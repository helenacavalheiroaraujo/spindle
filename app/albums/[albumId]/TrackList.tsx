"use client";

import { useEffect, useRef, useState } from "react";
import { formatPlayed, showPreviewNote } from "@/lib/rules/trackPreview";

// The album page track list (story 28) with a "▶ Preview" pill at the end of each matched track (story 34, option B).
// One shared audio element, so only one preview plays at a time. Nothing plays until the buyer taps a pill.
// `previews[i]` is the iTunes preview URL of track i, or null (no pill). No previews at all → no pills and no line.
export function TrackList({ tracks, previews }: { tracks: string[]; previews: (string | null)[] }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [played, setPlayed] = useState(0);
  const loaded = useRef<number | null>(null); // the track whose preview is in the audio element

  // Stop the preview when the buyer leaves the page.
  useEffect(() => () => audio.current?.pause(), []);

  function toggle(i: number) {
    const el = audio.current;
    const url = previews[i];
    if (!el || !url) return;
    if (playing === i) {
      el.pause();
      setPlaying(null);
      return;
    }
    if (loaded.current !== i) {
      el.pause();
      el.src = url;
      loaded.current = i;
      setPlayed(0);
    }
    setPlaying(i);
    el.play().catch(() => setPlaying((current) => (current === i ? null : current)));
  }

  return (
    <section>
      <h2 className="font-heading text-2xl">Track list</h2>
      {showPreviewNote(previews) && (
        <p className="mt-1 text-sm text-navy/70">Previews are from the album on iTunes, not from a specific pressing.</p>
      )}
      <ol className="mt-2 divide-y divide-line rounded-2xl border border-line bg-sand px-5">
        {tracks.map((track, i) => {
          const on = playing === i;
          return (
            <li key={`${i}-${track}`} className="flex min-h-14 items-center gap-4 py-2">
              <span className="w-6 shrink-0 font-semibold text-navy/70">{i + 1}</span>
              <span className="flex-1">{track}</span>
              {previews[i] && (
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-label={`${on ? "Pause" : "Play"} preview of ${track}`}
                  className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-navy px-3.5 text-sm font-semibold ${
                    // The "hover:" class keeps the playing pill navy under the pointer (the shared outlined-pill hover would turn it sand).
                    on ? "bg-navy text-cream hover:bg-[#323d57]" : "text-navy"
                  }`}
                >
                  {on ? `❚❚ ${formatPlayed(played)}` : "▶ Preview"}
                </button>
              )}
            </li>
          );
        })}
      </ol>
      <audio
        ref={audio}
        preload="none"
        onTimeUpdate={(e) => setPlayed(e.currentTarget.currentTime)}
        onEnded={() => {
          setPlaying(null);
          setPlayed(0);
          loaded.current = null;
        }}
      />
    </section>
  );
}
