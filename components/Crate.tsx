import type { Genre } from "@/lib/rules/home";

// A genre as a crate (story 12): the genre's colour, its name and a record peeking out. Used on the home page
// (as a link, from HomeSections) and as the heading of the genre screen.
export function Crate({ genre, count, label, large = false }: { genre: Genre; count: string; label?: string; large?: boolean }) {
  const text = genre.tone === "dark" ? "text-navy" : "text-cream";
  return (
    <div
      style={{ backgroundColor: genre.color }}
      className={`relative overflow-hidden rounded-3xl ${text} ${large ? "min-h-36 p-5 lg:min-h-44 lg:p-7" : "min-h-32 p-4"}`}
    >
      <span
        aria-hidden
        className={`absolute rounded-full bg-navy ${large ? "-right-10 -top-10 h-40 w-40 lg:h-52 lg:w-52" : "-right-5 -top-5 h-16 w-16"}`}
      >
        <span className="absolute inset-[34%] rounded-full bg-cream" />
      </span>
      <span className={`absolute bottom-4 left-4 z-10 ${large ? "lg:bottom-6 lg:left-7" : ""}`}>
        <span className={`block font-heading leading-none ${large ? "text-5xl lg:text-6xl" : "text-2xl"}`}>{label ?? genre.name}</span>
        <span className="mt-1 block text-sm">{count}</span>
      </span>
    </div>
  );
}
