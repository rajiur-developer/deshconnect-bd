-- Run the blood-request expiry cleanup hourly in Bangladesh local-time logic.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'deshconnect-blood-request-expiry'
  ) THEN
    PERFORM cron.schedule(
      'deshconnect-blood-request-expiry',
      '0 * * * *',
      'SELECT public.delete_expired_blood_requests();'
    );
  END IF;
END;
$$;
