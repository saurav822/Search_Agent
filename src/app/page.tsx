import Link from "next/link";
import { Search, Zap, Globe, Code2, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/30 to-slate-900">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-500 rounded-lg flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white">Search Agent Builder</span>
          </div>
          <Link
            href="/login"
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-purple-300 text-sm mb-6">
          <Zap className="w-3.5 h-3.5" />
          Powered by Gemini, Groq, OpenAI & Perplexity
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          Build AI Search APIs<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            for any website
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Define a prompt, pick your columns, choose your AI model — get a public REST API endpoint
          your website can use as a smart search engine. No backend coding required.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how"
            className="px-6 py-3 text-slate-300 hover:text-white border border-white/10 rounded-xl transition-colors"
          >
            See how it works
          </a>
        </div>
      </section>

      <section id="how" className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              icon: <Code2 className="w-6 h-6 text-purple-400" />,
              title: "Configure your agent",
              desc: "Choose an AI provider (Gemini, Groq, OpenAI, Perplexity), paste your API key, write a system prompt, and define the output columns you want.",
            },
            {
              step: "2",
              icon: <Zap className="w-6 h-6 text-purple-400" />,
              title: "Get your endpoint",
              desc: "We instantly generate a unique public REST API endpoint for your agent. Test it live directly from your dashboard.",
            },
            {
              step: "3",
              icon: <Globe className="w-6 h-6 text-purple-400" />,
              title: "Integrate anywhere",
              desc: "Call your endpoint from any website with a simple POST request. Get back structured JSON results matching your defined columns.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-white/5 border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500/20 border border-purple-500/20 rounded-lg flex items-center justify-center text-purple-400 font-bold text-sm">
                  {item.step}
                </div>
                {item.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Example: Startup Funding Search</h2>
          <p className="text-slate-400 text-sm mb-6">
            A startup directory website creates a search agent with Gemini and these columns:
            <em className="text-slate-300"> Company, Stage, Amount, Investor, Country</em>.
            Their users search and get live AI-powered results instantly.
          </p>
          <div className="bg-black/40 rounded-xl p-4 font-mono text-xs">
            <p className="text-slate-500 mb-1"># Call your generated endpoint</p>
            <p className="text-green-400">
              POST https://your-app.vercel.app/api/search/funding-india-a1b2c3
            </p>
            <p className="text-slate-400 mt-1">{"{ \"query\": \"AI startups raised Series A in 2024\" }"}</p>
            <p className="text-slate-500 mt-3 mb-1"># Response</p>
            <p className="text-blue-300">{"{ \"results\": [{ \"Company\": \"...\", \"Stage\": \"Series A\", ... }] }"}</p>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Everything free to start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
          {[
            "Gemini 2.0 Flash with live web search",
            "Groq Llama 3 — ultra-fast responses",
            "Multiple agents per account",
            "Unlimited API calls",
            "Live test from dashboard",
            "Hosted on Vercel + Supabase",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-sm text-slate-300">
              <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
              {item}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Start building for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-slate-500 text-sm">
        Search Agent Builder — Built with Next.js, Supabase & Vercel AI SDK
      </footer>
    </div>
  );
}
