"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Download, Share2, Copy, ExternalLink, RotateCcw, ZoomIn, ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PROGRESS_STEPS = [
  { key: "verifying", label: "Verifying Order", emoji: "🎟️" },
  { key: "generating", label: "Generating Previews", emoji: "🎨" },
  { key: "selecting", label: "Pick Your Favorite", emoji: "🤩" },
  { key: "upscaling", label: "HD Polish", emoji: "✨" },
  { key: "complete", label: "Done!", emoji: "🎉" },
];

export default function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  const [status, setStatus] = useState<"verifying" | "generating" | "selecting" | "upscaling" | "complete" | "error">("verifying");
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [zoomedIndex, setZoomedIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showGalleryOpt, setShowGalleryOpt] = useState(false);
  const [creditsTotal, setCreditsTotal] = useState(1);
  const [creditsUsed, setCreditsUsed] = useState(0);

  const processOrder = useCallback(async () => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    try {
      const { data: gen } = await supabase
        .from('generations')
        .select('preview_urls, output_image_url, status')
        .eq('order_id', orderId)
        .single();
      
      if (gen?.status === 'completed' && gen?.output_image_url) {
        setFinalImageUrl(gen.output_image_url);
        setStatus("complete");
        return;
      }
      
      if (gen?.preview_urls && gen.preview_urls.length > 0) {
        setPreviewUrls(gen.preview_urls);
        setStatus("selecting");
        return;
      }
      
      setStatus("generating");
      
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      if (data.previewUrls && data.previewUrls.length > 0) {
        setPreviewUrls(data.previewUrls);
        setStatus("selecting");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, [orderId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      processOrder();
    }, 1000);
    return () => clearTimeout(timer);
  }, [processOrder]);

  const handleSelect = async (index: number) => {
    if (!orderId) return;
    setSelectedIndex(index);
    setStatus("upscaling");
    
    try {
      const res = await fetch("/api/upscale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, selectedImageUrl: previewUrls[index] }),
      });
      
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);
      if (data.imageUrl) {
        setFinalImageUrl(data.imageUrl);
        if (data.creditsTotal) setCreditsTotal(data.creditsTotal);
        if (data.creditsUsed) setCreditsUsed(data.creditsUsed);
        setStatus("complete");
        
        setTimeout(() => {
          const a = document.createElement('a');
          a.href = data.imageUrl;
          a.download = `bobblehead-${orderId}.png`;
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("verifying");
    setPreviewUrls([]);
    setFinalImageUrl(null);
    setSelectedIndex(null);
    processOrder();
  };

  const handleCopyLink = () => {
    if (finalImageUrl) {
      navigator.clipboard.writeText(finalImageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitToGallery = async () => {
    if (!orderId) return;
    await supabase.from('generations').update({ show_in_gallery: true }).eq('order_id', orderId);
    setShowGalleryOpt(false);
  };

  const currentStepIndex = PROGRESS_STEPS.findIndex(s => s.key === status);

  // Dynamic preview grid columns based on count
  const previewGridCols = previewUrls.length <= 2 ? "grid-cols-2" : previewUrls.length === 3 ? "grid-cols-3" : "grid-cols-2";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center border-b px-6 bg-white/80 backdrop-blur-sm">
        <Link href="/builder" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          Back to Builder
        </Link>
        <div className="ml-auto font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">🗿 BobbleMe!</div>
      </header>

      {/* Progress Steps Bar */}
      {status !== "error" && (
        <div className="border-b bg-white/50 backdrop-blur-sm px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            {PROGRESS_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
                    i < currentStepIndex
                      ? "bg-green-500 text-white"
                      : i === currentStepIndex
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 scale-110"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {i < currentStepIndex ? "✓" : step.emoji}
                  </div>
                  <span className={`text-[10px] font-medium mt-1 hidden sm:block transition-colors ${
                    i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                  }`}>{step.label}</span>
                </div>
                {i < PROGRESS_STEPS.length - 1 && (
                  <div className="flex-1 mx-1.5 mb-4 sm:mb-0">
                    <div className={`h-0.5 rounded-full transition-all duration-700 ${
                      i < currentStepIndex ? "bg-green-500" : "bg-muted"
                    }`} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center space-y-6">
          {status === "verifying" && (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h1 className="text-2xl font-bold">Hang tight! 🎟️</h1>
              <p className="text-muted-foreground mt-2">Verifying your order... don&apos;t close this window!</p>
            </div>
          )}

          {status === "generating" && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="relative h-24 w-24 mb-6">
                <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary/30" strokeWidth={1} />
                <div className="absolute inset-2 bg-gradient-to-tr from-primary/20 to-primary/60 rounded-full animate-pulse blur-sm" />
                <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center text-xl">🗿</div>
              </div>
              <h1 className="text-2xl font-bold">🎨 Bobblehead Automation Has Begun!</h1>
              <p className="text-muted-foreground mt-2 max-w-md">Our bobblehead workshop is crafting 4 unique versions of your figure. This usually takes 30-60 seconds... grab a snack! 🍿</p>
              
              {/* Generation progress animation */}
              <div className="mt-8 w-full max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full animate-progress" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Bobblehead minions are working their magic...</p>
              </div>
            </div>
          )}

          {status === "selecting" && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {zoomedIndex !== null ? (
                /* === ZOOMED SINGLE PREVIEW === */
                <>
                  <button
                    onClick={() => setZoomedIndex(null)}
                    className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4 self-start"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back to All Previews
                  </button>
                  <h1 className="text-2xl font-bold mb-2">🔍 Preview #{zoomedIndex + 1}</h1>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Take a close look! If you like it, hit the button below to finalize.
                  </p>
                  
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-primary/20 bg-white dark:bg-zinc-900 p-2 w-full max-w-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={previewUrls[zoomedIndex]} 
                      alt={`Bobblehead option ${zoomedIndex + 1} (zoomed)`} 
                      className="w-full rounded-lg pointer-events-none select-none" 
                      draggable={false}
                    />
                    {/* Watermark overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                      <div className="rotate-[-35deg] opacity-20">
                        <p className="text-4xl font-black text-black tracking-widest">PREVIEW</p>
                        <p className="text-xl font-bold text-black tracking-wider text-center">NOT FOR DOWNLOAD</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setZoomedIndex(null)}
                      className="px-5 h-11 inline-flex items-center justify-center rounded-full border font-medium hover:bg-muted transition-all duration-200 gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      View Others
                    </button>
                    <button
                      onClick={() => { setZoomedIndex(null); handleSelect(zoomedIndex); }}
                      className="px-6 h-11 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg gap-2"
                    >
                      ✅ Select This One
                    </button>
                  </div>
                </>
              ) : (
                /* === GRID VIEW === */
                <>
                  <h1 className="text-2xl font-bold mb-2">🤩 Pick Your Favorite!</h1>
                  <p className="text-muted-foreground mb-6">
                    Here are your {previewUrls.length} custom bobblehead{previewUrls.length !== 1 ? 's' : ''} — tap to zoom in and inspect, then select your favorite!
                  </p>
                  
                  <div className={`grid ${previewGridCols} gap-4 w-full max-w-lg`}>
                    {previewUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setZoomedIndex(index)}
                        className="relative group rounded-xl overflow-hidden shadow-lg border-2 border-transparent hover:border-primary hover:shadow-2xl transition-all duration-300 bg-white dark:bg-zinc-900 p-1 hover:scale-[1.03]"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={url} 
                          alt={`Bobblehead option ${index + 1}`} 
                          className="w-full aspect-[3/4] object-cover rounded-lg pointer-events-none select-none" 
                          draggable={false}
                        />
                        {/* Watermark overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                          <div className="rotate-[-35deg] opacity-20">
                            <p className="text-3xl font-black text-black tracking-widest">PREVIEW</p>
                            <p className="text-lg font-bold text-black tracking-wider text-center">NOT FOR DOWNLOAD</p>
                          </div>
                        </div>
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 rounded-xl flex items-end justify-center pb-3">
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg flex items-center gap-1.5">
                            <ZoomIn className="h-3.5 w-3.5" />
                            Tap to Zoom
                          </span>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                          #{index + 1}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {status === "upscaling" && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="relative h-24 w-24 mb-6">
                <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary/30" strokeWidth={1} />
                <div className="absolute inset-2 bg-gradient-to-tr from-green-400/30 to-green-600/60 rounded-full animate-pulse blur-sm" />
                <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center font-bold text-xs">HD</div>
              </div>
              <h1 className="text-2xl font-bold">✨ Polishing Your Pick!</h1>
              <p className="text-muted-foreground mt-2">Upgrading option #{(selectedIndex ?? 0) + 1} to maximum detail... almost there! 🚀</p>
              
              {selectedIndex !== null && previewUrls[selectedIndex] && (
                <div className="mt-6 rounded-xl overflow-hidden shadow-xl border bg-white dark:bg-zinc-900 p-1 opacity-75">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrls[selectedIndex]} alt="Selected preview" className="w-[200px] aspect-[3/4] object-cover rounded-lg" />
                </div>
              )}

              <div className="mt-6 w-full max-w-xs">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full animate-progress" />
                </div>
              </div>
            </div>
          )}

          {status === "complete" && finalImageUrl && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">Your Bobblehead is Ready! 🎉</h1>
              <p className="text-muted-foreground mt-2 mb-4">Your download should start automatically. If not, smash that download button below!</p>
              
              {/* Credit Counter */}
              {creditsTotal > 1 && (
                <div className="mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 inline-flex items-center gap-2">
                  {creditsUsed < creditsTotal ? (
                    <>
                      <span className="text-lg">🎯</span>
                      <span className="font-bold text-purple-700">{creditsUsed} of {creditsTotal}</span>
                      <span className="text-purple-600">bobbleheads created —</span>
                      <span className="font-bold text-pink-600">{creditsTotal - creditsUsed} remaining!</span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg">🎊</span>
                      <span className="font-bold text-green-700">All {creditsTotal} bobbleheads created!</span>
                    </>
                  )}
                </div>
              )}
              
              <div className="relative group rounded-xl overflow-hidden shadow-2xl border bg-white dark:bg-zinc-900 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={finalImageUrl} alt="Final Bobblehead" className="w-[300px] aspect-[3/4] object-cover rounded-lg" />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-8 justify-center">
                <a 
                  href={finalImageUrl} 
                  download={`bobblehead-${orderId}.png`}
                  target="_blank"
                  className="px-6 h-12 inline-flex items-center justify-center rounded-full bg-green-600 text-white font-medium hover:bg-green-700 transition-all duration-200 gap-2 hover:scale-105 shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Download HD 📥
                </a>
                {creditsUsed < creditsTotal ? (
                  <Link href={`/builder?order_id=${orderId}&tier=${creditsTotal}`} className="px-6 h-12 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg">
                    🎨 Make Another! ({creditsTotal - creditsUsed} left)
                  </Link>
                ) : (
                  <Link href="/pricing" className="px-6 h-12 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-lg">
                    🎨 Buy More!
                  </Link>
                )}
              </div>

              {/* Share Section */}
              <div className="mt-8 p-5 rounded-xl bg-muted/30 border w-full max-w-md">
                <h3 className="text-sm font-bold mb-3 flex items-center gap-2 justify-center">
                  <Share2 className="h-4 w-4" />
                  Share Your Bobblehead
                </h3>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleCopyLink}
                    className="px-4 h-9 inline-flex items-center gap-1.5 rounded-full text-xs font-medium border bg-background hover:bg-muted transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out my custom AI bobblehead from BobbleMe! 🗿🎉")}&url=${encodeURIComponent(finalImageUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 h-9 inline-flex items-center gap-1.5 rounded-full text-xs font-medium border bg-background hover:bg-muted transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Share on X
                  </a>
                </div>

                {/* Gallery opt-in */}
                {!showGalleryOpt ? (
                  <button
                    onClick={() => setShowGalleryOpt(true)}
                    className="mt-3 text-xs text-primary hover:underline"
                  >
                    ⭐ Submit to public gallery?
                  </button>
                ) : (
                  <div className="mt-3 flex items-center gap-2 justify-center animate-in fade-in duration-200">
                    <button onClick={handleSubmitToGallery} className="px-3 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors">
                      Yes, share it!
                    </button>
                    <button onClick={() => setShowGalleryOpt(false)} className="px-3 h-8 rounded-full border text-xs font-medium hover:bg-muted transition-colors">
                      No thanks
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center animate-in fade-in duration-300">
              <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4 text-2xl">😵</div>
              <h1 className="text-2xl font-bold">Oops! Something Went Wonky</h1>
              <p className="text-muted-foreground mt-2 mb-6">We hit a bump creating your bobblehead. Try again or reach out to us for help!</p>
              <div className="flex gap-3">
                <button 
                  onClick={handleRetry}
                  className="px-6 h-12 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-all gap-2 hover:scale-105 shadow-lg"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </button>
                <Link href="/builder" className="px-6 h-12 inline-flex items-center justify-center rounded-full border font-medium hover:bg-muted transition-all">
                  🔙 Back to Builder
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
