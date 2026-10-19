import { createClient } from '@supabase/supabase-js';
import { AssetVersion } from './types';

/**
 * VersionController handles the creation, retrieval, and diffing 
 * of asset versions.
 */
export class VersionController {
    private supabase = createClient(
        process.env.VITE_SUPABASE_URL || (import.meta.env ? import.meta.env.VITE_SUPABASE_URL : ''),
        process.env.VITE_SUPABASE_ANON_KEY || (import.meta.env ? import.meta.env.VITE_SUPABASE_ANON_KEY : '')
    );

    /**
     * Returns all versions of an asset ordered by version number.
     */
    async getVersionHistory(assetId: string): Promise<AssetVersion[]> {
        const { data, error } = await this.supabase
            .from('asset_versions')
            .select('*')
            .eq('asset_id', assetId)
            .order('version_number', { ascending: true });

        if (error) throw error;
        return (data || []) as AssetVersion[];
    }

    /**
     * Returns the most recent version of an asset.
     */
    async getCurrentVersion(assetId: string): Promise<AssetVersion> {
        const { data, error } = await this.supabase
            .from('asset_versions')
            .select('*')
            .eq('asset_id', assetId)
            .order('version_number', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) throw new Error(`VersionNotFoundError: No versions found for asset ${assetId}`);
        return data as AssetVersion;
    }

    /**
     * Creates a new version of an asset.
     */
    async createVersion(
        assetId: string, 
        content: string, 
        changeSummary: string, 
        createdBy: string
    ): Promise<AssetVersion> {
        const history = await this.getVersionHistory(assetId);
        const nextVersion = history.length + 1;
        
        let diff = '';
        if (history.length > 0) {
            const prevContent = history[history.length - 1].content;
            diff = this.calculateSimpleDiff(prevContent, content);
        }

        const { data, error } = await this.supabase
            .from('asset_versions')
            .insert({
                asset_id: assetId,
                version_number: nextVersion,
                content,
                change_summary: changeSummary,
                diff_from_prev: diff,
                created_by: createdBy,
            })
            .select()
            .single();

        if (error) throw error;
        return data as AssetVersion;
    }

    /**
     * Rolls back an asset to a target version number.
     * Creates a NEW version with the rolled-back content.
     */
    async rollbackToVersion(assetId: string, targetVersionNumber: number, createdBy: string): Promise<AssetVersion> {
        const { data: version, error } = await this.supabase
            .from('asset_versions')
            .select('*')
            .eq('asset_id', assetId)
            .eq('version_number', targetVersionNumber)
            .single();

        if (error || !version) throw new Error(`VersionNotFoundError: Target version ${targetVersionNumber} not found.`);

        return this.createVersion(
            assetId, 
            version.content, 
            `Rolled back to version ${targetVersionNumber}`, 
            createdBy
        );
    }

    /**
     * Generates a simple line-by-line diff between two versions.
     */
    diffVersions(v1: string, v2: string): string {
        // Simplified diff implementation
        const lines1 = v1.split('\n');
        const lines2 = v2.split('\n');
        let result = '';
        
        const max = Math.max(lines1.length, lines2.length);
        for (let i = 0; i < max; i++) {
            if (lines1[i] !== lines2[i]) {
                if (lines1[i]) result += `- ${lines1[i]}\n`;
                if (lines2[i]) result += `+ ${lines2[i]}\n`;
            }
        }
        return result || 'No changes detected.';
    }

    private calculateSimpleDiff(oldContent: string, newContent: string): string {
        return this.diffVersions(oldContent, newContent);
    }
}

export const versionController = new VersionController();
