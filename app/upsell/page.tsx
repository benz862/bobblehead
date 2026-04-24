import { Suspense } from "react";
import UpsellContent from "./UpsellContent";

export default function UpsellPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#0d0d1a]">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🎬</div>
          <p className="text-white/60 font-medium">Loading your exclusive offer...</p>
        </div>
      </div>
    }>
      <UpsellContent />
    </Suspense>
  );
}
