import fs from "node:fs"
import path from "node:path"
import process from "node:process"

const messagesDir = path.join(process.cwd(), "messages")
let hasError = false

if (!fs.existsSync(messagesDir)) {
  console.error(`Directory not found: ${messagesDir}`)
  process.exit(1)
}

const files = fs
  .readdirSync(messagesDir)
  .filter((file) => file.endsWith(".po"))
  .map((file) => path.join(messagesDir, file))

if (files.length === 0) {
  console.log("No .po files found in messages directory.")
  process.exit(0)
}

console.log(
  `Checking ${files.length} files: ${files.map((f) => path.basename(f)).join(", ")}`
)

files.forEach((file) => {
  try {
    const content = fs.readFileSync(file, "utf8")
    const lines = content.split(/\r?\n/)

    let currentMsgidLine = 0
    let inMsgid = false

    for (let i = 0; i < lines.length; i++) {
      // ignore first 2 lines (lines 0 and 1)
      if (i < 2) continue

      const line = lines[i].trim()

      // skip comments
      if (line.startsWith("#")) continue
      if (line.startsWith('msgid "')) {
        inMsgid = true
        currentMsgidLine = i + 1
      } else if (line.startsWith('msgstr "')) {
        if (inMsgid) {
          const match = line.match(/^msgstr "(.*)"$/)

          if (match) {
            let msgstrContent = match[1]

            if (msgstrContent === "") {
              console.error(
                `File: ${path.relative(process.cwd(), file)}, Line: ${currentMsgidLine} - msgid missing msgstr (empty)`
              )
              hasError = true
            }
          }
          inMsgid = false
        }
      }
    }
  } catch (err) {
    console.error(`Error reading file ${file}:`, err.message)
    hasError = true
  }
})

if (hasError) {
  process.exit(1)
} else {
  console.log("All checks passed.")
}
