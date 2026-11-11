import type { Genre } from "@/lib/rules/home";

// A genre as a crate (story 12), as in the Assignment 1 design: the genre's colour, a big record peeking out of the
// top right corner, the name and the number of records at the bottom. Used on the home page (as a link, from
// HomeSections) and as the heading of the genre screen.
export function Crate({ genre, count, large = false }: { genre: Genre; count: string; large?: boolean }) {
  const text = genre.tone === "dark" ? "text-navy" : "text-cream";
  return (
    <div
      style={{ backgroundColor: genre.color }}
      className={`relative overflow-hidden rounded-2xl ${text} ${large ? "min-h-40 p-5 lg:min-h-48 lg:p-7" : "aspect-square p-3 lg:p-4"}`}
    >
      <span
        aria-hidden
        className={`absolute rounded-full bg-[#15171d] ${large ? "-right-12 -top-12 h-44 w-44 lg:h-56 lg:w-56" : "-right-[25%] -top-[25%] h-[55%] w-[55%]"}`}
      >
        <span style={{ backgroundColor: genre.dot }} className="absolute inset-[32%] rounded-full" />
      </span>
      <span className={`absolute bottom-3 left-3 right-3 z-10 ${large ? "lg:bottom-6 lg:left-7" : "lg:bottom-4 lg:left-4"}`}>
        <span className={`block font-heading leading-none ${large ? "text-5xl lg:text-6xl" : "text-xl lg:text-2xl"}`}>{genre.name}</span>
        <span className={`mt-1 block ${large ? "text-sm" : "text-xs"}`}>{count}</span>
      </span>
    </div>
  );
}
