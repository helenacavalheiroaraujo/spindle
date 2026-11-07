// Render every page of a PDF to PNG so the designs can be compared with the stories.
// Usage: swift pdf_pages.swift <input.pdf> <output-folder>
import AppKit
import PDFKit

let args = CommandLine.arguments
guard args.count == 3, let doc = PDFDocument(url: URL(fileURLWithPath: args[1])) else {
    print("Usage: swift pdf_pages.swift <input.pdf> <output-folder>")
    exit(1)
}
let outDir = URL(fileURLWithPath: args[2], isDirectory: true)
try? FileManager.default.createDirectory(at: outDir, withIntermediateDirectories: true)

for i in 0..<doc.pageCount {
    guard let page = doc.page(at: i) else { continue }
    let box = page.bounds(for: .mediaBox)
    let scale: CGFloat = 1600 / max(box.width, box.height)
    let size = NSSize(width: box.width * scale, height: box.height * scale)
    let image = page.thumbnail(of: size, for: .mediaBox)
    guard let tiff = image.tiffRepresentation,
          let rep = NSBitmapImageRep(data: tiff),
          let png = rep.representation(using: .png, properties: [:]) else { continue }
    let file = outDir.appendingPathComponent(String(format: "page-%02d.png", i + 1))
    try? png.write(to: file)
    print(file.path)
}
