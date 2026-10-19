/**
 * Brand Voice Types
 */

export interface BrandVoice {
    id: string;
    workspace_id: string;
    client_id?: string;
    name: string;
    tone_descriptors: string[];
    forbidden_words: string[];
    value_propositions: string[];
    positioning_statement?: string;
    approved_phrases: string[];
    legal_constraints: string[];
    competitive_differentiators: string[];
    example_copy?: string;
    target_audience?: string;
    is_default: boolean;
    created_by?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateBrandVoiceInput {
    workspace_id: string;
    client_id?: string;
    name: string;
    tone_descriptors: string[];
    forbidden_words: string[];
    value_propositions: string[];
    positioning_statement?: string;
    approved_phrases: string[];
    legal_constraints: string[];
    competitive_differentiators: string[];
    example_copy?: string;
    target_audience?: string;
    is_default?: boolean;
}

export interface UpdateBrandVoiceInput extends Partial<Omit<CreateBrandVoiceInput, 'workspace_id'>> {}

export interface BrandVoiceExtractionResult {
    toneDescriptors: string[];
    forbiddenWords: string[];
    valuePropositions: string[];
    targetAudience: string;
}
