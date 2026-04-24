"use client";

import { useState, useRef, useCallback } from "react";
import { Loader2, Upload, X, CheckCircle2, Mic, Star, Zap, Video } from "lucide-react";

const TIER_1_PRICE = 39.99;
const TIER_2_PRICE = 69.99;
const VOICE_CLONE_PRICE = 29.99;

const SCRIPT_PLACEHOLDER =
`Hi, I'm [Your Name] with [Your Company]!

Are you thinking about buying or selling a home in [City]?

I specialize in helping [target client] find their perfect home — fast and stress-free.

With [X] years of experience and [Y] homes sold, I bring results.

Call or text me today at [phone number]. I'd love to help you make your next move!`;

// ─── Inline File Dropzone ──────────────────────────────────────────────────
function FileDropzone({
  id, accept, label, hint, icon, file, onFile, onClear,
}: {
  id: string; accept: string; label: string; hint: string;
  icon: React.ReactNode; file: File | null;
  onFile: (f: File) => void; onClear: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) onFile(f);
  }, [onFile]);

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/20 animate-in fade-in duration-200">
        <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
        <span className="text-sm text-white/80 truncate flex-1">{file.name}</span>
        <button onClick={onClear} className="h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
          <X className="h-3 w-3 text-white/60" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging ? "border-purple-400 bg-purple-500/10" : "border-white/20 hover:border-white/40 hover:bg-white/5"
      }`}
    >
      <input id={id} type="file" accept={accept} className="sr-only"
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">{icon}</div>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="text-xs text-white/40">{hint}</p>
    </label>
  );
}

// ─── Main Upsell Offer Component ───────────────────────────────────────────
export function UpsellOffer({ orderId }: { orderId: string }) {
  const [selectedTier, setSelectedTier] = useState<1 | 2>(2);
  const [voiceClone,   setVoiceClone]   = useState(false);
  const [script,       setScript]       = useState("");
  const [bullets,      setBullets]      = useState(["", "", ""]);
  const [bgFile,       setBgFile]       = useState<File | null>(null);
  const [voiceFile,    setVoiceFile]    = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [dismissed,    setDismissed]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const tierPrice = selectedTier === 1 ? TIER_1_PRICE : TIER_2_PRICE;
  const cartTotal = tierPrice + (voiceClone ? VOICE_CLONE_PRICE : 0);
  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async () => {
    setIsSubmitting(true); setError(null);
    try {
      const form = new FormData();
      form.append("orderId", orderId);
      form.append("tierSelected", String(selectedTier));
      form.append("voiceClone", String(voiceClone));
      if (selectedTier === 1) { form.append("script", script); }
      else { bullets.forEach((b, i) => form.append(`bullet_${i}`, b)); if (bgFile) form.append("backgroundFile", bgFile); }
      if (voiceClone && voiceFile) form.append("voiceFile", voiceFile);

      const res  = await fetch("/api/heygen-upsell", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed");
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Hidden after dismiss
  if (dismissed) return null;

  // Success state — stays inline, no redirect
  if (submitted) {
    return (
      <div className="mt-10 w-full max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-green-900/60 to-emerald-900/40 border border-green-500/30 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-extrabold text-white">Video upgrade confirmed! 🎬</h3>
        <p className="text-sm text-white/60 mt-2">
          We&apos;ll email you at the address on file when your animated video is ready — usually within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/30 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Dark header band ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#1a0a2e] via-[#16082a] to-[#1a0a2e] px-6 py-5 relative">
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-4 right-4 h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          aria-label="Dismiss offer"
        >
          <X className="h-3.5 w-3.5 text-white/50" />
        </button>

        <div className="inline-flex items-center gap-1.5 bg-yellow-400/15 border border-yellow-400/25 text-yellow-300 text-[10px] font-extrabold tracking-wider px-3 py-1 rounded-full mb-3">
          <Zap className="h-3 w-3" /> ONE-TIME OFFER — ONLY AVAILABLE NOW
        </div>
        <h2 className="text-xl font-extrabold text-white leading-tight">
          Turn your bobblehead into a{" "}
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            lip-syncing sales video 🎬
          </span>
        </h2>
        <p className="text-sm text-white/50 mt-1">
          A 1-minute animated promo video, powered by HeyGen AI. Perfect for real estate, mortgage, and professional services.
        </p>
      </div>

      {/* ── Cards area ───────────────────────────────────────────────────── */}
      <div className="bg-[#110820] px-6 py-5 space-y-3">

        {/* Tier 1 */}
        <button
          onClick={() => setSelectedTier(1)}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${
            selectedTier === 1
              ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
              : "border-white/10 bg-white/[0.02] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedTier === 1 ? "border-purple-400 bg-purple-400" : "border-white/30"
              }`}>
                {selectedTier === 1 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">Base Video — Standard</p>
                <p className="text-xs text-white/40 mt-0.5">AI voice · Standard background · You write the script</p>
              </div>
            </div>
            <p className="text-xl font-extrabold text-white flex-shrink-0">$39.99</p>
          </div>

          {selectedTier === 1 && (
            <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white/70">Your script</label>
                <span className={`text-xs font-mono ${wordCount > 150 ? "text-red-400" : "text-white/30"}`}>{wordCount}/150 words</span>
              </div>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder={SCRIPT_PLACEHOLDER}
                rows={6}
                className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/40 resize-none transition-all"
              />
              {wordCount > 150 && <p className="text-xs text-red-400">⚠️ Trim to 150 words max.</p>}
            </div>
          )}
        </button>

        {/* Tier 2 */}
        <button
          onClick={() => setSelectedTier(2)}
          className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
            selectedTier === 2
              ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
              : "border-white/10 bg-white/[0.02] hover:border-white/20"
          }`}
        >
          <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-bl-xl tracking-wider">
            ⭐ MOST POPULAR
          </div>

          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                selectedTier === 2 ? "border-pink-400 bg-pink-400" : "border-white/30"
              }`}>
                {selectedTier === 2 && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>
              <div>
                <p className="font-bold text-white text-sm">Premium Pro</p>
                <p className="text-xs text-white/40 mt-0.5">Custom background · Captions · We write your script with AI</p>
              </div>
            </div>
            <p className="text-xl font-extrabold text-white flex-shrink-0">$69.99</p>
          </div>

          {selectedTier === 2 && (
            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200" onClick={(e) => e.stopPropagation()}>
              <div>
                <p className="text-xs font-semibold text-white/70 mb-2">3 bullet points about you — we write the script</p>
                {bullets.map((b, i) => (
                  <input
                    key={i}
                    type="text"
                    value={b}
                    onChange={(e) => { const n = [...bullets]; n[i] = e.target.value; setBullets(n); }}
                    placeholder={[
                      "e.g. 10 years in real estate, sold 200+ homes",
                      "e.g. Specialize in first-time buyers in Phoenix, AZ",
                      "e.g. Free consultation — call or text me anytime",
                    ][i]}
                    className="w-full mb-2 rounded-xl bg-black/30 border border-white/10 px-3 py-2 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/40 transition-all"
                  />
                ))}
              </div>
              <FileDropzone
                id="bg-file-success"
                accept="image/*"
                label="Upload custom background"
                hint="Property photo, logo, office — JPG/PNG"
                icon={<Upload className="h-4 w-4 text-white/50" />}
                file={bgFile}
                onFile={setBgFile}
                onClear={() => setBgFile(null)}
              />
            </div>
          )}
        </button>

        {/* Voice Clone Bump */}
        <div className={`rounded-2xl border-2 p-4 transition-all duration-300 ${
          voiceClone ? "border-yellow-500/50 bg-yellow-500/5" : "border-white/10 bg-white/[0.02]"
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVoiceClone(!voiceClone)}
              className={`h-5 w-10 rounded-full relative transition-all duration-300 flex-shrink-0 ${
                voiceClone ? "bg-yellow-500" : "bg-white/10"
              }`}
            >
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                voiceClone ? "left-[22px]" : "left-0.5"
              }`} />
            </button>
            <Mic className="h-4 w-4 text-yellow-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Add Voice Clone <span className="text-yellow-400">+$29.99</span></p>
              <p className="text-xs text-white/40">Use your real voice — we clone it from a 60-sec sample</p>
            </div>
          </div>

          {voiceClone && (
            <div className="mt-3 animate-in fade-in slide-in-from-top-1 duration-200">
              <FileDropzone
                id="voice-file-success"
                accept=".mp3,.m4a,.wav,audio/*"
                label="Upload voice sample (60 sec min)"
                hint=".mp3, .m4a, or .wav"
                icon={<Mic className="h-4 w-4 text-white/50" />}
                file={voiceFile}
                onFile={setVoiceFile}
                onClear={() => setVoiceFile(null)}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-in fade-in duration-200">
            <span>😵</span><p>{error}</p>
          </div>
        )}

        {/* Cart + CTA */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-sm px-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={selectedTier === 1 ? "text-purple-400 font-semibold" : "text-white/30"}>
                {selectedTier === 1 ? "✓ Base Video ($39.99)" : "Base Video ($39.99)"}
              </span>
              <span className={selectedTier === 2 ? "text-pink-400 font-semibold" : "text-white/30"}>
                {selectedTier === 2 ? "✓ Premium Pro ($69.99)" : "Premium Pro ($69.99)"}
              </span>
              {voiceClone && <span className="text-yellow-400 font-semibold">+ Voice Clone ($29.99)</span>}
            </div>
            <span className="text-white font-extrabold text-lg flex-shrink-0">${cartTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (selectedTier === 1 && wordCount === 0) ||
              (selectedTier === 1 && wordCount > 150)
            }
            className="w-full h-13 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-extrabold text-sm hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg shadow-purple-600/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <>🎬 Add Video to My Order — ${cartTotal.toFixed(2)}</>
            )}
          </button>

          <p className="text-center text-xs text-white/20">
            <button onClick={() => setDismissed(true)} className="hover:text-white/40 underline underline-offset-2 transition-colors">
              No thanks, I don&apos;t need a video right now.
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
