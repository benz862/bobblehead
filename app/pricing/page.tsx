"use client";

import Link from "next/link";

export default function PricingPage() {

  const tiers = [
    {
      count: 1,
      price: "$7.99",
      label: "Starter",
      emoji: "🗿",
      description: "Perfect for a gift or treating yourself!",
      perUnit: "$7.99 each",
      popular: false,
    },
    {
      count: 3,
      price: "$19.99",
      label: "Fan Favorite",
      emoji: "🏆",
      description: "Get the whole family bobble-fied!",
      perUnit: "$6.66 each",
      popular: true,
    },
    {
      count: 5,
      price: "$27.99",
      label: "Super Pack",
      emoji: "🎉",
      description: "The ultimate bobblehead collection!",
      perUnit: "$5.60 each",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[350px] h-[350px] bg-purple-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-yellow-400/15 rounded-full blur-3xl"></div>
      <div className="absolute top-[40%] right-[5%] w-[250px] h-[250px] bg-teal-400/10 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="flex h-16 items-center border-b px-6 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
          ← Back to Home
        </Link>
        <div className="ml-auto font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          🗿 BobbleMe!
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
          Choose Your Pack
        </h1>
        <p className="text-muted-foreground mb-10 text-center max-w-md">
          Each bobblehead gets 4 unique previews to pick from, then your favorite is polished to full HD! ✨
        </p>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          {tiers.map((tier) => (
            <Link
              key={tier.count}
              href={`/builder?tier=${tier.count}`}
              className={`relative flex flex-col items-center p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white ${
                tier.popular
                  ? "border-purple-500 shadow-xl shadow-purple-500/20"
                  : "border-transparent shadow-lg hover:border-purple-300"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                  ⭐ MOST POPULAR
                </div>
              )}

              <span className="text-5xl mb-4">{tier.emoji}</span>
              <h2 className="text-xl font-bold">{tier.label}</h2>
              <p className="text-muted-foreground text-sm mt-1 text-center">{tier.description}</p>

              <div className="mt-6 mb-2">
                <span className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  {tier.price}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{tier.perUnit}</p>

              <div className="mt-4 flex items-center gap-2 text-sm text-foreground/70">
                <span className="font-bold text-2xl text-foreground">{tier.count}</span>
                <span>custom {tier.count === 1 ? "bobblehead" : "bobbleheads"}</span>
              </div>

              <div className="mt-6 w-full">
                <div
                  className={`w-full text-center py-3 rounded-full font-bold text-sm transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                      : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                  }`}
                >
                  Get Started →
                </div>
              </div>

              <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
                <li>✅ 4 previews per bobblehead</li>
                <li>✅ HD download</li>
                <li>✅ Any sport or occupation</li>
                <li>✅ Custom nameplate</li>
              </ul>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
