"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  const [status, setStatus] = useState<"verifying" | "generating" | "complete" | "error">("verifying");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("error");
      return;
    }

    const processOrder = async () => {
      try {
        setStatus("generating");
        // In a production app, we would verify the session_id with Stripe first
        // But the webhook will handle validating payment asynchronously anyway
        
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        
        const data = await res.json();
        
        if (data.error) throw new Error(data.error);
        if (data.imageUrl) {
          setImageUrl(data.imageUrl);
          setStatus("complete");
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    // We delay the trigger slightly to give the Stripe Webhook time to mark the order as 'paid'
    // Alternatively, we could poll the database for status changes.
    const timer = setTimeout(() => {
      processOrder();
    }, 2000);

    return () => clearTimeout(timer);
  }, [orderId]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center border-b px-6 bg-card">
        <Link href="/builder" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          Back to Builder
        </Link>
        <div className="ml-auto font-bold text-lg tracking-tight">AI Bobblehead</div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          {status === "verifying" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h1 className="text-2xl font-bold">Verifying Payment...</h1>
              <p className="text-muted-foreground mt-2">Please do not close this window.</p>
            </div>
          )}

          {status === "generating" && (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="relative h-24 w-24 mb-6">
                <Loader2 className="absolute inset-0 h-full w-full animate-spin text-primary/30" strokeWidth={1} />
                <div className="absolute inset-2 bg-gradient-to-tr from-primary/20 to-primary/60 rounded-full animate-pulse blur-sm" />
                <div className="absolute inset-4 bg-background rounded-full flex items-center justify-center font-bold text-sm">AI</div>
              </div>
              <h1 className="text-2xl font-bold">Generating Your Bobblehead!</h1>
              <p className="text-muted-foreground mt-2">Nano Banana Pro is processing your photos and rendering your custom figure. This typically takes 30-60 seconds.</p>
            </div>
          )}

          {status === "complete" && imageUrl && (
            <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Success!</h1>
              <p className="text-muted-foreground mt-2 mb-8">Your completely custom Bobblehead is ready.</p>
              
              <div className="relative group rounded-xl overflow-hidden shadow-2xl border bg-white dark:bg-zinc-900 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Generated Bobblehead" className="w-[300px] h-[400px] object-cover rounded-lg" />
              </div>
              
              <Link href="/builder" className="mt-8 px-8 h-12 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                Create Another One
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4 text-2xl font-bold">!</div>
              <h1 className="text-2xl font-bold">Oops! Something went wrong.</h1>
              <p className="text-muted-foreground mt-2">We couldn't generate your bobblehead right now. Please check your dashboard or contact support.</p>
              <Link href="/builder" className="mt-6 text-primary hover:underline font-medium">Return to Builder</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
