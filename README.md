# Factwright

Checks every case citation, statute, quote, figure and link in a document against its source before it goes out.

This is a preview. It covers:

- **Case citations:** UK neutral citations are looked up on [Find Case Law](https://caselaw.nationalarchives.gov.uk) (The National Archives). Made-up cases and citations that belong to a different case are flagged. Law report citations (WLR, AC and so on) are marked "check by hand".
- **Legislation:** sections and subsections of UK Public General Acts are checked on [legislation.gov.uk](https://www.legislation.gov.uk).
- **Quotes:** quoted words near a citation are matched against the judgment or section, down to a single changed word.
- **Figures:** "X of Y (Z%)", totals, growth rates, breakdowns that should sum to 100%, and the same metric stated twice with different values.
- **Links:** cited links are opened, and the page is checked for the figure it's cited for.

All checks are plain lookups and arithmetic; no AI model or API key is needed yet.

## Run it locally

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # engine tests, including both built-in samples
```

## Deploy a free preview on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. Choose **Add New → Project**, import `factwright`, and keep the defaults.
3. Click **Deploy**. You get a link like `factwright.vercel.app` to share.

Every push to `main` redeploys automatically.

## Before sharing widely

- Apply for the free [Find Case Law computational analysis licence](https://caselaw.nationalarchives.gov.uk/re-use-find-case-law-records/licence-application-process). Automated checking of judgments needs it.
- Ask testers to use public or redacted documents only.

## Where things live

| Path | What it does |
| --- | --- |
| `src/lib/extract.ts` | Finds citations, section references and quotes |
| `src/lib/sources/` | Find Case Law and legislation.gov.uk lookups, plus snapshots used by the samples |
| `src/lib/figures.ts` | Arithmetic checks on figures |
| `src/lib/links.ts` | Link checks |
| `src/lib/check.ts` | Runs every check and builds the report |
| `src/app/api/check/route.ts` | `POST /api/check` with a file, text or sample id |
| `src/components/` | Landing page, checker and results UI (Aceternity-style motion components in `ui/`) |
