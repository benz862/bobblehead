import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, verifyCode } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // STEP 2: Verify the code they entered
    if (verifyCode) {
      const { data: record } = await supabase
        .from("promo_emails")
        .select("verify_code, redeemed, promo_code")
        .eq("email", normalizedEmail)
        .single();

      if (!record) {
        return NextResponse.json({ error: "Email not found. Please request a code first." }, { status: 400 });
      }

      if (record.redeemed) {
        return NextResponse.json({ error: "This email has already been used for a free bobblehead." }, { status: 400 });
      }

      if (record.verify_code !== verifyCode.trim()) {
        return NextResponse.json({ error: "Incorrect code. Please check your email and try again." }, { status: 400 });
      }

      // Mark as verified
      await supabase
        .from("promo_emails")
        .update({ verified: true })
        .eq("email", normalizedEmail);

      console.log(`[Promo] ✅ Email ${normalizedEmail} verified — promo: ${record.promo_code}`);

      return NextResponse.json({
        code: record.promo_code,
        message: "Your free bobblehead code is ready!",
      });
    }

    // STEP 1: Send verification code + promo code to email
    const { data: existing } = await supabase
      .from("promo_emails")
      .select("redeemed")
      .eq("email", normalizedEmail)
      .single();

    if (existing?.redeemed) {
      return NextResponse.json({ error: "This email has already been used for a free bobblehead." }, { status: 400 });
    }

    // Generate 6-digit verification code
    const verificationCode = String(Math.floor(100000 + Math.random() * 900000));

    // Generate unique promo code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let promoCode = 'BOBBLE-';
    for (let i = 0; i < 6; i++) promoCode += chars[Math.floor(Math.random() * chars.length)];

    // Upsert email with both codes
    await supabase
      .from("promo_emails")
      .upsert([{
        email: normalizedEmail,
        verify_code: verificationCode,
        promo_code: promoCode,
        verified: false,
        created_at: new Date().toISOString(),
      }], { onConflict: "email" });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://bobbleme.app";
    const builderLink = `${baseUrl}/builder?promo=${promoCode}`;

    // Send email with verification code + promo code + builder link
    await resend.emails.send({
      from: "BobbleMe! <noreply@bobbleme.app>",
      to: normalizedEmail,
      subject: "🎁 Your FREE BobbleMe! Code Inside",
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; text-align: center;">
          <h1 style="font-size: 28px; margin-bottom: 8px;">🗿 BobbleMe!</h1>
          <p style="color: #666; font-size: 16px; margin-bottom: 24px;">Your free bobblehead is waiting!</p>
          
          <div style="background: #f8f5ff; border-radius: 12px; padding: 20px; margin-bottom: 20px; text-align: left;">
            <p style="color: #666; font-size: 13px; margin: 0 0 4px;">Step 1 — Verify your email with this code:</p>
            <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #9333ea; font-family: monospace; text-align: center; padding: 12px 0;">${verificationCode}</div>
          </div>

          <div style="background: linear-gradient(135deg, #9333ea, #ec4899); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="color: rgba(255,255,255,0.8); font-size: 13px; margin: 0 0 4px;">Step 2 — Your unique promo code:</p>
            <div style="font-size: 24px; font-weight: 800; letter-spacing: 4px; color: white; font-family: monospace; padding: 8px 0;">${promoCode}</div>
          </div>

          <a href="${builderLink}" style="display: inline-block; background: linear-gradient(135deg, #9333ea, #ec4899); color: white; font-weight: 700; font-size: 16px; padding: 14px 32px; border-radius: 50px; text-decoration: none; margin: 8px 0 24px;">🎨 Start Building My Bobblehead →</a>

          <p style="color: #999; font-size: 12px; line-height: 1.5;">Click the button above or go to <a href="${builderLink}" style="color: #9333ea;">${baseUrl}</a> and enter your code. Limited time offer!</p>
        </div>
      `,
    });

    console.log(`[Promo] 📧 Code sent to ${normalizedEmail} — promo: ${promoCode}`);

    return NextResponse.json({
      sent: true,
      message: "Check your email for your free bobblehead code!",
    });
  } catch (err: any) {
    console.error("[Promo] Error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
