/**
 * Asset Manager Types
 */

export interface Asset {
    id: string;
    workspace_id: string;
    client_id?: string;
    project_id?: string;
    entity_type: string;
    entity_id: string;
    type: string;
    platform?: string;
    title: string;
    status: string;
    language: string;
    parent_asset_id?: string;
    transformation_type?: string;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateAssetInput {
    workspace_id: string;
    client_id?: string;
    project_id?: string;
    entity_type: string;
    entity_id: string;
    type: string;
    title: string;
    content: string;
    platform?: string;
    language?: string;
    parent_asset_id?: string;
    transformation_type?: string;
}


export interface AssetVersion {
    id: string;
    asset_id: string;
    version_number: number;
    content: string;
    diff_from_prev?: string;
    change_summary?: string;
    created_by?: string;
    created_at?: string;
}

export interface AssetApproval {
    id: string;
    asset_id: string;
    version_id: string;
    stage: string;
    actor_id: string;
    comment?: string;
    created_at?: string;
}

export interface ReviewToken {
    id: string;
    asset_id: string;
    token: string;
    client_email: string;
    expires_at: string;
    used_at?: string;
}

export interface CreateAssetInput {
    workspace_id: string;
    client_id?: string;
    project_id?: string;
    entity_type: string;
    entity_id: string;
    type: string;
    title: string;
    content: string;
    platform?: string;
    language?: string;
}

export interface UpdateAssetInput {
    title?: string;
    status?: string;
    platform?: string;
    language?: string;
}

export interface AssetFilters {
    entity_type?: string;
    entity_id?: string;
    client_id?: string;
    project_id?: string;
    status?: string;
    type?: string;
    platform?: string;
    language?: string;
    limit?: number;
    offset?: number;
}

export interface VersionHistory {
    asset: Asset;
    versions: AssetVersion[];
}

export const VALID_TRANSITIONS: Record<string, string[]> = {
    draft: ['internal_review'],
    internal_review: ['draft', 'client_review', 'approved'],
    client_review: ['draft', 'approved'],
    approved: ['published', 'archived'],
    published: ['archived'],
    archived: [],
    rejected: ['draft'],
};
