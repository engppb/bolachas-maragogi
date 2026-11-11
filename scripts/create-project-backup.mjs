import { readdir, readFile, mkdir, writeFile } from "node:fs/promises"
import { basename, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { deflateRawSync } from "node:zlib"

const root = resolve(fileURLToPath(new URL("..", import.meta.url)))
const backupDir = join(root, "backups")
const date = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
const output = join(backupDir, `bolachas-maragogi-${date}.zip`)
const excludedDirectories = new Set([".git", ".vercel", "backups", "dist", "node_modules"])
const excludedFiles = new Set([".npmrc", ".netrc"])

function isExcluded(name) {
  if (excludedFiles.has(name) || name.endsWith(".local")) return true
  if (name === ".env") return true
  if (name.startsWith(".env.") && name !== ".env.example") return true
  if (/^(credentials|service-account).*\.json$/i.test(name)) return true
  return /\.(pem|key|p12|pfx)$/i.test(name)
}

async function collect(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue
    if (entry.isSymbolicLink() || isExcluded(entry.name)) continue
    const absolute = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collect(absolute))
    else if (entry.isFile() && absolute !== output) files.push(absolute)
  }
  return files
}

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc ^= byte
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function dosDateTime(dateValue) {
  return {
    time: (dateValue.getHours() << 11) | (dateValue.getMinutes() << 5) | Math.floor(dateValue.getSeconds() / 2),
    date: ((dateValue.getFullYear() - 1980) << 9) | ((dateValue.getMonth() + 1) << 5) | dateValue.getDate(),
  }
}

const files = await collect(root)
const localEntries = []
const centralEntries = []
let offset = 0
const timestamp = dosDateTime(new Date())

for (const file of files) {
  const name = relative(root, file).split(sep).join("/")
  const nameBytes = Buffer.from(name, "utf8")
  const content = await readFile(file)
  const compressed = deflateRawSync(content)
  const crc = crc32(content)
  const local = Buffer.alloc(30)
  local.writeUInt32LE(0x04034b50, 0)
  local.writeUInt16LE(20, 4)
  local.writeUInt16LE(0x0800, 6)
  local.writeUInt16LE(8, 8)
  local.writeUInt16LE(timestamp.time, 10)
  local.writeUInt16LE(timestamp.date, 12)
  local.writeUInt32LE(crc, 14)
  local.writeUInt32LE(compressed.length, 18)
  local.writeUInt32LE(content.length, 22)
  local.writeUInt16LE(nameBytes.length, 26)
  local.writeUInt16LE(0, 28)
  localEntries.push(local, nameBytes, compressed)

  const central = Buffer.alloc(46)
  central.writeUInt32LE(0x02014b50, 0)
  central.writeUInt16LE(0x0314, 4)
  central.writeUInt16LE(20, 6)
  central.writeUInt16LE(0x0800, 8)
  central.writeUInt16LE(8, 10)
  central.writeUInt16LE(timestamp.time, 12)
  central.writeUInt16LE(timestamp.date, 14)
  central.writeUInt32LE(crc, 16)
  central.writeUInt32LE(compressed.length, 20)
  central.writeUInt32LE(content.length, 24)
  central.writeUInt16LE(nameBytes.length, 28)
  central.writeUInt16LE(0, 30)
  central.writeUInt16LE(0, 32)
  central.writeUInt16LE(0, 34)
  central.writeUInt16LE(0, 36)
  central.writeUInt32LE(0, 38)
  central.writeUInt32LE(offset, 42)
  centralEntries.push(central, nameBytes)
  offset += local.length + nameBytes.length + compressed.length
}

const centralDirectory = Buffer.concat(centralEntries)
const end = Buffer.alloc(22)
end.writeUInt32LE(0x06054b50, 0)
end.writeUInt16LE(0, 4)
end.writeUInt16LE(0, 6)
end.writeUInt16LE(files.length, 8)
end.writeUInt16LE(files.length, 10)
end.writeUInt32LE(centralDirectory.length, 12)
end.writeUInt32LE(offset, 16)
end.writeUInt16LE(0, 20)

await mkdir(backupDir, { recursive: true })
await writeFile(output, Buffer.concat([...localEntries, centralDirectory, end]))
console.log(`ZIP criado: ${basename(output)} (${files.length} arquivos). Arquivos de credenciais foram excluídos.`)
