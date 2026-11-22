/**
 * What every Kerbside template shares: the fields (a stop, up to four lines with departures by hour for weekdays,
 * Saturday and Sunday), the look of a stop panel (signage blue, Overpass, the route in a coloured box), and helpers.
 */
import { Column, Text, defineTheme, prop } from "@hyper-elements/react";
import sample from "./example.ts";

const minutes = prop.list(prop.text({ label: "Minute", pattern: "^[0-5]\\d[a-h*]?$" }), { label: "Minutes", max: 60 });

export const fields = {
  stop: prop.text({ label: "Stop", required: true, maxLength: 60 }),
  code: prop.text({ label: "Stop number", maxLength: 20 }),
  agency: prop.text({ label: "Operator", maxLength: 60 }),
  title: prop.text({ label: "Title (instead of the stop name)", maxLength: 60 }),
  note: prop.text({ label: "Note", maxLength: 240 }),
  monday: prop.date({ label: "Week of (Monday)", required: true }),
  date: prop.date({ label: "Made on", required: true }),
  source: prop.text({ label: "Data source", maxLength: 160 }),
  lines: prop.list(
    prop.object(
      {
        route: prop.text({ label: "Route", required: true, maxLength: 12 }),
        headsign: prop.text({ label: "Towards", required: true, maxLength: 50 }),
        color: prop.text({ label: "Route colour", pattern: "^#[0-9A-Fa-f]{6}$" }),
        rows: prop.list(prop.object({ hour: prop.number({ label: "Hour", required: true, min: 0, max: 23, integer: true }), weekday: minutes, saturday: minutes, sunday: minutes }, { label: "Hour" }), { label: "Hours", max: 24 }),
        notes: prop.list(prop.object({ mark: prop.text({ label: "Mark", required: true, maxLength: 1 }), text: prop.text({ label: "Meaning", required: true, maxLength: 60 }) }, { label: "Note" }), { label: "Notes", max: 8 }),
        weekday: prop.number({ label: "Weekday departures", required: true, min: 0, integer: true }),
        saturday: prop.number({ label: "Saturday departures", required: true, min: 0, integer: true }),
        sunday: prop.number({ label: "Sunday departures", required: true, min: 0, integer: true }),
      },
      { label: "Line" },
    ),
    { label: "Lines", required: true, min: 1, max: 4 },
  ),
};

export type Row = { hour: number; weekday: string[]; saturday: string[]; sunday: string[] };
export type LineV = { route: string; headsign: string; color?: string; rows: Row[]; notes: Array<{ mark: string; text: string }>; weekday: number; saturday: number; sunday: number };
export type Values = { stop: string; code?: string; agency?: string; title?: string; note?: string; monday: string; date: string; source?: string; lines: LineV[] };

/** The sample: Wexford Bus Station, from Wexford Bus's GTFS feed (NTA, CC BY 4.0), week of 23 November 2026. */
export const example = sample as unknown as Values;

/* ---------- look: a stop panel ---------- */

export const INK = "#10202B";
export const INK2 = "#3A4A56";
export const MUTED = "#566470";
export const LINE = "#D5DDE3";
export const WASH = "#EFF3F6";
export const PAPER = "#FFFFFF";
export const SIGN = "#0A4D8C";
export const SIGN_SOFT = "#E3EEF8";
/** Line colours when the feed has none, in order. */
export const ROUTE_COLORS = ["#13294B", "#B3261E", "#1F7A4D", "#6B3FA0"];

export const SANS = "Overpass, 'Helvetica Neue', Arial, sans-serif";
export const MONO = "'Overpass Mono', Menlo, Consolas, monospace";

export const FONT_FILES = [
  { family: "Overpass", src: "../fonts/Overpass-Regular.ttf", weight: 400 },
  { family: "Overpass", src: "../fonts/Overpass-SemiBold.ttf", weight: 600 },
  { family: "Overpass", src: "../fonts/Overpass-ExtraBold.ttf", weight: 800 },
  { family: "Overpass Mono", src: "../fonts/OverpassMono-SemiBold.ttf", weight: 600 },
];
// The email loads Overpass from a CDN (Fontsource, OFL); clients that block web fonts fall back to Helvetica/Arial.
const CDN = "https://cdn.jsdelivr.net/npm/@fontsource";
export const FONT_URLS = [
  { family: "Overpass", src: `${CDN}/overpass@5.2.7/files/overpass-latin-400-normal.woff2`, weight: 400 },
  { family: "Overpass", src: `${CDN}/overpass@5.2.7/files/overpass-latin-800-normal.woff2`, weight: 800 },
  { family: "Overpass Mono", src: `${CDN}/overpass-mono@5.2.7/files/overpass-mono-latin-600-normal.woff2`, weight: 600 },
];

export const theme = defineTheme({
  colors: { background: WASH, foreground: INK, primary: SIGN, primaryForeground: PAPER, muted: MUTED, border: LINE, paper: PAPER },
  fonts: { body: SANS, heading: SANS },
  fontSizes: { body: 16 },
  lineHeights: { body: 1.5 },
  elements: { Heading: { fontWeight: 800, letterSpacing: -0.3, lineHeight: 1.15, by: { level: { 1: { fontSize: 28, mobile: { fontSize: 24 } }, 2: { fontSize: 19 } } } } },
  styles: {
    label: { fontFamily: SANS, fontWeight: 600, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED },
    card: { backgroundColor: PAPER, padding: 26, gap: 16, border: `1px solid ${LINE}` },
  },
});

/* ---------- words ---------- */

export const lineColor = (l: LineV, i: number) => l.color ?? ROUTE_COLORS[i % ROUTE_COLORS.length];
export const longDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
export const dayMonth = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" });
export const weekOf = (v: Values) => {
  const end = new Date(`${v.monday}T12:00:00Z`);
  end.setUTCDate(end.getUTCDate() + 6);
  return `${dayMonth(v.monday)} – ${dayMonth(end.toISOString().slice(0, 10))} ${end.getUTCFullYear()}`;
};
export const hh = (h: number) => String(h).padStart(2, "0");
export const first = (l: LineV, day: "weekday" | "saturday" | "sunday") => {
  const r = l.rows.find((x) => x[day].length);
  return r ? `${hh(r.hour)}:${r[day][0].slice(0, 2)}` : undefined;
};
export const last = (l: LineV, day: "weekday" | "saturday" | "sunday") => {
  const r = [...l.rows].reverse().find((x) => x[day].length);
  return r ? `${hh(r.hour)}:${r[day].at(-1)!.slice(0, 2)}` : undefined;
};

/** The route number in its coloured box, as on the stop flag. */
export function RouteBox({ route, color, size }: { route: string; color: string; size: number }) {
  const w = Math.ceil(Math.max(size * 1.6, route.length * size * 0.68 + size * 0.9));
  return (
    <Column style={{ width: w, backgroundColor: color, padding: [Math.round(size * 0.22), Math.round(size * 0.35), Math.round(size * 0.12)], alignItems: "center" }}>
      <Text style={{ width: w - 2 * Math.round(size * 0.35), fontWeight: 800, fontSize: size, lineHeight: 1.1, color: PAPER, textAlign: "center" }}>{route}</Text>
    </Column>
  );
}
