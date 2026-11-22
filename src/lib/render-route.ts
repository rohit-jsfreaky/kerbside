// Renders the stop poster, the timetable email and the lock-screen card with the same Hyper Elements templates the CLI uses. It runs in the
// browser (src/lib/render-local.ts), so the site is static files on Cloudflare.
// POST { output: "poster" | "note" | "phone", values } -> a PDF, { html, text } for the email, a PNG.
import { createElement } from "react";
import { ElementsError, render } from "@hyper-elements/react";
import { renderImage } from "@hyper-elements/react/image";
import { renderPdf } from "@hyper-elements/react/pdf";
import Poster from "@templates/poster";
import Note from "@templates/note";
import Phone from "@templates/phone";

type Diagnostic = { severity: string; code: string; message: string; path?: string };

const FONT_FILES: Array<[string, string, number]> = [
  ["Overpass", "Overpass-Regular.ttf", 400],
  ["Overpass", "Overpass-SemiBold.ttf", 600],
  ["Overpass", "Overpass-ExtraBold.ttf", 800],
  ["Overpass Mono", "OverpassMono-SemiBold.ttf", 600],
];

// In the browser: fonts and the resvg WebAssembly come from /public; Buffer (used for base64) from the buffer package.
let ready: Promise<void> | undefined;
async function fontFile(file: string) {
  ready ??= (async () => {
    const { Buffer } = await import("buffer");
    (globalThis as { Buffer?: unknown }).Buffer ??= Buffer;
    const { initWasm } = await import("@resvg/resvg-wasm");
    await initWasm(fetch("/resvg.wasm"));
  })();
  await ready;
  return new Uint8Array(await (await fetch(`/fonts/${file}`)).arrayBuffer());
}
let fonts: Promise<Array<{ family: string; src: Uint8Array; weight: number }>> | undefined;
const loadFonts = () => (fonts ??= Promise.all(FONT_FILES.map(async ([family, file, weight]) => ({ family, weight, src: await fontFile(file) }))));

const brief = (list: readonly unknown[] = []): Diagnostic[] =>
  (list as Diagnostic[]).filter((d) => d.severity === "error" || d.severity === "warning").map(({ severity, code, message, path }) => ({ severity, code, message, path }));

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { output?: string; values?: Record<string, unknown> } | null;
  if (!body?.values || !["poster", "note", "phone"].includes(body.output ?? "")) return Response.json({ error: 'Send { output: "poster" | "note" | "phone", values }' }, { status: 400 });
  const { output, values } = body;
  try {
    if (output === "poster") {
      const { pdf } = await renderPdf(createElement(Poster as never, { ...values, format: "a4" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf" } });
    }
    if (output === "phone") {
      const { image } = await renderImage(createElement(Phone as never, { ...values, format: "phone" }), { fonts: await loadFonts() });
      return new Response(new Uint8Array(image), { headers: { "Content-Type": "image/png" } });
    }
    const { html, text, diagnostics } = await render(createElement(Note as never, values));
    return Response.json({ html, text, diagnostics: brief(diagnostics) });
  } catch (e) {
    if (e instanceof ElementsError) return Response.json({ diagnostics: brief(e.diagnostics) }, { status: 422 });
    return Response.json({ error: (e as Error).message }, { status: 500 });
  }
}
