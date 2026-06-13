/**
 * Question mark handling (e.g., **text?** → **text**?)
 * Kept as a named rule so it can be disabled via the moveQuestionMark option,
 * since bolding a whole question (e.g. **Really?**) can be intentional
 */
const BOLD_QUESTION_MARK_RULE: [RegExp, string] = [/\*\*([^?]+?)\?\*\*/g, '**$1**?'];

/**
 * Transformation rules to move punctuation outside of bold markdown
 * Each rule is in the format [regex, replacement string]
 */
const PUNCTUATION_RULES: Array<[RegExp, string]> = [
  // Convert bold markdown links to standard format (**[text](url)** → [**text**](url))
  [/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, '[**$1**]($2)'],
  // ASCII double quotes - limited to not cross newlines
  // [^"*\n] restricts newlines to prevent excessive matching
  [/\*\*"([^"*\n]+)"\*\*/g, '"**$1**"'],
  // ASCII single quotes - limited to not cross newlines
  [/\*\*'([^'*\n]+)'\*\*/g, "'**$1**'"],
  // Parentheses with space (e.g., **text (description)** → **text** (description))
  [/\*\*([^*\n]+?)\s+(\([^*\n]+?\))\*\*/g, '**$1** $2'],
  // Parentheses without space (e.g., **text(description)** → **text**(description))
  [/\*\*([^*\n]+?)(\([^*\n]+?\))\*\*/g, '**$1**$2'],
  // Parentheses with trailing text (e.g., **text (description)**suffix → **text** (description)suffix)
  [/\*\*([^*]+?)\s+(\([^*]+?\))\*\*([^\s*]+)/g, '**$1** $2$3'],
  // Parentheses with trailing text - no space version
  [/\*\*([^*]+?)(\([^*]+?\))\*\*([^\s*]+)/g, '**$1**$2$3'],
  // Percentage sign handling (e.g., **21%** → **21**%)
  // Use [^%]+? to prevent bold % only
  [/\*\*([^%]+?)%\*\*/g, '**$1**%'],
  BOLD_QUESTION_MARK_RULE,
  // Angle brackets handling (e.g., **<text>** → <**text**>)
  [/\*\*<([^<>*\n]+)>\*\*/g, '<**$1**>'],
  // Korean brackets handling
  // 겹낫표 (book titles): **『text』** → 『**text**』
  [/\*\*『([^『』*\n]+)』\*\*/g, '『**$1**』'],
  // 낫표 (article titles): **「text」** → 「**text**」
  [/\*\*「([^「」*\n]+)」\*\*/g, '「**$1**」'],
  // 겹화살괄호 (events/exhibitions): **《text》** → 《**text**》
  [/\*\*《([^《》*\n]+)》\*\*/g, '《**$1**》'],
  // 홑화살괄호 (artworks): **〈text〉** → 〈**text**〉
  [/\*\*〈([^〈〉*\n]+)〉\*\*/g, '〈**$1**〉'],
  // Full-width parentheses: **（text）** → （**text**）
  [/\*\*（([^（）*\n]+)）\*\*/g, '（**$1**）'],
  // Black lenticular brackets (CJK notices/emphasis): **【text】** → 【**text**】
  [/\*\*【([^【】*\n]+)】\*\*/g, '【**$1**】'],
  // Tortoise shell brackets: **〔text〕** → 〔**text**〕
  [/\*\*〔([^〔〕*\n]+)〕\*\*/g, '〔**$1**〕'],
];

/**
 * Transformation rules to move punctuation outside of italic markdown
 * Same patterns as bold rules but applied to italic (single asterisk)
 */
