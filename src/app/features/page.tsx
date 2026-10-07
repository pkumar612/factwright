import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { CloudShader } from "@/components/ui/cloud-shader";
import { MovingBorderLink } from "@/components/ui/moving-border";
import { cn } from "@/lib/cn";
import { FEATURE_AREAS, NOT_BUILDING, type FeatureStatus } from "@/lib/features";

export const metadata: Metadata = { title: "Features · Factwright" };

const BADGE: Record<FeatureStatus, { label: string; className: string }> = {
  live: { label: "Live in preview", className: "bg-verified/10 text-verified ring-verified/30" },
  next: { label: "Next", className: "bg-sky/10 text-sky ring-sky/30" },
  later: { label: "Later", className: "bg-stone-500/10 text-stone-600 ring-stone-400/30" },
};

const all = FEATURE_AREAS.flatMap((a) => a.features);
const count = (s: FeatureStatus) => all.filter((f) => f.status === s).length;

export default function FeaturesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <CloudShader className="w-full" speed={0.6} count={3} fadeTo="#fbf8f2">
          <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 text-center sm:px-6 sm:pt-16">
            <h1 className="text-3xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgb(31_59_45/0.25)] sm:text-4xl">Everything Factwright will do</h1>
            <p className="mx-auto mt-3 max-w-xl text-white/90 drop-shadow-[0_1px_8px_rgb(31_59_45/0.3)]">
              {all.length} features across six areas. {count("live")} are live in this preview, {count("next")} come next and {count("later")} follow later.
            </p>
          </div>
        </CloudShader>

        <div className="mx-auto -mt-10 max-w-6xl px-4 pb-16 sm:px-6">
          <nav className="no-print mb-8 flex flex-wrap justify-center gap-2">
            {FEATURE_AREAS.map((a) => (
              <a key={a.id} href={`#${a.id}`} className="rounded-full border border-line bg-white px-4 py-1.5 text-sm text-stone-700 shadow-sm transition hover:text-forest">
                {a.name} <span className="text-stone-400">{a.features.length}</span>
              </a>
            ))}
          </nav>

          <div className="space-y-12">
            {FEATURE_AREAS.map((area) => (
              <section key={area.id} id={area.id} className="scroll-mt-20">
                <h2 className="text-2xl font-semibold tracking-tight text-forest">{area.name}</h2>
                <p className="mt-1 text-stone-600">{area.summary}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {area.features.map((f) => (
                    <CardSpotlight key={f.name} className="p-5">
                      <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1", BADGE[f.status].className)}>{BADGE[f.status].label}</span>
                      <h3 className="mt-3 font-semibold text-forest">{f.name}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-stone-600">{f.detail}</p>
                    </CardSpotlight>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-2xl border border-line bg-white p-6">
              <h2 className="text-lg font-semibold text-forest">What we&apos;re deliberately not building</h2>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {NOT_BUILDING.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <div className="mt-14 text-center">
            <MovingBorderLink href="/check">
              Try the live features <ArrowRight className="h-4 w-4" />
            </MovingBorderLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
