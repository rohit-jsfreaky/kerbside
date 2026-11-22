import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { strFromU8, unzipSync } from "fflate";
import { busyStops, csv, departures, mondayFrom, readFeed, runs, table, toValues, type Files } from "../templates/_shared/gtfs.ts";

const tiny = (extra: Partial<Files> = {}): Files => ({
  "agency.txt": "agency_id,agency_name,agency_url,agency_timezone\n1,Town Bus,https://example.org,Europe/Dublin\n",
  "stops.txt": 'stop_id,stop_code,stop_name\nA,101,"Main St, North"\nB,102,Station\n',
  "routes.txt": "route_id,route_short_name,route_long_name,route_type\nR1,7,Loop,3\n",
  "trips.txt": "route_id,service_id,trip_id,trip_headsign\nR1,WK,t1,Station\nR1,FRI,t2,Station\nR1,WK,t3,Station\n",
  "stop_times.txt": "trip_id,arrival_time,departure_time,stop_id,stop_sequence\nt1,07:15:00,07:15:00,A,1\nt1,07:30:00,07:30:00,B,2\nt2,23:50:00,23:50:00,A,1\nt2,24:05:00,24:05:00,B,2\nt3,25:10:00,25:10:00,A,1\nt3,25:20:00,25:20:00,B,2\n",
  "calendar.txt": "service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\nWK,1,1,1,1,1,1,0,20260101,20271231\nFRI,0,0,0,0,1,0,0,20260101,20271231\n",
  "calendar_dates.txt": "service_id,date,exception_type\nWK,20261128,2\n",
  ...extra,
});

test("csv: quotes, commas in quotes, CRLF, BOM", () => {
  assert.deepEqual(csv('﻿a,b\r\n"x, y","say ""hi"""\r\n'), [{ a: "x, y", b: 'say "hi"' }]);
});

test("service days: weekly pattern and the exceptions", () => {
  const f = readFeed(tiny());
  assert.equal(runs(f, "WK", new Date("2026-11-27T12:00:00Z")), true); // Friday
  assert.equal(runs(f, "WK", new Date("2026-11-28T12:00:00Z")), false); // Saturday, removed by calendar_dates
  assert.equal(mondayFrom("2026-11-25"), "2026-11-30");
  assert.equal(mondayFrom("2026-11-23"), "2026-11-23");
});

test("a stop's table: last stops left out, footnotes, after midnight at the end", () => {
  const f = readFeed(tiny());
  const { lines, departures: d } = departures(f, "A", "2026-11-23");
  assert.deepEqual(lines.map((l) => [l.route, l.headsign]), [["7", "Station"]]);
  const t = table(d, lines[0].key);
  assert.deepEqual(t.rows.map((r) => [r.hour, r.weekday, r.saturday]), [[7, ["15"], []], [23, ["50a"], []], [1, ["10"], []]]);
  assert.deepEqual(t.notes, [{ mark: "a", text: "Fridays only" }]);
  assert.equal(departures(f, "B", "2026-11-23").departures.length, 0); // B is every trip's last stop
});

test("the real sample: Wexford Bus Station, week of 23 Nov 2026", () => {
  const z = unzipSync(readFileSync(new URL("../public/samples/wexford-bus.zip", import.meta.url)));
  const feed = readFeed(Object.fromEntries(Object.entries(z).map(([k, v]) => [k, strFromU8(v)])));
  const stop = busyStops(feed)[0].stop;
  assert.equal(stop.name, "Wexford Stn");
  const v = toValues(feed, stop.id, [], { monday: "2026-11-23", date: "2026-11-22" });
  assert.deepEqual(v.lines.map((l) => [l.route, l.weekday, l.saturday, l.sunday]), [["740", 19, 17, 15], ["340", 8, 7, 7], ["884", 6, 4, 4], ["740X", 3, 2, 1]]);
});

test("not a feed: a clear message", () => {
  assert.throws(() => readFeed({ "stops.txt": "stop_id\n" }), /no agency.txt/);
});
