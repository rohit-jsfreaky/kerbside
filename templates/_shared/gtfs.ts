/**
 * A GTFS feed (the timetable format every transit agency publishes, gtfs.org) read into what a printed stop
 * timetable shows: for one stop, each line (route + where it's going) with its departures by hour, for Monday to
 * Friday, Saturday and Sunday of a chosen week. Pure, no imports: the app, the sample script, the templates and the
 * tests share it. The zip is opened by the caller (fflate); this file takes the text of each .txt file.
 */

export type Files = Record<string, string>;
export type Stop = { id: string; code?: string; name: string; parent?: string };
export type Route = { id: string; short: string; long: string; color?: string; text?: string };
export type Feed = { agency: string; stops: Map<string, Stop>; routes: Map<string, Route>; trips: Map<string, { route: string; service: string; headsign: string }>; times: Array<{ trip: string; stop: string; time: string; seq: number; pickup: string }>; calendar: Map<string, { days: boolean[]; start: string; end: string }>; dates: Map<string, Map<string, 1 | 2>>; start?: string; end?: string };

/** RFC 4180 CSV: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function csv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((x) => x !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x !== "")) rows.push(row);
  const head = (rows.shift() ?? []).map((h) => h.trim());
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}

const need = (files: Files, name: string) => {
  const f = files[name];
  if (f === undefined) throw new Error(`The feed has no ${name}. Is this a GTFS zip (agency.txt, stops.txt, routes.txt, trips.txt, stop_times.txt)?`);
  return csv(f);
};

export function readFeed(files: Files): Feed {
  const agency = need(files, "agency.txt")[0]?.agency_name ?? "";
  const stops = new Map(need(files, "stops.txt").map((s) => [s.stop_id, { id: s.stop_id, code: s.stop_code || undefined, name: s.stop_name, parent: s.parent_station || undefined }]));
  const routes = new Map(need(files, "routes.txt").map((r) => [r.route_id, { id: r.route_id, short: r.route_short_name || r.route_long_name, long: r.route_long_name, color: r.route_color ? `#${r.route_color}` : undefined, text: r.route_text_color ? `#${r.route_text_color}` : undefined }]));
  const trips = new Map(need(files, "trips.txt").map((t) => [t.trip_id, { route: t.route_id, service: t.service_id, headsign: t.trip_headsign }]));
  const times = need(files, "stop_times.txt").map((t) => ({ trip: t.trip_id, stop: t.stop_id, time: t.departure_time || t.arrival_time, seq: Number(t.stop_sequence), pickup: t.pickup_type || "0" }));
  const calendar = new Map((files["calendar.txt"] ? csv(files["calendar.txt"]) : []).map((c) => [c.service_id, { days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((d) => c[d] === "1"), start: c.start_date, end: c.end_date }]));
  const dates = new Map<string, Map<string, 1 | 2>>();
  for (const d of files["calendar_dates.txt"] ? csv(files["calendar_dates.txt"]) : []) {
    if (!dates.has(d.service_id)) dates.set(d.service_id, new Map());
    dates.get(d.service_id)!.set(d.date, d.exception_type === "1" ? 1 : 2);
  }
  if (!times.length) throw new Error("stop_times.txt is empty: there are no departures in this feed.");
  const info = files["feed_info.txt"] ? csv(files["feed_info.txt"])[0] : undefined;
  return { agency, stops, routes, trips, times, calendar, dates, start: info?.feed_start_date, end: info?.feed_end_date };
}

/* ---------- dates ---------- */

const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d;
};
/** The Monday on or after a date (ISO in, ISO out). */
export function mondayFrom(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const back = (d.getUTCDay() + 6) % 7;
  return back ? addDays(iso, 7 - back).toISOString().slice(0, 10) : iso;
}

/** Does a service run on this date? calendar.txt's weekday and range, then calendar_dates.txt's exceptions. */
export function runs(feed: Feed, service: string, date: Date) {
  const key = ymd(date);
  const ex = feed.dates.get(service)?.get(key);
  if (ex) return ex === 1;
  const c = feed.calendar.get(service);
  if (!c) return false;
  return c.days[(date.getUTCDay() + 6) % 7] && key >= c.start && key <= c.end;
}

/* ---------- the stop ---------- */

/** Stops people would print a timetable for: with departures, busiest first (a parent station includes its platforms). */
export function busyStops(feed: Feed) {
  const n = new Map<string, number>();
  for (const t of feed.times) {
    const s = feed.stops.get(t.stop);
    const id = s?.parent ?? t.stop;
    n.set(id, (n.get(id) ?? 0) + 1);
  }
  return [...n].sort((a, b) => b[1] - a[1]).map(([id, count]) => ({ stop: feed.stops.get(id) ?? { id, name: id }, count }));
}

export type Day = "weekday" | "saturday" | "sunday";
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
export type Line = { key: string; route: string; color?: string; text?: string; headsign: string; count: number };
export type Departure = { line: string; time: string; days: boolean[] }; // days: Mon..Sun in the chosen week

