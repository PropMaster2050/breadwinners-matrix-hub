-- Create e-pins table for global storage
CREATE TABLE public.epins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_used boolean NOT NULL DEFAULT false,
  used_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.epins ENABLE ROW LEVEL SECURITY;

-- Admins can do everything with e-pins
CREATE POLICY "Admins can manage all e-pins"
ON public.epins
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view available e-pins (for validation during registration)
CREATE POLICY "Anyone can check e-pin validity"
ON public.epins
FOR SELECT
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_epins_code ON public.epins(code);
CREATE INDEX idx_epins_is_used ON public.epins(is_used);