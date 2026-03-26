import { NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";
import sharp from "sharp";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "Missing imageUrl" }, { status: 400 });
    }

    console.log(`[RemoveBG] Downloading image...`);
    const imgRes = await fetch(imageUrl);
    const imgBuffer = await imgRes.arrayBuffer();
    const inputBlob = new Blob([imgBuffer], { type: 'image/png' });

    console.log(`[RemoveBG] Running AI background removal...`);
    const resultBlob = await removeBackground(inputBlob, {
      model: 'medium',
      output: { format: 'image/png', quality: 1 },
    });

    // Convert blob to buffer and get raw pixels for cleanup
    const resultArrayBuffer = await resultBlob.arrayBuffer();
    const resultBuffer = Buffer.from(resultArrayBuffer);
    
    const meta = await sharp(resultBuffer).metadata();
    const w = meta.width!, h = meta.height!;
    
    console.log(`[RemoveBG] AI removal complete. Running gap cleanup on ${w}x${h}...`);
    
    // Get raw RGBA pixels from the AI result
    const rawPixels = await sharp(resultBuffer).ensureAlpha().raw().toBuffer();
    const pixels = new Uint8Array(rawPixels);

    // Post-process: flood-fill from existing transparent pixels into
    // neighboring light/white pixels to catch gaps in the figurine
    // (under arm, cage mask holes, logo cutouts, etc.)
    const GAP_BRIGHTNESS = 200; // Catch off-white/light-gray gap areas
    const GAP_SATURATION = 0.12;
    const totalPixels = w * h;
    const visited = new Uint8Array(totalPixels);

    // Seed queue with all pixels that the AI already made transparent
    const queue = new Int32Array(totalPixels);
    let qHead = 0;
    let qTail = 0;

    for (let i = 0; i < totalPixels; i++) {
      if (pixels[i * 4 + 3] < 30) { // Already transparent
        visited[i] = 1;
        queue[qTail++] = i;
      }
    }

    // BFS into neighboring light/neutral pixels (the white gaps)
    let gapsFilled = 0;
    while (qHead < qTail) {
      const pixel = queue[qHead++];
      const px = pixel % w;
      const py = Math.floor(pixel / w);

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = px + dx;
          const ny = py + dy;
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const n = ny * w + nx;
          if (visited[n]) continue;

          const idx = n * 4;
          const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2], a = pixels[idx + 3];
          
          // Only spread into opaque, light, low-saturation pixels (white/gray gaps)
          if (a > 200) {
            const brightness = (r + g + b) / 3;
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max > 0 ? (max - min) / max : 0;

            if (brightness >= GAP_BRIGHTNESS && sat < GAP_SATURATION) {
              pixels[idx + 3] = 0; // Make transparent
              visited[n] = 1;
              queue[qTail++] = n;
              gapsFilled++;
            }
          }
        }
      }
    }

    console.log(`[RemoveBG] Gap cleanup removed ${gapsFilled} additional pixels`);

    // Auto-crop transparent edges with Sharp
    const trimmedPng = await sharp(Buffer.from(pixels.buffer), {
      raw: { width: w, height: h, channels: 4 }
    })
      .trim()
      .png()
      .toBuffer();

    const finalKB = Math.round(trimmedPng.length / 1024);
    const trimMeta = await sharp(trimmedPng).metadata();
    console.log(`[RemoveBG] ✅ Done! ${trimMeta.width}x${trimMeta.height}, ${finalKB}KB`);

    return new NextResponse(new Uint8Array(trimmedPng), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="bobblehead-transparent.png"',
        'Content-Length': trimmedPng.length.toString(),
      }
    });
  } catch (error: any) {
    console.error("RemoveBG Error:", error);
    return NextResponse.json({ error: error.message || "Failed to remove background" }, { status: 500 });
  }
}
