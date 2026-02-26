-- Fix for infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Create a security definer function to check admin role
-- This bypasses RLS to prevent infinite recursion
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

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all worker profiles" ON public.worker_profiles;
DROP POLICY IF EXISTS "Admins can view all customer profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can update all requests" ON public.service_requests;
DROP POLICY IF EXISTS "Admins can view all quote offers" ON public.quote_offers;
DROP POLICY IF EXISTS "Admins can view all reviews" ON public.reviews;

-- Recreate policies using the non-recursive function
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all worker profiles" ON public.worker_profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all customer profiles" ON public.customer_profiles FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all requests" ON public.service_requests FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all requests" ON public.service_requests FOR UPDATE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all quote offers" ON public.quote_offers FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all reviews" ON public.reviews FOR SELECT 
USING (public.is_admin(auth.uid()));

-- Also add a delete policy for admin (needed for delete_user)
CREATE POLICY "Admins can delete all profiles" ON public.profiles FOR DELETE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all worker profiles" ON public.worker_profiles FOR DELETE 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all customer profiles" ON public.customer_profiles FOR DELETE 
USING (public.is_admin(auth.uid()));

-- Allow admins to insert profiles (needed for admin user creation via Edge Function)
CREATE POLICY "Admins can insert all profiles" ON public.profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert all worker profiles" ON public.worker_profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert all customer profiles" ON public.customer_profiles FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));
