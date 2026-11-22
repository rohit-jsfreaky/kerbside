"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, ArrowLeft, Download01, FileCheck02, Mail01, Phone01, Upload01, XClose } from "@untitledui/icons";
import { busyStops, departures, mondayFrom, toValues, type Feed } from "../../templates/_shared/gtfs.ts";
import { ROUTE_COLORS, hh } from "../../templates/_shared/doc.tsx";
import { openZip, sample } from "@/lib/load";
import { SAMPLE } from "@/lib/sample";
import { renderLocal } from "@/lib/render-local";
import { Logo } from "./Logo";

type Out = "poster" | "note" | "phone";
const OUTS: Array<{ key: Out; label: string; icon: ReactNode; file: string }> = [
  { key: "poster", label: "Stop poster", icon: <FileCheck02 size={16} />, file: "timetable.pdf" },
  { key: "note", label: "Email", icon: <Mail01 size={16} />, file: "timetable-email.html" },
  { key: "phone", label: "Lock screen", icon: <Phone01 size={16} />, file: "lock-screen.png" },
];
const today = () => new Date().toISOString().slice(0, 10);
const iso = (ymd?: string) => (ymd && /^\d{8}$/.test(ymd) ? `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6)}` : undefined);

/** The first Monday the feed covers, from today on. */
function firstMonday(feed: Feed) {
  const from = [today(), iso(feed.start)].filter(Boolean).sort().at(-1)!;
  return mondayFrom(from);
}

