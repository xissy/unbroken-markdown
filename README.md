# markdown-rendersafe

Fix broken markdown during streaming to ensure proper rendering. This package intelligently moves punctuation marks outside of bold/italic markers and handles incomplete markdown patterns during streaming.

## What it does

When markdown is streamed or improperly formatted, you might see broken rendering like:
- `**"text"**` → `"**text**"`  (quotes outside bold)
- `*text(info)*` → `*text*(info)` (parentheses outside italic)
- `**50%**` → `**50**%` (percentage outside bold)
- Incomplete image markdown removal during streaming

## Installation

```bash
npm install markdown-rendersafe
# or
yarn add markdown-rendersafe
# or
bun add markdown-rendersafe
```

## Usage

```typescript
import { validateMarkdown } from 'markdown-rendersafe';
// or use semantic aliases
import { markdownRendersafe, fixMarkdown } from 'markdown-rendersafe';

const input = '**"Hello (world)"**';
const output = validateMarkdown(input);
console.log(output); // "**Hello** (world)"

// Works with italic too
const italicInput = '*text(info)*';
const italicOutput = fixMarkdown(italicInput);
console.log(italicOutput); // *text*(info)
```

## Features

### Bold Pattern Fixes
- Quotes: `**"text"**` → `"**text**"`
- Parentheses: `**text(info)**` → `**text**(info)`
- Percentages: `**50%**` → `**50**%`
- Links: `**[text](url)**` → `[**text**](url)`

### Italic Pattern Fixes
- Quotes: `*"text"*` → `"*text*"`
- Parentheses: `*text(info)*` → `*text*(info)`
- Percentages: `*50%*` → `*50*%`
- Links: `*[text](url)*` → `[*text*](url)`

### Streaming Support
- Removes incomplete image markdown patterns
- Handles partial markdown during real-time streaming
- Ensures consistent rendering even with interrupted markdown

## API

### `validateMarkdown(markdown: string): string`

The main function that processes and fixes markdown text.

**Parameters:**
- `markdown` - The markdown string to process

**Returns:**
- Cleaned and properly formatted markdown string

**Aliases:**
- `markdownRendersafe` - Same as validateMarkdown
- `fixMarkdown` - Same as validateMarkdown

## Examples

### Complex nested patterns
```typescript
const input = '**AI의 "혁신적인 (breakthrough)" 기술**';
const output = validateMarkdown(input);
// Output: AI의 "**혁신적인** (breakthrough)" 기술
```

### Mixed bold and italic
```typescript
const input = '**Bold (text)** and *Italic (text)*';
const output = validateMarkdown(input);
// Output: **Bold** (text) and *Italic* (text)
```

### Korean text with quotes
```typescript
const input = "**'빛의 교회'**를 언급하며";
const output = validateMarkdown(input);
// Output: '**빛의 교회**'를 언급하며
```

## Use Cases

Perfect for:
- Real-time markdown streaming applications
- Chat applications with markdown support
- Content management systems
- Markdown editors with live preview
- AI-generated content processing

## License

MIT

## Contributing

Issues and pull requests are welcome at [GitHub repository](https://github.com/taehoio/harvest-monorepo).