-- Drop existing table if it exists
DROP TABLE IF EXISTS public.education;

-- Create the education table
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Hero section
  hero_heading TEXT NOT NULL,
  hero_subheading TEXT NOT NULL,
  hero_description_1 TEXT NOT NULL,
  hero_description_2 TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,

  -- Who This Is For section
  who_heading TEXT NOT NULL,
  who_descriptions JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- What I Can Help With section
  help_heading TEXT NOT NULL,
  help_description TEXT NOT NULL,
  help_items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- My Approach & The Outcome section
  expect_heading TEXT NOT NULL DEFAULT 'What You Can Expect',
  approach_heading TEXT NOT NULL,
  approach_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome_heading TEXT NOT NULL,
  outcome_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Why Work With Me section
  why_me_heading TEXT NOT NULL,
  why_me_paragraphs JSONB NOT NULL DEFAULT '[]'::jsonb,
  why_me_image_url TEXT NOT NULL,

  -- Contact / CTA section
  contact_heading TEXT NOT NULL,
  contact_description TEXT NOT NULL,
  contact_button_text TEXT NOT NULL,
  contact_note TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
  ON public.education
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert"
  ON public.education
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update"
  ON public.education
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete"
  ON public.education
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON public.education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: Education images should be stored in the existing 'images' bucket
-- under the 'education' subfolder.

-- Insert default values
INSERT INTO public.education (
  hero_heading,
  hero_subheading,
  hero_description_1,
  hero_description_2,
  hero_image_url,
  who_heading,
  who_descriptions,
  help_heading,
  help_description,
  help_items,
  expect_heading,
  approach_heading,
  approach_paragraphs,
  outcome_heading,
  outcome_paragraphs,
  why_me_heading,
  why_me_paragraphs,
  why_me_image_url,
  contact_heading,
  contact_description,
  contact_button_text,
  contact_note
) VALUES (
  'Education built from over 20 years behind the chair',
  'Helping salons and stylists build confidence, raise standards and grow stronger businesses.',
  'After over 20 years in the industry — building and running Blush in Cardiff and successfully selling the business — I now work with salons and stylists to help them improve, both behind the chair and within their business.',
  'This isn''t just about hair. It''s about confidence, consistency, client experience and creating something that actually works long term.',
  '/assets/images/Vicky.jpg',
  'Who This Is For',
  '["For salon owners and stylists who want to feel more confident, more consistent and more in control of what they''re doing.", "Whether that''s improving your skills, strengthening your team or creating a better client experience, this is built around real salon life \u2014 not theory."]'::jsonb,
  'What I Can Help With',
  'This can be tailored depending on what you need, but often includes:',
  '["Building confidence behind the chair", "Refining cutting, colour and finishing work", "Improving consultations and client connection", "Raising standards across a team", "Creating a better overall client experience", "Supporting salon owners with team and business development"]'::jsonb,
  'What You Can Expect',
  'What You Can Expect',
  '["I don''t believe in one-size-fits-all training.", "Everything I offer is personal, honest and based on real experience — what actually works in a busy salon, day in and day out."]'::jsonb,
  'The Outcome',
  '["The goal is simple — to help you feel more confident, more capable and clearer in what you''re doing.", "That might show up in your work, your clients, your team or your business as a whole."]'::jsonb,
  'Why Work With Me',
  '["I''ve experienced the industry from every angle — as a stylist, salon owner and mentor.", "Having built, grown and sold a successful salon, I understand both the creative and business side of this industry, and that''s what I now bring into the way I support others."]'::jsonb,
  '/assets/images/VBC - Salon.jpg',
  'Get In Touch',
  'If you''re ready to improve your skills, your team or your business, I''d love to hear from you.',
  'Enquire about education',
  NULL
)
ON CONFLICT DO NOTHING;
