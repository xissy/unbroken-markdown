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
  // Question mark handling (e.g., **text?** → **text**?)
  [/\*\*([^?]+?)\?\*\*/g, '**$1**?'],
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
 * Fixes broken markdown to ensure proper rendering.
 *
 * Main features:
 * 1. Move punctuation outside of Bold/Italic text for better typography
 * 2. Remove incomplete image markdown during streaming for rendering stability
 *
 * @param markdown - The markdown string to fix
 * @returns Unbroken markdown string
 */
export function unbreak(markdown: string): string {
  if (!markdown) return markdown;

  let result = markdown;

  // Normalize Unicode quotes to ASCII
  result = result.replaceAll('\u2018', "'");
  result = result.replaceAll('\u2019', "'");
  result = result.replaceAll('\u201C', '"');
  result = result.replaceAll('\u201D', '"');

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
  });

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

  // Remove incomplete image markdown
  for (const pattern of INCOMPLETE_IMAGE_PATTERNS) {
    result = result.replace(pattern, '');
  }

  return result;
}
