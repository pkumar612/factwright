import { checkDocument } from "@/lib/check";
import { fileToText, MAX_CHARS, MAX_FILE_BYTES, UnsupportedFileError } from "@/lib/parse";
import { SAMPLES } from "@/lib/samples";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { text, name } = await readInput(request);
    if (!text.trim()) return error("There's no text to check in that document.", 400);
    if (text.length > MAX_CHARS) {
      return error(`This preview checks documents up to ${MAX_CHARS.toLocaleString("en-GB")} characters.`, 413);
    }
    return Response.json(await checkDocument(text, name));
  } catch (e) {
    if (e instanceof InputError || e instanceof UnsupportedFileError) return error(e.message, 400);
    console.error(e);
    return error("Something went wrong while checking that document.", 500);
  }
}

class InputError extends Error {}

async function readInput(request: Request): Promise<{ text: string; name: string }> {
  const type = request.headers.get("content-type") ?? "";
  if (type.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new InputError("Choose a file to check.");
    if (file.size > MAX_FILE_BYTES) throw new InputError("Files up to 5 MB only in this preview.");
    return { text: await fileToText(file), name: file.name };
  }
  const body = (await request.json().catch(() => null)) as { sampleId?: string; text?: string; name?: string } | null;
  if (body?.sampleId) {
    const sample = SAMPLES.find((s) => s.id === body.sampleId);
    if (!sample) throw new InputError("Unknown sample.");
    return { text: sample.text, name: sample.name };
  }
  if (typeof body?.text === "string") return { text: body.text, name: body.name?.slice(0, 120) || "Pasted text" };
  throw new InputError("Send a file, some text or a sample to check.");
}

function error(message: string, status: number) {
  return Response.json({ error: message }, { status });
}
