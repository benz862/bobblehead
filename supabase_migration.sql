-- =============================================================
-- bobbleme.app  |  Coupon Codes Table
-- Run this in your Supabase SQL Editor
-- =============================================================

-- 1. Create the coupon_codes table
CREATE TABLE IF NOT EXISTS public.coupon_codes (
  id            UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
  email         TEXT                     NOT NULL UNIQUE,
  code          TEXT                     NOT NULL UNIQUE,
  redeemed      BOOLEAN                  NOT NULL DEFAULT FALSE,
  redeemed_at   TIMESTAMP WITH TIME ZONE,
  sent_at       TIMESTAMP WITH TIME ZONE,
  created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast lookups (code validation & email lookup)
CREATE INDEX IF NOT EXISTS idx_coupon_codes_code  ON public.coupon_codes (code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_email ON public.coupon_codes (email);

-- 3. Enable Row Level Security
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- 4. Policy: only your backend service role can read/write
--    (anon users cannot access this table at all)
--    Your app should use the service_role key to validate codes server-side.
CREATE POLICY "Service role only" ON public.coupon_codes
  USING (auth.role() = 'service_role');

-- =============================================================
-- OPTIONAL: Function to validate and redeem a code
-- Call this from your bobbleme.app backend when a user submits a code.
-- Returns TRUE if the code was valid & successfully redeemed,
-- FALSE if invalid or already used.
-- =============================================================
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code TEXT, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_row public.coupon_codes%ROWTYPE;
BEGIN
  -- Lock the row to prevent race conditions
  SELECT * INTO v_row
  FROM public.coupon_codes
  WHERE code = UPPER(TRIM(p_code))
  FOR UPDATE;

  -- Code not found
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Already redeemed
  IF v_row.redeemed THEN
    RETURN FALSE;
  END IF;

  -- Mark as redeemed
  UPDATE public.coupon_codes
  SET
    redeemed    = TRUE,
    redeemed_at = NOW()
  WHERE id = v_row.id;

  RETURN TRUE;
END;
$$;

-- =============================================================
-- OPTIONAL: Handy admin views
-- =============================================================

-- See all unredeemed codes
CREATE OR REPLACE VIEW public.v_unredeemed_codes AS
SELECT email, code, created_at
FROM public.coupon_codes
WHERE redeemed = FALSE
ORDER BY created_at DESC;

-- Redemption stats
CREATE OR REPLACE VIEW public.v_coupon_stats AS
SELECT
  COUNT(*)                                           AS total_sent,
  SUM(CASE WHEN redeemed THEN 1 ELSE 0 END)          AS total_redeemed,
  ROUND(
    100.0 * SUM(CASE WHEN redeemed THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    1
  )                                                  AS redemption_rate_pct
FROM public.coupon_codes;
