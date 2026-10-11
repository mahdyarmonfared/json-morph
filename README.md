# 🧬 JsonMorph

> Zero-dependency JSON structural diffing, formatting, minification, and automatic TypeScript interface generator & interactive Web Studio.

![JsonMorph Web Studio](https://raw.githubusercontent.com/mahdyarmonfared/json-morph/main/docs/preview.png)

## ⚡ Features

- 🔍 **Deep Structural Diff**: Accurately detects additions, removals, and modifications between nested JSON objects and arrays.
- 📐 **Automatic TypeScript Generation**: Generates idiomatic, strictly-typed TypeScript `interface` or `type` definitions from arbitrary JSON payloads.
- ✨ **Beautifier & Minifier**: Instant JSON indentation formatting and compact minification.
- 🌐 **Interactive Web Studio**: Built-in web GUI dashboard hosted on `http://localhost:3020`.
- 📦 **Zero External Dependencies**: Built with 100% native Node.js standard modules (`http`, `url`, `fs`, `node:test`).

---

## 🛠️ Installation

```bash
git clone https://github.com/mahdyarmonfared/json-morph.git
cd json-morph
npm link
```

---

## 🚀 Quick Start

### 1. Structural JSON Diff via CLI

```bash
json-morph diff old.json new.json
```

### 2. Generate TypeScript Interface

```bash
json-morph to-ts data.json --name UserProfile
```

### 3. Format or Minify JSON

```bash
# Format
json-morph format messy.json

# Minify
json-morph format messy.json --minify
```

### 4. Launch Interactive Web Studio

```bash
json-morph ui --port 3020
```

Open `http://localhost:3020` in your browser to inspect diffs and generate types visually.

---

## 📖 CLI Usage

```text
USAGE:
  json-morph <command> [options]

COMMANDS:
  diff <file1> <file2>      Compare two JSON files and highlight differences
  to-ts <file>             Generate TypeScript interfaces from JSON file
  format <file>            Format or minify JSON file
  ui, studio               Launch interactive Web Studio on localhost:3020
  help                     Display help guide

OPTIONS:
  -n, --name <string>      Root TypeScript interface name (default: RootObject)
  -m, --minify             Minify JSON output instead of formatting
  -i, --indent <num>       Indentation spaces (default: 2)
  -p, --port <number>      Port for Web Studio (default: 3020)
  -h, --help               Display help guide
  -v, --version            Display version
```

---

## 💻 Programmatic Usage

```javascript
const { diffJson, generateTypeScript, formatJson } = require('json-morph');

const diff = diffJson({ name: 'Alice' }, { name: 'Alice', age: 25 });
console.log(`Differences: ${diff.stats.totalDifferences}`);

const ts = generateTypeScript({ id: 1, title: 'Item' }, 'Item');
console.log(ts);
```

---

## 🧪 Testing

Run native test suite:

```bash
npm test
```

---

## 📄 License

[MIT](LICENSE) © Mahdyar Monfared
