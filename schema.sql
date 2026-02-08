-- UpKeep Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users/Profiles table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform connections (OAuth tokens for each platform)
CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL, -- 'youtube', 'github', 'twitch', 'discord', 'strava'
  platform_user_id TEXT,
  platform_username TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  scopes TEXT[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Contacts (people in user's network they want to track)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'keep_warm', -- 'inner_circle', 'close_friend', 'keep_warm'
  contact_frequency_days INTEGER DEFAULT 30,
  contact_method TEXT, -- 'call', 'text', 'dm', etc.
  last_contact_at TIMESTAMPTZ,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact identities (link contacts to platform accounts)
CREATE TABLE IF NOT EXISTS public.contact_identities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  platform_user_id TEXT,
  platform_username TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact interactions (log of when user reached out)
CREATE TABLE IF NOT EXISTS public.contact_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL, -- 'call', 'text', 'dm', 'in_person', 'other'
  notes TEXT,
  interaction_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signals (activity from contacts across platforms)
CREATE TABLE IF NOT EXISTS public.signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- 'video', 'stream', 'commit', 'pr', 'post', 'run', 'activity'
  title TEXT,
  description TEXT,
  url TEXT,
  thumbnail_url TEXT,
  is_live BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  notification_nudges BOOLEAN DEFAULT TRUE,
  notification_live BOOLEAN DEFAULT TRUE,
  notification_digest BOOLEAN DEFAULT TRUE,
  digest_frequency TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'never'
  theme TEXT DEFAULT 'dark',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON public.connections(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_tier ON public.contacts(tier);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contact ON public.contacts(last_contact_at);
CREATE INDEX IF NOT EXISTS idx_contact_identities_contact_id ON public.contact_identities(contact_id);
CREATE INDEX IF NOT EXISTS idx_contact_identities_platform ON public.contact_identities(platform);
CREATE INDEX IF NOT EXISTS idx_signals_user_id ON public.signals(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_platform ON public.signals(platform);
CREATE INDEX IF NOT EXISTS idx_signals_published_at ON public.signals(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_signals_is_live ON public.signals(is_live) WHERE is_live = TRUE;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Connections policies
CREATE POLICY "Users can manage own connections" ON public.connections
  FOR ALL USING (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "Users can manage own contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);

-- Contact identities policies
CREATE POLICY "Users can manage own contact identities" ON public.contact_identities
  FOR ALL USING (
    contact_id IN (SELECT id FROM public.contacts WHERE user_id = auth.uid())
  );

-- Contact interactions policies
CREATE POLICY "Users can manage own contact interactions" ON public.contact_interactions
  FOR ALL USING (
    contact_id IN (SELECT id FROM public.contacts WHERE user_id = auth.uid())
  );

-- Signals policies
CREATE POLICY "Users can view own signals" ON public.signals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own signals" ON public.signals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own signals" ON public.signals
  FOR DELETE USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update last_contact_at when interaction is logged
CREATE OR REPLACE FUNCTION public.update_contact_last_interaction()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.contacts
  SET last_contact_at = NEW.interaction_at, updated_at = NOW()
  WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update contact when interaction is logged
DROP TRIGGER IF EXISTS on_contact_interaction ON public.contact_interactions;
CREATE TRIGGER on_contact_interaction
  AFTER INSERT ON public.contact_interactions
  FOR EACH ROW EXECUTE FUNCTION public.update_contact_last_interaction();
