// Opens a GTFS zip in the browser. Only the files a timetable needs are unpacked (shapes.txt can be most of a feed).
import { strFromU8, unzipSync } from "fflate";
import { readFeed, type Feed } from "../../templates/_shared/gtfs.ts";

const NEEDED = new Set(["agency.txt", "stops.txt", "routes.txt", "trips.txt", "stop_times.txt", "calendar.txt", "calendar_dates.txt", "feed_info.txt"]);

export function openZip(bytes: Uint8Array): Feed {
  let files: Record<string, Uint8Array>;
  try {
    // Feeds zipped inside a folder keep their files under it: match on the file name alone.
    files = unzipSync(bytes, { filter: (f) => NEEDED.has(f.name.split("/").pop() ?? "") });
  } catch {
    throw new Error("That file isn't a zip. A GTFS feed is a .zip of text files (stops.txt, stop_times.txt…).");
  }
  return readFeed(Object.fromEntries(Object.entries(files).map(([k, v]) => [k.split("/").pop()!, strFromU8(v)])));
}

export const sample = async () => openZip(new Uint8Array(await (await fetch("/samples/wexford-bus.zip")).arrayBuffer()));
