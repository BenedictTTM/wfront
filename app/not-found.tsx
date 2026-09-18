import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md bg-card border-[3px] border-border shadow-offset rounded-xl p-8 sm:p-10 text-center">
        <div className="w-16 h-16 bg-primary/10 border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-4xl font-extrabold text-foreground mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-4">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-8 text-sm sm:text-base leading-relaxed">
          The page or learning module you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/dashboard"
            className="w-full bg-primary text-foreground border-2 border-border shadow-offset rounded-lg px-6 py-3.5 font-bold hover:-translate-y-0.5 transition-all inline-block"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/study"
            className="w-full bg-surface text-foreground border-2 border-border rounded-lg px-6 py-3.5 font-bold hover:bg-muted/50 transition-all inline-block"
          >
            Browse Study Paths
          </Link>
        </div>
      </div>
    </div>
  );
}
