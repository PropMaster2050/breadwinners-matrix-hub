-- Enable RLS on registration_logs table
ALTER TABLE public.registration_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all logs
CREATE POLICY "Admins can view all registration logs"
ON public.registration_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert logs
CREATE POLICY "System can insert registration logs"
ON public.registration_logs
FOR INSERT
WITH CHECK (true);