import { PageTransition } from "@/components/PageTransition";

export default function AboutPage() {
  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <h1 className="text-4xl font-bold font-syne text-white mb-8 text-center">About CrackKit</h1>
        
        <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 prose prose-invert max-w-none">
          <p className="text-xl text-text-secondary leading-relaxed mb-8 text-center">
            We are on a mission to make premium tech education accessible and affordable for every Indian student.
          </p>
          
          <h2 className="text-2xl font-bold text-white mb-4">Our Story</h2>
          <p className="text-text-secondary mb-6">
            CrackKit started with a simple observation: most high-quality tech interview preparation materials are either too expensive for the average college student or scattered across hundreds of fragmented blogs. We wanted to build a single, trusted source of truth.
          </p>
          
          <h2 className="text-2xl font-bold text-white mb-4 mt-8">Why We Built This</h2>
          <p className="text-text-secondary mb-6">
            We&apos;ve been in your shoes. We know the anxiety of upcoming placement drives and the overwhelming feeling of not knowing where to start. Our bundles are exactly what we wish we had when we were preparing for our first tech jobs.
          </p>
          
          <h2 className="text-2xl font-bold text-white mb-6 mt-12 text-center">Meet the Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-background border border-border rounded-xl p-6 text-center">
                <div className="w-20 h-20 bg-surface rounded-full mx-auto mb-4 border-2 border-primary/20"></div>
                <h3 className="text-white font-bold mb-1">Team Member {i}</h3>
                <p className="text-sm text-text-secondary">Co-Founder</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
