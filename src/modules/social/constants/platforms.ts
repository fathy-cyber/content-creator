export interface PlatformConstraints {
  maxImageSizeMb: number;
  maxVideoSizeMb: number;
  supportedImageFormats: string[];
  supportedVideoFormats: string[];
  maxCaptionLength: number;
}

export interface PlatformConfig {
  apiBaseUrl: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  rateLimits: {
    postsPerDay: number;
    postsPerHour: number;
    apiCallsPerDay: number;
  };
  mediaConstraints: PlatformConstraints;
  supportsScheduling: boolean;
  requiresBusinessAccount: boolean;
  freeApiAvailable: boolean;
  notes: string;
}

export interface PlatformConfig {
  apiBaseUrl: string;
  authUrl: string;
  tokenUrl: string;
  scopes: string[];
  rateLimits: {
    postsPerDay: number;
    postsPerHour: number;
    apiCallsPerDay: number;
  };
  mediaConstraints: PlatformConstraints;
  supportsScheduling: boolean;
  requiresBusinessAccount: boolean;
  freeApiAvailable: boolean;
  notes: string;
}

export const PLATFORMS: Record<string, PlatformConfig> = {
  linkedin: {
    apiBaseUrl: 'https://api.linkedin.com/v2',
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: ['w_member_social', 'rw_organization_admin'],
    rateLimits: {
      postsPerDay: 10,
      postsPerHour: 2,
      apiCallsPerDay: 1000,
    },
    mediaConstraints: {
      maxImageSizeMb: 5,
      maxVideoSizeMb: 100,
      supportedImageFormats: ['jpg', 'png'],
      supportedVideoFormats: ['mp4'],
      maxCaptionLength: 3000,
    },
    supportsScheduling: true,
    requiresBusinessAccount: false,
    freeApiAvailable: true,
    notes: 'Pages API requires partner status for some features. 150-char headline suggested.',
  },
  facebook: {
    apiBaseUrl: 'https://graph.facebook.com/v18.0',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['pages_manage_posts', 'pages_read_engagement', 'pages_show_list'],
    rateLimits: {
      postsPerDay: 25,
      postsPerHour: 5,
      apiCallsPerDay: 200,
    },
    mediaConstraints: {
      maxImageSizeMb: 4,
      maxVideoSizeMb: 1000,
      supportedImageFormats: ['jpg', 'png'],
      supportedVideoFormats: ['mp4', 'mov'],
      maxCaptionLength: 63206,
    },
    supportsScheduling: true,
    requiresBusinessAccount: true,
    freeApiAvailable: true,
    notes: 'Page permissions required. Long-lived tokens expire every 60 days.',
  },
  instagram: {
    apiBaseUrl: 'https://graph.facebook.com/v18.0',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scopes: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
    rateLimits: {
      postsPerDay: 25,
      postsPerHour: 5,
      apiCallsPerDay: 200,
    },
    mediaConstraints: {
      maxImageSizeMb: 8,
      maxVideoSizeMb: 100,
      supportedImageFormats: ['jpg'],
      supportedVideoFormats: ['mp4'],
      maxCaptionLength: 2200,
    },
    supportsScheduling: true,
    requiresBusinessAccount: true,
    freeApiAvailable: true,
    notes: 'Requires Facebook Business account. Reels published via separate endpoint.',
  },
  x: {
    apiBaseUrl: 'https://api.twitter.com/2',
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: ['tweet.read', 'tweet.write', 'users.read'],
    rateLimits: {
      postsPerDay: 50,
      postsPerHour: 15,
      apiCallsPerDay: 1000,
    },
    mediaConstraints: {
      maxImageSizeMb: 5,
      maxVideoSizeMb: 512,
      supportedImageFormats: ['jpg', 'png', 'gif'],
      supportedVideoFormats: ['mp4'],
      maxCaptionLength: 280,
    },
    supportsScheduling: true,
    requiresBusinessAccount: false,
    freeApiAvailable: false,
    notes: 'Write access requires $100/month Basic tier. Skip for MVP.',
  },
  tiktok: {
    apiBaseUrl: 'https://open.tiktokapis.com/v2',
    authUrl: 'https://www.tiktok.com/oauth/authorize',
    tokenUrl: 'https://open.tiktokapis.com/v2/oauth/token',
    scopes: ['video.upload', 'user.info.basic'],
    rateLimits: {
      postsPerDay: 10,
      postsPerHour: 2,
      apiCallsPerDay: 500,
    },
    mediaConstraints: {
      maxImageSizeMb: 0,
      maxVideoSizeMb: 50,
      supportedImageFormats: [],
      supportedVideoFormats: ['mp4'],
      maxCaptionLength: 4000,
    },
    supportsScheduling: true,
    requiresBusinessAccount: true,
    freeApiAvailable: true,
    notes: 'Complex review process for app approval.',
  },
  youtube: {
    apiBaseUrl: 'https://www.googleapis.com/youtube/v3',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
    rateLimits: {
      postsPerDay: 6,
      postsPerHour: 1,
      apiCallsPerDay: 10000,
    },
    mediaConstraints: {
      maxImageSizeMb: 6,
      maxVideoSizeMb: 256000,
      supportedImageFormats: ['jpg', 'png'],
      supportedVideoFormats: ['mp4', 'mov', 'avi'],
      maxCaptionLength: 5000,
    },
    supportsScheduling: true,
    requiresBusinessAccount: false,
    freeApiAvailable: true,
    notes: 'Video content only. Quota based on units (10k units/day).',
  },
  telegram: {
    apiBaseUrl: 'https://api.telegram.org/bot',
    authUrl: '', // Token-based
    tokenUrl: '', // Token-based
    scopes: [],
    rateLimits: {
      postsPerDay: 100,
      postsPerHour: 20,
      apiCallsPerDay: 5000,
    },
    mediaConstraints: {
      maxImageSizeMb: 10,
      maxVideoSizeMb: 2000,
      supportedImageFormats: ['jpg', 'png'],
      supportedVideoFormats: ['mp4'],
      maxCaptionLength: 4096,
    },
    supportsScheduling: true,
    requiresBusinessAccount: false,
    freeApiAvailable: true,
    notes: 'Requires Bot Token from BotFather.',
  },
  wordpress: {
    apiBaseUrl: 'https://wp-json/wp/v2', // Placeholder, actual URL depends on site
    authUrl: '', // Application Password based
    tokenUrl: '', 
    scopes: [],
    rateLimits: {
      postsPerDay: 50,
      postsPerHour: 10,
      apiCallsPerDay: 1000,
    },
    mediaConstraints: {
      maxImageSizeMb: 2,
      maxVideoSizeMb: 100,
      supportedImageFormats: ['jpg', 'png', 'gif'],
      supportedVideoFormats: ['mp4'],
      maxCaptionLength: 10000,
    },
    supportsScheduling: true,
    requiresBusinessAccount: false,
    freeApiAvailable: true,
    notes: 'Requires Application Password from WP User profile.',
  },
};
