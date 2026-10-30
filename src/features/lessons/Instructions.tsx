import type { ReactNode } from "react";

/**
 * Renders the light markdown used in task instructions: **bold**, `code`,
 * bullet lists ("- ") and blank-line-separated paragraphs. Deliberately
 * tiny — no markdown dependency.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-neutral-900">
          {m[1]}
        </strong>,
      );
    } else {
      nodes.push(
        <code
          key={`${keyPrefix}-c${i}`}
          className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] font-medium text-green-800"
        >
          {m[2]}
        </code>,
      );
    }
    last = re.lastIndex;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Instructions({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const lines = text.split("\n");
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length === 0) return;
    blocks.push(
      <ul key={key} className="list-disc space-y-1 pl-5">
        {listItems.map((item, i) => (
          <li key={i}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList(`list-${idx}`);
    if (trimmed.length > 0) {
      blocks.push(
        <p key={`p-${idx}`} className="leading-relaxed">
          {renderInline(trimmed, `p-${idx}`)}
        </p>,
      );
    }
  });
  flushList("list-end");

  return <div className="space-y-3 text-sm text-neutral-700">{blocks}</div>;
}
