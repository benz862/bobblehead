import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // 1. Validate Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found or database error");
    }

    // Uncomment this in production to prevent free generations!
    // if (order.status !== 'paid') {
    //   return NextResponse.json({ error: "Order payment not verified" }, { status: 400 });
    // }

    // 2. Fetch config and images
    const { data: config } = await supabase.from('generations').select('*').eq('order_id', orderId).single();
    const { data: uploads } = await supabase.from('uploads').select('*').eq('order_id', orderId);

    if (!config || !uploads || uploads.length === 0) {
      throw new Error("Missing generation configuration or source images");
    }

    // 3. Prepare Prompt for Nano Banana Pro (Gemini)
    const prompt = `Create a realistic bobblehead figure based on the provided photo(s). 
      Style: Clean, polished, semi-realistic finish, large head, small body.
      Theme: ${config.theme_type || 'Custom'}.
      Note: Integrate a dynamic sports or occupation outfit matching the theme.
      Include a bobblehead stand/base with an engraved nameplate reading: "${config.nameplate || 'BOBBLEHEAD'}".`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log(`[AI Engine] Initializing Nano Banana Pro (Gemini) pipeline for Order: ${orderId}...`);
    console.log(`[AI Engine] Prompt: ${prompt}`);
    
    // 4. API Call Placeholder 
    // You will replace this with the actual standard fetch/SDK call to the Nano Banana Pro / gemini-3-pro-image endpoint
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // 5. Output Handling
    // Once generated, you would upload the Buffer back to Supabase Storage:
    // await supabase.storage.from('generated-bobbleheads').upload(`output-${orderId}.png`, imageBuffer);
    
    const mockOutputUrl = "https://placehold.co/600x800/2a2a2a/ffffff.png?text=Custom+AI+Bobblehead";

    // 6. Update DB
    await supabase.from('generations').update({ 
      output_image_url: mockOutputUrl,
      status: 'completed'
    }).eq('order_id', orderId);

    return NextResponse.json({ success: true, imageUrl: mockOutputUrl });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