const ITALIC_PUNCTUATION_RULES: Array<[RegExp, string]> = [
  // Convert italic markdown links to standard format (*[text](url)* → [*text*](url))
  // Use negative lookbehind to exclude **
  [/(?<!\*)\*\[([^\]]+)\]\(([^)]+)\)\*(?!\*)/g, '[*$1*]($2)'],
  // ASCII double quotes - italic version
  [/(?<!\*)\*"([^"*\n]+)"\*(?!\*)/g, '"*$1*"'],
  // ASCII single quotes - italic version
  [/(?<!\*)\*'([^'*\n]+)'\*(?!\*)/g, "'*$1*'"],
  // Parentheses with space (e.g., *text (description)* → *text* (description))
  [/(?<!\*)\*([^*\n]+?)\s+(\([^*\n]+?\))\*(?!\*)/g, '*$1* $2'],
  // Parentheses without space (e.g., *text(description)* → *text*(description))
  [/(?<!\*)\*([^*\n]+?)(\([^*\n]+?\))\*(?!\*)/g, '*$1*$2'],
  // Parentheses with trailing text (e.g., *text (description)*suffix → *text* (description)suffix)
  [/(?<!\*)\*([^*]+?)\s+(\([^*]+?\))\*([^\s*]+)/g, '*$1* $2$3'],
  // Parentheses with trailing text - no space version
  [/(?<!\*)\*([^*]+?)(\([^*]+?\))\*([^\s*]+)/g, '*$1*$2$3'],
  // Percentage sign handling (e.g., *21%* → *21*%)
  [/(?<!\*)\*([^%]+?)%\*(?!\*)/g, '*$1*%'],
  // Angle brackets handling (e.g., *<text>* → <*text*>)
  [/(?<!\*)\*<([^<>*\n]+)>\*(?!\*)/g, '<*$1*>'],
  // Korean brackets handling - italic versions
  // 겹낫표 (book titles): *『text』* → 『*text*』
  [/(?<!\*)\*『([^『』*\n]+)』\*(?!\*)/g, '『*$1*』'],
  // 낫표 (article titles): *「text」* → 「*text*」
  [/(?<!\*)\*「([^「」*\n]+)」\*(?!\*)/g, '「*$1*」'],
  // 겹화살괄호 (events/exhibitions): *《text》* → 《*text*》
  [/(?<!\*)\*《([^《》*\n]+)》\*(?!\*)/g, '《*$1*》'],
  // 홑화살괄호 (artworks): *〈text〉* → 〈*text*〉
  [/(?<!\*)\*〈([^〈〉*\n]+)〉\*(?!\*)/g, '〈*$1*〉'],
  // Full-width parentheses: *（text）* → （*text*）
  [/(?<!\*)\*（([^（）*\n]+)）\*(?!\*)/g, '（*$1*）'],
  // Black lenticular brackets: *【text】* → 【*text*】
  [/(?<!\*)\*【([^【】*\n]+)】\*(?!\*)/g, '【*$1*】'],
  // Tortoise shell brackets: *〔text〕* → 〔*text*〕
  [/(?<!\*)\*〔([^〔〕*\n]+)〕\*(?!\*)/g, '〔*$1*〕'],
];

/**
 * Trailing punctuation that breaks CommonMark emphasis in CJK text.
 *
 * Per the right-flanking rule, a closing delimiter preceded by punctuation
 * only counts when it is followed by whitespace or punctuation. In CJK text,
 * particles and the next clause attach with no space (e.g. **제목:**내용,
 * **文章。**次), so the emphasis fails to render. These rules move the
 * trailing punctuation outside the delimiter, but ONLY when a letter or
 * number follows directly — **Note:** followed by a space renders fine and
 * must stay untouched.
 *
 * ASCII ? and % are excluded here: they are handled unconditionally by the
 * dedicated rules above. ASCII ~ only breaks plain CommonMark (GFM's
 * strikethrough tokenizer changes its handling); moving it out is safe in
 * both dialects.
 */
