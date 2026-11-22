/**
 * The phone card: a 1080 × 1920 lock-screen image of one line's weekday times. It works with no signal and no app,
 * and survives a dead data plan; Saturday and Sunday's first and last bus at the bottom.
 */
import { Canvas, Column, Row, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { FONT_FILES, INK, LINE, MONO, MUTED, PAPER, SANS, SIGN, WASH, example, fields, first, hh, last, lineColor, weekOf, type Values } from "./_shared/doc.tsx";

const W = 1080;
const H = 1920;
const PAD = 72;
const IN = W - 2 * PAD;

export default template({
  id: "kerbside.Phone",
  version: "1.0.0",
  label: "Lock-screen timetable (image)",
  guidance: "Set it as the lock screen: the first line's weekday times, readable with no signal.",
  root: "Canvas",
  formats: { phone: { width: W, height: H, scale: 1 } },
  fields,
  rules: { require: { core: ["image/overflow", "image/glyph", "image/fit"] } },
  example,
  render(input) {
    const v = input as unknown as Values;
    const l = v.lines[0];
    const color = lineColor(l, 0);
    const rows = l.rows.filter((r) => r.weekday.length).slice(0, 18);
    const LIST = H - 520 - 170 - 150; // under the stop band and the route, above the weekend line
    const size = Math.min(54, Math.floor((LIST / Math.max(rows.length, 1) - 8) / 1.3));
    const weekend = [first(l, "saturday") && `Sat ${first(l, "saturday")}–${last(l, "saturday")}`, first(l, "sunday") ? `Sun ${first(l, "sunday")}–${last(l, "sunday")}` : "No Sunday buses"].filter(Boolean).join("   ·   ");
    return (
      <Canvas width={W} height={H} fonts={FONT_FILES} style={{ backgroundColor: PAPER, fontFamily: SANS, color: INK, gap: 0 }}>
        {/* the top third stays quiet: the phone's clock sits there */}
        <Column style={{ width: W, height: 520, backgroundColor: SIGN, padding: [330, PAD, 0], gap: 8 }}>
          <Text fit={{ sizes: [64, 56, 48, 40], maxLines: 1 }} style={{ width: IN, fontWeight: 800, color: PAPER, letterSpacing: -1 }}>
            {v.title ?? v.stop}
          </Text>
          <Text style={{ width: IN, fontSize: 28, fontWeight: 600, color: "#CFE0F1" }}>{`Monday to Friday · week of ${weekOf(v)}`}</Text>
        </Column>
        <Row style={{ width: W, height: 170, padding: [30, PAD, 20], gap: 24, alignItems: "center" }}>
          <Column style={{ width: 170, backgroundColor: color, padding: [14, 0, 6] }}>
            <Text fit={{ sizes: [64, 52, 40], maxLines: 1 }} style={{ width: 170, fontWeight: 800, color: PAPER, textAlign: "center" }}>
              {l.route}
            </Text>
          </Column>
          <Text fit={{ sizes: [44, 38, 32, 28], maxLines: 2 }} style={{ width: IN - 170 - 24, fontWeight: 800, lineHeight: 1.1 }}>
            {`to ${l.headsign}`}
          </Text>
        </Row>
        <Column style={{ width: W, height: LIST, padding: [0, PAD], gap: 0 }}>
          {rows.map((r, n) => (
            <Row key={n} style={{ width: IN, gap: 0, backgroundColor: n % 2 ? WASH : PAPER, padding: [4, 0], alignItems: "center" }}>
              <Text style={{ width: 150, fontFamily: MONO, fontWeight: 600, fontSize: size, lineHeight: 1.2, color: MUTED, textAlign: "center" }}>{hh(r.hour)}</Text>
              <Text style={{ width: IN - 150, fontFamily: MONO, fontWeight: 600, fontSize: r.weekday.length > 8 ? Math.round(size * 0.6) : size, lineHeight: 1.2, color: INK, letterSpacing: 2 }}>{r.weekday.join("  ")}</Text>
            </Row>
          ))}
        </Column>
        <Column style={{ width: W, height: 150, padding: [26, PAD, 0], gap: 6, border: { top: `2px solid ${LINE}` } }}>
          <Text fit={{ sizes: [32, 28, 24], maxLines: 1 }} style={{ width: IN, fontWeight: 600 }}>
            {weekend}
          </Text>
          <Text style={{ width: IN, fontSize: 22, color: MUTED }}>{l.notes.length ? l.notes.map((x) => `${x.mark}: ${x.text}`).join(" · ") : "Scheduled times. Made with Kerbside."}</Text>
        </Column>
      </Canvas>
    );
  },
});
