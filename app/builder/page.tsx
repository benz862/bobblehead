import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { BuilderForm } from "./BuilderForm";

export default function BuilderPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
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

      {/* Full Width Builder */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="max-w-2xl mx-auto relative z-10">
          <Suspense fallback={<div className="p-6 text-center text-muted-foreground">Loading builder...</div>}>
            <BuilderForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
