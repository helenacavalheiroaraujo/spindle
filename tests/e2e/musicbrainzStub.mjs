// Stands in for MusicBrainz in the e2e tests: fixed answers for Kind of Blue, so the album test does not depend on the live service.
// Started by playwright.config.ts on port 4010; the dev server reads MUSICBRAINZ_URL to reach it.
import { createServer } from "node:http";

const KIND_OF_BLUE_GROUP = {
  id: "kob",
  title: "Kind of Blue",
  "first-release-date": "1959-08-17",
  "artist-credit": [{ name: "Miles Davis" }],
};
const KIND_OF_BLUE_RELEASE = {
  date: "1959-08-17",
  "label-info": [{ label: { name: "Columbia" } }],
  media: [
    {
      tracks: ["So What", "Freddie Freeloader", "Blue in Green", "All Blues", "Flamenco Sketches"].map((title) => ({ title })),
    },
  ],
};

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  res.setHeader("Content-Type", "application/json");
  if (url.pathname.startsWith("/ws/2/release-group")) {
    res.end(JSON.stringify({ "release-groups": [KIND_OF_BLUE_GROUP] }));
  } else if (url.pathname.startsWith("/ws/2/release")) {
    res.end(JSON.stringify({ releases: [KIND_OF_BLUE_RELEASE] }));
  } else {
    res.statusCode = 404;
    res.end("{}");
  }
}).listen(4010, () => console.log("MusicBrainz stub on http://localhost:4010"));
