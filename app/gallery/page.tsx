import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Use server-side Supabase client for this server component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export const revalidate = 60; // Revalidate every 60 seconds

export default async function GalleryPage() {
  const { data: items } = await supabase
    .from("generations")
    .select("id, output_image_url, nameplate, theme_type, theme_details, created_at")
    .eq("status", "completed")
    .eq("show_in_gallery", true)
    .order("created_at", { ascending: false })
    .limit(50);

  const galleryItems = items || [];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[350px] h-[350px] bg-purple-400/15 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-80px] right-[-80px] w-[400px] h-[400px] bg-yellow-400/15 rounded-full blur-3xl"></div>

      {/* Header */}
      <header className="flex h-16 items-center border-b px-6 bg-white/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="ml-auto font-bold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
          🗿 BobbleMe!
        </div>
      </header>

      <main className="flex-1 p-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
              Bobblehead Gallery 🏛️
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Check out what our community has created! Want yours here? Submit it after download.
            </p>
          </div>

          {galleryItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🗿</div>
              <h2 className="text-xl font-bold mb-2">Gallery is Empty... For Now!</h2>
              <p className="text-muted-foreground mb-6">Be the first to submit your bobblehead to the gallery!</p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 h-12 px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                🎨 Create Your Bobblehead
              </Link>
            </div>
          ) : (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {galleryItems.map((item) => {
                const details = (item.theme_details || {}) as Record<string, any>;
                const label = item.theme_type === 'sport'
                  ? `${details.teamName || details.sport || 'Sports'}`
                  : `${details.occupation || 'Custom'}`;

                return (
                  <div
                    key={item.id}
                    className="break-inside-avoid rounded-xl overflow-hidden bg-white border shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.output_image_url!}
                      alt={`${item.nameplate || 'Bobblehead'}`}
                      className="w-full object-cover"
                      loading="lazy"
                    />
                    <div className="p-3">
                      <p className="font-bold text-sm truncate">{item.nameplate || 'BobbleMe!'}</p>
                      <p className="text-xs text-muted-foreground capitalize">{label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/60 backdrop-blur-sm py-6 px-8 mt-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>🗿</span>
            <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">BobbleMe!</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} BobbleMe!</p>
        </div>
      </footer>
    </div>
  );
}
