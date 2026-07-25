// Renders a JSON-LD block. Server component on purpose (no "use client"): the
// structured data has to be in the server-rendered HTML for crawlers that do
// not execute JavaScript.
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // `<` is escaped so a stray "</script>" inside any string can never end
      // the tag early.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
