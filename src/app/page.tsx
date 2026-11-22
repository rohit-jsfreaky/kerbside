import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Calendar, FileCheck02, Mail01, Phone01, Route, Users01 } from "@untitledui/icons";
import { Logo } from "@/components/Logo";

const WRAP = "mx-auto max-w-[1200px] px-6";

export default function Home() {
  return (
    <div className="bg-paper text-ink">
      <Nav />
      <Hero />
      <Why />
      <Example />
      <How />
      <Outputs />
      <Reads />
      <Who />
      <Faq />
      <Close />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
      <div className={`${WRAP} h-16 flex items-center gap-4 md:gap-8`}>
        <Link href="/" className="flex items-center gap-2 font-extrabold text-[20px]">
          <Logo /> Kerbside
        </Link>
        <nav className="hidden md:flex gap-6 text-[15px] font-medium text-muted">
          <a href="#why" className="hover:text-ink">Why</a>
          <a href="#example" className="hover:text-ink">Example</a>
          <a href="#how" className="hover:text-ink">How it works</a>
          <a href="#outputs" className="hover:text-ink">What you get</a>
          <a href="#faq" className="hover:text-ink">FAQ</a>
        </nav>
        <div className="flex-1" />
        <Link href="/stop" className="btn btn-sign">
          <span className="hidden sm:inline">Make a timetable</span>
          <span className="sm:hidden">Start</span> <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}

const HERO_ROWS: Array<[string, string, string, string]> = [
  ["05", "00  30", "00", "–"],
  ["06", "00  30", "15", "–"],
  ["07", "20", "20", "20"],
  ["08", "30", "30", "30"],
  ["09", "30", "30", "30"],
];

function Hero() {
  return (
    <section className="border-b border-line">
      <div className={`${WRAP} pt-14 md:pt-20 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center`}>
        <div>
          <p className="label">For riders, families, community groups and small operators</p>
          <h1 className="mt-5 font-extrabold text-[46px] md:text-[76px] leading-[1.0] tracking-[-0.03em]">The timetable your stop used to have on paper.</h1>
          <p className="mt-6 text-[19px] leading-relaxed text-ink-2 max-w-[560px]">
            Drop in any operator&apos;s GTFS feed and pick a stop. Kerbside makes the printed stop timetable, by hour, for weekdays, Saturday and Sunday. Plus an email of the times for someone who won&apos;t use the app, and a lock-screen image that works with no signal.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/stop" className="btn btn-sign !px-5 !py-3 !text-[16px]">
              Make a timetable <ArrowRight size={17} />
            </Link>
            <a href="/landing/timetable.pdf" className="btn btn-line !px-5 !py-3 !text-[16px]">
              Sample poster (PDF)
            </a>
          </div>
        </div>
        <figure className="min-w-0 border border-line shadow-[0_30px_70px_-34px_rgb(16_32_43/0.45)]" aria-label="A sample of the stop timetable">
          <div className="bg-sign text-white px-5 py-4">
            <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-white/75">Wexford Bus · departures from this stop</p>
            <p className="font-extrabold text-[34px] leading-tight">Wexford Stn</p>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="rounded-sm bg-[#13294b] text-white font-extrabold text-[18px] px-2 py-0.5">740</span>
            <span className="font-extrabold text-[17px]">to Dublin Airport</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] text-[14px]">
              <thead>
                <tr className="bg-[#13294b] text-white text-[11px] font-bold uppercase tracking-wide">
                  <th className="py-1.5 w-14">Hour</th>
                  <th className="py-1.5 px-3 text-left">Mon – Fri</th>
                  <th className="py-1.5 px-3 text-left">Saturday</th>
                  <th className="py-1.5 px-3 text-left">Sunday</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {HERO_ROWS.map(([h, a, b, c], n) => (
                  <tr key={h} className={n % 2 ? "bg-wash" : ""}>
                    <td className="py-1 text-center text-muted">{h}</td>
                    <td className="py-1 px-3 border-l border-line">{a}</td>
                    <td className="py-1 px-3 border-l border-line">{b}</td>
                    <td className="py-1 px-3 border-l border-line">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </figure>
      </div>
      <div className={`${WRAP} mt-14`}>
        <figure className="rounded-t-md border border-b-0 border-rule bg-wash p-2.5 pb-0">
          <Image src="/landing/stop.png" alt="Kerbside showing Wexford Bus Station: four lines at the stop and the 740's departures by hour for weekdays, Saturday and Sunday" width={1440} height={900} priority className="w-full h-auto rounded-t border border-b-0 border-line" />
        </figure>
      </div>
    </section>
  );
}

const QUOTES = [
  { q: "A downloadable PDF of the FULL route's timetable for BOTH directions, weekday AND weekend was the easiest to read… Also, when my phone dies, now what?", who: "A rider after WMATA stopped publishing PDF bus timetables", href: "https://www.reddit.com/r/WMATA/comments/1q6f0xq/", when: "r/WMATA, Jan 2026" },
  { q: "I was looking for something like this too for my grandparents, couldn't find anything and ended up having to make it manually in Excel!", who: "Replying to “Want to print a bus stop timetable for home”", href: "https://www.reddit.com/r/MelbourneTrains/comments/1v64io4/", when: "r/MelbourneTrains, Jul 2026" },
  { q: "Is there anywhere that presents GTFS data in an easy to read format for people unfamiliar with using raw data?", who: "A question on r/transit", href: "https://www.reddit.com/r/transit/comments/1pt793t/", when: "r/transit" },
];

function Why() {
  return (
    <section id="why" className="border-b border-line bg-wash">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="01" eyebrow="Why" title="The data is public. The paper timetable went away.">
          Every operator publishes its timetable as GTFS so journey-planner apps can read it. Fewer of them still print a timetable for each stop. People who want one on the wall, or for a parent without a smartphone, end up retyping times into a spreadsheet.
        </Head>
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {QUOTES.map((x) => (
            <blockquote key={x.href} className="bg-paper border border-line rounded-md p-6 flex flex-col">
              <p className="text-[17px] leading-snug font-semibold flex-1">&ldquo;{x.q}&rdquo;</p>
              <footer className="mt-5 text-[14px] text-muted">
                {x.who}.{" "}
                <a className="underline underline-offset-2 hover:text-ink" href={x.href}>
                  {x.when}
                </a>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

const LINES: Array<[string, string, string, string]> = [
  ["740", "#13294b", "Dublin Airport · Wexford–Dublin Airport", "19 each weekday · 17 Saturday · 15 Sunday"],
  ["340", "#b3261e", "Whitfield Hospital · Wexford–Waterford", "8 each weekday · 7 Saturday · 7 Sunday"],
  ["884", "#1f7a4d", "Main Street · Gorey–Ballycanew–Wexford", "6 each weekday · 4 Saturday · 4 Sunday"],
  ["740X", "#6b3fa0", "Dublin Airport", "3 each weekday · 2 Saturday · 1 Sunday"],
];

function Example() {
  return (
    <section id="example" className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="02" eyebrow="A real feed" title="Wexford Bus Station, the week of 23 November 2026.">
          Wexford Bus&apos;s own GTFS feed, as Transport for Ireland publishes it. The busiest stop in the feed has four lines. Kerbside reads which services run on each day of that week, including the exceptions, and lays them out by hour.
        </Head>
        <div className="mt-12 grid sm:grid-cols-2 gap-4">
          {LINES.map(([r, c, to, n]) => (
            <div key={r} className="border border-line rounded-md p-5 flex items-center gap-4">
              <span className="rounded-sm text-white font-extrabold text-[22px] px-2.5 py-1 shrink-0" style={{ background: c }}>
                {r}
              </span>
              <div>
                <p className="font-extrabold text-[18px]">{`to ${to}`}</p>
                <p className="text-[14px] text-muted">{n}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[14px] text-muted">Data: Transport for Ireland / National Transport Authority, CC BY 4.0. The headsigns are the feed&apos;s own (&ldquo;Dublin Airport Zone 14&rdquo;).</p>
      </div>
    </section>
  );
}

function How() {
  const steps = [
    ["Get the feed", "Search “[operator] GTFS”, or find it in the Mobility Database. It's a zip of text files."],
    ["Pick the stop", "Search by name or stop number. The busiest stops come first."],
    ["Pick the week and lines", "Up to four lines. Weekday times that don't run every day get a footnote letter."],
    ["Print, send, set", "The A4 poster, the email, the lock-screen image."],
  ];
  return (
    <section id="how" className="border-b border-line bg-sign text-white">
      <div className={`${WRAP} py-20 md:py-28`}>
        <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-white/70">03 · How it works</p>
        <h2 className="mt-4 font-extrabold text-[40px] md:text-[60px] leading-[1.02] tracking-[-0.025em]">A feed in. A timetable out.</h2>
        <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/20 border border-white/20">
          {steps.map(([t, d], i) => (
            <li key={t} className="bg-sign p-6">
              <span className="font-mono text-[15px] text-white/70">{`0${i + 1}`}</span>
              <h3 className="mt-2 font-extrabold text-[21px]">{t}</h3>
              <p className="mt-2 text-[15px] text-white/80 leading-relaxed">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Outputs() {
  return (
    <section id="outputs" className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="04" eyebrow="What you get" title="For the wall, the inbox and the lock screen.">
          Three Hyper Elements templates, rendered in your browser or from the command line.
        </Head>
        <div className="mt-12 grid md:grid-cols-12 gap-4">
          <Tile className="md:col-span-6 md:row-span-2" icon={<FileCheck02 size={17} />} name="The stop poster" note="A4 PDF · each line by hour, weekdays, Saturday, Sunday">
            <Image src="/landing/poster.png" alt="Stop poster for Wexford Stn: the 740 and 340 timetables by hour" width={1241} height={1754} className="w-full h-auto rounded border border-line" />
          </Tile>
          <Tile className="md:col-span-6" icon={<Mail01 size={17} />} name="The email" note="For someone who won't use the app: every bus, by hour">
            <div className="h-[330px] overflow-hidden rounded border border-line bg-wash">
              <Image src="/landing/note.png" alt="Email: Bus times from Wexford Stn, with the 740's departures in a table" width={760} height={1000} className="w-full h-auto" />
            </div>
          </Tile>
          <Tile className="md:col-span-6" icon={<Phone01 size={17} />} name="The lock screen" note="1080 × 1920 PNG · readable with no signal">
            <div className="h-[330px] overflow-hidden rounded border border-line bg-wash grid place-items-center">
              <Image src="/landing/phone.png" alt="Lock-screen image: Wexford Stn, the 740's weekday times by hour" width={1080} height={1920} className="h-[310px] w-auto" />
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}

function Tile({ className = "", icon, name, note, children }: { className?: string; icon: ReactNode; name: string; note: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 border border-line rounded-md p-5 md:p-6 flex flex-col gap-5 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid place-items-center size-10 rounded bg-sign text-white">{icon}</span>
        <div>
          <p className="font-extrabold text-[18px] leading-tight">{name}</p>
          <p className="text-[13px] text-muted">{note}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

const READS: Array<[ReactNode, string, string]> = [
  [<Calendar key="c" size={20} />, "The days each bus really runs", "calendar.txt for the weekly pattern and date range, calendar_dates.txt for the exceptions (bank holidays, added days), checked for each day of the week you pick."],
  [<Route key="r" size={20} />, "Lines, not just routes", "A route and where it's going, from the trip's headsign. The last stop of a trip is left out (nobody boards there), and so are drop-off-only stops."],
  [<Users01 key="u" size={20} />, "Footnotes, worked out", "A weekday bus that doesn't run every weekday gets a letter: “a: Fridays only”, “b: not on Mondays”. Times after midnight stay at the end of the day they belong to."],
];

function Reads() {
  return (
    <section className="border-b border-line bg-wash">
      <div className={`${WRAP} py-20 md:py-28`}>
        <Head n="05" eyebrow="What it reads" title="The same GTFS the journey planners use." />
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          {READS.map(([icon, t, d]) => (
            <div key={t} className="bg-paper border border-line rounded-md p-6">
              <span className="grid place-items-center size-10 rounded bg-sign-soft text-sign">{icon}</span>
              <h3 className="mt-4 font-extrabold text-[19px]">{t}</h3>
              <p className="mt-2 text-[15px] text-ink-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Who() {
  const who = [
    ["Riders", "A timetable for the fridge, the hallway or the office kitchen."],
    ["Families", "The times for a parent or grandparent who doesn't use apps, by email or on paper."],
    ["Community groups", "Notices for the village hall, the library, the school gate."],
    ["Small operators", "Stop posters from the feed you already publish, without a designer."],
  ];
  return (
    <section className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-24`}>
        <Head n="06" eyebrow="Who it's for" title="Anyone who wants the times without a phone." />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {who.map(([t, d]) => (
            <div key={t} className="border-t-4 border-sign pt-4">
              <p className="font-extrabold text-[19px]">{t}</p>
              <p className="mt-1.5 text-[15px] text-ink-2 leading-relaxed">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  ["Where do I find my operator's GTFS feed?", "Most operators link it from a “developers” or “open data” page; national portals (Transport for Ireland, data.gov sites) list theirs, and the Mobility Database indexes thousands. It's the same feed journey-planner apps use."],
  ["Are these live times?", "No: they're the scheduled times for the week you pick. On the day, the live times at the stop or in the operator's app may differ."],
  ["How big a feed can it open?", "Single-operator feeds (a few MB) open in a second. Very large national feeds may be too big for a browser tab; use the operator's own feed instead."],
  ["What do the letters next to times mean?", "A weekday departure that doesn't run every weekday gets a letter, and the poster says what it means, for example “a: Fridays only”."],
  ["Is anything uploaded?", "No. The zip is opened in your browser, and the PDF, the email and the image are made there too."],
  ["Can I use it for my own stops as an operator?", "Yes. The templates run from the command line too: npm run sample builds the values from a feed, npm run sheets renders all three."],
] as const;

function Faq() {
  return (
    <section id="faq" className="border-b border-line">
      <div className={`${WRAP} py-20 md:py-28 grid md:grid-cols-[360px_1fr] gap-12`}>
        <div className="md:sticky md:top-28 self-start">
          <Head n="07" eyebrow="FAQ" title="Before you print." />
        </div>
        <div className="border-t-2 border-ink">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold text-[18px]">
                {q}
                <span className="grid place-items-center size-8 shrink-0 rounded bg-sign text-white text-[18px] font-bold transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-6 pr-12 text-[16px] text-ink-2 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Close() {
  return (
    <>
      <section className="bg-wash border-b border-line">
        <div className={`${WRAP} py-16 md:py-20 grid md:grid-cols-[1fr_auto] gap-8 items-end`}>
          <h2 className="font-extrabold text-[40px] md:text-[64px] leading-[1.0] tracking-[-0.025em] max-w-[760px]">Put the timetable back on the wall.</h2>
          <Link href="/stop" className="btn btn-sign !px-6 !py-3.5 !text-[16px]">
            Make a timetable <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <footer className={`${WRAP} py-10 flex flex-col md:flex-row gap-3 justify-between text-[13.5px] text-muted`}>
        <span className="flex items-center gap-2 font-extrabold text-[19px] text-ink">
          <Logo size={22} /> Kerbside
        </span>
        <p className="max-w-[720px] md:text-right">
          Built with{" "}
          <a className="underline underline-offset-2 hover:text-ink inline-flex items-center gap-0.5" href="https://github.com/hyper-elements/hyper-elements">
            Hyper Elements <ArrowUpRight size={12} />
          </a>
          . Sample data: Wexford Bus, from Transport for Ireland (National Transport Authority), CC BY 4.0. Not affiliated with any operator.
        </p>
      </footer>
    </>
  );
}

function Head({ n, eyebrow, title, children }: { n: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="max-w-[820px]">
      <p className="label">
        <span className="text-sign">{n}</span> · {eyebrow}
      </p>
      <h2 className="mt-4 font-extrabold text-[38px] md:text-[56px] leading-[1.04] tracking-[-0.025em]">{title}</h2>
      {children ? <p className="mt-5 text-[18px] leading-relaxed text-ink-2">{children}</p> : null}
    </div>
  );
}
