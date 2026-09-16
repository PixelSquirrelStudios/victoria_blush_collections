BEGIN;

CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'education' CHECK (type IN ('education', 'homepage')),
  heading TEXT NOT NULL CHECK (length(trim(heading)) > 0),
  copy TEXT NOT NULL CHECK (length(trim(copy)) > 0),
  has_cta BOOLEAN NOT NULL DEFAULT false,
  cta_text TEXT NOT NULL DEFAULT '',
  cta_link TEXT NOT NULL DEFAULT '',
  background_colour TEXT NOT NULL DEFAULT 'white' CHECK (background_colour IN ('white', 'green')),
  sort_order BIGINT NOT NULL DEFAULT 0,
  CHECK (NOT has_cta OR (length(trim(cta_text)) > 0 AND length(trim(cta_link)) > 0))
);

ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT 'centre'
  CHECK (position IN ('left', 'centre', 'right'));

ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS image_alt TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS sections_type_order_idx ON public.sections (type, sort_order, id);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.sections TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.sections TO authenticated;

DROP POLICY IF EXISTS "Public sections" ON public.sections;
CREATE POLICY "Public sections" ON public.sections FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "Manage sections" ON public.sections;
CREATE POLICY "Manage sections" ON public.sections FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE OR REPLACE FUNCTION public.append_section_position()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.type IS DISTINCT FROM OLD.type THEN
    PERFORM pg_advisory_xact_lock(hashtext('public.sections.append'));
    SELECT COALESCE(max(sort_order), -1) + 1 INTO NEW.sort_order
      FROM public.sections WHERE type = NEW.type;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS append_section_position ON public.sections;
CREATE TRIGGER append_section_position BEFORE INSERT OR UPDATE OF type ON public.sections
  FOR EACH ROW EXECUTE FUNCTION public.append_section_position();

