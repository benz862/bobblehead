import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center relative overflow-hidden">
      {/* Fun background blobs */}
      <div className="absolute top-[-100px] left-[-100px] w-[400px] h-[400px] bg-purple-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-[500px] h-[500px] bg-yellow-400/20 rounded-full blur-3xl"></div>
      <div className="absolute top-[30%] right-[10%] w-[300px] h-[300px] bg-teal-400/15 rounded-full blur-3xl"></div>
      
      {/* Floating bobblehead decorations */}
      {[
        { src: '/samples/demo-1.png', top: '8%', left: '3%', size: 120, delay: '0s' },
        { src: '/samples/demo-2.png', top: '12%', right: '4%', size: 110, delay: '0.5s' },
        { src: '/samples/demo-5.png', top: '45%', left: '2%', size: 100, delay: '1s' },
        { src: '/samples/demo-6.png', top: '50%', right: '3%', size: 105, delay: '1.5s' },
        { src: '/samples/demo-9.png', top: '25%', left: '8%', size: 80, delay: '0.7s' },
        { src: '/samples/demo-10.png', top: '30%', right: '8%', size: 85, delay: '1.2s' },
      ].map((bob, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={bob.src}
          alt=""
          className="absolute bobble-animate opacity-40 hover:opacity-80 transition-opacity duration-500 pointer-events-none hidden lg:block"
          style={{
            top: bob.top,
            left: bob.left,
            right: bob.right,
            width: bob.size,
            animationDelay: bob.delay,
            filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.15))',
          } as React.CSSProperties}
        />
      ))}

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center p-8 pt-20 pb-16 relative z-10 max-w-2xl">
        <div className="text-7xl mb-4 bobble-animate">🗿</div>
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-4 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
          BobbleMe!
        </h1>
        <p className="text-2xl font-bold text-foreground/80 mb-2">
          Turn Yourself Into a Custom Bobblehead
        </p>
        <p className="text-lg text-muted-foreground mb-10 max-w-[500px] mx-auto leading-relaxed">
          Upload your photo (or your pet&apos;s!), pick your sport or dream job, and we&apos;ll create a one-of-a-kind bobblehead figure just for you. Complete with a personalized nameplate! 🎉
        </p>
        
        <Link 
          href="/pricing" 
          className="inline-flex items-center justify-center rounded-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 h-14 px-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 gap-2"
        >
          🎨 Let&apos;s Build One!
        </Link>
        
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🏆</span>
            <span className="font-semibold">150+ Teams</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">👔</span>
            <span className="font-semibold">Any Occupation</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">🐾</span>
            <span className="font-semibold">Pet Portraits</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl">✨</span>
            <span className="font-semibold">Custom Names</span>
          </div>
        </div>
      </section>

      {/* Showcase Gallery Ribbon */}
      <section className="w-full py-12 relative z-10 overflow-hidden">
        <h2 className="text-2xl font-extrabold text-center mb-8 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          Recent Creations
        </h2>
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          {/* Scrolling ribbon */}
          <div className="flex gap-6 animate-scroll">
            {[1,2,3,4,5,6,7,8,9,10,11,12,1,2,3,4,5,6,7,8,9,10,11,12].map((n, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={`/samples/demo-${n}.png`}
                alt={`Sample bobblehead ${n}`}
                className="h-48 w-auto rounded-xl flex-shrink-0 hover:scale-110 transition-transform duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="w-full max-w-4xl mx-auto px-8 py-16 relative z-10">
        <h2 className="text-3xl font-extrabold text-center mb-3 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">How It Works</h2>
        <p className="text-center text-muted-foreground mb-12">Three simple steps to your custom bobblehead</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: "1", emoji: "📸", title: "Upload Your Photo", desc: "Snap a selfie or upload your favorite pic. Clear, front-facing photos work best!" },
            { step: "2", emoji: "🎨", title: "Choose Your Style", desc: "Pick your team sport (150+ real teams!), any occupation, or upload your pet's photo for an adorable animal bobblehead." },
            { step: "3", emoji: "🤩", title: "Get Your Bobblehead", desc: "Our AI generates 4 unique options. Pick your favorite, and we polish it to full HD!" },
          ].map((item) => (
            <div key={item.step} className="relative flex flex-col items-center text-center p-6 rounded-2xl bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-bold flex items-center justify-center shadow-md">
                {item.step}
              </div>
              <span className="text-4xl mt-4 mb-3">{item.emoji}</span>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-2xl mx-auto px-8 py-16 relative z-10">
        <h2 className="text-3xl font-extrabold text-center mb-10 bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">FAQ</h2>
        
        <div className="space-y-4">
          {[
            { q: "What do I get exactly?", a: "You get 4 unique AI-generated bobblehead previews based on your photo. Pick your favorite, and we upscale it to a beautiful, high-definition digital image you can download instantly." },
            { q: "What sports teams are available?", a: "We have all NHL, NFL, MLB teams, plus soccer leagues including MLS, Premier League, Bundesliga, La Liga, Serie A, and Ligue 1 — over 150 real teams with accurate colors!" },
            { q: "Can I make a non-sports bobblehead?", a: "Absolutely! Choose from preset occupations (doctor, firefighter, chef, astronaut...) or type any custom character you can imagine — like a pirate captain, disco dancer, or superhero." },
            { q: "How long does it take?", a: "The AI generates your 4 bobblehead previews in about 30-60 seconds. Upscaling your selected favorite takes another 15-30 seconds." },
            { q: "What photo works best?", a: "A clear, front-facing photo with good lighting. The AI analyzes your facial features in detail, so the clearer the photo, the better the likeness!" },
            { q: "I bought a multi-pack but closed my browser. How do I get my remaining bobbleheads?", a: "No worries! Visit our Resume Order page and enter the email you used at checkout. We'll find your order and let you continue creating your remaining bobbleheads for free." },
          ].map((item, i) => (
            <details key={i} className="group border rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
              <summary className="flex items-center justify-between p-5 cursor-pointer font-semibold text-sm">
                <span>{item.q}</span>
                <span className="text-primary transition-transform duration-200 group-open:rotate-45 text-lg">+</span>
              </summary>
              <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed -mt-1">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="w-full max-w-4xl mx-auto px-8 py-12 relative z-10">
        <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 rounded-2xl p-10 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-extrabold mb-3">Ready to Get Bobbled? 🗿</h2>
          <p className="text-white/80 mb-6">Starting at just $7.99 — it&apos;s the gift that keeps on bobbling!</p>
          <Link 
            href="/pricing" 
            className="inline-flex items-center justify-center rounded-full text-lg font-bold bg-white text-purple-700 hover:bg-purple-50 h-14 px-10 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            🎉 See Pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-white/60 backdrop-blur-sm py-8 px-8 mt-8 relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗿</span>
            <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">BobbleMe!</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/gallery" className="hover:text-foreground transition-colors">Gallery</Link>
            <Link href="/resume" className="hover:text-foreground transition-colors">Resume Order</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} BobbleMe! — AI-Powered Bobbleheads by Epoxy Dogs LLC.</p>
        </div>
      </footer>
    </main>
  );
}
