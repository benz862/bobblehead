"""
bobbleme.app  |  Free Bobblehead Email Campaign
================================================
Reads your Etsy email CSV, generates a unique coupon code per recipient,
stores them in Supabase, then sends personalised HTML emails via Resend.

Setup:
  pip install resend supabase python-dotenv

Create a .env file alongside this script with:
  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
  SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
  SUPABASE_SERVICE_KEY=eyJhbGci...   (use service_role key, NOT anon key)
  FROM_EMAIL=hello@bobbleme.app      (must be a verified Resend sender domain)
  FROM_NAME=The BobbleMe Team
  CSV_FILE=ETSY Emails.csv
  EMAIL_COLUMN=email                 (column name in your CSV — auto-detected if blank)
  DRY_RUN=false                      (set to "true" to preview without sending)
  BATCH_SIZE=50                      (emails per batch — Resend free tier is safe at 50)
  BATCH_DELAY_SECONDS=2              (pause between batches to respect rate limits)
"""

import csv
import os
import random
import string
import time
import sys
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────────────

RESEND_API_KEY        = os.getenv("RESEND_API_KEY", "")
SUPABASE_URL          = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY  = os.getenv("SUPABASE_SERVICE_KEY", "")
FROM_EMAIL            = os.getenv("FROM_EMAIL", "hello@bobbleme.app")
FROM_NAME             = os.getenv("FROM_NAME", "The BobbleMe Team")
CSV_FILE              = os.getenv("CSV_FILE", "ETSY Emails.csv")
EMAIL_COLUMN          = os.getenv("EMAIL_COLUMN", "")       # auto-detect if blank
DRY_RUN               = os.getenv("DRY_RUN", "false").lower() == "true"
BATCH_SIZE            = int(os.getenv("BATCH_SIZE", "50"))
BATCH_DELAY           = float(os.getenv("BATCH_DELAY_SECONDS", "2"))
CODE_LENGTH           = 8                                    # 6–8 char alphanumeric codes
SUBJECT               = "🎁 Your FREE custom bobblehead is waiting for you!"

# ── Template ──────────────────────────────────────────────────────────────────

TEMPLATE_FILE = Path(__file__).parent / "email_template.html"

def load_template() -> str:
    if not TEMPLATE_FILE.exists():
        print(f"ERROR: email_template.html not found at {TEMPLATE_FILE}")
        sys.exit(1)
    return TEMPLATE_FILE.read_text(encoding="utf-8")

def render(template: str, email: str, code: str) -> str:
    return (
        template
        .replace("{{COUPON_CODE}}", code)
        .replace("{{EMAIL}}", email)
    )

# ── Code generation ───────────────────────────────────────────────────────────

def generate_codes(emails: list[str], length: int = CODE_LENGTH) -> dict[str, str]:
    """Generate a unique BOBBLE-XXXXXXXX code for every email address."""
    chars = string.ascii_uppercase + string.digits
    used: set[str] = set()
    mapping: dict[str, str] = {}
    for email in emails:
        while True:
            code = "BOBBLE-" + "".join(random.choices(chars, k=length))
            if code not in used:
                used.add(code)
                mapping[email] = code
                break
    return mapping

# ── CSV helpers ───────────────────────────────────────────────────────────────

EMAIL_HEADER_CANDIDATES = {"email", "e-mail", "email address", "buyer email", "emailaddress"}

def detect_email_column(fieldnames: list[str]) -> str | None:
    for name in fieldnames:
        if name.strip().lower() in EMAIL_HEADER_CANDIDATES:
            return name
    # Fallback: look for any column containing an "@" in the first data row
    return None

def read_emails(csv_path: str, column_hint: str = "") -> list[str]:
    emails: list[str] = []
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []

        col = column_hint.strip() if column_hint else ""
        if not col:
            col = detect_email_column(list(fieldnames))
        if not col:
            # Last resort: use first column
            col = fieldnames[0] if fieldnames else None

        if not col:
            print("ERROR: Could not detect email column in CSV.")
            sys.exit(1)

        print(f"  Using CSV column: '{col}'")

        seen: set[str] = set()
        skipped = 0
        for row in reader:
            raw = row.get(col, "").strip().lower()
            if "@" in raw and raw not in seen:
                seen.add(raw)
                emails.append(raw)
            else:
                skipped += 1

    print(f"  Loaded {len(emails)} unique valid emails ({skipped} skipped/duplicate).")
    return emails

# ── Supabase ──────────────────────────────────────────────────────────────────

def get_supabase_client():
    try:
        from supabase import create_client
        return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    except ImportError:
        print("ERROR: supabase package not installed. Run: pip install supabase")
        sys.exit(1)

