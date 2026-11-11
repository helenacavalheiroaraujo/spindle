"use client";
// The crates of the home page (story 12, story 24). Up to six: a grid. From seven: one row that moves by drag, trackpad,
// swipe or the keyboard, with a progress line and "Showing 1 to 4 of N genres" under it (option C of
// docs/design/crate-carousel-options.html). No arrows.
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { Crate } from "@/components/Crate";
import { isCrateRow, recordsLabel, showingLabel, type Genre } from "@/lib/rules/home";

type CrateItem = { genre: Genre; count: number };

const GAP_PX = 16; // gap-4

function CrateLink({ genre, count }: CrateItem) {
  return (
    <Link href={`/genres/${genre.slug}`} aria-label={`${genre.name}, ${recordsLabel(count)}`} className="card-link" style={{ borderRadius: "1rem" }}>
      <Crate genre={genre} count={recordsLabel(count)} />
    </Link>
  );
}

export function CrateRow({ crates }: { crates: CrateItem[] }) {
  if (!isCrateRow(crates.length)) {
    return (
      <ul className="grid grid-cols-3 gap-3 lg:grid-cols-6">
        {crates.map((item) => (
          <li key={item.genre.slug}>
            <CrateLink {...item} />
          </li>
        ))}
      </ul>
    );
  }
  return <CrateScroller crates={crates} />;
}

function CrateScroller({ crates }: { crates: CrateItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ first: 1, last: 1, thumbWidth: 100, thumbLeft: 0 });
  // Mouse drag (story 24): trackpad and touch swipe scroll natively; a mouse does not, so the row follows the pointer.
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    if (!el || e.pointerType !== "mouse" || e.button !== 0) return;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = trackRef.current;
    const d = drag.current;
    if (!el || !d.active) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < 5) return; // a small wobble is still a tap
      d.moved = true;
      el.style.scrollSnapType = "none"; // no snapping while the pointer moves the row
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = d.startLeft - dx;
  }

  function endDrag() {
    const el = trackRef.current;
    if (!el || !drag.current.active) return;
    drag.current.active = false;
    if (drag.current.moved) {
      el.style.scrollSnapType = ""; // snapping returns and settles on the nearest crate
    }
  }

  // A drag must not also open the crate under the pointer when the mouse is released.
  function onClickCapture(e: React.MouseEvent<HTMLDivElement>) {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  }

  // Where the row is now: which crates are visible, and where the progress line sits.
  function measure() {
    const el = trackRef.current;
    if (!el) return;
    const total = crates.length;
    const item = el.firstElementChild as HTMLElement | null;
    const step = (item?.offsetWidth ?? 1) + GAP_PX;
    const visible = Math.max(1, Math.floor((el.clientWidth + GAP_PX) / step));
    const maxScroll = el.scrollWidth - el.clientWidth;
    const thumbWidth = el.scrollWidth > 0 ? Math.min(100, (el.clientWidth / el.scrollWidth) * 100) : 100;
    const thumbLeft = maxScroll > 0 ? (el.scrollLeft / maxScroll) * (100 - thumbWidth) : 0;
    const first = Math.min(Math.round(el.scrollLeft / step) + 1, total - visible + 1);
    const last = Math.min(total, first + visible - 1);
    setView({ first, last, thumbWidth, thumbLeft });
  }

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // measure reads the DOM only; it changes when the crates change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crates.length]);

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        role="region"
        aria-label="Crates by genre, scroll to see more"
        tabIndex={0}
        className="flex snap-x snap-mandatory select-none gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {crates.map((item) => (
          <div key={item.genre.slug} className="w-[42%] shrink-0 snap-start lg:w-[calc((100%-3rem)/4)]">
            <CrateLink {...item} />
          </div>
        ))}
      </div>
      <div aria-hidden className="relative mt-2 h-[3px] rounded-full bg-navy/20">
        <span className="absolute top-0 h-[3px] rounded-full bg-navy" style={{ width: `${view.thumbWidth}%`, left: `${view.thumbLeft}%` }} />
      </div>
      <p className="mt-2 text-sm text-navy/80">{showingLabel(view.first, view.last, crates.length)}</p>
    </div>
  );
}
