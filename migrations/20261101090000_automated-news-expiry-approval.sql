-- Automated Bangla news ingestion and admin-approved expiry cleanup.
ALTER TABLE public.news
  ALTER COLUMN author_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS external_id text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS fetched_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS news_external_id_uidx
  ON public.news (external_id)
  WHERE external_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS news_source_url_uidx
  ON public.news (source_url)
  WHERE source_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS news_expiry_idx
  ON public.news (expires_at)
  WHERE status = 'published' AND expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.news_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id uuid NOT NULL,
  news_title text NOT NULL,
  source_url text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  decision text NOT NULL DEFAULT 'pending'
    CHECK (decision IN ('pending', 'approved', 'rejected')),
  decided_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  decided_at timestamptz,
  reason text,
  UNIQUE (news_id)
);

CREATE INDEX IF NOT EXISTS news_deletion_requests_pending_idx
  ON public.news_deletion_requests (requested_at DESC)
  WHERE decision = 'pending';

ALTER TABLE public.news_deletion_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.news_deletion_requests FROM anon, authenticated;
GRANT SELECT, UPDATE ON public.news_deletion_requests TO authenticated;

DROP POLICY IF EXISTS news_deletion_requests_staff_read ON public.news_deletion_requests;
CREATE POLICY news_deletion_requests_staff_read
  ON public.news_deletion_requests FOR SELECT TO authenticated
  USING (public.is_current_user_staff());

DROP POLICY IF EXISTS news_deletion_requests_staff_update ON public.news_deletion_requests;
CREATE POLICY news_deletion_requests_staff_update
  ON public.news_deletion_requests FOR UPDATE TO authenticated
  USING (public.is_current_user_staff())
  WITH CHECK (public.is_current_user_staff());

CREATE OR REPLACE FUNCTION public.decide_news_deletion_request(
  p_request_id uuid,
  p_decision text,
  p_reason text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_request public.news_deletion_requests%ROWTYPE;
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL OR p_decision NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Not authorized or invalid decision';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_actor AND role IN ('admin', 'moderator')
  ) THEN
    RAISE EXCEPTION 'Only staff can decide news deletion requests';
  END IF;

  SELECT * INTO v_request
  FROM public.news_deletion_requests
  WHERE id = p_request_id AND decision = 'pending'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF p_decision = 'approved' THEN
    DELETE FROM public.news WHERE id = v_request.news_id;
  END IF;

  UPDATE public.news_deletion_requests
  SET decision = p_decision,
      decided_by = v_actor,
      decided_at = now(),
      reason = NULLIF(left(coalesce(p_reason, ''), 500), '')
  WHERE id = p_request_id;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.decide_news_deletion_request(uuid, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.decide_news_deletion_request(uuid, text, text) TO authenticated;
