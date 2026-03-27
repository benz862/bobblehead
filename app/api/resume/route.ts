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

    // Find orders for this email
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, tier, credits_total, credits_used, created_at")
      .eq("customer_email", email.toLowerCase().trim())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Resume] DB error:", error);
      return NextResponse.json({ error: "Failed to look up orders" }, { status: 500 });
    }

    // For each order, fetch completed generation images
    const ordersWithImages = await Promise.all(
      (orders || []).map(async (order) => {
        const { data: generations } = await supabase
          .from("generations")
          .select("output_image_url")
          .eq("order_id", order.id)
          .eq("status", "completed")
          .order("created_at", { ascending: true });

        return {
          ...order,
          completedImages: (generations || [])
            .map((g: any) => g.output_image_url)
            .filter(Boolean),
        };
      })
    );

    return NextResponse.json({ orders: ordersWithImages });
  } catch (err: any) {
    console.error("Resume API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
