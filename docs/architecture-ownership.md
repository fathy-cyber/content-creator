# Architectural Ownership & Module Boundaries

This document defines the ownership and responsibilities of the core modules after the Content Hub migration.

## 1. Content Module (`content`)
The Content Module is the engine for all content creation, transformation, and management.

### Responsibilities
- **AI Generation**: High-level orchestration of AI for text, images, and video.
- **Asset Lifecycle**: Creation, versioning, and storage of all content assets.
- **Asset Transformation**: Repurposing content across different formats and platforms.
- **Localization**: Translation and cultural adaptation of content.
- **Templates**: Management of reusable content structures.
- **Persona Management**: Defining and storing Ideal Customer Profiles (ICPs).
- **Landing Page Generation**: Strategic copy generation for landing pages.

### Key Services
- `aiService`: Interface to AI providers and prompts.
- `assetService`: CRUD and lifecycle for `marketing_assets`.
- `generatorService`: High-level generation wrappers.
- `repurposerService`: Content transformation logic.
- `translationService`: Localization services.
- `templateService`: Template library management.
- `personaService`: ICP generation and storage.
- `landingPageService`: Landing page copy generation.

---

## 2. Marketing Module (`marketing`)
The Marketing Module focuses on growth, distribution, and lead management.

### Responsibilities
- **Campaign Management**: Planning, budgeting, and tracking marketing campaigns.
- **Lead Management**: Acquisition, scoring, and conversion of leads.
- **Audience Segmentation**: Grouping leads based on behavior and attributes.
- **Marketing Analytics**: ROI tracking and conversion rate optimization.
- **Funnel Building**: Designing and managing customer acquisition funnels.

### Key Services
- `campaignService`: Campaign lifecycle management.
- `leadService`: Lead scoring and tracking.
- `segmentationService`: Audience grouping.
- `analyticsService`: Marketing performance metrics.

---

## 3. Social Module (`social`)
The Social Module handles the distribution of content to social platforms.

### Responsibilities
- **Account Connectivity**: OAuth connections to social platforms.
- **Publishing Workflow**: Approval, scheduling, and dispatch of posts.
- **Social Analytics**: Tracking reach and engagement on social media.
- **Rate Limiting**: Enforcing platform-specific API limits.

### Key Services
- `accountService`: Connection and token management.
- `publisherService`: Job queue and n8n dispatch.
- `approvalService`: Review and approval workflow.
- `analyticsService`: Social performance tracking.
- `rateLimitService`: API quota enforcement.

---

## Inter-Module Communication Flow

1. **Creation**: `marketing` $\rightarrow$ `content` (e.g., generate ad copy for a campaign).
2. **Refinement**: `content` $\rightarrow$ `content` (e.g., repurpose a blog post into 5 tweets).
3. **Distribution**: `content` $\rightarrow$ `social` (e.g., schedule a generated post for publishing).
4. **Feedback**: `social` $\rightarrow$ `marketing` (e.g., social analytics feeding back into campaign ROI).