def store_codes_in_supabase(mapping: dict[str, str]) -> None:
    """Upsert all email→code pairs into the promo_emails table.
    
    Uses the SAME table the checkout route validates against.
    Campaign codes are pre-verified (verified=True) since the email itself
    serves as verification — no 2-step flow needed.
    """
    if DRY_RUN:
        print("  [DRY RUN] Skipping Supabase insert.")
        return

    client = get_supabase_client()
    now = datetime.now(timezone.utc).isoformat()
    records = [
        {
            "email": email,
            "promo_code": code,
            "verified": True,       # Pre-verified — email IS the verification
            "redeemed": False,
            "created_at": now,
        }
        for email, code in mapping.items()
    ]

    print(f"  Inserting {len(records)} records into promo_emails...")
    # Upsert in chunks of 500 to stay within Supabase row limits
    chunk_size = 500
    for i in range(0, len(records), chunk_size):
        chunk = records[i : i + chunk_size]
        client.table("promo_emails").upsert(chunk, on_conflict="email").execute()
        print(f"  ✓ Stored rows {i+1}–{min(i+chunk_size, len(records))}")

# ── Resend ────────────────────────────────────────────────────────────────────

def get_resend():
    try:
        import resend as resend_lib
        resend_lib.api_key = RESEND_API_KEY
        return resend_lib
    except ImportError:
        print("ERROR: resend package not installed. Run: pip install resend")
        sys.exit(1)

def send_emails(mapping: dict[str, str], template: str) -> None:
    resend = get_resend()
    total   = len(mapping)
    sent    = 0
    failed  = 0
    items   = list(mapping.items())

    print(f"\n{'[DRY RUN] ' if DRY_RUN else ''}Sending {total} emails in batches of {BATCH_SIZE}...\n")

    for batch_start in range(0, total, BATCH_SIZE):
        batch = items[batch_start : batch_start + BATCH_SIZE]

        for email, code in batch:
            html_body = render(template, email, code)

            if DRY_RUN:
                print(f"  [DRY RUN] Would send to: {email}  |  code: {code}")
                sent += 1
                continue

            try:
                resend.Emails.send({
                    "from":    f"{FROM_NAME} <{FROM_EMAIL}>",
                    "to":      [email],
                    "subject": SUBJECT,
                    "html":    html_body,
                })
                sent += 1
                if sent % 10 == 0 or sent == total:
                    print(f"  ✓ Sent {sent}/{total}")
            except Exception as exc:
                failed += 1
                print(f"  ✗ Failed [{email}]: {exc}")

        # Pause between batches
        if batch_start + BATCH_SIZE < total:
            print(f"  ⏳ Batch done — waiting {BATCH_DELAY}s before next batch...")
            time.sleep(BATCH_DELAY)

    print(f"\n{'─'*50}")
    print(f"  Campaign complete: {sent} sent, {failed} failed.")

# ── Output CSV (email → code tracking sheet) ─────────────────────────────────

def save_tracking_csv(mapping: dict[str, str]) -> None:
    out_path = Path(__file__).parent / "coupon_codes_tracking.csv"
    with open(out_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["email", "coupon_code", "redeemed", "redeemed_at"])
        for email, code in mapping.items():
            writer.writerow([email, code, "FALSE", ""])
    print(f"\n  ✓ Tracking sheet saved → {out_path.name}")

# ── Main ──────────────────────────────────────────────────────────────────────

def validate_config() -> None:
    issues = []
    if not RESEND_API_KEY and not DRY_RUN:
        issues.append("RESEND_API_KEY is not set")
    if not SUPABASE_URL and not DRY_RUN:
        issues.append("SUPABASE_URL is not set")
    if not SUPABASE_SERVICE_KEY and not DRY_RUN:
        issues.append("SUPABASE_SERVICE_KEY is not set")
    if issues:
        print("Config errors:")
        for issue in issues:
            print(f"  • {issue}")
        sys.exit(1)

def main() -> None:
    print("\n╔══════════════════════════════════════════════╗")
    print("║   bobbleme.app  |  Free Bobblehead Campaign   ║")
    print("╚══════════════════════════════════════════════╝\n")

    if DRY_RUN:
        print("⚠️  DRY RUN MODE — no emails will be sent, no DB writes.\n")

    validate_config()

    # 1. Read emails
    print("1. Reading email list...")
    emails = read_emails(CSV_FILE, EMAIL_COLUMN)

    # 2. Generate codes
    print("\n2. Generating unique coupon codes...")
    mapping = generate_codes(emails)
    print(f"  ✓ Generated {len(mapping)} unique {CODE_LENGTH}-character codes.")

    # 3. Save tracking CSV
    print("\n3. Saving tracking spreadsheet...")
    save_tracking_csv(mapping)

    # 4. Store in Supabase
    print("\n4. Storing codes in Supabase...")
    store_codes_in_supabase(mapping)

    # 5. Load email template
    print("\n5. Loading email template...")
    template = load_template()
    print("  ✓ Template loaded.")

    # 6. Send emails
    send_emails(mapping, template)

if __name__ == "__main__":
    main()
