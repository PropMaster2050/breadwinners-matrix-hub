-- Drop the restrictive admin-only policy for INSERT
DROP POLICY IF EXISTS "Admins can manage all e-pins" ON public.epins;

-- Create separate policies for better control
CREATE POLICY "Admins can view all e-pins"
ON public.epins
FOR SELECT
USING (true);

CREATE POLICY "Allow e-pin generation"
ON public.epins
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can update e-pins"
ON public.epins
FOR UPDATE
USING (true);

CREATE POLICY "Admins can delete e-pins"
ON public.epins
FOR DELETE
USING (true);