import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Turn Yourself Into a Custom Bobblehead
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-[600px]">
        Upload a photo and let AI transform you into a personalized bobblehead with your favorite sports team, occupation, and custom engraved nameplate.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/builder" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-8"
        >
          Create Yours
        </Link>
      </div>
    </main>
  );
}
