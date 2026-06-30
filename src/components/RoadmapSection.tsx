"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";

type Level = "Beginner" | "Intermediate" | "Advanced";

interface RoadmapNode {
  title: string;
  subtitle?: string;
  level?: Level;
  productSlug?: string; // when set, node links to the paid PDF
}

interface Track {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  productSlug: string;
  productLabel: string;
  nodes: RoadmapNode[];
}

const TRACKS: Track[] = [
  {
    id: "dsa",
    label: "DSA",
    emoji: "🧠",
    tagline: "From Big-O to graphs & DP — the FAANG interview path.",
    productSlug: "dsa-mastery-bundle",
    productLabel: "Ultimate DSA Mastery Bundle",
    nodes: [
      { title: "Complexity & Big-O", subtitle: "Time/space analysis, recursion basics", level: "Beginner" },
      { title: "Arrays & Strings", subtitle: "Two pointers, sliding window", level: "Beginner" },
      { title: "Hashing", subtitle: "Maps, sets, frequency counting", level: "Beginner" },
      { title: "Stacks, Queues & Linked Lists", subtitle: "Monotonic stack, fast/slow pointers", level: "Intermediate" },
      { title: "Trees & BST", subtitle: "Traversals, recursion patterns", level: "Intermediate", productSlug: "dsa-mastery-bundle" },
      { title: "Heaps & Priority Queues", subtitle: "Top-K, scheduling problems", level: "Intermediate" },
      { title: "Graphs", subtitle: "BFS, DFS, Dijkstra, union-find", level: "Advanced" },
      { title: "Dynamic Programming", subtitle: "Knapsack, LIS, grid DP", level: "Advanced", productSlug: "dsa-mastery-bundle" },
      { title: "Greedy & Advanced", subtitle: "Tries, segment trees, intervals", level: "Advanced" },
    ],
  },
  {
    id: "web",
    label: "Web Dev",
    emoji: "🌐",
    tagline: "Full-stack MERN — ship real projects end to end.",
    productSlug: "mern-full-stack-kit",
    productLabel: "MERN Full Stack Kit",
    nodes: [
      { title: "HTML, CSS & Modern JS", subtitle: "ES6+, async/await, DOM", level: "Beginner" },
      { title: "React Fundamentals", subtitle: "Components, props, JSX", level: "Beginner" },
      { title: "Hooks & State", subtitle: "useState, useEffect, context", level: "Intermediate", productSlug: "mern-full-stack-kit" },
      { title: "Node & Express", subtitle: "Routing, middleware, REST APIs", level: "Intermediate" },
      { title: "MongoDB & Mongoose", subtitle: "Schemas, queries, relations", level: "Intermediate" },
      { title: "Authentication", subtitle: "JWT, sessions, protected routes", level: "Advanced", productSlug: "mern-full-stack-kit" },
      { title: "Deployment & DevOps", subtitle: "Vercel, env, CI basics", level: "Advanced" },
    ],
  },
  {
    id: "system-design",
    label: "System Design",
    emoji: "⚙️",
    tagline: "HLD & LLD for senior engineering interviews.",
    productSlug: "system-design-bible",
    productLabel: "System Design Bible",
    nodes: [
      { title: "Fundamentals", subtitle: "Latency, throughput, CAP theorem", level: "Beginner" },
      { title: "Scaling Basics", subtitle: "Vertical vs horizontal, load balancing", level: "Intermediate" },
      { title: "Caching", subtitle: "Redis, CDN, eviction policies", level: "Intermediate", productSlug: "system-design-bible" },
      { title: "Databases", subtitle: "SQL vs NoSQL, indexing, sharding", level: "Intermediate" },
      { title: "Async & Messaging", subtitle: "Queues, Kafka, pub/sub", level: "Advanced" },
      { title: "Microservices", subtitle: "API gateway, service discovery", level: "Advanced", productSlug: "system-design-bible" },
      { title: "HLD & LLD Case Studies", subtitle: "Design Twitter, URL shortener, etc.", level: "Advanced" },
    ],
  },
  {
    id: "interview",
    label: "Interview Prep",
    emoji: "🎯",
    tagline: "The 4-week sprint that lands the offer.",
    productSlug: "top-500-interview-questions",
    productLabel: "Top 500 Interview Questions",
    nodes: [
      { title: "Resume & Profile", subtitle: "ATS-friendly, projects that pop", level: "Beginner" },
      { title: "CS Fundamentals", subtitle: "OS, DBMS, networks, OOP", level: "Intermediate", productSlug: "top-500-interview-questions" },
      { title: "DSA Patterns", subtitle: "20 patterns that cover 90% of Qs", level: "Intermediate" },
      { title: "Behavioral (STAR)", subtitle: "Stories, leadership principles", level: "Intermediate" },
      { title: "Mock Interviews", subtitle: "Timed practice, feedback loops", level: "Advanced" },
      { title: "HR & Negotiation", subtitle: "Salary talk, closing the offer", level: "Advanced", productSlug: "top-500-interview-questions" },
    ],
  },
];

