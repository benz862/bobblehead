import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

// Server-side routes must use the service-role key to bypass RLS.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { orderId, selectedImageUrl } = await req.json();

    if (!orderId || !selectedImageUrl) {
      return NextResponse.json({ error: "Missing orderId or selectedImageUrl" }, { status: 400 });
    }

    // Download the selected preview
    console.log(`[Upscale] Downloading selected preview for order ${orderId}...`);
    const imgRes = await fetch(selectedImageUrl);
    const imgBuffer = Buffer.from(await imgRes.arrayBuffer());

    const sizeKB = Math.round(imgBuffer.byteLength / 1024);
    console.log(`[Upscale] Original preview size: ${sizeKB}KB`);

    // Read original dimensions, then upscale 4× using Lanczos3 (high-quality)
    const metadata = await sharp(imgBuffer).metadata();
    const origW = metadata.width  ?? 1024;
    const origH = metadata.height ?? 1365;
    const targetW = origW * 4;
    const targetH = origH * 4;
    console.log(`[Upscale] ${origW}×${origH} → ${targetW}×${targetH} (4× Lanczos)`);

    const upscaledBuffer = await sharp(imgBuffer)
      .resize(targetW, targetH, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 6, quality: 100 })
      .toBuffer();

    const upscaledKB = Math.round(upscaledBuffer.byteLength / 1024);
    console.log(`[Upscale] Upscaled size: ${upscaledKB}KB`);
    const fileName = `final-${orderId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, upscaledBuffer, { contentType: 'image/png' });

    if (uploadError) {
      console.error("[Upscale] Failed to upload final image:", uploadError);
      throw new Error("Failed to save the final image.");
    }

    const { data: publicUrlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName);
      
    const finalUrl = publicUrlData.publicUrl;

    // Update the latest generation row for this order (the one in 'previewing' state)
    await supabase.from('generations').update({ 
      output_image_url: finalUrl,
      status: 'completed'
    }).eq('order_id', orderId).eq('status', 'previewing');

    // Increment credits_used on the order
    const { data: order } = await supabase.from('orders').select('credits_total, credits_used').eq('id', orderId).single();
    const newUsed = (order?.credits_used || 0) + 1;
    await supabase.from('orders').update({ credits_used: newUsed }).eq('id', orderId);

    console.log(`[Upscale] ✅ Complete! Credit ${newUsed}/${order?.credits_total}. Final 2K image: ${finalUrl}`);
    return NextResponse.json({ 
      success: true, 
      imageUrl: finalUrl,
      creditsTotal: order?.credits_total || 1,
      creditsUsed: newUsed,
    });
  } catch (error: any) {
    console.error("Upscale API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upscale image" }, { status: 500 });
  }
}

