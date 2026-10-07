import { ArrowRight, BookOpenCheck, Calculator, FileCheck2, Landmark, Link2, Quote } from "lucide-react";
import Link from "next/link";
import { LivePreview } from "@/components/live-preview";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { CloudShader } from "@/components/ui/cloud-shader";
import { GridBackground } from "@/components/ui/grid-background";
import { MovingBorderLink } from "@/components/ui/moving-border";
import { TextGenerate } from "@/components/ui/text-generate";

const FEATURES = [
  { Icon: Landmark, title: "Case citations", body: "Every neutral citation is looked up in the National Archives. Made-up cases and citations that belong to a different case are flagged.", wide: true },
  { Icon: BookOpenCheck, title: "Legislation", body: "Sections and subsections are checked against legislation.gov.uk." },
  { Icon: Quote, title: "Quotes", body: "Quoted words are matched against the judgment or statute, down to a single changed word." },
  { Icon: Calculator, title: "Figures", body: "Percentages, totals, growth rates and repeated numbers are recalculated." },
  { Icon: Link2, title: "Links and sources", body: "Cited links are opened, and the page is checked for the figure it's cited for.", wide: true },
];

const STEPS = [
  { n: "01", title: "Drop in a document", body: "A Word file, PDF or pasted text. A Word add-in comes next." },
  { n: "02", title: "Every claim is extracted", body: "Citations, statutes, quotes, figures and links, each tied to its place in the text." },
  { n: "03", title: "Checked against the source", body: "Plain lookups first, so verdicts are fast and explainable." },
  { n: "04", title: "Green, amber or red", body: "Each claim gets a verdict, the evidence behind it and a link to the source." },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative">
          <CloudShader className="min-h-[46rem] w-full" speed={0.8} count={5} fadeTo="#fbf8f2">
            <div className="mx-auto max-w-6xl px-4 pb-56 pt-20 text-center sm:px-6 sm:pt-28">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-3 py-1 text-xs text-white backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d6f0c2]" /> Preview · UK case law, legislation and figures
              </span>
              <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgb(31_59_45/0.25)] sm:text-6xl">
                <TextGenerate words="Nothing leaves your firm unverified." highlight={["unverified."]} />
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-white/90 drop-shadow-[0_1px_8px_rgb(31_59_45/0.3)] sm:text-lg">
                Factwright checks every case citation, statute, quote and figure in a document against its source, before a judge, a client or a journalist does.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <MovingBorderLink href="/check">
                  Check a sample document <ArrowRight className="h-4 w-4" />
                </MovingBorderLink>
                <Link href="/check?mode=upload" className="rounded-full px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                  Upload your own
                </Link>
              </div>
            </div>
          </CloudShader>
          <div className="relative -mt-44 px-4 pb-24 sm:px-6">
            <LivePreview />
          </div>
        </section>

        <section id="why" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <p className="text-sm font-medium text-brand">Why now</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-forest">AI drafts faster than anyone can check it. Courts and clients have noticed.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <CardSpotlight color="rgb(190 18 60 / 0.07)">
              <p className="text-xs uppercase tracking-wider text-stone-500">High Court, June 2025</p>
              <h3 className="mt-2 text-lg font-semibold text-forest">Ayinde v Haringey</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Grounds for judicial review cited five cases that don&apos;t exist. The Divisional Court warned the profession that lawyers who cite AI-invented authorities face regulatory referral.
              </p>
              <a className="mt-4 inline-flex items-center gap-1 text-sm text-stone-700 hover:text-forest" href="https://caselaw.nationalarchives.gov.uk/ewhc/admin/2025/1383">
                Read the judgment <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </CardSpotlight>
            <CardSpotlight color="rgb(180 83 9 / 0.08)">
              <p className="text-xs uppercase tracking-wider text-stone-500">Financial Times, July 2026</p>
              <h3 className="mt-2 text-lg font-semibold text-forest">A Big Four firm&apos;s published reports</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                Researchers found links to pages that don&apos;t exist, a cited paper that appears never to have been written, and one fact footnoted to three different sources.
              </p>
              <a className="mt-4 inline-flex items-center gap-1 text-sm text-stone-700 hover:text-forest" href="https://www.irishtimes.com/business/2026/07/29/pwc-published-thought-leadership-reports-marred-by-ai-hallucinations/">
                Read the coverage <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </CardSpotlight>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <p className="text-sm font-medium text-brand">What it checks</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-forest">Every claim, traced to the paragraph it came from.</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ Icon, title, body, wide }) => (
              <CardSpotlight key={title} className={wide ? "md:col-span-2" : undefined}>
                <Icon className="h-5 w-5 text-brand" aria-hidden />
                <h3 className="mt-4 font-semibold text-forest">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{body}</p>
              </CardSpotlight>
            ))}
            <CardSpotlight className="md:col-span-3" color="rgb(21 128 61 / 0.08)">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <FileCheck2 className="h-5 w-5 shrink-0 text-verified" aria-hidden />
                <div>
                  <h3 className="font-semibold text-forest">Coming next: the verification record</h3>
                  <p className="mt-1 text-sm text-stone-600">A signed record of what was checked, by whom and when, ready for clients, insurers and regulators.</p>
                </div>
              </div>
            </CardSpotlight>
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <p className="text-sm font-medium text-brand">How it works</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-forest">Lookups first, judgement second.</h2>
          <ol className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="bg-white p-6">
                <span className="font-mono text-xs text-stone-500">{s.n}</span>
                <h3 className="mt-3 font-semibold text-forest">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative overflow-hidden px-4 py-24 text-center sm:px-6">
          <GridBackground />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-forest sm:text-4xl">See what it finds in a real-world failure.</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-stone-600">Run the sample built from the Ayinde citations, or upload a public document of your own.</p>
          <div className="relative mt-8">
            <MovingBorderLink href="/check">
              Open the demo <ArrowRight className="h-4 w-4" />
            </MovingBorderLink>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
