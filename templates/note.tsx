/**
 * The note: the stop's timetable as an email, for someone who'd rather not use an app (a parent, a neighbour, a new
 * starter). Each line with its first and last bus and every departure by hour, as a plain table that reads the same
 * in every email client and in the plain-text version.
 */
import { Column, Email, Heading, Row, Section, Table, TableCell, TableRow, Text } from "@hyper-elements/react";
import { lint } from "@hyper-elements/lint";
import { template } from "@hyper-elements/react/template";
import { FONT_URLS, INK, INK2, LINE, MONO, MUTED, PAPER, SIGN, WASH, example, fields, first, hh, last, lineColor, longDate, theme, weekOf, type Values } from "./_shared/doc.tsx";

const label = { fontWeight: 600, fontSize: 12, letterSpacing: 0.8, textTransform: "uppercase", color: MUTED } as const;
const cell = { fontFamily: MONO, fontWeight: 600, fontSize: 14, color: INK } as const;

export default template({
  id: "kerbside.Note",
  version: "1.0.0",
  label: "Timetable email",
  guidance: "Send it to someone who'd rather not use an app: every bus from their stop, by hour.",
  root: "Email",
  fields,
  rules: { plugins: { lint: lint() }, require: { lint: ["lang", "contrast", "link-text"] }, root: { previewText: true } },
  example,
  render(input) {
    const v = input as unknown as Values;
    const name = v.title ?? v.stop;
    const summary = v.lines.map((l) => `${l.route} to ${l.headsign}${first(l, "weekday") ? `, first ${first(l, "weekday")}, last ${last(l, "weekday")}` : ""}`).join("; ");
    return (
      <Email theme={theme} lang="en" width={600} fonts={FONT_URLS} title={`Bus times from ${name}`} previewText={`Weekdays: ${summary}.`.slice(0, 140)} style={{ gap: 0 }}>
        <Section style={{ padding: [24, 24, 0] }}>
          <Column style={{ backgroundColor: SIGN, padding: [14, 18], gap: 2 }}>
            <Text style={{ ...label, color: "#CFE0F1" }}>{`${v.agency ?? "Bus"} · stop ${v.code ?? ""}`.trim()}</Text>
            <Text style={{ fontWeight: 800, fontSize: 26, color: PAPER }}>{name}</Text>
          </Column>
        </Section>
        <Column style={{ apply: ["card"] }}>
          <Heading level={1}>{`Bus times from ${name}`}</Heading>
          <Text>{`Here are the buses from ${name} for the week of ${weekOf(v)}, by hour. The numbers are minutes past the hour: 30 in the 07 row means 07:30.`}</Text>
          {v.note ? <Text style={{ color: INK2, padding: [10, 14], backgroundColor: WASH }}>{v.note}</Text> : null}
          {v.lines.map((l, i) => (
            <Column key={i} style={{ gap: 8 }}>
              <Row style={{ gap: 10, alignItems: "center" }}>
                <Column style={{ width: 64, backgroundColor: lineColor(l, i), padding: [4, 0] }}>
                  <Text style={{ fontWeight: 800, fontSize: 18, color: PAPER, textAlign: "center" }}>{l.route}</Text>
                </Column>
                <Column>
                  <Text style={{ fontWeight: 800, fontSize: 18 }}>{`to ${l.headsign}`}</Text>
                </Column>
              </Row>
              <Text style={{ fontSize: 14, color: INK2 }}>{[first(l, "weekday") && `Weekdays ${first(l, "weekday")}–${last(l, "weekday")}`, first(l, "saturday") && `Saturday ${first(l, "saturday")}–${last(l, "saturday")}`, first(l, "sunday") ? `Sunday ${first(l, "sunday")}–${last(l, "sunday")}` : "no Sunday service"].filter(Boolean).join(" · ")}</Text>
              <Table style={{ border: `1px solid ${LINE}` }}>
                <TableRow style={{ backgroundColor: WASH }}>
                  <TableCell style={{ padding: [6, 8], ...label }}>Hour</TableCell>
                  <TableCell style={{ padding: [6, 8], ...label }}>Mon–Fri</TableCell>
                  <TableCell style={{ padding: [6, 8], ...label }}>Sat</TableCell>
                  <TableCell style={{ padding: [6, 8], ...label }}>Sun</TableCell>
                </TableRow>
                {l.rows.map((r, n) => (
                  <TableRow key={n}>
                    <TableCell style={{ padding: [4, 8], ...cell, color: SIGN }}>{hh(r.hour)}</TableCell>
                    <TableCell style={{ padding: [4, 8], ...cell }}>{r.weekday.join(" ") || "–"}</TableCell>
                    <TableCell style={{ padding: [4, 8], ...cell }}>{r.saturday.join(" ") || "–"}</TableCell>
                    <TableCell style={{ padding: [4, 8], ...cell }}>{r.sunday.join(" ") || "–"}</TableCell>
                  </TableRow>
                ))}
              </Table>
              {l.notes.map((x) => (
                <Text key={x.mark} style={{ fontSize: 14, color: INK2 }}>{`${x.mark}: ${x.text}`}</Text>
              ))}
            </Column>
          ))}
          <Text style={{ fontSize: 14, color: MUTED }}>These are the scheduled times. On the day, the live times at the stop or in the operator&apos;s app may differ.</Text>
        </Column>
        <Section style={{ padding: [16, 24, 28] }}>
          <Text style={{ fontSize: 13, color: MUTED }}>{`${v.source ?? "From the operator's published timetable (GTFS)."} Made with Kerbside, ${longDate(v.date)}.`}</Text>
        </Section>
      </Email>
    );
  },
});