const TRAILING_PUNCT = '[:!.,;~？！。、，：；…．～]';
const CJK_FLANKING_RULES: Array<[RegExp, string]> = [
  // Bold: **제목:**내용 → **제목**:내용
  [new RegExp(`\\*\\*([^*\\n]+?)(${TRAILING_PUNCT}+)\\*\\*(?=[\\p{L}\\p{N}])`, 'gu'), '**$1**$2'],
  // Italic: *제목:*내용 → *제목*:내용
  [new RegExp(`(?<!\\*)\\*([^*\\n]+?)(${TRAILING_PUNCT}+)\\*(?=[\\p{L}\\p{N}])`, 'gu'), '*$1*$2'],
  // Full-width parenthetical before attached text: **텍스트（설명）**뒤 → **텍스트**（설명）뒤
  [/\*\*([^*\n]+?)(（[^*\n（）]+?）)\*\*(?=[\p{L}\p{N}])/gu, '**$1**$2'],
  [/(?<!\*)\*([^*\n]+?)(（[^*\n（）]+?）)\*(?=[\p{L}\p{N}])/gu, '*$1*$2'],
  // GFM strikethrough: ~~취소!~~라고 → ~~취소~~!라고 (same flanking constraint)
  [/(?<!~)~~([^~\n]+?)([:!.,;？！。、，：；…．]+)~~(?!~)(?=[\p{L}\p{N}])/gu, '~~$1~~$2'],
];

/**
 * Rules to handle partial quotes inside bold
 * e.g., **text 'quote'** → text '**quote**'
 * Note: Use negative lookahead to avoid interfering with already processed patterns
 */
const PARTIAL_QUOTE_RULES: Array<[RegExp, string]> = [
  // Bold starting after quotes is already handled in main rules
  // This rule is removed to prevent interference
  // Complex nested pattern: single quotes and parentheses inside double quotes
  // e.g., **AI-based business email automation solution 'MailMaster (MailMaster)'**
  //     → AI-based business email automation solution '**MailMaster** (MailMaster)'
  [/\*\*([^*']+?)'([^'(]+?)\s+\(([^)]+?)\)'\*\*/g, "$1'**$2** ($3)'"],
  // ASCII double quotes with separated text and parentheses
  // e.g., **text "quote (description)"** → text "**quote** (description)"
  [/\*\*([^*]+?)\s+"([^"]+?)\s+\(([^)]+?)\)"\*\*/g, '$1 "**$2** ($3)"'],
  // ASCII single quotes with parentheses - more specific pattern
  // e.g., **'Do Things That Don't Scale'** → '**Do Things That Don't Scale**'
  [/\*\*'([^']+?)\(([^)]+?)\)'\*\*/g, "'**$1**($2)'"],
  // ASCII single quotes with parentheses - with preceding text
  // e.g., **text 'quote(description)'** → text '**quote**(description)'
  [/\*\*([^*]+?)\s+'([^']+?)\(([^)]+?)\)'\*\*/g, "$1 '**$2**($3)'"],
  // ASCII double quotes with parentheses
  [/\*\*([^*]+?)\s+"([^"]+?)\(([^)]+?)\)"\*\*/g, '$1 "**$2**($3)"'],
  // ASCII single quotes partially inside (no parentheses)
  // Use [^*] to avoid interfering with already processed quotes
  [/\*\*([^*]+?)\s+'([^']+?)'\*\*/g, "$1 '**$2**'"],
  // ASCII double quotes partially inside (no parentheses)
  [/\*\*([^*]+?)\s+"([^"]+?)"\*\*/g, '$1 "**$2**"'],
];

/**
 * Rules to handle partial quotes inside italic
 * Similar to bold rules but using single asterisk
 */
