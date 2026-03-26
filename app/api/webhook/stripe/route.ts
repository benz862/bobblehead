import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe and Supabase clients
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // We will attach the internal order ID to the Stripe session metadata when creating the checkout
    const orderId = session.metadata?.orderId;

    if (orderId) {
      // 1. Update the order status in Supabase
      const { error } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        return new NextResponse("Database Error", { status: 500 });
      }

      // 2. Trigger the AI Generation pipeline here or via an edge function
      // triggerGenerationPipeline(orderId);
      console.log(`Order ${orderId} successfully paid and queued for generation.`);
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
