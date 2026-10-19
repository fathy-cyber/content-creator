/**
 * Content Module - Public API
 * Pure service layer. Zero React components.
 */

import { generatorService } from './services/generatorService';
import { repurposerService } from './services/repurposerService';
import { translationService } from './services/translationService';
import { templateService } from './services/templateService';
import { landingPageService, AIDAPage, PASPage } from './services/landingPageService';
import { personaService, Persona } from './services/personaService';
import { assetService } from './services/assetService';
import { competitorService, CompetitorAnalysis, CounterAngle, Competitor } from './services/competitorService';
import { serviceRegistry } from '@/core/registry/ServiceRegistry';

export { generatorService, repurposerService, translationService, templateService, landingPageService, personaService, assetService, competitorService };
export type { AIDAPage, PASPage, Persona, CompetitorAnalysis, CounterAngle, Competitor };

export type { GeneratedContent } from '@/core/ai/types';
export type { ContentTemplate } from './services/templateService';
export interface RepurposeResult {
    format: string;
    assetId: string;
    content: string;
}

// Register the content service aggregate
serviceRegistry.registerService('content', {
    generator: generatorService,
    repurposer: repurposerService,
    translation: translationService,
    template: templateService,
    landingPage: landingPageService,
    persona: personaService,
    assets: assetService,
    competitor: competitorService,
});

// Default export for Kernel boot loader (uses mod.default ?? mod)
const serviceAggregate = {
    generator: generatorService,
    repurposer: repurposerService,
    translation: translationService,
    template: templateService,
    landingPage: landingPageService,
    persona: personaService,
    assets: assetService,
    competitor: competitorService,
};
export default serviceAggregate;
