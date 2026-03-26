import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { orderId, selectedImageUrl } = await req.json();

    if (!orderId || !selectedImageUrl) {
      return NextResponse.json({ error: "Missing orderId or selectedImageUrl" }, { status: 400 });
    }

    // Previews are already generated at 2048×2048 (2K) by Imagen 4.0.
    // This step just downloads the selected preview and saves it as the final image.
    console.log(`[Upscale] Downloading selected 2K preview for order ${orderId}...`);
    const imgRes = await fetch(selectedImageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const finalBase64 = Buffer.from(imgBuffer).toString('base64');

    const sizeKB = Math.round(imgBuffer.byteLength / 1024);
    console.log(`[Upscale] Preview size: ${sizeKB}KB`);

    // Upload final image to Supabase Storage
    const imageBuffer = Buffer.from(finalBase64, 'base64');
    const fileName = `final-${orderId}-${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from('user-uploads')
      .upload(fileName, imageBuffer, { contentType: 'image/png' });

    if (uploadError) {
      console.error("[Upscale] Failed to upload final image:", uploadError);
      throw new Error("Failed to save the final image.");
    }

    const { data: publicUrlData } = supabase.storage
      .from('user-uploads')
      .getPublicUrl(fileName);
      
    const finalUrl = publicUrlData.publicUrl;

    // Update DB
    await supabase.from('generations').update({ 
      output_image_url: finalUrl,
      status: 'completed'
    }).eq('order_id', orderId);

    console.log(`[Upscale] ✅ Complete! Final 2K image: ${finalUrl}`);
    return NextResponse.json({ success: true, imageUrl: finalUrl });
  } catch (error: any) {
    console.error("Upscale API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to upscale image" }, { status: 500 });
  }
}