const ITALIC_PARTIAL_QUOTE_RULES: Array<[RegExp, string]> = [
  // Complex nested pattern: single quotes and parentheses inside double quotes - italic version
  [/(?<!\*)\*([^*']+?)'([^'(]+?)\s+\(([^)]+?)\)'\*(?!\*)/g, "$1'*$2* ($3)'"],
  // ASCII double quotes with separated text and parentheses - italic version
  [/(?<!\*)\*([^*]+?)\s+"([^"]+?)\s+\(([^)]+?)\)"\*(?!\*)/g, '$1 "*$2* ($3)"'],
  // ASCII single quotes with parentheses - italic version
  [/(?<!\*)\*'([^']+?)\(([^)]+?)\)'\*(?!\*)/g, "'*$1*($2)'"],
  // ASCII single quotes with parentheses - with preceding text - italic version
  [/(?<!\*)\*([^*]+?)\s+'([^']+?)\(([^)]+?)\)'\*(?!\*)/g, "$1 '*$2*($3)'"],
  // ASCII double quotes with parentheses - italic version
  [/(?<!\*)\*([^*]+?)\s+"([^"]+?)\(([^)]+?)\)"\*(?!\*)/g, '$1 "*$2*($3)"'],
  // ASCII single quotes partially inside (no parentheses) - italic version
  [/(?<!\*)\*([^*]+?)\s+'([^']+?)'\*(?!\*)/g, "$1 '*$2*'"],
  // ASCII double quotes partially inside (no parentheses) - italic version
  [/(?<!\*)\*([^*]+?)\s+"([^"]+?)"\*(?!\*)/g, '$1 "*$2*"'],
];

/**
 * Incomplete image markdown patterns
 * Remove partially transmitted image markdown during streaming
 */
const INCOMPLETE_IMAGE_PATTERNS: RegExp[] = [
  /!\[[^\]]*\]\([^)]*$/g, // Unfinished image link
  /!\[[^\]]*$/g, // Image with alt text only
  /!\[$/g, // Image with opening bracket only
  /!$/g, // Exclamation mark only
];

/**
 * Fenced code blocks (``` or ~~~), including an unclosed trailing fence
 * so that partially streamed code blocks are also protected
 */
const FENCED_CODE_PATTERN = /(`{3,}|~{3,})[\s\S]*?(?:\1|$)/g;

/**
 * Inline code spans (single line, backtick-delimited)
 */
const INLINE_CODE_PATTERN = /(`+)[^`\n]+?\1(?!`)/g;

/**
 * Replaces each match of `pattern` with a placeholder (\x00<tag><index>\x00)
 * and stores the original text in `store` for later restoration.
 * The placeholder contains no characters that transformation rules can match,
 * so masked segments pass through all rules untouched.
 */
function maskSegments(text: string, pattern: RegExp, store: string[], tag: string): string {
  return text.replace(pattern, (match) => {
    store.push(match);
    return `\x00${tag}${store.length - 1}\x00`;
  });
}

/**
 * Restores placeholders created by maskSegments back to their original text
 */
function restoreSegments(text: string, store: string[], tag: string): string {
  return text.replace(
    new RegExp(`\\x00${tag}(\\d+)\\x00`, 'g'),
    (_, index) => store[Number(index)]
  );
}

/**
 * Options for the unbreak function
 */
export interface UnbreakOptions {
  /**
   * Remove trailing incomplete image markdown (e.g. `![alt](https://…` cut
   * off mid-stream). Enable this for intermediate chunks while streaming;
   * leave it off for complete documents, where a trailing `!` or `![` is
   * legitimate content and must not be removed.
   * @default false
   */
  streaming?: boolean;
  /**
   * Normalize Unicode smart quotes (‘ ’ “ ”) to ASCII quotes (' ") so that
   * the quote-related rules can match them.
   * @default true
   */
  normalizeQuotes?: boolean;
  /**
   * Move a trailing question mark outside bold (**text?** → **text**?).
   * Disable if bolding whole questions is intentional in your content.
   * @default true
   */
  moveQuestionMark?: boolean;
}

/**
 * Fixes broken markdown to ensure proper rendering.
 *
 * Main features:
 * 1. Move punctuation outside of Bold/Italic text for better typography
 * 2. With `streaming: true`, remove incomplete image markdown for rendering stability
 *
 * Code segments (fenced code blocks and inline code) are never modified.
 *
 * @param markdown - The markdown string to fix
 * @param options - Optional behavior toggles
 * @returns Unbroken markdown string
 */