CREATE OR REPLACE FUNCTION public.reorder_sections(page_type TEXT, section_ids UUID[])
RETURNS VOID LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF page_type IS NULL OR page_type NOT IN ('education', 'homepage') THEN
    RAISE EXCEPTION 'Invalid section type';
  END IF;
  LOCK TABLE public.sections IN SHARE ROW EXCLUSIVE MODE;
  IF section_ids IS NULL
    OR cardinality(section_ids) <> (SELECT count(*) FROM public.sections WHERE type = page_type)
    OR cardinality(section_ids) <> (SELECT count(DISTINCT section_id) FROM unnest(section_ids) AS submitted(section_id))
    OR EXISTS (
      SELECT 1 FROM unnest(section_ids) AS submitted(section_id)
      WHERE NOT EXISTS (SELECT 1 FROM public.sections WHERE id = section_id AND type = page_type)
    ) THEN
    RAISE EXCEPTION 'Sections changed. Reload the page before reordering.';
  END IF;
  UPDATE public.sections AS section SET sort_order = submitted.position - 1
    FROM unnest(section_ids) WITH ORDINALITY AS submitted(section_id, position)
    WHERE section.id = submitted.section_id AND section.type = page_type;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_sections(TEXT, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_sections(TEXT, UUID[]) TO authenticated;

INSERT INTO public.sections (type, heading, copy, has_cta, cta_text, cta_link, background_colour)
SELECT 'education', seed.heading, seed.copy, seed.has_cta, seed.cta_text, seed.cta_link, seed.background_colour
FROM (VALUES
  (1, $heading$You might still love hair. You just might not love the way you're doing it anymore.$heading$,
  $copy$<p>This is for you if you're:</p>
<ul>
<li>employed and wondering if your salon still feels right for you</li>
<li>self-employed and tired of feeling like you can never switch off</li>
<li>working non-stop but still not earning enough for the hours you're putting in</li>
<li>fed up of late nights, weekends and constantly missing time with family and friends</li>
<li>managing a team and feeling like you're carrying everyone else's problems</li>
<li>owning a salon and wondering when the &ldquo;freedom&rdquo; was supposed to start</li>
<li>constantly busy but still feeling flat, tired or unhappy</li>
<li>questioning whether you need a change, but scared of making the wrong move</li>
<li>feeling like you've lost a bit of yourself somewhere along the way</li>
</ul>
<p>You might be booked out, working hard and doing everything you thought you were supposed to do &mdash; and still thinking:</p>
<blockquote><p>&ldquo;Why am I working this much if I'm not actually enjoying my life?&rdquo;</p></blockquote>
<p>You don't need to know the answer yet.</p>
<p>You just need to know that you don't want to keep feeling like this.</p>$copy$,
  false, '', '', 'green'),
  (2, $heading$When you're still showing up, but inside you're done.$heading$,
  $copy$<p>Burnout doesn't always look like falling apart.</p>
<p>Sometimes it looks like:</p>
<p>Still doing your clients.<br>Still smiling.<br>Still sorting everyone else out.<br>Still getting through the day.</p>
<p>But underneath it, you might be thinking:</p>
<blockquote><p>&ldquo;I'm exhausted.&rdquo;<br>&ldquo;I can't keep doing this.&rdquo;<br>&ldquo;I don't even know what I want anymore.&rdquo;<br>&ldquo;I've lost my confidence.&rdquo;<br>&ldquo;I'm fed up of worrying about money, clients, staff, targets and everything else.&rdquo;<br>&ldquo;I used to love this. Why don't I feel like that now?&rdquo;</p></blockquote>
<p>You might not want to leave hair.</p>
<p>You may just need a different way of being in it.</p>$copy$,
  false, '', '', 'white'),
  (3, $heading$I'm not here to tell you to quit, open a salon or go self-employed.$heading$,
  $copy$<p>I'm here to help you work out what you actually want.</p>
<p>We can look at things like:</p>
<ul><li>why work is draining you so much</li><li>whether it's the salon, the role, the hours, the pressure or something else</li><li>whether you've outgrown where you are</li><li>whether self-employment is actually right for you</li><li>whether managing or owning a salon is still what you want</li><li>where your confidence has gone</li><li>what's making you scared to change anything</li><li>what needs to change first so life feels lighter again</li></ul>
<p>Sometimes you don't need a massive life overhaul.</p>
<p>You just need to stop running on autopilot long enough to hear yourself properly.</p>$copy$,
  false, '', '', 'green'),
  (4, $heading$Support for where you are now - and where you want to go next.$heading$,
  $copy$<h3>The Shift Session</h3>
<p>A private 75-minute 1:1 session for hairdressers, managers and salon owners who know something needs to change but don't know what.</p>
<p>We'll talk through what's really going on, what's making you feel stuck, what you actually want, and what your next step could look like.</p>
<p>You'll leave with more clarity and a simple plan rather than another head full of thoughts.</p>$copy$,
  true, 'Book The Shift Session', 'mailto:hello@victoriablushcollections.co.uk?subject=The%20Shift%20Session', 'white'),
  (5, '1:1 Mentoring',
  $copy$<p>For when you want more than one conversation.</p>
<p>This could be around confidence, changing direction, becoming self-employed, stepping into management, running a salon, boundaries, burnout or simply figuring out what you want next.</p>$copy$,
  true, 'Enquire about 1:1 mentoring', 'mailto:hello@victoriablushcollections.co.uk?subject=1%3A1%20Mentoring', 'green'),
  (6, 'Salon & Team Education',
  $copy$<p>For salons that want stronger teams, better communication, more confidence and less firefighting.</p>
<p>Practical sessions around leadership, culture, standards, client experience, confidence and how people actually work together day to day.</p>$copy$,
  true, 'Enquire about salon education', 'mailto:hello@victoriablushcollections.co.uk?subject=Salon%20Education', 'white'),
  (7, $heading$I've lived this industry, not just studied it.$heading$,
  $copy$<p>I've spent more than 25 years in hair.</p>
<p>I've been behind the chair, built salons, led teams, managed people, dealt with staff problems, worried about money, made big decisions and carried the pressure that comes with being the one everyone looks to.</p>
<p>And I've also reached the point where something I had worked incredibly hard for no longer felt like the life I wanted.</p>
<p>So I understand the strange guilt that comes with thinking:</p>
<blockquote><p>&ldquo;I should be grateful&hellip; so why am I not happy?&rdquo;</p></blockquote>
<p>I know how hard it is to admit when something needs to change.</p>
<p>And I know how easy it is to keep going because everyone else thinks you're doing brilliantly.</p>
<p>That experience is what I bring into this work.</p>$copy$,
  false, '', '', 'green'),
  (8, $heading$No "just work harder" advice.$heading$,
  $copy$<p>There's already enough pressure in this industry to:</p>
<p>post more<br>sell more<br>rebook more<br>earn more<br>grow more<br>be more confident<br>build a bigger team<br>open another salon</p>
<p>Sometimes more isn't the answer.</p>
<p>Sometimes the answer is working out what you actually want before you keep pushing yourself towards something you don't even want anymore.</p>
<p>I'm interested in the person behind the hairdresser.</p>
<p>How you feel.<br>What you want.<br>What's draining you.<br>What would make work feel good again.</p>$copy$,
  false, '', '', 'white'),
  (9, 'Less noise in your head. More clarity about what comes next.',
  $copy$<p>Depending on how we work together, the aim is to help you feel:</p>
<ul><li>clearer about what you want</li><li>more confident making decisions</li><li>less overwhelmed</li><li>less guilty about wanting something different</li><li>stronger with boundaries</li><li>more in control of your work</li><li>excited about your career again</li><li>clearer on your next move</li></ul>
<p>Not a new version of you.</p>
<p>Just more of you again.</p>$copy$,
  false, '', '', 'green'),
  (10, 'You are allowed to love hair and still want things to feel different.',
  $copy$<p>You are allowed to want a successful career without being exhausted all the time.</p>
<p>You are allowed to want money and freedom.</p>
<p>You are allowed to want ambition and a life outside of work.</p>
<p>You are allowed to change your mind.</p>
<p>And you are allowed to admit when something that used to fit you doesn't anymore.</p>
<p>If you know something needs to change but you don't know what, we can start there.</p>$copy$,
  true, 'Start with The Shift Session', 'mailto:hello@victoriablushcollections.co.uk?subject=The%20Shift%20Session', 'white')
) AS seed(position, heading, copy, has_cta, cta_text, cta_link, background_colour)
WHERE NOT EXISTS (SELECT 1 FROM public.sections WHERE type = 'education')
ORDER BY seed.position;

COMMIT;