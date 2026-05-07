import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL for /api/orders/create"
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TIER_PRICES: Record<number, number> = {
  1: 799,
  3: 1999,
  5: 2799,
};

export async function POST(req: Request) {
  try {
    const { tier } = await req.json();
    const parsedTier = Number(tier);

    if (!TIER_PRICES[parsedTier]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          tier: parsedTier,
          amount: TIER_PRICES[parsedTier],
          status: "pending",
          credits_total: parsedTier,
          credits_used: 0,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
