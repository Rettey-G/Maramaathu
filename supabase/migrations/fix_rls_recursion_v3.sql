-- Fix RLS recursion - clean drop and recreate
-- Run this in Supabase SQL Editor

-- Step 1: Drop policies that depend on is_admin
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all worker profiles" ON public.worker_profiles;
DROP POLICY IF EXISTS "Admins can insert all worker profiles" ON public.worker_profiles;
DROP POLICY IF EXISTS "Admins can delete all worker profiles" ON public.worker_profiles;
DROP POLICY IF EXISTS "Admins can view all customer profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Admins can insert all customer profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Admins can delete all customer profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.service_requests;

-- Step 2: Now drop the function (no dependencies)
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Step 3: Create the function with correct parameter name
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Step 4: Recreate all policies
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert all profiles" ON public.profiles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete all profiles" ON public.profiles FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all worker profiles" ON public.worker_profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert all worker profiles" ON public.worker_profiles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete all worker profiles" ON public.worker_profiles FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all customer profiles" ON public.customer_profiles FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can insert all customer profiles" ON public.customer_profiles FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admins can delete all customer profiles" ON public.customer_profiles FOR DELETE USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all requests" ON public.service_requests FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can update all requests" ON public.service_requests FOR UPDATE USING (public.is_admin(auth.uid()));
