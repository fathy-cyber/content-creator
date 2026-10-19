import { lazy } from 'react';

export const manifest = {
  id: 'social',
  name: 'Social Media Publisher',
  version: '1.0.0',
  depends: ['marketing'],
  models: [],
  routes: [
    {
      path: '/social',
      component: lazy(() => import('./components/SocialDashboard')),
      label: 'Social Publisher',
      icon: 'share-2',
    },
  ],
  sidebarItems: [
    {
      id: 'social-dashboard',
      label: 'Social Publisher',
      href: '/social',
      icon: 'share-2',
      sequence: 10,
    },
  ],
  migrations: [
    '001_social_accounts.sql',
    '002_ai_posts.sql',
    '003_publish_jobs.sql',
    '004_approval_events.sql',
    '005_post_analytics.sql',
    '006_fix_system_uuids.sql',
    '007_fix_ai_posts_rls.sql',
    '008_final_ai_posts_rls.sql',
    '009_disable_rls_debug.sql',
  ],
  events: {
    emits: [
      'social.post.draft.created',
      'social.post.submitted',
      'social.post.approved',
      'social.post.rejected',
      'social.post.approval.expired',
      'social.post.scheduled',
      'social.post.published',
      'social.post.publish.failed',
      'social.post.publish.dead',
      'social.token.refreshed',
      'social.token.expired',
      'social.token.revoked',
      'social.analytics.fetched',
    ],
    listens: [
      'marketing.asset.published',
      'marketing.campaign.ended',
    ],
  },
  services: {
    social: () => import('./services'),
  },
}
