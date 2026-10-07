export function SiteFooter() {
  return (
    <footer className="no-print mt-auto border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-stone-500 sm:flex-row sm:justify-between sm:px-6">
        <p>Factwright preview. Not legal or financial advice. Use public or redacted documents only.</p>
        <p>
          Sources: <a className="underline hover:text-stone-700" href="https://caselaw.nationalarchives.gov.uk">Find Case Law</a> (The National Archives) and{" "}
          <a className="underline hover:text-stone-700" href="https://www.legislation.gov.uk">legislation.gov.uk</a>, Open Government Licence.
        </p>
      </div>
    </footer>
  );
}