export function unbreak(markdown: string, options: UnbreakOptions = {}): string {
  if (!markdown) return markdown;

  const { streaming = false, normalizeQuotes = true, moveQuestionMark = true } = options;

  let result = markdown;

  // Mask fenced code blocks first so no rule (including quote normalization
  // and inline-code unwrapping) can touch their content
  const fencedBlocks: string[] = [];
  result = maskSegments(result, FENCED_CODE_PATTERN, fencedBlocks, 'FENCE');

  // Remove bold/italic wrapping around inline code
  // Inline code already has visual distinction (monospace + background), bold/italic is redundant
  // Must be applied before inline code masking, since it matches the backticks themselves
  result = result.replaceAll(/\*\*`([^`\n]+)`\*\*/g, '`$1`');
  result = result.replaceAll(/(?<!\*)\*`([^`\n]+)`\*(?!\*)/g, '`$1`');

  // Mask inline code spans so the remaining rules cannot alter their content
  const inlineCodes: string[] = [];
  result = maskSegments(result, INLINE_CODE_PATTERN, inlineCodes, 'CODE');

  // Normalize Unicode quotes to ASCII
  if (normalizeQuotes) {
    result = result.replaceAll('\u2018', "'");
    result = result.replaceAll('\u2019', "'");
    result = result.replaceAll('\u201C', '"');
    result = result.replaceAll('\u201D', '"');
  }

  // Simple approach: only convert **"text"** that comes after space or line start
  // This way "**text**" pattern is not converted
  result = result.replaceAll(/(^|\s)\*\*"([^"]+)"\*\*/g, '$1"**$2**"');
  result = result.replaceAll(/(^|\s)\*\*'([^']+)'\*\*/g, "$1'**$2**'");

  // Convert italic (*"text"*) to quotes with italic inside ("*text*") (single *)
  result = result.replaceAll(/(?<!\*)\*"([^"]+)"\*/g, '"*$1*"');
  result = result.replaceAll(/(?<!\*)\*'([^']+)'\*/g, "'*$1*'");

  // Handle partial quotes - Bold
  for (const [pattern, replacement] of PARTIAL_QUOTE_RULES) {
    result = result.replaceAll(pattern, replacement);
  }

  // Handle partial quotes - Italic
  for (const [pattern, replacement] of ITALIC_PARTIAL_QUOTE_RULES) {
    result = result.replaceAll(pattern, replacement);
  }

  // Apply remaining punctuation rules - Bold
  // Exclude quote-related rules as they're already processed
  const nonQuoteRules = PUNCTUATION_RULES.filter(([pattern]) => {
    const patternStr = pattern.toString();
    return !patternStr.includes('"') && !patternStr.includes("'");
  }).filter((rule) => moveQuestionMark || rule !== BOLD_QUESTION_MARK_RULE);

  for (const [pattern, replacement] of nonQuoteRules) {
    result = result.replaceAll(pattern, replacement);
  }

  // Apply remaining punctuation rules - Italic
  // Exclude quote-related rules as they're already processed
  const nonQuoteItalicRules = ITALIC_PUNCTUATION_RULES.filter(([pattern]) => {
    const patternStr = pattern.toString();
    return !patternStr.includes('"') && !patternStr.includes("'");
  });

  for (const [pattern, replacement] of nonQuoteItalicRules) {
    result = result.replaceAll(pattern, replacement);
  }

  // Fix CJK flanking breakage: trailing punctuation directly followed by a
  // letter/number prevents the closing delimiter from being right-flanking
  for (const [pattern, replacement] of CJK_FLANKING_RULES) {
    result = result.replaceAll(pattern, replacement);
  }

  // Remove incomplete image markdown (only while streaming — on a complete
  // document a trailing "!" or "![" is legitimate content)
  if (streaming) {
    for (const pattern of INCOMPLETE_IMAGE_PATTERNS) {
      result = result.replace(pattern, '');
    }
  }

  // Restore masked code segments
  result = restoreSegments(result, inlineCodes, 'CODE');
  result = restoreSegments(result, fencedBlocks, 'FENCE');

  return result;
}
