import { NextResponse } from "next/server";

/**
 * POST /api/heygen-upsell
 *
 * Accepts a multipart/form-data payload from the upsell page.
 * Currently MOCKED — logs the payload and returns a mock job ID.
 * Replace the mock block with the real HeyGen SDK call once
 * HEYGEN_API_KEY is added to .env.local.
 *
 * Fields:
 *   orderId        string   — BobbleMe order ID
 *   tierSelected   "1"|"2"  — Upsell tier chosen
 *   voiceClone     "true"|"false"
 *   script         string   — Tier 1: customer-pasted script
 *   bullet_0..2    string   — Tier 2: AI scriptwriting bullet points
 *   backgroundFile File?    — Tier 2: custom background image
 *   voiceFile      File?    — Voice clone: sample audio
 */
export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const orderId       = form.get("orderId")      as string;
    const tierSelected  = form.get("tierSelected") as string;
    const voiceClone    = form.get("voiceClone")   === "true";
    const script        = form.get("script")       as string | null;
    const bullet0       = form.get("bullet_0")     as string | null;
    const bullet1       = form.get("bullet_1")     as string | null;
    const bullet2       = form.get("bullet_2")     as string | null;
    const backgroundFile = form.get("backgroundFile") as File | null;
    const voiceFile      = form.get("voiceFile")      as File | null;

    if (!orderId || !tierSelected) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, tierSelected" },
        { status: 400 }
      );
    }

    // --- LOG PAYLOAD (dev/mock) ---
    console.log("[HeyGen Upsell] 🎬 New video upsell request:");
    console.log("  Order ID:     ", orderId);
    console.log("  Tier:         ", tierSelected);
    console.log("  Voice Clone:  ", voiceClone);
    if (tierSelected === "1") {
      console.log("  Script:       ", script?.slice(0, 80), "...");
    } else {
      console.log("  Bullet 1:     ", bullet0);
      console.log("  Bullet 2:     ", bullet1);
      console.log("  Bullet 3:     ", bullet2);
      console.log("  BG File:      ", backgroundFile?.name ?? "none");
    }
    if (voiceClone) {
      console.log("  Voice File:   ", voiceFile?.name ?? "none");
    }

    // --- MOCK RESPONSE ---
    // TODO: Replace with real HeyGen API call:
    //   const heygen = new HeyGenClient({ apiKey: process.env.HEYGEN_API_KEY! });
    //   const job = await heygen.videos.create({ ... });
    const mockJobId = `heygen_mock_${Date.now()}`;

    return NextResponse.json({
      success: true,
      videoJobId: mockJobId,
      message: "Your video is being created! We'll email you when it's ready.",
    });
  } catch (err: any) {
    console.error("[HeyGen Upsell] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
