import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../fonts/Overpass-Regular.ttf", weight: "400" },
    { path: "../../fonts/Overpass-SemiBold.ttf", weight: "600" },
    { path: "../../fonts/Overpass-ExtraBold.ttf", weight: "800" },
  ],
  variable: "--font-overpass",
});
const mono = localFont({ src: "../../fonts/OverpassMono-SemiBold.ttf", weight: "600", variable: "--font-overpass-mono" });

export const metadata: Metadata = {
  title: "Kerbside · Print the timetable for your stop",
  description: "Drop in any transit agency's GTFS feed, pick a stop, and Kerbside makes the timetable that used to be on paper: an A4 stop poster, an email of the times for someone without the app, and a lock-screen image that works with no signal. Built with Hyper Elements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
