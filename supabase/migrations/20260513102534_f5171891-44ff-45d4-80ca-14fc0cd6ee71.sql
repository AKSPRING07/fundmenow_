
CREATE TYPE public.request_status AS ENUM ('pending', 'accepted', 'rejected');

CREATE TABLE public.intro_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  startup_user_id UUID NOT NULL,
  investor_id TEXT NOT NULL,
  investor_name TEXT NOT NULL,
  investor_focus TEXT,
  investor_ticket TEXT,
  investor_initials TEXT,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  address TEXT,
  reason TEXT NOT NULL,
  expected_amount TEXT NOT NULL,
  status public.request_status NOT NULL DEFAULT 'pending',
  response_reason TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.intro_requests ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS public.user_role
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = _user_id $$;

CREATE POLICY "Startups view own requests" ON public.intro_requests
  FOR SELECT TO authenticated USING (auth.uid() = startup_user_id);

CREATE POLICY "Investors view all requests" ON public.intro_requests
  FOR SELECT TO authenticated USING (public.get_user_role(auth.uid()) = 'investor');

CREATE POLICY "Startups create own requests" ON public.intro_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = startup_user_id AND public.get_user_role(auth.uid()) = 'startup');

CREATE POLICY "Startups update own pending requests" ON public.intro_requests
  FOR UPDATE TO authenticated USING (auth.uid() = startup_user_id);

CREATE POLICY "Investors update any request" ON public.intro_requests
  FOR UPDATE TO authenticated USING (public.get_user_role(auth.uid()) = 'investor');

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_intro_requests_updated_at
BEFORE UPDATE ON public.intro_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.intro_requests;
ALTER TABLE public.intro_requests REPLICA IDENTITY FULL;
