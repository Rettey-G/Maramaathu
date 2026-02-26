-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  name text,
  role text NOT NULL CHECK (role IN ('customer', 'worker', 'admin')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Worker-specific profile
CREATE TABLE IF NOT EXISTS public.worker_profiles (
  id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  phone text,
  whatsapp text,
  viber text,
  categories text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  about text,
  promo_poster_url text,
  rating_avg numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  jobs_done integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer-specific profile
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id uuid REFERENCES public.profiles(id) PRIMARY KEY,
  phone text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Service requests
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'open',
  category text NOT NULL,
  title text NOT NULL,
  description text,
  budget integer,
  urgency text,
  location text,
  customer_id uuid REFERENCES public.profiles(id) NOT NULL,
  accepted_worker_id uuid REFERENCES public.profiles(id),
  interested_worker_ids uuid[] DEFAULT '{}',
  inspection jsonb,
  quote jsonb,
  work jsonb,
  payment jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Quote offers
CREATE TABLE IF NOT EXISTS public.quote_offers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.profiles(id),
  amount integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  request_id uuid REFERENCES public.service_requests(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.profiles(id),
  worker_id uuid REFERENCES public.profiles(id),
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  comment text
);

-- Functions to auto-update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER worker_profiles_updated_at BEFORE UPDATE ON public.worker_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER customer_profiles_updated_at BEFORE UPDATE ON public.customer_profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
CREATE TRIGGER service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id ON public.service_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON public.service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_accepted_worker_id ON public.service_requests(accepted_worker_id);
CREATE INDEX IF NOT EXISTS idx_quote_offers_request_id ON public.quote_offers(request_id);
CREATE INDEX IF NOT EXISTS idx_quote_offers_worker_id ON public.quote_offers(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON public.reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Workers can view customer profiles" ON public.profiles FOR SELECT USING (role = 'worker' AND EXISTS (SELECT 1 FROM public.service_requests WHERE customer_id = public.profiles.id));
CREATE POLICY "Customers can view worker profiles" ON public.profiles FOR SELECT USING (role = 'customer' AND EXISTS (SELECT 1 FROM public.worker_profiles WHERE id = public.profiles.id));

-- Worker profiles policies
CREATE POLICY "Users can view their own worker profile" ON public.worker_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own worker profile" ON public.worker_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own worker profile" ON public.worker_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all worker profiles" ON public.worker_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Customers can view worker profiles" ON public.worker_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'customer'));

-- Customer profiles policies
CREATE POLICY "Users can view their own customer profile" ON public.customer_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own customer profile" ON public.customer_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own customer profile" ON public.customer_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all customer profiles" ON public.customer_profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Workers can view customer profiles for jobs" ON public.customer_profiles FOR SELECT USING (role = 'worker' AND EXISTS (SELECT 1 FROM public.service_requests WHERE customer_id = public.customer_profiles.id AND (status = 'open' OR accepted_worker_id = auth.uid())));

-- Service requests policies
CREATE POLICY "Customers can view their own requests" ON public.service_requests FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Workers can view open requests" ON public.service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'worker')
  AND status = 'open'
);
CREATE POLICY "Workers can view assigned requests" ON public.service_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'worker')
  AND accepted_worker_id = auth.uid()
);
CREATE POLICY "Admins can view all requests" ON public.service_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Customers can insert requests" ON public.service_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Workers can update assigned requests" ON public.service_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'worker')
  AND accepted_worker_id = auth.uid()
);
CREATE POLICY "Customers can update their requests" ON public.service_requests FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Admins can update all requests" ON public.service_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Quote offers policies
CREATE POLICY "Workers can insert quote offers" ON public.quote_offers FOR INSERT WITH CHECK (auth.uid() = worker_id);
CREATE POLICY "Customers can view quote offers for their requests" ON public.quote_offers FOR SELECT USING (EXISTS (SELECT 1 FROM public.service_requests WHERE id = request_id AND customer_id = auth.uid()));
CREATE POLICY "Workers can view their own quote offers" ON public.quote_offers FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Admins can view all quote offers" ON public.quote_offers FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Reviews policies
CREATE POLICY "Customers can insert reviews for completed jobs" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id AND EXISTS (SELECT 1 FROM public.service_requests WHERE id = request_id AND status = 'completed' AND customer_id = auth.uid()));
CREATE POLICY "Users can view reviews" ON public.reviews FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = worker_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
