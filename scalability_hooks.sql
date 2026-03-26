-- PRD 14: Scalability & Future Growth Hooks

-- 1. Multi-Country Support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'IN',
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'INR';

ALTER TABLE public.draws
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'IN',
ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'INR';

-- 2. Organizations / Corporate Accounts
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- 3. Campaign Module
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    organization_id UUID REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.draws
ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES public.campaigns(id);

-- Enable RLS (Standard practice)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Admins only for now)
CREATE POLICY "Admins can manage organizations" ON public.organizations
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Everyone can view active campaigns" ON public.campaigns
    FOR SELECT USING (is_active = true);
