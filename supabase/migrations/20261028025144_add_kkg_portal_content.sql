-- Additive portal features; existing records and policies remain intact.
CREATE TABLE public.kkg_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('profile','committee','program','documentation','practice','resource','service')),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  summary text NOT NULL DEFAULT '' CHECK (length(summary) <= 500),
  body text NOT NULL DEFAULT '' CHECK (length(body) <= 30000),
  author_name text NOT NULL DEFAULT '' CHECK (length(author_name) <= 200),
  image_url text NOT NULL DEFAULT '' CHECK (image_url = '' OR (length(image_url) <= 2000 AND image_url ~ '^https?://')),
  link_url text NOT NULL DEFAULT '' CHECK (link_url = '' OR (length(link_url) <= 2000 AND link_url ~ '^https?://')),
  tags text[] NOT NULL DEFAULT '{}' CHECK (cardinality(tags) <= 20),
  details jsonb NOT NULL DEFAULT '{}' CHECK (jsonb_typeof(details) = 'object' AND octet_length(details::text) <= 60000),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order BETWEEN 0 AND 9999),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT resource_link_required CHECK (kind <> 'resource' OR link_url <> '')
);
CREATE INDEX kkg_content_kind_status_order ON public.kkg_content(kind,status,sort_order,created_at DESC);
ALTER TABLE public.kkg_content ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.kkg_content FROM anon, authenticated;
GRANT SELECT ON public.kkg_content TO anon, authenticated;
GRANT INSERT, UPDATE ON public.kkg_content TO authenticated;
CREATE POLICY "Read published content" ON public.kkg_content FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admin read content" ON public.kkg_content FOR SELECT TO authenticated USING ((SELECT public.is_kkg_admin()));
CREATE POLICY "Admin insert content" ON public.kkg_content FOR INSERT TO authenticated WITH CHECK ((SELECT public.is_kkg_admin()));
CREATE POLICY "Admin update content" ON public.kkg_content FOR UPDATE TO authenticated USING ((SELECT public.is_kkg_admin())) WITH CHECK ((SELECT public.is_kkg_admin()));

CREATE TABLE public.kkg_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('practice','resource','suggestion')),
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  body text NOT NULL CHECK (length(btrim(body)) BETWEEN 10 AND 15000),
  author_name text NOT NULL CHECK (length(btrim(author_name)) BETWEEN 2 AND 200),
  school_name text NOT NULL CHECK (length(btrim(school_name)) BETWEEN 2 AND 200),
  link_url text NOT NULL DEFAULT '' CHECK (link_url = '' OR (length(link_url) <= 2000 AND link_url ~ '^https?://')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','rejected')),
  published_content_id uuid REFERENCES public.kkg_content(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  CONSTRAINT submitted_resource_link_required CHECK (kind <> 'resource' OR link_url <> '')
);
CREATE INDEX kkg_submissions_status_created ON public.kkg_submissions(status,created_at DESC);
CREATE INDEX kkg_submissions_published_content ON public.kkg_submissions(published_content_id);
ALTER TABLE public.kkg_submissions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.kkg_submissions FROM anon, authenticated;
GRANT INSERT (id,kind,title,body,author_name,school_name,link_url) ON public.kkg_submissions TO anon, authenticated;
GRANT SELECT, UPDATE ON public.kkg_submissions TO authenticated;
CREATE POLICY "Submit for moderation" ON public.kkg_submissions FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending' AND published_content_id IS NULL AND reviewed_at IS NULL);
CREATE POLICY "Admin read submissions" ON public.kkg_submissions FOR SELECT TO authenticated USING ((SELECT public.is_kkg_admin()));
CREATE POLICY "Admin review submissions" ON public.kkg_submissions FOR UPDATE TO authenticated USING ((SELECT public.is_kkg_admin())) WITH CHECK ((SELECT public.is_kkg_admin()));

CREATE FUNCTION public.touch_kkg_content() RETURNS trigger
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
BEGIN
  NEW.updated_at := clock_timestamp();
  NEW.created_at := OLD.created_at;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.touch_kkg_content() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER touch_kkg_content BEFORE UPDATE ON public.kkg_content FOR EACH ROW EXECUTE FUNCTION public.touch_kkg_content();

CREATE FUNCTION public.review_kkg_submission(submission_id uuid, review_action text) RETURNS uuid
LANGUAGE plpgsql SECURITY INVOKER SET search_path = '' AS $$
DECLARE submission public.kkg_submissions; content_id uuid;
BEGIN
  IF NOT (SELECT public.is_kkg_admin()) THEN RAISE EXCEPTION 'Akses pengurus diperlukan.'; END IF;
  SELECT * INTO submission FROM public.kkg_submissions WHERE id = submission_id FOR UPDATE;
  IF NOT FOUND OR submission.status <> 'pending' THEN RAISE EXCEPTION 'Kiriman tidak ditemukan atau sudah ditinjau. Muat ulang daftar.'; END IF;
  IF review_action NOT IN ('publish','review','reject') THEN RAISE EXCEPTION 'Tindakan tidak valid.'; END IF;
  IF review_action = 'publish' THEN
    IF submission.kind = 'suggestion' THEN RAISE EXCEPTION 'Usulan cukup ditandai sudah ditinjau.'; END IF;
    INSERT INTO public.kkg_content(kind,title,body,author_name,link_url,details,status)
      VALUES (submission.kind,submission.title,submission.body,submission.author_name,submission.link_url,jsonb_build_object('school',submission.school_name),'published')
      RETURNING id INTO content_id;
  END IF;
  UPDATE public.kkg_submissions SET status = CASE WHEN review_action = 'reject' THEN 'rejected' ELSE 'reviewed' END,
    published_content_id = content_id, reviewed_at = now() WHERE id = submission_id;
  RETURN content_id;
END;
$$;
REVOKE ALL ON FUNCTION public.review_kkg_submission(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_kkg_submission(uuid,text) TO authenticated;

ALTER TABLE public.announcements ADD COLUMN expires_on date, ADD COLUMN attachment_url text;
ALTER TABLE public.announcements ADD CONSTRAINT announcements_attachment_url_http CHECK (attachment_url IS NULL OR attachment_url = '' OR (length(attachment_url) <= 2000 AND attachment_url ~ '^https?://'));

INSERT INTO public.kkg_content(kind,title,summary,body,status) VALUES (
 'profile','KKG Kelas VI Kecamatan Pagu',
 'Ruang berbagi dan belajar bersama guru kelas VI di Kecamatan Pagu, Kabupaten Kediri.',
 'Portal KKG SIXVIBE • KKG6UP! menghubungkan informasi kegiatan, perangkat pembelajaran, dan kolaborasi guru kelas VI Kecamatan Pagu.',
 'published'
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.kkg_content, public.kkg_submissions;
