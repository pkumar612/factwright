import type { Metadata } from "next";
import { Suspense } from "react";
import { Checker } from "@/components/checker";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SAMPLES } from "@/lib/samples";

export const metadata: Metadata = { title: "Check a document · Factwright" };

const samples = SAMPLES.map(({ id, title, blurb }) => ({ id, title, blurb }));

export default function CheckPage({ searchParams }: PageProps<"/check">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<Checker samples={samples} initialMode="samples" />}>
          <CheckerForMode searchParams={searchParams} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}

async function CheckerForMode({ searchParams }: Pick<PageProps<"/check">, "searchParams">) {
  const { mode } = await searchParams;
  return <Checker samples={samples} initialMode={mode === "upload" ? "upload" : mode === "paste" ? "paste" : "samples"} />;
}
