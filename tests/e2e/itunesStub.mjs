// Stands in for the iTunes Search API in the e2e tests (story 34), so the preview test does not depend on the live service.
// Started by playwright.config.ts on port 4011; the dev server reads ITUNES_URL to reach it.
// - Ziggy Stardust: an iTunes album "… (2012 Remaster)" whose tracks match ours, except "It Ain't Easy" (no match).
// - Kind of Blue: iTunes "does not answer" (status 500), for the iTunes-down case (MusicBrainz still gives its tracks).
// - Anything else: no album found.
// Previews are 30 seconds of silence (WAV), served by this stub.
import { createServer } from "node:http";

const PORT = 4011;
const ZIGGY_ID = 555001;
const ZIGGY_TRACKS = [
  "Five Years",
  "Soul Love",
  "Moonage Daydream",
  "Starman",
  // "It Ain't Easy" is left out on purpose: that track gets no play button.
  "Lady Stardust",
  "Star",
  "Hang On to Yourself",
  "Ziggy Stardust",
  "Suffragette City",
  "Rock 'n' Roll Suicide",
];

// 30 s of silence, 8 kHz, 8-bit mono.
function silentWav(seconds) {
  const rate = 8000;
  const data = rate * seconds;
  const buf = Buffer.alloc(44 + data, 0x80);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + data, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); // PCM
  buf.writeUInt16LE(1, 22); // mono
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate, 28);
  buf.writeUInt16LE(1, 32);
  buf.writeUInt16LE(8, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(data, 40);
  return buf;
}
const PREVIEW = silentWav(30);

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname.startsWith("/preview/")) {
    // Byte ranges: WebKit (the phone project) asks for parts of an audio file and needs 206 answers.
    res.setHeader("Content-Type", "audio/wav");
    res.setHeader("Accept-Ranges", "bytes");
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
    if (range) {
      const start = range[1] ? Number(range[1]) : 0;
      const end = range[2] ? Math.min(Number(range[2]), PREVIEW.length - 1) : PREVIEW.length - 1;
      res.statusCode = 206;
      res.setHeader("Content-Range", `bytes ${start}-${end}/${PREVIEW.length}`);
      res.setHeader("Content-Length", end - start + 1);
      res.end(PREVIEW.subarray(start, end + 1));
    } else {
      res.setHeader("Content-Length", PREVIEW.length);
      res.end(PREVIEW);
    }
    return;
  }
  res.setHeader("Content-Type", "application/json");
  if (url.pathname === "/search") {
    const term = (url.searchParams.get("term") ?? "").toLowerCase();
    if (term.includes("kind of blue")) {
      res.statusCode = 500;
      res.end("{}");
    } else if (term.includes("ziggy stardust")) {
      res.end(
        JSON.stringify({
          results: [
            {
              wrapperType: "collection",
              collectionId: ZIGGY_ID,
              collectionName: "The Rise and Fall of Ziggy Stardust and the Spiders from Mars (2012 Remaster)",
              artistName: "David Bowie",
            },
          ],
        }),
      );
    } else {
      res.end(JSON.stringify({ results: [] }));
    }
  } else if (url.pathname === "/lookup" && url.searchParams.get("id") === String(ZIGGY_ID)) {
    res.end(
      JSON.stringify({
        results: [
          { wrapperType: "collection", collectionId: ZIGGY_ID },
          ...ZIGGY_TRACKS.map((title, i) => ({
            wrapperType: "track",
            kind: "song",
            trackName: `${title} (2012 Remaster)`,
            discNumber: 1,
            trackNumber: i + 1,
            previewUrl: `http://localhost:${PORT}/preview/${i + 1}.wav`,
          })),
        ],
      }),
    );
  } else if (url.pathname === "/lookup") {
    res.end(JSON.stringify({ results: [] }));
  } else {
    res.statusCode = 404;
    res.end("{}");
  }
}).listen(PORT, () => console.log(`iTunes stub on http://localhost:${PORT}`));
