import { Suspense } from "react";
import SuccessContent from "./SuccessContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce">🗿</div>
          <p className="text-muted-foreground font-medium">Loading your bobblehead...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
