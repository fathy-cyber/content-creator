-- Create the platform rate limits table
CREATE TABLE IF NOT EXISTS public.platform_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    social_account_id UUID NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
    window_start TIMESTAMPTZ NOT NULL,
    window_end TIMESTAMPTZ NOT NULL,
    posts_sent INTEGER DEFAULT 0,
    posts_limit INTEGER NOT NULL,
    api_calls_made INTEGER DEFAULT 0,
    api_calls_limit INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(social_account_id, window_start)
);

-- Enable RLS
ALTER TABLE public.platform_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their rate limits
CREATE POLICY "Allow authenticated users to view rate limits" 
ON public.platform_rate_limits FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create index for faster window lookups
CREATE INDEX IF NOT EXISTS idx_platform_rate_limits_account_window 
ON public.platform_rate_limits(social_account_id, window_start);