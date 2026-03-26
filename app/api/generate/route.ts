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

    // 3. Extract Face Features using Gemini 1.5 Flash Vision
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    console.log(`[AI Engine] Fetching source image for analysis...`);
    
    let faceDescription = "A generic person";
    let hairColor = '';
    let facialHair = '';
    let petDescription = '';
    const isPet = config.theme_type === 'pet';
    
    if (uploads && uploads.length > 0) {
      try {
        const imageUrl = uploads[0].image_url;
        const imgRes = await fetch(imageUrl);
        const imgBuffer = await imgRes.arrayBuffer();
        const base64Img = Buffer.from(imgBuffer).toString('base64');
        
        console.log(`[AI Engine] Analyzing face with Gemini 2.5 Flash...`);
        const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const visionRes = await fetch(visionUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: isPet 
                  ? `You are a veterinary animal identification specialist. Analyze this photo and produce an extremely detailed physical description of this animal. Your description will be used to recreate the animal's likeness as a toy figurine, so accuracy is critical.

You MUST describe ALL of the following:
1. SPECIES (dog, cat, bird, etc.)
2. BREED (if identifiable, or best guess — e.g. "Golden Retriever", "Persian cat", "Cockatiel")
3. FUR/COAT COLOR: Use very specific descriptors (e.g. "rich golden blonde", "charcoal gray with silver ticking", "orange tabby with white chest patch", "jet black"). This is CRITICAL.
4. FUR TEXTURE and LENGTH (short, medium, long, wiry, fluffy, smooth, curly)
5. MARKINGS and PATTERNS: spots, stripes, patches, masks, saddles, socks — describe colors and locations precisely
6. EYE COLOR and SHAPE
7. EAR SHAPE (floppy, pointed, folded, tufted)
8. NOSE/SNOUT shape and color
9. TAIL description (bushy, short, curled, long, docked)
10. BODY BUILD (stocky, lean, muscular, petite, fluffy, chunky)
11. SIZE estimation (small, medium, large)
12. DISTINGUISHING FEATURES: unique markings, missing features, accessories in photo

IMPORTANT: Output your response in TWO parts:
1. First line must be exactly: FUR COLOR: [the precise fur/coat color, e.g. "rich golden blonde" or "black and tan" or "orange tabby with white patches"]
2. Second part: a single dense paragraph with the full animal description. Be brutally precise.`
                  : `You are a forensic facial description specialist. Analyze this photo and produce an extremely detailed physical description of the person's head and face. Your description will be used to recreate their likeness, so accuracy is critical.

You MUST describe ALL of the following in precise detail:
1. GENDER and approximate AGE
2. ETHNICITY and exact SKIN TONE (use specific descriptors like "warm medium-brown", "fair with pink undertones", "deep ebony", "olive-toned")
3. FACE SHAPE (oval, round, square, heart, oblong, diamond)
4. FOREHEAD (high, low, broad, narrow)
5. EYES: exact color, shape (almond, round, hooded, deep-set, wide-set), size, eyebrow shape/thickness/color
6. NOSE: size, shape (broad, narrow, upturned, aquiline, button), bridge width
7. MOUTH and LIPS: lip fullness (thin, medium, full), lip color, smile characteristics
8. CHIN and JAW: shape (pointed, square, rounded), jaw width, chin prominence
9. CHEEKBONES: prominent/flat, high/low
10. HAIR: exact color (use specific shades like "dark chestnut brown", "platinum blonde", "jet black", "honey blonde", "auburn", "strawberry blonde", "salt-and-pepper gray"), texture (straight, wavy, curly, coily, kinky), length, style, part, hairline shape. If balding or thinning, describe exactly where.
11. EARS: visible? Size, shape
12. ACCESSORIES: glasses (frame shape/color), earrings, piercings, notable jewelry
13. DISTINGUISHING FEATURES: dimples, moles, scars, wrinkles, freckles, laugh lines

ONLY mention facial hair if they actually have a beard, mustache, or goatee. If they have none, do NOT mention facial hair at all.

IMPORTANT: Output your response in THREE parts:
1. First line must be exactly: HAIR COLOR: [the precise hair color, e.g. "dark chestnut brown" or "jet black" or "light honey blonde"]
2. Second line must be exactly: FACIAL HAIR: [describe any facial hair precisely, e.g. "full dark brown beard" or "neatly trimmed salt-and-pepper goatee" or "thin black mustache" or "none"]
3. Third part: a single dense paragraph with the full description. Be brutally precise and objective.` },
                { inlineData: { mimeType: "image/jpeg", data: base64Img } }
              ]
            }]
          })
        });
        
        if (visionRes.ok) {
          const visionData = await visionRes.json();
          if (visionData.candidates && visionData.candidates[0].content.parts[0].text) {
            faceDescription = visionData.candidates[0].content.parts[0].text.trim();
            console.log(`[AI Engine] Extracted Face Description: ${faceDescription}`);
          }
        } else {
          // This else is handled below, just need to close the hair extraction block
        }
        
        // Extract key color from the tagged line if present
        if (isPet) {
          const furColorMatch = faceDescription.match(/FUR COLOR:\s*(.+)/i);
          if (furColorMatch) {
            petDescription = faceDescription;
            hairColor = furColorMatch[1].trim(); // Reuse hairColor var for fur color
            console.log(`[AI Engine] Extracted Fur Color: ${hairColor}`);
          }
        } else {
          const hairColorMatch = faceDescription.match(/HAIR COLOR:\s*(.+)/i);
          if (hairColorMatch) {
            hairColor = hairColorMatch[1].trim();
            console.log(`[AI Engine] Extracted Hair Color: ${hairColor}`);
          }
          // Extract facial hair
          const facialHairMatch = faceDescription.match(/FACIAL HAIR:\s*(.+)/i);
          if (facialHairMatch) {
            const fh = facialHairMatch[1].trim().toLowerCase();
            if (fh && fh !== 'none' && fh !== 'n/a' && fh !== 'no') {
              facialHair = facialHairMatch[1].trim();
              console.log(`[AI Engine] Extracted Facial Hair: ${facialHair}`);
            }
          }
        }
        // Vision API error handling moved inline above
      } catch (e) {
        console.error("[AI Engine] Failed to extract face, falling back to generic.", e);
      }
    }

    // 4. Prepare Mega Prompt for Nano Banana Pro (Gemini / Imagen 4.0)
    const details = config.theme_details || {};
    
    // Build theme-specific prop, outfit, and orientation descriptions
    let propsDescription = '';
    let outfitDescription = '';
    
    if (config.theme_type === 'sport') {
      // Build orientation string from saved orientations object
      const oris = details.orientations || {};
      const oriParts = Object.entries(oris).filter(([,v]) => v).map(([k,v]) => `${k}: ${v}`);
      const orientationStr = oriParts.length > 0 ? oriParts.join(', ') : '';
      
      // Sport-specific jersey and prop descriptions
      const sportKey = (details.sport || '').toLowerCase();
      const teamName = details.teamName || '';
      
      const sportPropsMap: Record<string, string> = {
        hockey: `holding a hockey stick${orientationStr.includes('Left') ? ' on the left side, shooting left-handed' : ' on the right side, shooting right-handed'}, wearing ice skates and hockey gloves, full hockey jersey with a PROMINENT LARGE team logo/crest on the chest, team colors on sleeves and socks, hockey helmet tucked under arm`,
        baseball: `holding a baseball bat${orientationStr.includes('Left') ? ' from the left side (left-handed batter)' : ' over the right shoulder (right-handed batter)'}, wearing a baseball cap with a small team logo, full baseball jersey with the team name TEXT across the chest (NO large logo on jersey), baseball pants, and cleats`,
        football: `holding a football in one hand, wearing a football helmet decorated in team colors${orientationStr.includes('Left') ? ', throwing stance with left arm' : ''}, full football jersey with a LARGE NUMBER on the chest and back but NO LOGO on the jersey itself, shoulder pads visible, football pants, and cleats`,
        soccer: `one foot resting on a soccer ball${orientationStr.includes('Left') ? ', left-footed stance' : ', right-footed stance'}, wearing soccer cleats, full soccer kit with a SMALL team crest/badge on the left chest, shorts, and knee-high socks in team colors`,
        golf: `holding a golf club${orientationStr.includes('Left') ? ' in a left-handed swing stance' : ' in a right-handed swing stance'}, wearing a polo shirt, golf glove, khaki pants, and golf shoes`,
        boxing: `wearing boxing gloves${orientationStr.includes('Southpaw') ? ' in a southpaw stance (right hand forward, left hand back)' : ' in an orthodox stance (left hand forward, right hand back)'}, boxing shorts with team/fighter colors, boxing boots, and a championship belt`,
      };
      
      propsDescription = sportPropsMap[sportKey] || `in an athletic pose with appropriate ${details.sport} equipment`;
      
      const colorStr = details.teamColors ? ` in ${details.teamColors} team colors` : '';
      const jerseyStr = details.jersey ? ` with number ${details.jersey} on the jersey` : '';
      const posStr = details.position ? `, playing ${details.position}` : '';
      const teamStr = teamName ? ` for the ${teamName}` : '';
      const customDetailsStr = details.sportCustomDetails ? ` CUSTOM DETAILS (MUST INCLUDE): ${details.sportCustomDetails}.` : '';
      outfitDescription = `Full ${details.sport || 'sports'} uniform${colorStr}${jerseyStr}${posStr}${teamStr}.${customDetailsStr}`;
    } else if (config.theme_type === 'occupation') {
      const occKey = (details.occupation || '').toLowerCase();
      
      // Known occupations with curated descriptions
      const occPropsMap: Record<string, string> = {
        doctor: 'wearing a white lab coat with stethoscope around neck, holding a medical clipboard',
        firefighter: 'wearing full firefighter turnout gear and helmet, holding a fire hose nozzle',
        police: 'wearing a police uniform with badge and cap, one hand on belt, other hand holding a radio',
        teacher: 'wearing professional attire, holding a book in one hand and a piece of chalk in the other, glasses optional',
        chef: 'wearing a white chef coat and tall chef hat (toque), holding a wooden spoon in one hand and a frying pan in the other',
        nurse: 'wearing scrubs and a stethoscope, holding a medical chart, comfortable shoes',
        military: 'wearing full military combat uniform (camouflage fatigues), combat boots, holding a combat helmet under one arm or wearing a full combat helmet, military insignia and patches visible on shoulders',
        construction: 'wearing a hard hat, safety vest, jeans, and work boots, holding a hammer or power drill',
        scientist: 'wearing a lab coat and safety goggles, holding a beaker or test tube with colorful liquid',
        astronaut: 'wearing a full space suit with helmet under arm, NASA-style patches visible on suit',
        pilot: 'wearing a pilot uniform with captain hat, aviator sunglasses, holding a flight bag',
        business: 'wearing a sharp business suit with tie, holding a briefcase in one hand',
      };
      
      if (occPropsMap[occKey]) {
        // Known occupation
        propsDescription = occPropsMap[occKey];
        outfitDescription = `Dressed as a ${details.occupation}.`;
      } else {
        // CUSTOM occupation — use the user's exact description as the primary directive
        propsDescription = `dressed and posed exactly as described: "${details.occupation}"`;
        if (details.customProps) {
          propsDescription += `. Additional details: ${details.customProps}`;
        }
        outfitDescription = `The outfit, props, accessories, and pose must ALL match the character description "${details.occupation}". Do NOT default to a business suit. Be creative and accurate to the description.`;
      }
    } else if (config.theme_type === 'pet') {
      // Pet theme — completely different prompt structure
      const animalType = details.animalType || 'dog';
      const breed = details.petBreed || '';
      const costume = details.petCostume || '';
      const costumeStr = costume ? ` The animal is wearing ${costume}.` : '';
      propsDescription = `an adorable ${breed || animalType}${costumeStr}`;
      outfitDescription = `This is a PET bobblehead, not a human.`;
    }

    const nameplateText = config.nameplate || 'BOBBLEHEAD';

    // Build hair/fur color emphasis for the prompt
    const colorEmphasis = isPet 
      ? (hairColor ? `\n\nCRITICAL - FUR/COAT COLOR: The animal's fur MUST be ${hairColor}. This is the #1 priority for likeness accuracy. Do NOT change the fur color. The fur is ${hairColor}.` : '')
      : (hairColor ? `\n\nCRITICAL - HAIR COLOR: The figure's hair MUST be ${hairColor}. This is the #1 priority for likeness accuracy. Do NOT change the hair color. The hair is ${hairColor}.` : '')
      + (facialHair ? `\n\nCRITICAL - FACIAL HAIR: The figure MUST have ${facialHair}. This is essential for likeness. Do NOT remove or omit the facial hair. The figure has ${facialHair}.` : '');

    let prompt: string;

    if (isPet) {
      // === PET BOBBLEHEAD PROMPT ===
      const animalType = details.animalType || 'dog';
      const breed = details.petBreed || '';
      const costume = details.petCostume || '';
      const costumeStr = costume ? `The animal is wearing ${costume}.` : 'The animal is in its natural appearance.';
      const animalLabel = breed ? `${breed} ${animalType}` : animalType;

      prompt = `Product photography on a PURE WHITE (#FFFFFF) background. A bobblehead toy figurine of an adorable ${animalLabel} standing upright on its hind legs on a glossy display base with a silver nameplate.

DISPLAY BASE (MUST BE VISIBLE IN IMAGE):
At the bottom of the image there is a rectangular glossy display base/pedestal. The figure stands on top of this base. On the front of the base is an engraved silver nameplate that says "${nameplateText}". The base and nameplate MUST be clearly visible.

COSTUME/ACCESSORIES:
${propsDescription}. ${costumeStr}
The animal is standing upright on hind legs in a cute, anthropomorphic pose.

HEAD AND FACE (PHOTOREALISTIC):
The animal's head and face should look much more realistic than the body — like a high-quality photograph of a real ${animalLabel}. Real fur texture with individual strands${hairColor ? `, fur color ${hairColor}` : ''}. Realistic eyes with wet reflections and depth. Real nose texture. The head should contrast with the glossy plastic toy body.

ANIMAL APPEARANCE (MATCH THIS):
${petDescription.replace(/\n/g, ' ')}${colorEmphasis}

BODY AND PROPORTIONS:
- Classic bobblehead proportions: MASSIVE oversized head, tiny cartoonish body
- The body (below the neck) is glossy painted plastic toy style
- Full figure from head to feet including display base, nothing cropped
- No metal support rods or sticks
- Solid pure white (#FFFFFF) background, no scenery`;
    } else {
      // === HUMAN BOBBLEHEAD PROMPT ===
      prompt = `Product photography on a PURE WHITE (#FFFFFF) background. A bobblehead toy figurine standing on a glossy display base with a silver nameplate.

DISPLAY BASE (MUST BE VISIBLE IN IMAGE):
At the bottom of the image there is a rectangular glossy display base/pedestal. The figure's feet are planted on top of this base. On the front of the base is an engraved silver nameplate that says "${nameplateText}". Do NOT put the team name on the nameplate. The base and nameplate MUST be clearly visible.

OUTFIT AND PROPS (MANDATORY):
The figure is ${propsDescription}. ${outfitDescription}
Do NOT substitute with a business suit, casual clothes, or any other outfit. The figure has an energetic pose while feet stay on the base.

HEAD AND FACE (PHOTOREALISTIC):
The head and face should look much more realistic than the body — like a high-quality portrait photograph. Real skin texture with visible pores and natural tonal variation. Real hair with individual strands, shine, and movement${hairColor ? ` — hair color ${hairColor}` : ''}.${facialHair ? ` IMPORTANT: This person has ${facialHair}. The facial hair MUST be visible on the figurine. Do NOT omit the facial hair.` : ''} Realistic eyes with wet reflections, iris detail, and depth. The head should contrast with the glossy plastic toy body.

FACE IDENTITY (MATCH THIS):
${faceDescription.replace(/\n/g, ' ')}${colorEmphasis}

BODY AND PROPORTIONS:
- Classic bobblehead proportions: MASSIVE oversized head, tiny cartoonish body
- The body (below the neck) is glossy painted plastic toy style
- REMINDER: Must be wearing the ${config.theme_type === 'sport' ? (details.sport || 'sports') + ' uniform' : (details.occupation || 'occupation') + ' outfit'} described above
- Full figure from head to feet including display base, nothing cropped
- No metal support rods or sticks
- Solid pure white (#FFFFFF) background, no scenery`;
    }
    console.log(`[AI Engine] Initializing Nano Banana Pro (Gemini) pipeline for Order: ${orderId}...`);
    console.log(`[AI Engine] Prompt: ${prompt}`);
    
    // 5. API Call to Nano Banana Pro (Gemini / Imagen 4.0) — generate 4 previews
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_API_KEY}`;
    const aiResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: prompt }],
        parameters: { sampleCount: 4, sampleImageSize: "2K" }
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[AI Engine] Error from Gemini API:", errorText);
      throw new Error("Failed to generate image from AI provider.");
    }

    const data = await aiResponse.json();
    let predictions = data.predictions || [];
    if (predictions.length === 0) throw new Error("No images returned from AI provider.");

    // If fewer than 4 came back (safety filter), retry aggressively
    // Always request 4 per call to maximize yield past safety filters
    const MAX_RETRIES = 3;
    let retryCount = 0;
    while (predictions.length < 4 && retryCount < MAX_RETRIES) {
      retryCount++;
      const needed = 4 - predictions.length;
      console.log(`[AI Engine] Only got ${predictions.length}/4, retry ${retryCount}/${MAX_RETRIES} — requesting 4 more...`);
      try {
        const retryRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt: prompt }],
            parameters: { sampleCount: 4, sampleImageSize: "2K" }
          })
        });
        if (retryRes.ok) {
          const retryData = await retryRes.json();
          const retryPreds = retryData.predictions || [];
          console.log(`[AI Engine] Retry ${retryCount} returned ${retryPreds.length} images`);
          predictions = [...predictions, ...retryPreds].slice(0, 4);
        } else {
          console.log(`[AI Engine] Retry ${retryCount} failed with status ${retryRes.status}`);
        }
      } catch (e) {
        console.log(`[AI Engine] Retry ${retryCount} error, continuing...`);
      }
    }

    // Ensure we have at least 2 previews for a reasonable experience
    if (predictions.length < 2) {
      console.error(`[AI Engine] Only got ${predictions.length} preview(s) after ${MAX_RETRIES} retries — insufficient.`);
      throw new Error(`Only ${predictions.length} preview(s) could be generated. The AI safety filter may be blocking this image. Please try a different photo.`);
    }

    console.log(`[AI Engine] Final count: ${predictions.length} preview images!`);
    
    // 6. Upload all previews to Supabase Storage
    const previewUrls: string[] = [];
    for (let i = 0; i < predictions.length; i++) {
      const base64Image = predictions[i].bytesBase64Encoded;
      if (!base64Image) continue;
      
      const imageBuffer = Buffer.from(base64Image, 'base64');
      const fileName = `preview-${orderId}-${i}-${Date.now()}.png`;

      const { error: uploadError } = await supabase.storage
        .from('user-uploads')
        .upload(fileName, imageBuffer, { contentType: 'image/png' });

      if (uploadError) {
        console.error(`[Storage] Failed to upload preview ${i}:`, uploadError);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('user-uploads')
        .getPublicUrl(fileName);
        
      previewUrls.push(publicUrlData.publicUrl);
    }

    if (previewUrls.length === 0) throw new Error("Failed to upload any preview images.");

    // 7. Update DB with preview URLs
    await supabase.from('generations').update({ 
      preview_urls: previewUrls,
      status: 'previewing'
    }).eq('order_id', orderId);

    return NextResponse.json({ success: true, previewUrls });
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
  }
}
