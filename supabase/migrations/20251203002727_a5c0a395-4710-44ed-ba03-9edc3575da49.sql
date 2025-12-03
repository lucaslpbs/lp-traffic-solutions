-- Create clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  value_spent NUMERIC NOT NULL DEFAULT 0,
  messages_started INTEGER NOT NULL DEFAULT 0,
  cost_per_message NUMERIC NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  cpm_real NUMERIC NOT NULL DEFAULT 0,
  ctr_real NUMERIC NOT NULL DEFAULT 0,
  instagram_visits INTEGER NOT NULL DEFAULT 0,
  instagram_followers INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create users_clients table for access control
CREATE TABLE public.users_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, client_id)
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_clients ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user access
CREATE OR REPLACE FUNCTION public.user_has_client_access(p_user_id UUID, p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users_clients
    WHERE user_id = p_user_id AND client_id = p_client_id
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.user_is_admin(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users_clients
    WHERE user_id = p_user_id AND role = 'admin'
  )
$$;

-- RLS Policies for clients
CREATE POLICY "Users can view their linked clients"
ON public.clients FOR SELECT
TO authenticated
USING (
  public.user_has_client_access(auth.uid(), id)
  OR public.user_is_admin(auth.uid())
);

-- RLS Policies for reports
CREATE POLICY "Users can view reports of their linked clients"
ON public.reports FOR SELECT
TO authenticated
USING (
  public.user_has_client_access(auth.uid(), client_id)
  OR public.user_is_admin(auth.uid())
);

-- RLS Policies for users_clients
CREATE POLICY "Users can view their own access records"
ON public.users_clients FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all access records"
ON public.users_clients FOR ALL
TO authenticated
USING (public.user_is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_reports_client_date ON public.reports(client_id, date);
CREATE INDEX idx_users_clients_user ON public.users_clients(user_id);
CREATE INDEX idx_users_clients_client ON public.users_clients(client_id);