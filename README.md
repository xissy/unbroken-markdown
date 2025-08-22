# unbroken-markdown

Fix broken markdown during streaming to ensure proper rendering. This package intelligently moves punctuation marks outside of bold/italic markers and handles incomplete markdown patterns during streaming.

## What it does

When markdown is streamed or improperly formatted, you might see broken rendering like:

- `**"text"**` → `"**text**"` (quotes outside bold)
- `*text(info)*` → `*text*(info)` (parentheses outside italic)
- `**50%**` → `**50**%` (percentage outside bold)
- Incomplete image markdown removal during streaming

## Installation

```bash
npm install unbroken-markdown
# or
yarn add unbroken-markdown
# or
bun add unbroken-markdown
```

## Usage

```typescript
import { unbreak } from 'unbroken-markdown';

const input = '**"Hello (world)"**';
const output = unbreak(input);
console.log(output); // "**Hello** (world)"

// Works with italic too
const italicInput = '*text(info)*';
const italicOutput = unbreak(italicInput);
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

### `unbreak(markdown: string): string`

The main function that processes and fixes broken markdown text.

**Parameters:**

- `markdown` - The markdown string to process

**Returns:**

- Unbroken and properly formatted markdown string

## Examples

### Complex nested patterns

```typescript
const input = '**AI "innovative (breakthrough)" technology**';
const output = unbreak(input);
// Output: AI "**innovative** (breakthrough)" technology
```

### Mixed bold and italic

```typescript
const input = '**Bold (text)** and *Italic (text)*';
const output = unbreak(input);
// Output: **Bold** (text) and *Italic* (text)
```

### Text with quotes

```typescript
const input = "**'Church of Light'** mentioned";
const output = unbreak(input);
// Output: '**Church of Light**' mentioned
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

Issues and pull requests are welcome at [GitHub repository](https://github.com/xissy/unbroken-markdown).
