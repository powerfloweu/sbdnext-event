import type { ReactNode } from "react";

import { parsePrivacyNoticeText } from "@/lib/privacy-notice";

// Renders the admin-editable privacy notice text (see lib/privacy-notice.ts
// for the tiny "## "/"### "/"- " markup it understands) on both the public
// /adatkezeles pages and the admin preview, so the two never drift apart.

// Splits on "**bold**" and bare e-mail addresses / https URLs, turning the
// latter into mailto:/https: links. Never builds an href from an arbitrary
// scheme the text might contain, so this stays safe even though the text is
// admin-authored free text rather than sanitised HTML.
function renderInline(text: string): ReactNode[] {
  const tokenPattern = /(\*\*[^*]+\*\*|[\w.+-]+@[\w-]+\.[\w.-]+|https?:\/\/[^\s)]+)/g;
  const parts = text.split(tokenPattern);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) {
      return (
        <a key={i} href={`mailto:${part}`} className="text-primary underline">
          {part}
        </a>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {part}
        </a>
      );
    }
    return part;
  });
}

export function PrivacyNoticeContent({ text }: { text: string }) {
  const blocks = parsePrivacyNoticeText(text);

  return (
    <>
      {blocks.map((block, i) => {
        if (block.type === "h2") {
          return (
            <h2 key={i} className="text-lg font-bold">
              {renderInline(block.text)}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={i} className="mt-3 font-semibold">
              {renderInline(block.text)}
            </h3>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={i} className="mt-2 list-disc space-y-1 pl-5">
              {block.items.map((item, j) => (
                <li key={j}>{renderInline(item)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="mt-1">
            {renderInline(block.text)}
          </p>
        );
      })}
    </>
  );
}