export function Planner() {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [source, setSource] = useState("");
  const [stopId, setStopId] = useState("");
  const [monday, setMonday] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [meta, setMeta] = useState({ title: "", note: "" });
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<Out | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start(get: () => Promise<Feed>, src: string, isSample = false) {
    setBusy(true);
    setError(null);
    try {
      const f = await get();
      const stops = busyStops(f);
      if (!stops.length) throw new Error("No stop in this feed has a departure.");
      const first = (isSample && stops.find((s) => s.stop.name === SAMPLE.stopName)) || stops[0];
      setFeed(f);
      setSource(src);
      setStopId(first.stop.id);
      setMonday(isSample ? SAMPLE.monday : firstMonday(f));
      setChosen([]);
      setMeta({ title: "", note: "" });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const stops = useMemo(() => (feed ? busyStops(feed) : []), [feed]);
  const lines = useMemo(() => (feed && stopId && monday ? departures(feed, stopId, monday).lines : []), [feed, stopId, monday]);
  const values = useMemo(() => {
    if (!feed || !stopId || !monday || !lines.length) return null;
    const pick = chosen.filter((k) => lines.some((l) => l.key === k));
    return toValues(feed, stopId, pick, { monday, date: today(), ...meta, source });
  }, [feed, stopId, monday, lines, chosen, meta, source]);

  if (!feed) return <Start busy={busy} error={error} start={start} />;
  const stop = feed.stops.get(stopId);
  const found = query.trim() ? stops.filter((s) => `${s.stop.name} ${s.stop.code ?? ""}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 40) : stops.slice(0, 40);
  const picked = chosen.filter((k) => lines.some((l) => l.key === k)).length ? chosen : lines.slice(0, 4).map((l) => l.key);
  const toggle = (key: string) => {
    const next = picked.includes(key) ? picked.filter((k) => k !== key) : [...picked, key].slice(-4);
    if (next.length) setChosen(next);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-wash">
      <header className="h-14 shrink-0 bg-paper border-b border-line flex items-center gap-3 px-4 md:px-6">
        <NextLink href="/" className="flex items-center gap-2 font-extrabold text-[19px]" aria-label="Kerbside home">
          <Logo /> <span className="max-[420px]:hidden">Kerbside</span>
        </NextLink>
        <span className="hidden md:inline text-[13px] text-muted truncate">{feed.agency}</span>
        <div className="flex-1" />
        <div className="flex gap-1.5">
          {OUTS.map((o) => (
            <button key={o.key} disabled={!values} className={`btn !py-1.5 max-lg:!px-2.5 ${o.key === "poster" ? "btn-sign" : "btn-line"}`} onClick={() => setSheet(o.key)} aria-label={o.label}>
              {o.icon} <span className="hidden lg:inline">{o.label}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-line !py-1.5 max-sm:!px-2.5" onClick={() => setFeed(null)} aria-label="Another feed">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Another feed</span>
        </button>
      </header>

      <div className="flex-1 mx-auto w-full max-w-[1280px] px-4 md:px-6 py-6 grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        <aside className="space-y-4 lg:sticky lg:top-6 min-w-0">
          <section className="bg-paper border border-line rounded-md p-4 space-y-2">
            <p className="label">{`Stop · ${stops.length} with departures`}</p>
            <input className="input !py-1.5 !text-[14px]" placeholder="Search stop name or number" value={query} onChange={(e) => setQuery(e.target.value)} />
            <ul className="max-h-[300px] overflow-y-auto -mx-1" role="listbox" aria-label="Stops">
              {found.map((s) => (
                <li key={s.stop.id}>
                  <button role="option" aria-selected={s.stop.id === stopId} onClick={() => (setStopId(s.stop.id), setChosen([]))} className={`w-full text-left rounded px-2 py-1.5 text-[14px] flex justify-between gap-2 ${s.stop.id === stopId ? "bg-sign text-white" : "hover:bg-wash"}`}>
                    <span className="truncate">{s.stop.name}</span>
                    <span className={`font-mono text-[12px] shrink-0 ${s.stop.id === stopId ? "text-white/80" : "text-muted"}`}>{s.stop.code ?? s.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
          <section className="bg-paper border border-line rounded-md p-4 space-y-3">
            <label className="block">
              <span className="text-[12.5px] font-semibold text-ink-2">Week of (a Monday)</span>
              <input type="date" className="input mt-1 !py-1.5 !text-[14px]" value={monday} onChange={(e) => e.target.value && setMonday(mondayFrom(e.target.value))} />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-semibold text-ink-2">Title (instead of the stop name)</span>
              <input className="input mt-1 !py-1.5 !text-[14px]" maxLength={60} value={meta.title} onChange={(e) => setMeta({ ...meta, title: e.target.value })} placeholder={stop?.name} />
            </label>
            <label className="block">
              <span className="text-[12.5px] font-semibold text-ink-2">Note</span>
              <textarea className="input mt-1 !text-[14px] h-20" maxLength={240} value={meta.note} onChange={(e) => setMeta({ ...meta, note: e.target.value })} placeholder="e.g. The 740 stops at the hospital on request." />
            </label>
          </section>
          <p className="text-[12.5px] text-muted px-1">{`Feed: ${feed.agency}${feed.start && feed.end ? `, valid ${iso(feed.start)} to ${iso(feed.end)}` : ""}. Read in this tab; nothing is uploaded.`}</p>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="bg-paper border border-line rounded-md overflow-hidden">
            <div className="bg-sign text-white px-5 md:px-6 py-4">
              <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-white/75">{`${feed.agency} · departures${stop?.code ? ` · stop ${stop.code}` : ""}`}</p>
              <h1 className="mt-1 font-extrabold text-[30px] md:text-[40px] leading-tight">{meta.title || stop?.name}</h1>
            </div>
            <div className="p-5 md:p-6">
              <p className="label">Lines at this stop · pick up to four</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lines.map((l, i) => {
                  const on = picked.includes(l.key);
                  return (
                    <button key={l.key} onClick={() => toggle(l.key)} aria-pressed={on} className={`flex items-center gap-2 rounded border px-2 py-1.5 text-[14px] ${on ? "border-ink bg-paper" : "border-line text-muted opacity-70"}`}>
                      <span className="rounded-sm px-1.5 py-0.5 font-extrabold text-white text-[13px]" style={{ background: l.color ?? ROUTE_COLORS[i % 4] }}>
                        {l.route}
                      </span>
                      <span className="truncate max-w-[220px]">{`to ${l.headsign}`}</span>
                      <span className="font-mono text-[12px] text-muted">{l.count}</span>
                    </button>
                  );
                })}
                {!lines.length ? <p className="text-[14px] text-red">No departures from this stop in that week. Try another week or stop.</p> : null}
              </div>
            </div>
          </section>

          {values?.lines.map((l, i) => (
            <section key={`${l.route}${l.headsign}`} className="bg-paper border border-line rounded-md overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <span className="rounded-sm px-2 py-1 font-extrabold text-white text-[18px]" style={{ background: l.color ?? ROUTE_COLORS[i % 4] }}>
                  {l.route}
                </span>
                <div className="min-w-0">
                  <p className="label">Towards</p>
                  <p className="font-extrabold text-[18px] leading-tight truncate">{l.headsign}</p>
                </div>
                <p className="ml-auto text-[12.5px] text-muted text-right">{`${l.weekday} each weekday · ${l.saturday} Sat · ${l.sunday} Sun`}</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-[14px]">
                  <thead>
                    <tr className="text-white text-[12px] font-bold uppercase tracking-wide" style={{ background: l.color ?? ROUTE_COLORS[i % 4] }}>
                      <th className="py-1.5 w-16">Hour</th>
                      <th className="py-1.5 text-left px-3">Monday – Friday</th>
                      <th className="py-1.5 text-left px-3">Saturday</th>
                      <th className="py-1.5 text-left px-3">Sunday</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {l.rows.map((r, n) => (
                      <tr key={n} className={n % 2 ? "bg-wash" : ""}>
                        <td className="py-1 text-center text-muted">{hh(r.hour)}</td>
                        <td className="py-1 px-3 border-l border-line">{r.weekday.join("  ") || "–"}</td>
                        <td className="py-1 px-3 border-l border-line">{r.saturday.join("  ") || "–"}</td>
                        <td className="py-1 px-3 border-l border-line">{r.sunday.join("  ") || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {l.notes.length ? <p className="px-4 py-2 text-[13px] text-ink-2 border-t border-line">{l.notes.map((x) => `${x.mark}: ${x.text}`).join(" · ")}</p> : null}
            </section>
          ))}
        </main>
      </div>

      {sheet && values ? <Sheet out={sheet} setOut={setSheet} values={values} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}

/* ---------- start ---------- */

function Start({ busy, error, start }: { busy: boolean; error: string | null; start: (get: () => Promise<Feed>, source: string, isSample?: boolean) => void }) {
  const [over, setOver] = useState(false);
  const file = (f?: File) => {
    if (!f) return;
    if (f.size > 80 * 1024 * 1024) return start(() => Promise.reject(new Error("That feed is over 80 MB: too big to open in a browser tab. Most single-operator feeds are a few MB.")), "");
    start(async () => openZip(new Uint8Array(await f.arrayBuffer())), `Timetable data: ${f.name}.`);
  };
  return (
    <div className="min-h-dvh grid place-items-center p-4 md:p-8 bg-wash">
      <div className="w-full max-w-[620px] bg-paper border border-line rounded-md overflow-hidden shadow-[0_30px_60px_-34px_rgb(16_32_43/0.35)]">
        <div className="bg-sign text-white px-6 md:px-8 py-5">
          <NextLink href="/" className="flex items-center gap-2 font-extrabold text-[18px]">
            <Logo /> Kerbside
          </NextLink>
          <h1 className="mt-5 font-extrabold text-[30px] md:text-[36px] leading-[1.08]">Which buses are we printing?</h1>
        </div>
        <div className="p-6 md:p-8 space-y-4">
          <p className="text-[15.5px] text-muted leading-relaxed">Drop in the operator&apos;s GTFS feed: the zip of timetable files every transit agency publishes for journey planners. Search &ldquo;[your operator] GTFS&rdquo;, or find it in the Mobility Database.</p>
          <label
            onDragOver={(e) => (e.preventDefault(), setOver(true))}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => (e.preventDefault(), setOver(false), file(e.dataTransfer.files[0]))}
            className={`flex flex-col items-center gap-1 rounded border-2 border-dashed px-4 py-7 text-center cursor-pointer ${over ? "border-sign bg-sign-soft" : "border-rule hover:border-ink"}`}
          >
            <Upload01 size={22} className="text-muted" />
            <span className="font-semibold text-[15px]">Drop the GTFS .zip here, or choose it</span>
            <span className="text-[13px] text-muted">Opened in this tab. Nothing is uploaded.</span>
            <input type="file" accept=".zip,application/zip" className="sr-only" onChange={(e) => file(e.target.files?.[0])} />
          </label>
          <button className="btn btn-line" disabled={busy} onClick={() => start(sample, SAMPLE.source, true)}>
            Sample: Wexford Bus, Ireland (real feed)
          </button>
          {busy ? <p className="text-[13px] text-muted">Reading the timetable…</p> : null}
          {error ? (
            <p className="text-[13.5px] text-red flex gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* ---------- outputs ---------- */

function Sheet({ out, setOut, values, onClose }: { out: Out; setOut: (o: Out) => void; values: ReturnType<typeof toValues>; onClose: () => void }) {
  const [view, setView] = useState<{ url?: string; html?: string; issues?: string[] } | null>(null);
  const key = JSON.stringify(values);
  useEffect(() => {
    let alive = true;
    const timer = setTimeout(async () => {
      const res = await renderLocal({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ output: out, values }) });
      const type = res.headers.get("Content-Type") ?? "";
      const next = type.includes("json")
        ? await res.json().then((j) => (res.ok ? { html: j.html as string } : { issues: (j.diagnostics ?? [{ message: j.error }]).map((d: { message: string; path?: string }) => `${d.path ? `${d.path.replace(/^values\./, "")}: ` : ""}${d.message}`) }))
        : { url: URL.createObjectURL(await res.blob()) };
      if (!alive) return;
      setView((prev) => {
        if (prev?.url) URL.revokeObjectURL(prev.url);
        return next;
      });
    }, 150);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [out, key]);

  function download() {
    if (!view || view.issues) return;
    const a = document.createElement("a");
    a.href = view.url ?? URL.createObjectURL(new Blob([view.html ?? ""], { type: "text/html" }));
    a.download = `${(values.title ?? values.stop).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${OUTS.find((o) => o.key === out)!.file}`;
    a.click();
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-ink/35" onClick={onClose}>
      <div className="w-full md:w-[min(1040px,94vw)] h-full bg-paper flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="h-14 shrink-0 border-b border-line flex items-center gap-1 sm:gap-2 px-3 sm:px-5">
          {OUTS.map((o) => (
            <button key={o.key} onClick={() => o.key !== out && (setOut(o.key), setView(null))} className={`px-2 sm:px-3 py-1.5 rounded text-[13px] sm:text-[14px] font-semibold ${out === o.key ? "bg-sign text-white" : "text-muted hover:text-ink"}`}>
              {o.label}
            </button>
          ))}
          <div className="flex-1" />
          <button className="btn btn-sign" onClick={download} disabled={!view || !!view.issues} aria-label="Download">
            <Download01 size={16} /> <span className="hidden sm:inline">Download</span>
          </button>
          <button className="text-muted hover:text-ink ml-1" onClick={onClose} aria-label="Close">
            <XClose size={20} />
          </button>
        </div>
        <div className="flex-1 min-h-0 bg-wash flex">
          {view?.issues ? (
            <div className="m-6 rounded bg-red-soft p-4 space-y-1 self-start">
              <p className="font-semibold text-red text-[14px]">The template refused these values</p>
              {view.issues.map((m) => (
                <p key={m} className="text-[13px]">
                  {m}
                </p>
              ))}
            </div>
          ) : view?.url && out === "poster" ? (
            <iframe title="Stop poster" src={view.url} className="flex-1" />
          ) : view?.url ? (
            <div className="flex-1 grid place-items-center p-6 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={view.url} alt="Lock-screen timetable" className="max-h-full max-w-full border border-line rounded-md shadow-lg" />
            </div>
          ) : view?.html ? (
            <iframe title="Timetable email" srcDoc={view.html} className="flex-1 bg-white" />
          ) : (
            <p className="m-auto text-[14px] text-muted">Rendering with Hyper Elements…</p>
          )}
        </div>
      </div>
    </div>
  );
}
