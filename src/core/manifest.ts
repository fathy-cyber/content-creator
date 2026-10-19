/**
 * Core Module Manifest
 */
export const coreManifest = {
    id: 'core',
    name: 'Agency OS Core',
    version: '2.0.0',
    description: 'Kernel layer providing shared services for all modules',
    dependencies: [],
    services: [
        'ai', 'assets', 'brandVoice', 'brandVoiceInjector', 'context',
        'eventBus', 'permissions', 'audit',
        'clients', 'projects', 'workspaces'
    ],
    migrations: [
        '001_workspaces.sql', '002_clients.sql', '003_projects.sql',
        '004_assets_v2.sql', '005_brand_voices.sql', '006_event_store.sql',
        '007_audit_log.sql', '008_rbac.sql', '009_pg_cron_jobs.sql'
    ]
};
