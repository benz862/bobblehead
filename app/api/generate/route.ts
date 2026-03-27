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

    // Credit check: ensure order has remaining credits
    if (order.credits_used >= order.credits_total) {
      return NextResponse.json({ error: "All credits for this order have been used." }, { status: 400 });
    }

    // Uncomment this in production to prevent free generations!
    // if (order.status !== 'paid') {
    //   return NextResponse.json({ error: "Order payment not verified" }, { status: 400 });
    // }

    // 2. Fetch config and images — get the LATEST pending generation for this order
    const { data: config } = await supabase.from('generations').select('*').eq('order_id', orderId).eq('status', 'pending').order('created_at', { ascending: false }).limit(1).single();
    
    // If this generation has specific uploadIds (credit reuse with new photos), use only those
    // Otherwise fall back to all uploads for the order (first-time generation)
    const generationUploadIds = config?.theme_details?.uploadIds;
    let uploads;
    if (generationUploadIds && generationUploadIds.length > 0) {
      console.log(`[AI Engine] Using generation-specific uploads: ${generationUploadIds.join(', ')}`);
      const { data } = await supabase.from('uploads').select('*').in('id', generationUploadIds);
      uploads = data;
    } else {
      const { data } = await supabase.from('uploads').select('*').eq('order_id', orderId);
      uploads = data;
    }

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
    let identitySignature = '';
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
                  : `You are a forensic facial description specialist creating a description that will be used to recreate this person's likeness as a figurine. ACCURACY OF LIKENESS IS THE #1 PRIORITY.

Analyze this photo and produce an extremely detailed physical description. Focus on what makes THIS person's face UNIQUE and RECOGNIZABLE — the features that distinguish them from anyone else.

You MUST describe ALL of the following in precise detail:
1. GENDER and approximate AGE
2. ETHNICITY and exact SKIN TONE (use specific descriptors like "warm medium-brown", "fair with pink undertones", "deep ebony", "olive-toned")
3. FACE SHAPE (oval, round, square, heart, oblong, diamond) and FACE PROPORTIONS (wide vs narrow, long vs short)
4. FOREHEAD (high, low, broad, narrow)
5. EYES: exact color, shape (almond, round, hooded, deep-set, wide-set, close-set), size relative to face, eyebrow shape/thickness/color/arch, distance between eyes
6. NOSE: size relative to face, shape (broad, narrow, upturned, aquiline, button, Roman), bridge width, tip shape, nostril prominence
7. MOUTH and LIPS: lip fullness (thin, medium, full), upper vs lower lip ratio, lip color, width of mouth, smile characteristics (does the smile show teeth? dimples?)
8. CHIN and JAW: shape (pointed, square, rounded, cleft), jaw width relative to forehead, jawline definition
9. CHEEKBONES: prominent/flat, high/low, cheek fullness
10. HAIR: exact color (use specific shades like "dark chestnut brown", "platinum blonde", "jet black", "honey blonde", "auburn", "salt-and-pepper gray"), texture (straight, wavy, curly, coily, kinky), length, style, part side, hairline shape (receding? widow's peak?). If balding or thinning, describe exactly where and how much.
11. EARS: size, shape, how much they protrude
12. ACCESSORIES: glasses (frame shape/color/style), earrings, piercings
13. DISTINGUISHING FEATURES: dimples, moles (location and size), scars, wrinkles pattern, freckles, laugh lines, beauty marks, asymmetries

ONLY mention facial hair if they actually have a beard, mustache, or goatee. If they have none, do NOT mention facial hair at all.

IMPORTANT: Output your response in FOUR parts:
1. First line: HAIR COLOR: [the precise hair color]
2. Second line: FACIAL HAIR: [describe any facial hair precisely, or "none"]
3. Third line: IDENTITY SIGNATURE: [List the 5-7 MOST DISTINCTIVE features that make this person uniquely recognizable, in order of importance. These should be the features someone would use to pick this person out of a crowd. Format as a comma-separated list, e.g. "prominent aquiline nose, deep-set bright blue eyes, strong square jaw, thick dark eyebrows, cleft chin, salt-and-pepper wavy hair"]
4. Fourth part: a single dense paragraph with the full description. Be brutally precise and objective.` },
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
          // Extract identity signature
          const idSigMatch = faceDescription.match(/IDENTITY SIGNATURE:\s*(.+)/i);
          if (idSigMatch) {
            identitySignature = idSigMatch[1].trim();
            console.log(`[AI Engine] Identity Signature: ${identitySignature}`);
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

    // Build identity reinforcement block for humans
    const identityReinforcement = !isPet && identitySignature 
      ? `\n\n🎯 IDENTITY SIGNATURE (MOST IMPORTANT — REPEAT FOR EMPHASIS):\nThe following features are the KEY IDENTIFIERS that make this person recognizable. These MUST be clearly visible and accurate in the final image:\n${identitySignature}\n\nREPEAT: The figure's face MUST show: ${identitySignature}. Getting these features right is MORE IMPORTANT than the outfit or pose.`
      : '';

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

HEAD AND FACE (PHOTOREALISTIC — LIKENESS IS THE #1 PRIORITY):
The head and face should look much more realistic than the body — like a high-quality portrait photograph of a SPECIFIC REAL PERSON. The face must be INSTANTLY RECOGNIZABLE as the person described below. Real skin texture with visible pores and natural tonal variation. Real hair with individual strands, shine, and movement${hairColor ? ` — hair color is ${hairColor}` : ''}.${facialHair ? ` IMPORTANT: This person has ${facialHair}. The facial hair MUST be visible on the figurine. Do NOT omit the facial hair.` : ''} Realistic eyes with wet reflections, iris detail, and depth. The head should contrast with the glossy plastic toy body.

FACE IDENTITY (MATCH THIS PERSON EXACTLY — THIS IS THE MOST IMPORTANT SECTION):
${faceDescription.replace(/\n/g, ' ')}${colorEmphasis}${identityReinforcement}

BODY AND PROPORTIONS:
- Classic bobblehead proportions: MASSIVE oversized head, tiny cartoonish body
- The body (below the neck) is glossy painted plastic toy style
- REMINDER: Must be wearing the ${config.theme_type === 'sport' ? (details.sport || 'sports') + ' uniform' : (details.occupation || 'occupation') + ' outfit'} described above
- Full figure from head to feet including display base, nothing cropped
- No metal support rods or sticks
- Solid pure white (#FFFFFF) background, no scenery`;
    }
    console.log(`[AI Engine] Initializing Nano Banana 2 (Gemini 3.1 Flash Image) for Order: ${orderId}...`);
    console.log(`[AI Engine] Prompt length: ${prompt.length} chars`);
    
    // 5. Generate 4 previews using Nano Banana 2 (gemini-3.1-flash-image-preview)
    // Supports up to 14 reference images, 4K resolution, and improved face likeness
    const geminiImageUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent`;
    
    // Build the content parts: text prompt + reference photo
    const contentParts: any[] = [
      { text: prompt + "\n\nIMPORTANT: The reference photo below shows the EXACT person whose face must appear on this bobblehead. Match their facial features, skin tone, hair, and any distinctive characteristics as closely as possible. The face on the bobblehead must be INSTANTLY RECOGNIZABLE as this specific person." }
    ];
    
    // Add the reference photo(s) as inline data so the model can SEE the face
    if (uploads && uploads.length > 0) {
      for (const upload of uploads) {
        try {
          const imgRes = await fetch(upload.image_url);
          const imgBuffer = await imgRes.arrayBuffer();
          const base64Img = Buffer.from(imgBuffer).toString('base64');
          contentParts.push({
            inlineData: { mimeType: "image/jpeg", data: base64Img }
          });
        } catch (e) {
          console.log(`[AI Engine] Could not fetch upload ${upload.id}, skipping`);
        }
      }
    }
    
    // Fire 4 parallel requests (Nano Banana 2 generates 1 image per call)
    const generateOne = async (index: number): Promise<string | null> => {
      try {
        const res = await fetch(geminiImageUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-goog-api-key': GEMINI_API_KEY!,
          },
          body: JSON.stringify({
            contents: [{ parts: contentParts }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
              temperature: 1.0,  // Add variation between the 4 results
              imageConfig: {
                aspectRatio: "3:4",
                imageSize: "2K",
              },
            }
          })
        });
        
        if (!res.ok) {
          const errText = await res.text();
          console.error(`[AI Engine] Preview ${index} failed (${res.status}):`, errText);
          return null;
        }
        
        const data = await res.json();
        // Extract image from response parts
        if (data.candidates && data.candidates[0]?.content?.parts) {
          for (const part of data.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.mimeType?.startsWith('image/')) {
              return part.inlineData.data; // base64 image
            }
          }
        }
        console.log(`[AI Engine] Preview ${index}: no image in response`);
        return null;
      } catch (e) {
        console.error(`[AI Engine] Preview ${index} error:`, e);
        return null;
      }
    };
    
    console.log(`[AI Engine] Firing 4 parallel image generation requests...`);
    const results = await Promise.all([
      generateOne(0),
      generateOne(1),
      generateOne(2),
      generateOne(3),
    ]);
    
    let predictions = results.filter((r): r is string => r !== null);
    console.log(`[AI Engine] Nano Banana 2: Got ${predictions.length}/4 successful generations`);
    
    // Retry if we got fewer than 2
    const MAX_RETRIES = 3;
    let retryCount = 0;
    while (predictions.length < 2 && retryCount < MAX_RETRIES) {
      retryCount++;
      const needed = 4 - predictions.length;
      console.log(`[AI Engine] Only got ${predictions.length}/4, retry ${retryCount}/${MAX_RETRIES} — requesting ${needed} more...`);
      const retryResults = await Promise.all(
        Array.from({ length: needed }, (_, i) => generateOne(predictions.length + i))
      );
      const newPreds = retryResults.filter((r): r is string => r !== null);
      predictions = [...predictions, ...newPreds].slice(0, 4);
    }

    if (predictions.length < 2) {
      console.error(`[AI Engine] Only got ${predictions.length} preview(s) after ${MAX_RETRIES} retries — insufficient.`);
      throw new Error(`Only ${predictions.length} preview(s) could be generated. The AI safety filter may be blocking this image. Please try a different photo.`);
    }

    console.log(`[AI Engine] Nano Banana 2: Final count: ${predictions.length} preview images!`);
    
    // 6. Upload all previews to Supabase Storage
    const previewUrls: string[] = [];
    for (let i = 0; i < predictions.length; i++) {
      const base64Image = predictions[i]; // Already a base64 string from Nano Banana 2
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
