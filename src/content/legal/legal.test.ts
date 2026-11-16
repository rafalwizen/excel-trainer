import { describe, expect, it } from "vitest";
import { politykaPrywatnosci } from "./polityka-prywatnosci";
import { regulamin } from "./regulamin";

const docs = [
  { name: "regulamin", doc: regulamin },
  { name: "polityka prywatności", doc: politykaPrywatnosci },
];

describe.each(docs)("$name", ({ doc }) => {
  it("has a non-empty title and a valid ISO updatedAt date", () => {
    expect(doc.title.trim()).not.toBe("");
    expect(doc.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("has at least one section with unique, slug-like ids", () => {
    expect(doc.sections.length).toBeGreaterThan(0);
    const ids = doc.sections.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("has no empty headings or paragraphs", () => {
    for (const section of doc.sections) {
      expect(section.heading.trim()).not.toBe("");
      expect(section.paragraphs.length).toBeGreaterThan(0);
      for (const paragraph of section.paragraphs) {
        expect(paragraph.trim()).not.toBe("");
      }
    }
  });
});
