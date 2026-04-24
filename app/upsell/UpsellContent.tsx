"use client";

import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Upload, X, CheckCircle2, Mic, Star, Zap, Video, Users, TrendingUp } from "lucide-react";

// ─── Pricing ────────────────────────────────────────────────────────────────
const TIER_1_PRICE = 39.99;
const TIER_2_PRICE = 69.99;
const VOICE_CLONE_PRICE = 29.99;

const SCRIPT_PLACEHOLDER =
  `Hi, I'm [Your Name] with [Your Company]!

Are you thinking about buying or selling a home in [City]? 

I specialize in helping [target client] find their perfect home — fast and stress-free.

With [X] years of experience and [Y] homes sold, I bring results.

Call or text me today at [phone number]. 

I'd love to help you make your next move!`;

// ─── File Dropzone ───────────────────────────────────────────────────────────
function FileDropzone({
  id,
  accept,
  label,
  icon,
  hint,
  file,
  onFile,
  onClear,
}: {
  id: string;
  accept: string;
  label: string;
  icon: React.ReactNode;
  hint: string;
  file: File | null;
  onFile: (f: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onFile(f);
    },
    [onFile]
  );

  if (file) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/20 animate-in fade-in duration-200">
        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
        <span className="text-sm text-white/80 truncate flex-1">{file.name}</span>
        <button
          onClick={onClear}
          className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
        >
          <X className="h-3.5 w-3.5 text-white/60" />
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
      className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
        dragging
          ? "border-purple-400 bg-purple-500/10"
          : "border-white/20 hover:border-white/40 hover:bg-white/5"
      }`}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }}
      />
      <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-medium text-white/80">{label}</p>
      <p className="text-xs text-white/40">{hint}</p>
    </label>
  );
}

// ─── Animated Video Placeholder ──────────────────────────────────────────────
function DemoReel() {
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/80 via-[#1a0a2e] to-pink-900/60 border border-white/10 shadow-2xl">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 via-transparent to-pink-600/10" />

      {/* Mock video content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        {/* Animated bobblehead avatar */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg shadow-purple-500/40 animate-[bounce_2s_ease-in-out_infinite]">
            🗿
          </div>
          {/* Speaking animation rings */}
          <span className="absolute inset-0 rounded-full bg-purple-400/30 animate-ping" />
        </div>

        {/* Caption bar */}
        <div className="px-5 py-2 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 max-w-[280px] text-center">
          <p className="text-sm font-semibold text-white animate-pulse">
            &ldquo;Hi, I&apos;m Sarah — your local real estate expert!&rdquo;
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-3/4 h-1 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full w-2/3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-[progress_4s_ease-in-out_infinite]" />
        </div>
      </div>

      {/* Play overlay badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-xs text-white/70 font-medium border border-white/10">
        <Video className="h-3 w-3" />
        LIVE DEMO
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0d0d1a] to-transparent" />
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function UpsellContent() {
  const searchParams = useSearchParams();
  const orderId    = searchParams.get("order_id")    ?? "";
  const sessionId  = searchParams.get("session_id")  ?? "";

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedTier, setSelectedTier] = useState<1 | 2>(2); // default to popular
  const [voiceClone,   setVoiceClone]   = useState(false);
  const [script,       setScript]       = useState("");
  const [bullets,      setBullets]      = useState(["", "", ""]);
  const [bgFile,       setBgFile]       = useState<File | null>(null);
  const [voiceFile,    setVoiceFile]    = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted,    setSubmitted]    = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  // ── Cart Total ────────────────────────────────────────────────────────────
  const tierPrice  = selectedTier === 1 ? TIER_1_PRICE : TIER_2_PRICE;
  const cartTotal  = tierPrice + (voiceClone ? VOICE_CLONE_PRICE : 0);

  const successUrl = `/success?session_id=${sessionId}&order_id=${orderId}`;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const form = new FormData();
      form.append("orderId",      orderId);
      form.append("tierSelected", String(selectedTier));
      form.append("voiceClone",   String(voiceClone));

      if (selectedTier === 1) {
        form.append("script", script);
      } else {
        bullets.forEach((b, i) => form.append(`bullet_${i}`, b));
        if (bgFile) form.append("backgroundFile", bgFile);
      }
      if (voiceClone && voiceFile) form.append("voiceFile", voiceFile);

      const res  = await fetch("/api/heygen-upsell", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Submission failed");

      setSubmitted(true);
      // After brief success flash, route to success page
      setTimeout(() => { window.location.href = successUrl; }, 2200);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = script.trim().split(/\s+/).filter(Boolean).length;

  // ── Success flash ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d1a] p-6">
        <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/40">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">You&apos;re all set! 🎬</h2>
          <p className="text-white/60">Your video order is confirmed. Redirecting to your bobblehead...</p>
          <Loader2 className="h-5 w-5 animate-spin text-purple-400 mx-auto" />
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-white flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="flex h-16 items-center px-6 border-b border-white/10 bg-black/30 backdrop-blur-sm flex-shrink-0">
        <div className="font-bold text-lg tracking-tight bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          🗿 BobbleMe!
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-green-400 font-semibold bg-green-400/10 border border-green-400/20 rounded-full px-3 py-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Purchase Confirmed ✓
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Hero headline */}
        <div className="text-center px-6 pt-10 pb-6">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full mb-4">
            <Zap className="h-3.5 w-3.5" /> ONE-TIME EXCLUSIVE OFFER
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight max-w-2xl mx-auto">
            Wait!{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
              Turn your Bobblehead into a 24/7 Virtual Sales Rep.
            </span>
          </h1>
          <p className="mt-3 text-white/50 text-sm max-w-lg mx-auto">
            Add a lip-syncing, AI-animated promo video to your order — right now, at a special post-purchase price only available on this page.
          </p>
        </div>

        {/* ── Two-column layout ──────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left Column: Demo + Benefits ─────────────────────────────── */}
          <div className="lg:sticky lg:top-6 space-y-6">
            <DemoReel />

            {/* Benefit bullets */}
            <div className="space-y-3">
              {[
                { icon: Video,      label: "1-minute animated video", sub: "Your bobblehead comes alive with smooth lip-sync" },
                { icon: Users,      label: "Built for real estate & mortgage pros", sub: "Scripts tailored to convert buyers & sellers" },
                { icon: TrendingUp, label: "Works 24/7 on any platform", sub: "Social, email, website — everywhere you need reach" },
                { icon: Star,       label: "One-time price — never this low again", sub: "This offer disappears when you leave this page" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{label}</p>
                    <p className="text-xs text-white/40 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right Column: Pricing Cards ──────────────────────────────── */}
          <div className="space-y-4">

            {/* ── Tier 1 Card ──────────────────────────────────────────── */}
            <button
              onClick={() => setSelectedTier(1)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 ${
                selectedTier === 1
                  ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTier === 1 ? "border-purple-400 bg-purple-400" : "border-white/30"
                  }`}>
                    {selectedTier === 1 && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">The Base Video</p>
                    <p className="text-xs text-white/50 mt-0.5">Standard background · AI voice · You write the script</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold text-white">$39.99</p>
                  <p className="text-xs text-white/40">one-time</p>
                </div>
              </div>

              {/* Tier 1 form — script textarea */}
              {selectedTier === 1 && (
                <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-white/80">Your Script</label>
                    <span className={`text-xs font-mono ${wordCount > 150 ? "text-red-400" : "text-white/30"}`}>
                      {wordCount} / 150 words
                    </span>
                  </div>
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder={SCRIPT_PLACEHOLDER}
                    rows={7}
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none transition-all"
                  />
                  {wordCount > 150 && (
                    <p className="text-xs text-red-400">⚠️ Please trim to 150 words max for best results.</p>
                  )}
                </div>
              )}
            </button>

            {/* ── Tier 2 Card ──────────────────────────────────────────── */}
            <button
              onClick={() => setSelectedTier(2)}
              className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                selectedTier === 2
                  ? "border-pink-500 bg-pink-500/10 shadow-lg shadow-pink-500/20"
                  : "border-white/10 bg-white/[0.03] hover:border-white/20"
              }`}
            >
              {/* Most Popular badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-yellow-500 text-white text-[10px] font-extrabold px-4 py-1 rounded-bl-xl tracking-wider">
                ⭐ MOST POPULAR
              </div>

              <div className="flex items-start justify-between gap-4 pr-8">
                <div className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    selectedTier === 2 ? "border-pink-400 bg-pink-400" : "border-white/30"
                  }`}>
                    {selectedTier === 2 && <div className="h-2 w-2 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className="font-bold text-white">Premium Pro</p>
                    <p className="text-xs text-white/50 mt-0.5">Custom background · Dynamic captions · We write your script</p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold text-white">$69.99</p>
                  <p className="text-xs text-white/40">one-time</p>
                </div>
              </div>

              {/* Tier 2 form — bullets + bg upload */}
              {selectedTier === 2 && (
                <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">
                      Tell us 3 key points about yourself
                    </label>
                    <p className="text-xs text-white/40 mb-3">Our AI will craft a professional script from these bullet points.</p>
                    {bullets.map((b, i) => (
                      <input
                        key={i}
                        type="text"
                        value={b}
                        onChange={(e) => {
                          const next = [...bullets];
                          next[i] = e.target.value;
                          setBullets(next);
                        }}
                        placeholder={[
                          "e.g. 10 years in real estate, sold 200+ homes",
                          "e.g. Specialize in first-time buyers in Phoenix, AZ",
                          "e.g. Free consultation — call or text me anytime",
                        ][i]}
                        className="w-full mb-2 rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                      />
                    ))}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-white/80 block mb-2">
                      Custom Background <span className="text-white/30 font-normal">(property photo, logo, etc.)</span>
                    </label>
                    <FileDropzone
                      id="bg-file"
                      accept="image/*"
                      label="Upload background image"
                      icon={<Upload className="h-4 w-4 text-white/50" />}
                      hint="JPG, PNG, WEBP — drag & drop or click"
                      file={bgFile}
                      onFile={setBgFile}
                      onClear={() => setBgFile(null)}
                    />
                  </div>
                </div>
              )}
            </button>

            {/* ── Voice Clone Order Bump ─────────────────────────────────── */}
            <div
              className={`rounded-2xl border-2 p-5 transition-all duration-300 ${
                voiceClone
                  ? "border-yellow-500/60 bg-yellow-500/5"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <button
                    onClick={() => setVoiceClone(!voiceClone)}
                    className={`h-6 w-11 rounded-full relative transition-all duration-300 ${
                      voiceClone ? "bg-yellow-500" : "bg-white/10"
                    }`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300 ${
                      voiceClone ? "left-[22px]" : "left-0.5"
                    }`} />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="font-bold text-white flex items-center gap-2">
                        <Mic className="h-4 w-4 text-yellow-400" />
                        Voice Clone Add-On
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        Your actual voice — not AI. We clone it from a 60-second sample.
                      </p>
                    </div>
                    <p className="text-lg font-extrabold text-yellow-400 flex-shrink-0">+$29.99</p>
                  </div>

                  {/* Audio upload */}
                  {voiceClone && (
                    <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                      <label className="text-sm font-semibold text-white/80 block mb-2">
                        Upload voice sample{" "}
                        <span className="text-white/30 font-normal">(60 sec min)</span>
                      </label>
                      <FileDropzone
                        id="voice-file"
                        accept=".mp3,.m4a,.wav,audio/*"
                        label="Upload voice recording"
                        icon={<Mic className="h-4 w-4 text-white/50" />}
                        hint=".mp3, .m4a, or .wav — 60 seconds or more"
                        file={voiceFile}
                        onFile={setVoiceFile}
                        onClear={() => setVoiceFile(null)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300 animate-in fade-in duration-200">
                <span>😵</span>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky Footer ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0d0d1a]/95 backdrop-blur-xl border-t border-white/10 px-4 py-4 z-50">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Cart summary */}
          <div className="flex items-center justify-between text-sm px-1">
            <div className="flex items-center gap-3 flex-wrap text-white/40">
              <span className={selectedTier === 1 ? "text-purple-400 font-semibold" : ""}>
                {selectedTier === 1 ? "✓ Base Video ($39.99)" : ""}
              </span>
              <span className={selectedTier === 2 ? "text-pink-400 font-semibold" : ""}>
                {selectedTier === 2 ? "✓ Premium Pro ($69.99)" : ""}
              </span>
              {voiceClone && (
                <span className="text-yellow-400 font-semibold">+ Voice Clone ($29.99)</span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <span className="text-white/40 text-xs">Total: </span>
              <span className="text-white font-extrabold text-lg">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              (selectedTier === 1 && wordCount === 0) ||
              (selectedTier === 1 && wordCount > 150)
            }
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 text-white font-extrabold text-base hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-xl shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing your upgrade...
              </>
            ) : (
              <>
                🎬 Complete My Video Upgrade — ${cartTotal.toFixed(2)}
              </>
            )}
          </button>

          {/* Opt-out */}
          <p className="text-center text-xs text-white/20">
            <a
              href={successUrl}
              className="hover:text-white/40 underline underline-offset-2 transition-colors"
            >
              No thanks, I don&apos;t need a video right now. Take me to my $7.99 image.
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
