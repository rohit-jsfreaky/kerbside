/**
 * The poster: an A4 stop timetable, the kind on the pole at the stop. The stop's name on a signage-blue band, then
 * each line with its departures by hour for Monday to Friday, Saturday and Sunday, and what each footnote letter
 * means. Big enough to read on a fridge. Pages are planned from row counts, because a Document page doesn't flow.
 */
import { Fragment, type ReactNode } from "react";
import { Column, Document, PageBreak, PageFooter, PageNumber, Row, Text } from "@hyper-elements/react";
import { template } from "@hyper-elements/react/template";
import { FONT_FILES, INK, INK2, LINE, MONO, MUTED, PAPER, RouteBox, SANS, SIGN, WASH, example, fields, hh, lineColor, longDate, weekOf, type LineV, type Values } from "./_shared/doc.tsx";

const W = 682;
const PAGE = 960;
const HOUR = 54;
const COL = Math.floor((W - HOUR) / 3);
const DAYS = [
  ["weekday", "Monday – Friday"],
  ["saturday", "Saturday"],
  ["sunday", "Sunday"],
] as const;

function Timetable({ l, i }: { l: LineV; i: number }) {
  const color = lineColor(l, i);
  return (
    <Column style={{ width: W, gap: 0, border: `1px solid ${LINE}` }}>
      <Row style={{ width: W - 2, gap: 12, padding: [10, 12], alignItems: "center", backgroundColor: PAPER }}>
        <RouteBox route={l.route} color={color} size={20} />
        <Column style={{ width: W - 2 - 24 - 12 - 90 - 150 }}>
          <Text style={{ fontSize: 9, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase", color: MUTED }}>Towards</Text>
          <Text style={{ fontWeight: 800, fontSize: 17, lineHeight: 1.15 }}>{l.headsign}</Text>
        </Column>
        <Column style={{ width: 150 }}>
          <Text style={{ fontSize: 8.5, color: MUTED, textAlign: "right" }}>{`${l.weekday} each weekday · ${l.saturday} Sat · ${l.sunday} Sun`}</Text>
        </Column>
      </Row>
      <Row style={{ width: W - 2, backgroundColor: color, padding: [5, 0] }}>
        <Column style={{ width: HOUR }}>
          <Text style={{ fontSize: 8.5, fontWeight: 800, color: PAPER, textAlign: "center" }}>HOUR</Text>
        </Column>
        {DAYS.map(([k, name]) => (
          <Column key={k} style={{ width: k === "sunday" ? W - 2 - HOUR - 2 * COL : COL }}>
            <Text style={{ fontSize: 9, fontWeight: 800, color: PAPER, padding: [0, 10] }}>{name.toUpperCase()}</Text>
          </Column>
        ))}
      </Row>
      {l.rows.map((r, n) => (
        <Row key={`${r.hour}-${n}`} style={{ width: W - 2, backgroundColor: n % 2 ? WASH : PAPER, padding: [3, 0] }}>
          <Column style={{ width: HOUR }}>
            <Text style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, color: INK, textAlign: "center" }}>{hh(r.hour)}</Text>
          </Column>
          {DAYS.map(([k]) => (
            <Column key={k} style={{ width: k === "sunday" ? W - 2 - HOUR - 2 * COL : COL, border: { left: `0.75px solid ${LINE}` } }}>
              <Text style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, color: r[k].length ? INK : MUTED, padding: [0, 10], letterSpacing: 0.5 }}>{r[k].length ? r[k].join("  ") : "–"}</Text>
            </Column>
          ))}
        </Row>
      ))}
      {l.notes.length ? (
        <Column style={{ width: W - 2, padding: [6, 12], gap: 2, border: { top: `0.75px solid ${LINE}` } }}>
          {l.notes.map((x) => (
            <Text key={x.mark} style={{ fontSize: 9, color: INK2 }}>{`${x.mark}  ${x.text}`}</Text>
          ))}
        </Column>
      ) : null}
    </Column>
  );
}
const height = (l: LineV) => 50 + 22 + 20.5 * l.rows.length + (l.notes.length ? 12 + 13 * l.notes.length : 0) + 16;

export default template({
  id: "kerbside.Poster",
  version: "1.0.0",
  label: "Stop timetable poster (PDF)",
  guidance: "Print it for the fridge, the noticeboard or the stop itself: every departure by hour, weekdays and weekend.",
  root: "Document",
  formats: { a4: { size: "A4", orientation: "portrait" } },
  fields,
  example,
  render(input) {
    const v = input as unknown as Values;
    const pages: ReactNode[][] = [[]];
    let room = PAGE - 190;
    v.lines.forEach((l, i) => {
      const h = height(l);
      if (h > room && pages.at(-1)!.length) {
        pages.push([]);
        room = PAGE;
      }
      pages.at(-1)!.push(<Timetable key={i} l={l} i={i} />);
      room -= h;
    });
    return (
      <Document size="A4" margin={56} title={`Timetable: ${v.title ?? v.stop}`} lang="en" fonts={FONT_FILES} style={{ fontFamily: SANS, fontSize: 10, color: INK, gap: 14 }}>
        <Column style={{ width: W, backgroundColor: SIGN, padding: [16, 20], gap: 4 }}>
          <Row style={{ width: W - 40, alignItems: "end" }}>
            <Column>
              <Text style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "#CFE0F1" }}>{`${v.agency ? `${v.agency} · ` : ""}Departures from this stop`}</Text>
            </Column>
            <Column style={{ width: 160 }}>
              {v.code ? <Text style={{ fontFamily: MONO, fontWeight: 600, fontSize: 11, color: PAPER, textAlign: "right" }}>{`Stop ${v.code}`}</Text> : null}
            </Column>
          </Row>
          <Text style={{ fontWeight: 800, fontSize: 38, lineHeight: 1.1, color: PAPER, letterSpacing: -0.5 }}>{v.title ?? v.stop}</Text>
          <Row style={{ width: W - 40, gap: 8, padding: [4, 0, 0] }}>
            {v.lines.map((l, i) => (
              <RouteBox key={i} route={l.route} color={lineColor(l, i)} size={13} />
            ))}
          </Row>
        </Column>
        <Row style={{ width: W, alignItems: "end" }}>
          <Column>
            <Text style={{ fontWeight: 600, fontSize: 11 }}>{`Timetable for the week of ${weekOf(v)}`}</Text>
          </Column>
          <Column style={{ width: 300 }}>
            <Text style={{ fontSize: 9, color: MUTED, textAlign: "right" }}>Times are when the bus is due to leave this stop.</Text>
          </Column>
        </Row>
        {v.note ? <Text style={{ fontSize: 10.5, color: INK2, padding: [8, 12], backgroundColor: WASH }}>{v.note}</Text> : null}

        {pages.map((page, i) => (
          <Fragment key={i}>
            {i ? <PageBreak /> : null}
            {page}
          </Fragment>
        ))}

        <PageFooter style={{ padding: [8, 0, 0], border: { top: `0.75px solid ${LINE}` } }}>
          <Row>
            <Column>
              <Text style={{ fontSize: 7.5, color: MUTED }}>{`Kerbside · ${v.stop} · made ${longDate(v.date)}${v.source ? ` · ${v.source}` : ""}`}</Text>
            </Column>
            <Column style={{ width: 70 }}>
              <Text style={{ fontSize: 7.5, color: MUTED, textAlign: "right" }}>
                Page <PageNumber /> of <PageNumber total />
              </Text>
            </Column>
          </Row>
        </PageFooter>
      </Document>
    );
  },
});
