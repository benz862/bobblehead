"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, ArrowRight } from "lucide-react";

export default function ResumePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setOrders(null);

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to look up orders");
    } finally {
      setLoading(false);
    }
  };

  const tierLabel = (tier: number) =>
    tier === 1 ? "Starter" : tier === 3 ? "Fan Favorite" : "Super Pack";

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center border-b px-6 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="ml-auto font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">🗿 BobbleMe!</div>
      </header>

      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">🔑 Resume Your Order</h1>
            <p className="text-muted-foreground">
              Enter the email you used at checkout and we&apos;ll find your remaining bobblehead credits.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium hover:from-purple-700 hover:to-pink-600 transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Looking up...
                </>
              ) : (
                "Find My Orders"
              )}
            </button>
          </form>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {orders !== null && orders.length === 0 && (
            <div className="p-6 rounded-xl bg-muted/30 border space-y-3">
              <p className="text-muted-foreground">No orders with remaining credits found for this email.</p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Get started with a new pack <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {orders !== null && orders.length > 0 && (
            <div className="space-y-6 text-left">
              {/* Orders with remaining credits */}
              {orders.filter(o => o.credits_used < o.credits_total).length > 0 && (
                <>
                  <h2 className="font-bold text-lg text-center">🎨 Active Orders</h2>
                  {orders.filter(o => o.credits_used < o.credits_total).map((order) => (
                    <div key={order.id} className="p-5 rounded-xl border bg-white shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-purple-700">{tierLabel(order.tier)} Pack</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {order.credits_used} of {order.credits_total} used — <span className="font-bold text-pink-600">{order.credits_total - order.credits_used} remaining</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ordered {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/builder?order_id=${order.id}&tier=${order.tier}`}
                          className="px-4 h-10 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium text-sm hover:from-purple-700 hover:to-pink-600 transition-all duration-200 hover:scale-105 shadow-md gap-1.5"
                        >
                          Continue <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      {/* Past creations for this order */}
                      {order.completedImages && order.completedImages.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Your creations so far:</p>
                          <div className="flex gap-2 flex-wrap">
                            {order.completedImages.map((url: string, i: number) => (
                              <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden border shadow-sm" onContextMenu={(e) => e.preventDefault()}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Creation ${i + 1}`} className="w-full h-full object-cover pointer-events-none select-none" draggable={false} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/5">
                                  <p className="text-[8px] font-black text-white/40 rotate-[-30deg] tracking-widest">PREVIEW</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {/* Fully used orders — show past creations only */}
              {orders.filter(o => o.credits_used >= o.credits_total).length > 0 && (
                <>
                  <h2 className="font-bold text-lg text-center mt-4">✅ Completed Orders</h2>
                  {orders.filter(o => o.credits_used >= o.credits_total).map((order) => (
                    <div key={order.id} className="p-5 rounded-xl border bg-muted/20 space-y-3">
                      <div>
                        <p className="font-bold text-muted-foreground">{tierLabel(order.tier)} Pack — <span className="text-green-600">All {order.credits_total} used</span></p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ordered {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {order.completedImages && order.completedImages.length > 0 && (
                        <div className="pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Your creations:</p>
                          <div className="flex gap-2 flex-wrap">
                            {order.completedImages.map((url: string, i: number) => (
                              <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden border shadow-sm" onContextMenu={(e) => e.preventDefault()}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Creation ${i + 1}`} className="w-full h-full object-cover pointer-events-none select-none" draggable={false} />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none bg-black/5">
                                  <p className="text-[8px] font-black text-white/40 rotate-[-30deg] tracking-widest">PREVIEW</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
