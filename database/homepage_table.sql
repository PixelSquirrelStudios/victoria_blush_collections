-- Create the homepage table
CREATE TABLE IF NOT EXISTS public.homepage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Hero section
  hero_image_url TEXT NOT NULL,
  hero_subheading TEXT NOT NULL,
  hero_description TEXT NOT NULL,
  
  -- About section
  about_description TEXT NOT NULL,
  
  -- Services section
  services_subheading TEXT NOT NULL,
  services_description TEXT NOT NULL,
  services_important_notice TEXT,
  
  -- Gallery section
  gallery_subheading TEXT NOT NULL,
  gallery_description TEXT NOT NULL,
  
  -- Contact section
  contact_subheading TEXT NOT NULL,
  contact_description TEXT NOT NULL,
  contact_address TEXT NOT NULL,
  contact_phone_number TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  opening_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
  contact_social_media_url TEXT,
  
  -- Footer section
  footer_description TEXT NOT NULL,

  -- Maintenance mode
  enable_maintenance BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.homepage ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
  ON public.homepage
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert"
  ON public.homepage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy to allow authenticated users to update
CREATE POLICY "Allow authenticated users to update"
  ON public.homepage
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete"
  ON public.homepage
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_homepage_updated_at
  BEFORE UPDATE ON public.homepage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: Homepage images should be stored in the existing 'images' bucket
-- under the 'homepage' subfolder. No need to create a separate bucket.

-- Insert default values (optional)
INSERT INTO public.homepage (
  hero_image_url,
  hero_subheading,
  hero_description,
  about_description,
  services_subheading,
  services_description,
  services_important_notice,
  gallery_subheading,
  gallery_description,
  contact_subheading,
  contact_description,
  contact_address,
  contact_phone_number,
  contact_email,
  opening_hours,
  contact_social_media_url,
  footer_description
) VALUES (
  '/assets/images/victoria-hero.jpg',
  'Premium Hair Artistry',
  'A calm, friendly space where you can relax and enjoy beautiful hair. One-to-one appointments specialising in balayage, lived-in colour, colour correction and precision cutting — helping you feel like the best version of you.',
  'Hi, I''m Victoria — freelance hairstylist, educator and mum of four (yes… four. Coffee is my personality at this point). I founded and ran Blush in Llandaff, one of Cardiff''s most loved salons, before deciding it was time to swap the hustle of running a full team for something more personal — and a lot more peaceful. Now I work 1:1 with clients in a calm, friendly space where you will feel free to relax, gossip, offload, laugh, or hide from your responsibilities for a couple of hours. Wanting some quiet time? Perfect. Want to talk about your ex, your job, your dog, life crisis, and everything in between? Even better — I''ve heard it all. I''m known for genuinely seeing people — I listen, I support, I''m honest, which also means I''ll gently steer you away from hair ideas you''ll regret by the weekend. My goal is simple: hair that suits your vibe, your lifestyle, and your sanity. That''s something we will work out together. Alongside my freelance work, I also train stylists to meet their potential in colour, cutting, consultation and client care — so yes, I am a bit obsessed with neat blends, perfect placement and making sure your hair behaves when you''re not here. My chair is a welcoming place for everyone — all ages, all styles, all stages of life. If you are looking for hair that feels like you, whether that be a trim, a huge transformation, I''d love to look after you to feel fully yourself. (And if you leave feeling amazing and slightly addicted to coming back… don''t say I didn''t warn you.)',
  'Transparent Pricing',
  'Premium hair services tailored to your unique style and needs. All prices include consultation and aftercare advice.',
  '',
  'Portfolio',
  'Explore transformations that celebrate individuality and style',
  'Get In Touch',
  'Ready for a transformation? Let''s create something beautiful together.',
  '123 Main Street, Cardiff, CF10 1AB',
  '+44 7123 456789',
  'hello@victoriablushcollections.co.uk',
  '[{"label": "Mon & Tue", "value": "9AM - 7PM (Alt Weeks)"}, {"label": "Weds", "value": "9AM - 7PM"}, {"label": "Fri", "value": "9AM - 5PM"}, {"label": "Sat", "value": "8AM - 4PM"}, {"label": "Thurs & Sun", "value": "CLOSED"}]'::jsonb,
  'https://instagram.com/victoriablushcollections',
  'Where hair artistry meets individuality. Creating beautiful, lived-in looks that make you feel truly confident.'
)
ON CONFLICT DO NOTHING;
