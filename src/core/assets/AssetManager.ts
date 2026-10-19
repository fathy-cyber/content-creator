import { createClient } from '@supabase/supabase-js';
import { useContextStore } from '../context/ContextStore';
import { 
    Asset, 
    AssetVersion, 
    CreateAssetInput, 
    UpdateAssetInput, 
    AssetFilters, 
    VALID_TRANSITIONS, 
    ReviewToken 
} from './types';
import { versionController } from './VersionController';
import { serviceRegistry } from '../registry/ServiceRegistry';
import { eventBus } from '../events/EventBus';

/**
 * AssetManager is the central service for all asset lifecycle operations.
 * Enforces RBAC, logging, and event emission.
 */
export class AssetManager {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Creates a new asset and its initial version.
     */
    async createAsset(input: CreateAssetInput): Promise<{ data: Asset | null, error: Error | null }> {
        try {
            const { activeWorkspaceId, activeClientId } = useContextStore.getState();
            const workspaceId = input.workspace_id || activeWorkspaceId;
            const clientId = input.client_id || activeClientId;
            
            if (!workspaceId) {
                throw new Error('Active workspace required to create assets');
            }

            const { data: { user } } = await this.supabase.auth.getUser();
            const userId = user?.id || '00000000-0000-0000-0000-000000000000'; 
            
            const { data: asset, error: assetError } = await this.supabase
                .from('assets')
                .insert({
                    workspace_id: workspaceId,
                    client_id: clientId,
                    project_id: input.project_id,
                    entity_type: input.entity_type,
                    entity_id: input.entity_id,
                    type: input.type,
                    title: input.title,
                    platform: input.platform,
                    language: input.language || 'en',
                    parent_asset_id: input.parent_asset_id,
                    transformation_type: input.transformation_type,
                    created_by: userId,
                })
                .select()
                .single();

            if (assetError) throw assetError;

            // Create initial version
            await versionController.createVersion(
                asset.id, 
                input.content, 
                'Initial draft', 
                userId
            );

            // Emit event
            await eventBus.emit('asset.created', { 
                asset: asset,
                type: asset.type, 
                clientId: asset.client_id || '' 
            }, 'core');

            // Audit Log (Mocked until 1I)
            // auditLogger.log('asset.created', 'asset', asset.id, null, asset);

            return { data: asset as Asset, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Retrieves an asset merged with its latest version content.
     */
    async getAsset(id: string): Promise<{ data: Asset & { currentContent: string } | null, error: Error | null }> {
        try {
            const { data: asset, error: assetError } = await this.supabase
                .from('assets')
                .select('*')
                .eq('id', id)
                .single();

            if (assetError || !asset) throw new Error('Asset not found');

            const version = await versionController.getCurrentVersion(id);

            return { 
                data: { ...asset as Asset, currentContent: version.content }, 
                error: null 
            };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Retrieves an asset with its full version history.
     */
    async getAssetWithHistory(id: string): Promise<{ data: Asset & { versions: AssetVersion[] } | null, error: Error | null }> {
        try {
            const { data: asset, error: assetError } = await this.supabase
                .from('assets')
                .select('*')
                .eq('id', id)
                .single();

            if (assetError || !asset) throw new Error('Asset not found');

            const versions = await versionController.getVersionHistory(id);

            return { 
                data: { ...asset as Asset, versions }, 
                error: null 
            };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Retrieves the lineage of an asset (all derivatives).
     */
    async getAssetLineage(assetId: string): Promise<{ data: Asset[], error: Error | null }> {
        try {
            const { data, error } = await this.supabase
                .from('assets')
                .select('*')
                .eq('parent_asset_id', assetId);
            
            if (error) throw error;
            return { data: (data || []) as Asset[], error: null };
        } catch (e: any) {
            return { data: [], error: e };
        }
    }

    /**
     * Retrieves the parent of an asset.
     */
    async getAssetParent(assetId: string): Promise<{ data: Asset | null, error: Error | null }> {
        try {
            const { data: asset } = await this.supabase
                .from('assets')
                .select('*')
                .eq('id', assetId)
                .single();
            
            if (!asset || !asset.parent_asset_id) return { data: null, error: null };
            
            const { data: parent, error: parentError } = await this.supabase
                .from('assets')
                .select('*')
                .eq('id', asset.parent_asset_id)
                .single();
                
            if (parentError) throw parentError;
            return { data: parent as Asset, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Lists assets based on filters.
     */
    async listAssets(filters: AssetFilters): Promise<{ data: Asset[], count: number, error: Error | null }> {
        try {
            let query = this.supabase.from('assets').select('*', { count: 'exact' });

            if (filters.entity_type) query = query.eq('entity_type', filters.entity_type);
            if (filters.entity_id) query = query.eq('entity_id', filters.entity_id);
            if (filters.client_id) query = query.eq('client_id', filters.client_id);
            if (filters.project_id) query = query.eq('project_id', filters.project_id);
            if (filters.status) query = query.eq('status', filters.status);
            if (filters.type) query = query.eq('type', filters.type);
            if (filters.platform) query = query.eq('platform', filters.platform);
            if (filters.language) query = query.eq('language', filters.language);

            const { data, count, error } = await query
                .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

            if (error) throw error;
            return { data: (data || []) as Asset[], count: count || 0, error: null };
        } catch (e: any) {
            return { data: [], count: 0, error: e };
        }
    }

    /**
     * Saves a new version of an asset.
     */
    async saveNewVersion(assetId: string, content: string, changeSummary: string, userId: string): Promise<{ data: AssetVersion | null, error: Error | null }> {
        try {
            const asset = await this.getAsset(assetId);
            if (asset.error || !asset.data) throw new Error('Asset not found');

            if (['published', 'archived'].includes(asset.data.status)) {
                throw new Error(`Cannot edit asset in ${asset.data.status} state.`);
            }

            const version = await versionController.createVersion(assetId, content, changeSummary, userId);

            await this.supabase
                .from('assets')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', assetId);

            // auditLogger.log('asset.version_created', 'asset', assetId, null, { versionNumber: version.version_number });

            return { data: version, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Transitions the status of an asset.
     */
    async transitionStatus(assetId: string, toStatus: string, userId: string, comment?: string): Promise<{ data: Asset | null, error: Error | null }> {
        try {
            const asset = await this.getAsset(assetId);
            if (asset.error || !asset.data) throw new Error('Asset not found');

            const fromStatus = asset.data.status;
            const allowed = VALID_TRANSITIONS[fromStatus] || [];
            if (!allowed.includes(toStatus)) {
                throw new Error(`Invalid transition from ${fromStatus} to ${toStatus}.`);
            }

            const currentVersion = await versionController.getCurrentVersion(assetId);

            // RBAC check (Mocked until 1H)
            // await permissionService.canOrThrow(userId, this.mapStatusToAction(toStatus), 'asset');

            const { data: approval, error: approvalError } = await this.supabase
                .from('asset_approvals')
                .insert({
                    asset_id: assetId,
                    version_id: currentVersion.id,
                    stage: toStatus,
                    actor_id: userId,
                    comment,
                })
                .select()
                .single();

            if (approvalError) throw approvalError;

            const { data: updatedAsset, error: updateError } = await this.supabase
                .from('assets')
                .update({ status: toStatus })
                .eq('id', assetId)
                .select()
                .single();

            if (updateError) throw updateError;

            await eventBus.emit('asset.status.changed', { 
                assetId, 
                from: fromStatus, 
                to: toStatus 
            }, 'core');

            // auditLogger.log('asset.status_changed', 'asset', assetId, { status: fromStatus }, { status: toStatus });

            return { data: updatedAsset as Asset, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Generates a review token for client access.
     */
    async generateReviewToken(assetId: string, clientEmail: string): Promise<{ data: ReviewToken | null, error: Error | null }> {
        try {
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
            const { data, error } = await this.supabase
                .from('review_tokens')
                .insert({
                    asset_id: assetId,
                    client_email: clientEmail,
                    expires_at: expiresAt,
                })
                .select()
                .single();

            if (error) throw error;
            return { data: data as ReviewToken, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Validates a review token and returns the asset.
     */
    async validateReviewToken(token: string): Promise<{ data: Asset | null, error: Error | null }> {
        try {
            const { data: tokenData, error: tokenError } = await this.supabase
                .from('review_tokens')
                .select('*')
                .eq('token', token)
                .single();

            if (tokenError || !tokenData) throw new Error('Invalid or expired token');
            if (new Date(tokenData.expires_at) < new Date()) throw new Error('Token expired');
            if (tokenData.used_at) throw new Error('Token already used');

            const asset = await this.getAsset(tokenData.asset_id);
            if (asset.error || !asset.data) throw new Error('Associated asset not found');

            return { data: asset.data as Asset, error: null };
        } catch (e: any) {
            return { data: null, error: e };
        }
    }

    /**
     * Helper to map status transitions to RBAC actions.
     */
    private mapStatusToAction(toStatus: string): string {
        const mapping: Record<string, string> = {
            internal_review: 'create',
            approved: 'approve',
            published: 'publish',
            archived: 'delete',
            rejected: 'update',
            draft: 'update',
        };
        return mapping[toStatus] || 'update';
    }
}

export const assetManager = new AssetManager();
serviceRegistry.registerService('assets', assetManager);
