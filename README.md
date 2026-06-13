# unbroken-markdown

Fix broken markdown during streaming to ensure proper rendering. This package intelligently moves punctuation marks outside of bold/italic markers and handles incomplete markdown patterns during streaming.

## What it does

When markdown is streamed or improperly formatted, you might see broken rendering like:

- `**"text"**` → `"**text**"` (quotes outside bold)
- `*text(info)*` → `*text*(info)` (parentheses outside italic)
- `**50%**` → `**50**%` (percentage outside bold)
- `**<text>**` → `<**text**>` (angle brackets outside bold)
- `**『책 제목』**` → `『**책 제목**』` (Korean quotation marks)
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
- Angle brackets: `**<text>**` → `<**text**>`
- Korean brackets: `**『text』**` → `『**text**』`, `**「text」**` → `「**text**」`, `**《text》**` → `《**text**》`, `**〈text〉**` → `〈**text**〉`
- CJK brackets: `**【text】**` → `【**text**】`, `**〔text〕**` → `〔**text**〕`, `**（text）**` → `（**text**）`

### CJK Flanking Fixes

CommonMark's right-flanking rule rejects a closing delimiter that is preceded by punctuation and directly followed by a letter. In CJK text the next clause or particle attaches with no space, so patterns like these fail to render entirely. When (and only when) a letter or number follows the closing delimiter directly, trailing punctuation is moved outside:

- ASCII: `**제목:**내용` → `**제목**:내용`, `**대박!**이라고` → `**대박**!이라고` (also `.` `,` `;` `~`)
- Full-width: `**質問？**に` → `**質問**？に`, `**文章。**次` → `**文章**。次` (also `！` `、` `，` `：` `；` `…` `．` `～`)
- Full-width parenthetical: `**텍스트（설명）**뒤에` → `**텍스트**（설명）뒤에`
- GFM strikethrough: `~~취소!~~라고` → `~~취소~~!라고`

Patterns that already render — `**Note:** text` (space after), `**文章。**` (end of input) — are left untouched.

### Italic Pattern Fixes

- Quotes: `*"text"*` → `"*text*"`
- Parentheses: `*text(info)*` → `*text*(info)`
- Percentages: `*50%*` → `*50*%`
- Links: `*[text](url)*` → `[*text*](url)`
- Angle brackets: `*<text>*` → `<*text*>`
- Korean brackets: `*『text』*` → `『*text*』`, `*「text」*` → `「*text*」`, `*《text》*` → `《*text*》`, `*〈text〉*` → `〈*text*〉`

### Streaming Support

With `streaming: true`:

- Removes incomplete image markdown patterns (e.g. `![alt](https://…` cut off mid-stream)
- Handles partial markdown during real-time streaming
- Ensures consistent rendering even with interrupted markdown

```typescript
// While streaming, run intermediate chunks with streaming: true
const partial = unbreak(accumulatedText, { streaming: true });

// Run the final, complete document without it so legitimate
// trailing "!" or "![" content is preserved
const final = unbreak(fullText);
```

### Code Segment Protection

Fenced code blocks (` ``` ` and `~~~`, including a not-yet-closed fence during streaming) and inline code spans are never modified.

## API

### `unbreak(markdown: string, options?: UnbreakOptions): string`

The main function that processes and fixes broken markdown text.

**Parameters:**

- `markdown` - The markdown string to process
- `options` - Optional behavior toggles:
  - `streaming` (default `false`) - Remove trailing incomplete image markdown. Enable for intermediate chunks while streaming; leave off for complete documents.
  - `normalizeQuotes` (default `true`) - Normalize Unicode smart quotes (`‘ ’ “ ”`) to ASCII quotes so quote rules can match them.
  - `moveQuestionMark` (default `true`) - Move a trailing question mark outside bold (`**text?**` → `**text**?`).

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

### Korean quotation marks

```typescript
const input = '**『책의 제목』**을 표기할 때 사용해요.';
const output = unbreak(input);
// Output: 『**책의 제목**』을 표기할 때 사용해요.
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