const LEVEL_STYLES: Record<Level, string> = {
  Beginner: "text-success bg-success/10 border-success/20",
  Intermediate: "text-warning bg-warning/10 border-warning/20",
  Advanced: "text-badge bg-badge/10 border-badge/20",
};

export function RoadmapSection() {
  const [active, setActive] = useState(TRACKS[0].id);
  const track = TRACKS.find((t) => t.id === active) ?? TRACKS[0];

  return (
    <section id="roadmaps" className="py-12 md:py-20 bg-background border-t border-border scroll-mt-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Free Roadmaps
          </span>
          <h2 className="text-3xl md:text-4xl font-bold font-syne text-white mb-3">
            Don&apos;t know where to start?
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Follow a clear, step-by-step path for each track. Each milestone maps
            to a curated CrackKit PDF — learn the order, then go deep.
          </p>
        </div>

        {/* Track tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-semibold border transition-all",
                t.id === active
                  ? "bg-primary border-primary text-white"
                  : "bg-surface border-border text-text-secondary hover:text-white hover:border-text-secondary"
              )}
            >
              <span className="mr-1.5">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Active track */}
        <p className="text-center text-text-secondary mb-10 italic">{track.tagline}</p>

        {/* Vertical roadmap */}
        <div className="relative max-w-2xl mx-auto">
          {/* track line */}
          <div className="absolute left-4 md:left-1/2 top-2 bottom-2 w-px bg-border md:-translate-x-1/2" />

          <ol className="space-y-5">
            {track.nodes.map((node, i) => (
              <li key={node.title} className="relative pl-12 md:pl-0">
                {/* node dot */}
                <span className="absolute left-4 md:left-1/2 top-5 w-3 h-3 rounded-full bg-primary ring-4 ring-background md:-translate-x-1/2 z-10" />

                <div
                  className={cn(
                    "md:w-[calc(50%-1.75rem)]",
                    i % 2 === 0 ? "md:mr-auto md:pr-8 md:text-right" : "md:ml-auto md:pl-8"
                  )}
                >
                  <div className="bg-surface border border-border hover:border-primary/40 rounded-2xl p-4 transition-colors">
                    <div
                      className={cn(
                        "flex items-center gap-2 mb-1",
                        i % 2 === 0 ? "md:justify-end" : ""
                      )}
                    >
                      <span className="text-[11px] font-mono text-text-secondary">
                        Step {i + 1}
                      </span>
                      {node.level && (
                        <span
                          className={cn(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                            LEVEL_STYLES[node.level]
                          )}
                        >
                          {node.level}
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-bold">{node.title}</h3>
                    {node.subtitle && (
                      <p className="text-sm text-text-secondary mt-0.5">{node.subtitle}</p>
                    )}
                    {node.productSlug && (
                      <Link
                        href={`/products/${node.productSlug}`}
                        className={cn(
                          "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover mt-2",
                          i % 2 === 0 ? "md:flex-row-reverse" : ""
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Covered in our PDF
                      </Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Track CTA */}
        <div className="mt-12 text-center">
          <Link
            href={`/products/${track.productSlug}`}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 rounded-xl transition-colors"
          >
            Get the {track.productLabel} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
