import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Server misconfigured for order lookup" },
      { status: 500 }
    );
  }

  const { orderId } = await context.params;
  if (!orderId || !/^\d+$/.test(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("credits_total, credits_used, tier")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const { data: uploadRows, error: uploadsError } = await supabase
    .from("uploads")
    .select("image_url")
    .eq("order_id", orderId);

  if (uploadsError) {
    return NextResponse.json({ error: uploadsError.message }, { status: 500 });
  }

  return NextResponse.json({
    order,
    uploads: (uploadRows ?? []).map((row) => row.image_url),
  });
}
