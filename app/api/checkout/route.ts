import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any,
});

// Stripe Price IDs for each tier
const PRICE_IDS: Record<number, string> = {
  1: "price_1TEU0HE6oTidvpnUaQ8KRguF",  // BobbleMe - 1 Image  ($7.99)
  3: "price_1TEU0HE6oTidvpnUNJ0wmsvH",  // BobbleMe - 3 Images ($19.99)
  5: "price_1TEU0HE6oTidvpnUNXVhXuuA",  // BobbleMe - 5 Images ($27.99)
};

// Set to false to enable real Stripe checkout
const DEMO_MODE = false;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, tier, promoCode, promoEmail } = body;

    if (!orderId || !tier) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const priceId = PRICE_IDS[tier as number];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // PROMO CODE CHECK
    if (promoCode) {
      const expiresAt = process.env.PROMO_EXPIRES 
        ? new Date(process.env.PROMO_EXPIRES) 
        : new Date(Date.now() + 24 * 60 * 60 * 1000);

      if (new Date() > expiresAt) {
        return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
      }

      // Look up the code in the database
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: promoRecord } = await supabase
        .from("promo_emails")
        .select("email, verified, redeemed, promo_code")
        .eq("promo_code", promoCode.toUpperCase().trim())
        .single();

      if (!promoRecord || !promoRecord.verified) {
        return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
      }

      if (promoRecord.redeemed) {
        return NextResponse.json({ error: "This promo code has already been used." }, { status: 400 });
      }

      // Mark as redeemed
      await supabase
        .from("promo_emails")
        .update({ redeemed: true, redeemed_at: new Date().toISOString(), order_id: orderId })
        .eq("promo_code", promoCode.toUpperCase().trim());

      console.log(`[Promo] ✅ Code ${promoCode} redeemed by ${promoRecord.email} for order ${orderId}`);

      return NextResponse.json({ 
        url: `${origin}/success?session_id=promo_${promoCode}&order_id=${orderId}`,
        promo: true,
      });
    }

    // DEMO MODE: Skip Stripe and go straight to success
    if (DEMO_MODE) {
      return NextResponse.json({ 
        url: `${origin}/success?session_id=demo_bypass&order_id=${orderId}` 
      });
    }

    // PRODUCTION MODE: Create real Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
      cancel_url: `${origin}/builder?tier=${tier}`,
      metadata: {
        orderId: String(orderId),
        tier: String(tier),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Checkout Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
