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

    let currentMsgctxt = ""
    let currentMsgid = null
    let currentMsgidLine = 0
    let currentMsgstr = null

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (!line || line.startsWith("#")) continue

      const msgctxtMatch = line.match(/^msgctxt "(.*)"$/)
      if (msgctxtMatch) {
        currentMsgctxt = msgctxtMatch[1]
        continue
      }

      const msgidMatch = line.match(/^msgid "(.*)"$/)
      if (msgidMatch) {
        currentMsgid = msgidMatch[1]
        currentMsgidLine = i + 1
        currentMsgstr = null
        continue
      }

      const msgstrMatch = line.match(/^msgstr "(.*)"$/)
      if (msgstrMatch) {
        currentMsgstr = msgstrMatch[1]

        // Ignore PO file header (by standard, header always has an empty msgid "")
        if (currentMsgid !== "" && currentMsgstr === "") {
          // Check if the next line is a multiline string continuation ("...")
          const nextLine = lines[i + 1]?.trim()
          const isMultiline =
            nextLine && nextLine.startsWith('"') && nextLine.endsWith('"')

          if (!isMultiline) {
            const identifier = currentMsgctxt
              ? `key "${currentMsgctxt}" (msgid: "${currentMsgid}")`
              : `msgid "${currentMsgid}"`
            console.error(
              `File: ${path.relative(process.cwd(), file)}, line ${currentMsgidLine} with ${identifier} is missing msgstr`
            )
            hasError = true
          }
        }

        currentMsgctxt = ""
        currentMsgid = null
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
