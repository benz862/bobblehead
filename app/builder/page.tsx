import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BuilderForm } from "./BuilderForm";

export default function BuilderPage() {
  return (
    <div className="flex h-screen w-full flex-col bg-background">
      {/* Header */}
      <header className="flex h-16 items-center border-b px-6 bg-card text-card-foreground">
        <Link href="/" className="flex items-center gap-2 text-sm font-medium hover:opacity-80 transition-opacity">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
        <div className="ml-auto font-bold text-lg tracking-tight">
          Bobblehead Builder
        </div>
      </header>

      {/* Main Split Interface */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Panel - Configurator */}
        <section className="w-[450px] border-r bg-muted/30 flex flex-col overflow-y-auto">
          <BuilderForm />
        </section>

        {/* Right Panel - Live Preview */}
        <section className="flex-1 flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-950 p-6 relative">
          <div className="absolute inset-x-0 top-6 text-center">
            <h2 className="text-xl font-bold">Live Preview</h2>
            <p className="text-sm text-zinc-500">Your configuration rendered in real-time</p>
          </div>
          
          <div className="w-[400px] h-[550px] bg-white dark:bg-zinc-900 rounded-xl shadow-2xl flex flex-col items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-800 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800 opacity-50 z-0"></div>
            
            <div className="z-10 flex flex-col items-center justify-center text-center p-8">
              <div className="h-32 w-32 rounded-full border-4 border-dashed border-zinc-300 dark:border-zinc-700 flex items-center justify-center mb-6 bg-zinc-50 dark:bg-zinc-800">
                <span className="text-zinc-400">Preview</span>
              </div>
              <h3 className="text-lg font-medium text-zinc-600 dark:text-zinc-300">Awaiting Configuration</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-xs">Upload your photos and select your theme on the left to see a preview block here.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
