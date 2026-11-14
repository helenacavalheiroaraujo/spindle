import type { ReactNode } from "react";
import type { Genre } from "@/lib/rules/home";

// A genre as a crate (story 12): the genre's colour, a fine-line drawing from the genre's world at the top right
// (DECISIONS 2026-11-14, B · variation 1 of docs/design/genre-tiles-options.html), the name and the number of records
// at the bottom. Used on the home page (as a link, from CrateRow) and as the heading of the genre screen.
export function Crate({ genre, count, large = false }: { genre: Genre; count: string; large?: boolean }) {
  const text = genre.tone === "dark" ? "text-navy" : "text-cream";
  return (
    <div
      style={{ backgroundColor: genre.color }}
      className={`relative overflow-hidden rounded-2xl ${text} ${large ? "min-h-40 p-5 lg:min-h-48 lg:p-7" : "aspect-square p-3 lg:p-4"}`}
    >
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className={`absolute top-0 right-0 ${large ? "h-full w-auto aspect-square" : "h-full w-full"}`}
      >
        <GenreArt slug={genre.slug} id={`crate-${genre.slug}-${large ? "l" : "s"}`} />
      </svg>
      <span className={`absolute bottom-3 left-3 right-3 z-10 ${large ? "lg:bottom-6 lg:left-7" : "lg:bottom-4 lg:left-4"}`}>
        <span className={`block font-heading leading-none ${large ? "text-5xl lg:text-6xl" : "text-xl lg:text-2xl"}`}>{genre.name}</span>
        <span className={`mt-1 block ${large ? "text-sm" : "text-xs"}`}>{count}</span>
      </span>
    </div>
  );
}

// A gradient mask that keeps the drawing at the top right and fades it out towards the name at the bottom left.
function Fade({ id, children }: { id: string; children: ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-g`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0.25" stopColor="#fff" />
          <stop offset="0.85" stopColor="#000" />
        </linearGradient>
        <mask id={`${id}-m`}>
          <rect width="100" height="100" fill={`url(#${id}-g)`} />
        </mask>
      </defs>
      <g mask={`url(#${id}-m)`}>{children}</g>
    </>
  );
}

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.1, strokeLinecap: "butt", strokeLinejoin: "miter" } as const;

const STAFF = [0, 1, 2, 3, 4].map((i) => 16 + i * 4);

function GenreArt({ slug, id }: { slug: Genre["slug"]; id: string }) {
  switch (slug) {
    case "classical":
      return (
        <>
          <Fade id={id}>
            <g {...line} strokeWidth={0.7}>
              {STAFF.map((y) => (
                <path key={y} d={`M-2,${y + 5} C30,${y - 3} 60,${y + 9} 104,${y - 1}`} />
              ))}
            </g>
          </Fade>
          <g fill="currentColor">
            <ellipse cx="60" cy="23.6" rx="2.1" ry="1.5" transform="rotate(-20 60 23.6)" />
            <ellipse cx="71" cy="21.4" rx="2.1" ry="1.5" transform="rotate(-20 71 21.4)" />
            <ellipse cx="85" cy="27.2" rx="2.1" ry="1.5" transform="rotate(-20 85 27.2)" />
          </g>
          <g {...line} strokeWidth={0.9}>
            <path d="M61.9,23 V11 M72.9,20.8 V8.8 M86.9,26.6 V14.6" />
            <path d="M61.9,11 L72.9,8.8" strokeWidth={1.4} />
            <path d="M86.9,14.6 l3.5,3" />
          </g>
        </>
      );
    case "electronic":
      return (
        <Fade id={id}>
          <g {...line}>
            <path d="M0,22 C6,12 12,12 18,22 S30,32 36,22 S48,12 54,22 S66,32 72,22 S84,12 90,22 S102,32 108,22" />
            <path d="M0,40 H9 V32 H21 V40 H33 V32 H45 V40 H57 V32 H69 V40 H81 V32 H93 V40 H104" />
            <path d="M0,56 L12,48 L24,56 L36,48 L48,56 L60,48 L72,56 L84,48 L96,56 L108,48" />
          </g>
        </Fade>
      );
    case "fado":
      return (
        <>
          <defs>
            <pattern id={`${id}-p`} width="20" height="20" patternUnits="userSpaceOnUse">
              <g {...line} strokeWidth={0.7}>
                <rect width="20" height="20" />
                <path d="M10,2 L18,10 L10,18 L2,10 Z" />
                <circle cx="10" cy="10" r="3" />
                <path d="M0,5 A5,5 0 0 0 5,0 M15,0 A5,5 0 0 0 20,5 M20,15 A5,5 0 0 0 15,20 M5,20 A5,5 0 0 0 0,15" />
              </g>
            </pattern>
          </defs>
          <Fade id={id}>
            <rect width="100" height="100" fill={`url(#${id}-p)`} opacity={0.85} />
          </Fade>
        </>
      );
    case "hip-hop":
      return (
        <>
          <defs>
            <pattern id={`${id}-p`} width="20" height="10" patternUnits="userSpaceOnUse">
              <path d="M0,0 H20 M0,5 H20 M5,0 V5 M15,5 V10" {...line} strokeWidth={0.5} />
            </pattern>
          </defs>
          <Fade id={id}>
            <rect width="100" height="100" fill={`url(#${id}-p)`} opacity={0.55} />
          </Fade>
          <path d="M42,24 C47,18 52,26 57,21 C62,16 66,25 72,19 C78,13 82,22 88,15 L95,10" {...line} strokeWidth={2.4} />
          <path d="M50,22 V40 M63,20 V46 M79,17 V33 M88,15 V26" {...line} strokeWidth={0.9} />
          <g fill="currentColor">
            <rect x="49.4" y="40" width="1.2" height="1.8" />
            <rect x="62.4" y="46" width="1.2" height="1.8" />
            <rect x="78.4" y="33" width="1.2" height="1.8" />
          </g>
        </>
      );
    case "jazz":
      return (
        <>
          <g {...line}>
            <circle cx="78" cy="22" r="16" />
            <circle cx="78" cy="22" r="6" />
          </g>
          <g fill="currentColor">
            <rect x="46" y="14" width="3" height="34" />
            <rect x="54" y="24" width="3" height="24" />
            <rect x="62" y="34" width="3" height="14" />
            <rect x="46" y="47" width="52" height="1.1" />
            <circle cx="94" cy="56" r="1.6" />
          </g>
        </>
      );
    case "rock":
      return (
        <g {...line} strokeWidth={1.3}>
          <path d="M72,2 L54,34 H66 L56,62 L88,24 H75 L88,2 Z" />
          <path d="M79,2 L63,30 H74" strokeWidth={0.7} />
        </g>
      );
    case "soul-and-funk":
      return (
        <g {...line}>
          {[62, 53, 44, 35, 26].map((r, i) => (
            <circle key={r} cx="100" cy="0" r={r} strokeWidth={i % 2 ? 1 : 3.2} />
          ))}
        </g>
      );
  }
}