/** Every departure from the stop (or its platforms) in the week starting `monday`, by line. Last stops are left out. */
export function departures(feed: Feed, stopId: string, monday: string) {
  const ids = new Set([stopId, ...[...feed.stops.values()].filter((s) => s.parent === stopId).map((s) => s.id)]);
  const last = new Map<string, number>();
  for (const t of feed.times) last.set(t.trip, Math.max(last.get(t.trip) ?? 0, t.seq));
  const week = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const lines = new Map<string, Line>();
  const out: Departure[] = [];
  const runsCache = new Map<string, boolean[]>();
  for (const t of feed.times) {
    if (!ids.has(t.stop) || t.pickup === "1" || t.seq === last.get(t.trip) || !t.time) continue;
    const trip = feed.trips.get(t.trip);
    if (!trip) continue;
    let days = runsCache.get(trip.service);
    if (!days) runsCache.set(trip.service, (days = week.map((d) => runs(feed, trip.service, d))));
    if (!days.some(Boolean)) continue;
    const route = feed.routes.get(trip.route);
    const key = `${trip.route}|${trip.headsign}`;
    if (!lines.has(key)) lines.set(key, { key, route: route?.short ?? trip.route, color: route?.color, text: route?.text, headsign: trip.headsign || route?.long || "", count: 0 });
    lines.get(key)!.count++;
    out.push({ line: key, time: t.time.slice(0, 5).padStart(5, "0"), days });
  }
  return { lines: [...lines.values()].sort((a, b) => b.count - a.count || a.route.localeCompare(b.route, undefined, { numeric: true })), departures: out };
}

/**
 * One line's timetable: rows by hour (only hours with a bus), minutes per column. A weekday departure that doesn't
 * run every weekday gets a letter, explained in the notes ("a: Fridays only"). GTFS times past 24:00 (after
 * midnight, same service day) keep their place at the end and print as the clock shows them.
 */
export function table(deps: Departure[], line: string) {
  const mine = deps.filter((d) => d.line === line);
  const notes: Array<{ mark: string; text: string; days: string }> = [];
  const mark = (days: boolean[]) => {
    const wk = days.slice(0, 5);
    if (wk.every(Boolean)) return "";
    const sig = wk.map((x) => (x ? 1 : 0)).join("");
    let n = notes.find((x) => x.days === sig);
    if (!n) {
      const on = WEEKDAYS.filter((_, i) => wk[i]);
      const text = on.length === 1 ? `${FULL[on[0]]}s only` : on.length === 4 ? `not on ${FULL[WEEKDAYS[wk.indexOf(false)]]}s` : `${on.join(", ")} only`;
      notes.push((n = { mark: "abcdefgh"[notes.length] ?? "*", text, days: sig }));
    }
    return n.mark;
  };
  const rows = new Map<number, Record<Day, string[]>>();
  const add = (day: Day, time: string, m = "") => {
    const h = Number(time.slice(0, 2));
    if (!rows.has(h)) rows.set(h, { weekday: [], saturday: [], sunday: [] });
    rows.get(h)![day].push(`${time.slice(3, 5)}${m}`);
  };
  for (const d of [...mine].sort((a, b) => a.time.localeCompare(b.time))) {
    if (d.days.slice(0, 5).some(Boolean)) add("weekday", d.time, mark(d.days));
    if (d.days[5]) add("saturday", d.time);
    if (d.days[6]) add("sunday", d.time);
  }
  const dedupe = (xs: string[]) => [...new Set(xs)];
  return {
    rows: [...rows].sort((a, b) => a[0] - b[0]).map(([hour, r]) => ({ hour: hour % 24, weekday: dedupe(r.weekday), saturday: dedupe(r.saturday), sunday: dedupe(r.sunday) })),
    notes: notes.map(({ mark, text }) => ({ mark, text })),
    counts: { weekday: new Set(mine.filter((d) => d.days.slice(0, 5).some(Boolean)).map((d) => d.time)).size, saturday: mine.filter((d) => d.days[5]).length, sunday: mine.filter((d) => d.days[6]).length },
  };
}
const FULL: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday" };

/** The values the three templates take. */
export function toValues(feed: Feed, stopId: string, chosen: string[], meta: { monday: string; date: string; title?: string; note?: string; source?: string }) {
  const stop = feed.stops.get(stopId);
  if (!stop) throw new Error("That stop isn't in the feed.");
  const { lines, departures: deps } = departures(feed, stopId, meta.monday);
  const pick = (chosen.length ? lines.filter((l) => chosen.includes(l.key)) : lines).slice(0, 4);
  return {
    stop: stop.name.slice(0, 60),
    code: stop.code?.slice(0, 20),
    agency: feed.agency.slice(0, 60),
    title: meta.title?.trim().slice(0, 60) || undefined,
    note: meta.note?.trim().slice(0, 240) || undefined,
    monday: meta.monday,
    date: meta.date,
    source: meta.source?.slice(0, 160),
    lines: pick.map((l) => {
      const t = table(deps, l.key);
      return { route: l.route.slice(0, 12), headsign: l.headsign.slice(0, 50), color: /^#[0-9A-Fa-f]{6}$/.test(l.color ?? "") ? l.color : undefined, rows: t.rows.slice(0, 24), notes: t.notes, weekday: t.counts.weekday, saturday: t.counts.saturday, sunday: t.counts.sunday };
    }),
  };
}
