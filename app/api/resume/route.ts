import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Find orders with remaining credits for this email
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, tier, credits_total, credits_used, created_at")
      .eq("customer_email", email.toLowerCase().trim())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Resume] DB error:", error);
      return NextResponse.json({ error: "Failed to look up orders" }, { status: 500 });
    }

    // Filter to only orders with remaining credits
    const activeOrders = (orders || []).filter(o => o.credits_used < o.credits_total);

    return NextResponse.json({ orders: activeOrders });
  } catch (err: any) {
    console.error("Resume API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
