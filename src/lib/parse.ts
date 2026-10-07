export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_CHARS = 80_000;

/** Pull plain text out of an uploaded Word, PDF or text file. */
export async function fileToText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  }
  if (name.endsWith(".pdf")) {
    const { extractText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
  }
  if (name.endsWith(".txt") || name.endsWith(".md")) return buffer.toString("utf8");
  throw new UnsupportedFileError();
}

export class UnsupportedFileError extends Error {
  constructor() {
    super("Upload a Word (.docx), PDF or text file.");
  }
}
