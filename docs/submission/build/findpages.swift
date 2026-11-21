// Finds the page of each heading in the printed PDF. Usage: swift findpages.swift <pdf> <titles.json> <out.json>
// The contents page lists every heading too, so a heading counts only from the page after the one that starts with "Contents".
import PDFKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let titles = try! JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: args[2]))) as! [String]
var tocPage = 3
for i in 0..<min(doc.pageCount, 6) {
  if let text = doc.page(at: i)?.string, text.trimmingCharacters(in: .whitespacesAndNewlines).hasPrefix("Contents") { tocPage = i + 1; break }
}
var out: [String: Int] = [:]
for t in titles {
  let pages = doc.findString(t, withOptions: .caseInsensitive).compactMap { $0.pages.first }.map { doc.index(for: $0) + 1 }.filter { $0 > tocPage }
  if let p = pages.min() { out[t] = p }
}
try! JSONSerialization.data(withJSONObject: out).write(to: URL(fileURLWithPath: args[3]))
print(doc.pageCount, out.count, titles.count)
