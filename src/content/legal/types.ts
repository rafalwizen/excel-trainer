// Shape of legal documents (regulamin, privacy policy). Content lives in
// this directory as plain data; pages render it with LegalDocPage. Keep the
// prose here so the pages stay identical and edits are text-only.

export type LegalSection = {
  // Slug-like anchor id, unique within the document (used for #links).
  id: string;
  heading: string;
  paragraphs: string[];
};

export type LegalDoc = {
  title: string;
  // ISO date (YYYY-MM-DD) of the last content update, shown to the reader.
  updatedAt: string;
  sections: LegalSection[];
};
