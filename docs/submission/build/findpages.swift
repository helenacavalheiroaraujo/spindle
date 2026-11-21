import PDFKit
let args = CommandLine.arguments
let doc = PDFDocument(url: URL(fileURLWithPath: args[1]))!
let titles = try! JSONSerialization.jsonObject(with: Data(contentsOf: URL(fileURLWithPath: args[2]))) as! [String]
var out: [String: Int] = [:]
for t in titles {
  for sel in doc.findString(t, withOptions: .caseInsensitive) {
    if let pg = sel.pages.first {
      let idx = doc.index(for: pg) + 1
      if idx >= 3 { out[t] = idx; break }
    }
  }
}
let data = try! JSONSerialization.data(withJSONObject: out)
try! data.write(to: URL(fileURLWithPath: args[3]))
print(doc.pageCount, out.count, titles.count)
