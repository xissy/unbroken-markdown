/**
 * Bold markdown 안의 구두점을 밖으로 이동시키는 변환 규칙
 * 각 규칙은 [정규식, 대체 문자열] 형태
 */
const PUNCTUATION_RULES: Array<[RegExp, string]> = [
  // Bold markdown 링크를 표준 형태로 변환 (**[text](url)** → [**text**](url))
  [/\*\*\[([^\]]+)\]\(([^)]+)\)\*\*/g, "[**$1**]($2)"],
  // ASCII 큰따옴표 - 줄바꿈을 넘지 않도록 제한
  // [^"*\n]로 줄바꿈을 제한하여 과도한 매칭 방지
  [/\*\*"([^"*\n]+)"\*\*/g, '"**$1**"'],
  // ASCII 작은따옴표 - 줄바꿈을 넘지 않도록 제한
  [/\*\*'([^'*\n]+)'\*\*/g, "'**$1**'"],
  // 공백이 있는 괄호 처리 (예: **텍스트 (설명)** → **텍스트** (설명))
  [/\*\*([^*\n]+?)\s+(\([^*\n]+?\))\*\*/g, "**$1** $2"],
  // 공백이 없는 괄호 처리 (예: **텍스트(설명)** → **텍스트**(설명))
  [/\*\*([^*\n]+?)(\([^*\n]+?\))\*\*/g, "**$1**$2"],
  // 괄호 뒤에 추가 텍스트가 있는 경우 (예: **텍스트 (설명)**가 → **텍스트** (설명)가)
  [/\*\*([^*]+?)\s+(\([^*]+?\))\*\*([^\s*]+)/g, "**$1** $2$3"],
  // 괄호 뒤에 추가 텍스트가 있는 경우 - 공백 없는 버전
  [/\*\*([^*]+?)(\([^*]+?\))\*\*([^\s*]+)/g, "**$1**$2$3"],
  // 퍼센트 기호 처리 (예: **21%** → **21**%)
  // % 자체만 bold인 경우 방지하기 위해 [^%]+? 사용
  [/\*\*([^%]+?)%\*\*/g, "**$1**%"],
];

/**
 * Italic markdown 안의 구두점을 밖으로 이동시키는 변환 규칙
 * Bold 규칙과 동일한 패턴을 italic(single asterisk)에 적용
 */
const ITALIC_PUNCTUATION_RULES: Array<[RegExp, string]> = [
  // Italic markdown 링크를 표준 형태로 변환 (*[text](url)* → [*text*](url))
  // negative lookbehind로 **를 제외
  [/(?<!\*)\*\[([^\]]+)\]\(([^)]+)\)\*(?!\*)/g, "[*$1*]($2)"],
  // ASCII 큰따옴표 - italic 버전
  [/(?<!\*)\*"([^"*\n]+)"\*(?!\*)/g, '"*$1*"'],
  // ASCII 작은따옴표 - italic 버전
  [/(?<!\*)\*'([^'*\n]+)'\*(?!\*)/g, "'*$1*'"],
  // 공백이 있는 괄호 처리 (예: *텍스트 (설명)* → *텍스트* (설명))
  [/(?<!\*)\*([^*\n]+?)\s+(\([^*\n]+?\))\*(?!\*)/g, "*$1* $2"],
  // 공백이 없는 괄호 처리 (예: *텍스트(설명)* → *텍스트*(설명))
  [/(?<!\*)\*([^*\n]+?)(\([^*\n]+?\))\*(?!\*)/g, "*$1*$2"],
  // 괄호 뒤에 추가 텍스트가 있는 경우 (예: *텍스트 (설명)*가 → *텍스트* (설명)가)
  [/(?<!\*)\*([^*]+?)\s+(\([^*]+?\))\*([^\s*]+)/g, "*$1* $2$3"],
  // 괄호 뒤에 추가 텍스트가 있는 경우 - 공백 없는 버전
  [/(?<!\*)\*([^*]+?)(\([^*]+?\))\*([^\s*]+)/g, "*$1*$2$3"],
  // 퍼센트 기호 처리 (예: *21%* → *21*%)
  [/(?<!\*)\*([^%]+?)%\*(?!\*)/g, "*$1*%"],
];

/**
 * Bold 내부에 부분적으로 따옴표가 있는 경우를 처리하는 규칙
 * 예: **텍스트 '인용'** → 텍스트 '**인용**'
 * 주의: 이미 처리된 패턴을 건드리지 않도록 negative lookahead 사용
 */
const PARTIAL_QUOTE_RULES: Array<[RegExp, string]> = [
  // Bold가 큰따옴표 뒤에서 시작하는 경우는 이미 메인 규칙에서 처리됨
  // 이 규칙은 제거하여 간섭 방지
  // 복잡한 중첩 패턴: 큰따옴표 안에 작은따옴표와 괄호가 있는 경우
  // 예: **AI 기반의 비즈니스 이메일 자동화 및 최적화 솔루션 '메일마스터 (MailMaster)'**
  //     → AI 기반의 비즈니스 이메일 자동화 및 최적화 솔루션 '**메일마스터** (MailMaster)'
  [/\*\*([^*']+?)'([^'(]+?)\s+\(([^)]+?)\)'\*\*/g, "$1'**$2** ($3)'"],
  // ASCII 큰따옴표 안의 텍스트와 괄호가 분리된 경우
  // 예: **텍스트 "인용 (설명)"** → 텍스트 "**인용** (설명)"
  [/\*\*([^*]+?)\s+"([^"]+?)\s+\(([^)]+?)\)"\*\*/g, '$1 "**$2** ($3)"'],
  // ASCII 작은따옴표와 괄호가 함께 있는 경우 - 더 구체적인 패턴
  // 예: **'확장되지 않는 일(Do Things That Don't Scale)'** → '**확장되지 않는 일**(Do Things That Don't Scale)'
  [/\*\*'([^']+?)\(([^)]+?)\)'\*\*/g, "'**$1**($2)'"],
  // ASCII 작은따옴표와 괄호가 함께 있는 경우 - 앞에 텍스트가 있는 경우
  // 예: **텍스트 '인용(설명)'** → 텍스트 '**인용**(설명)'
  [/\*\*([^*]+?)\s+'([^']+?)\(([^)]+?)\)'\*\*/g, "$1 '**$2**($3)'"],
  // ASCII 큰따옴표와 괄호가 함께 있는 경우
  [/\*\*([^*]+?)\s+"([^"]+?)\(([^)]+?)\)"\*\*/g, '$1 "**$2**($3)"'],
  // ASCII 작은따옴표가 부분적으로 있는 경우 (괄호 없음)
  // 이미 처리된 '를 건드리지 않도록 [^*] 사용
  [/\*\*([^*]+?)\s+'([^']+?)'\*\*/g, "$1 '**$2**'"],
  // ASCII 큰따옴표가 부분적으로 있는 경우 (괄호 없음)
  [/\*\*([^*]+?)\s+"([^"]+?)"\*\*/g, '$1 "**$2**"'],
];

/**
 * Italic 내부에 부분적으로 따옴표가 있는 경우를 처리하는 규칙
 * Bold 규칙과 유사하지만 single asterisk 사용
 */
const ITALIC_PARTIAL_QUOTE_RULES: Array<[RegExp, string]> = [
  // 복잡한 중첩 패턴: 큰따옴표 안에 작은따옴표와 괄호가 있는 경우 - italic 버전
  [/(?<!\*)\*([^*']+?)'([^'(]+?)\s+\(([^)]+?)\)'\*(?!\*)/g, "$1'*$2* ($3)'"],
  // ASCII 큰따옴표 안의 텍스트와 괄호가 분리된 경우 - italic 버전
  [/(?<!\*)\*([^*]+?)\s+"([^"]+?)\s+\(([^)]+?)\)"\*(?!\*)/g, '$1 "*$2* ($3)"'],
  // ASCII 작은따옴표와 괄호가 함께 있는 경우 - italic 버전
  [/(?<!\*)\*'([^']+?)\(([^)]+?)\)'\*(?!\*)/g, "'*$1*($2)'"],
  // ASCII 작은따옴표와 괄호가 함께 있는 경우 - 앞에 텍스트가 있는 경우 - italic 버전
  [/(?<!\*)\*([^*]+?)\s+'([^']+?)\(([^)]+?)\)'\*(?!\*)/g, "$1 '*$2*($3)'"],
  // ASCII 큰따옴표와 괄호가 함께 있는 경우 - italic 버전
  [/(?<!\*)\*([^*]+?)\s+"([^"]+?)\(([^)]+?)\)"\*(?!\*)/g, '$1 "*$2*($3)"'],
  // ASCII 작은따옴표가 부분적으로 있는 경우 (괄호 없음) - italic 버전
  [/(?<!\*)\*([^*]+?)\s+'([^']+?)'\*(?!\*)/g, "$1 '*$2*'"],
  // ASCII 큰따옴표가 부분적으로 있는 경우 (괄호 없음) - italic 버전
  [/(?<!\*)\*([^*]+?)\s+"([^"]+?)"\*(?!\*)/g, '$1 "*$2*"'],
];

/**
 * 불완전한 이미지 markdown 패턴
 * 스트리밍 중 부분적으로 전달된 이미지 markdown을 제거
 */
const INCOMPLETE_IMAGE_PATTERNS: RegExp[] = [
  /!\[[^\]]*\]\([^)]*$/g, // 끝나지 않은 이미지 링크
  /!\[[^\]]*$/g, // alt 텍스트만 있는 이미지
  /!\[$/g, // 시작 부분만 있는 이미지
  /!$/g, // 느낌표만 있는 경우
];

/**
 * markdown 텍스트를 검증하고 정리합니다.
 *
 * 주요 기능:
 * 1. Bold 텍스트 안의 구두점을 밖으로 이동시켜 타이포그래피 개선
 * 2. 스트리밍 중 불완전한 이미지 markdown 제거로 렌더링 안정성 확보
 *
 * @param markdown - 검증할 markdown 문자열
 * @returns 정리된 markdown 문자열
 */
export function validateMarkdown(markdown: string): string {
  if (!markdown) return markdown;

  let result = markdown;

  // 유니코드 문자를 ASCII로 정규화
  result = result.replaceAll("\u2018", "'");
  result = result.replaceAll("\u2019", "'");
  result = result.replaceAll("\u201C", '"');
  result = result.replaceAll("\u201D", '"');

  // 간단한 접근: 공백이나 줄 시작 뒤에 오는 **"text"**만 변환
  // 이렇게 하면 "**text**" 패턴은 변환되지 않음
  result = result.replaceAll(/(^|\s)\*\*"([^"]+)"\*\*/g, '$1"**$2**"');
  result = result.replaceAll(/(^|\s)\*\*'([^']+)'\*\*/g, "$1'**$2**'");

  // 이탤릭(*"text"*)을 따옴표 안의 이탤릭("*text*")으로 변환 (single *)
  result = result.replaceAll(/(?<!\*)\*"([^"]+)"\*/g, '"*$1*"');
  result = result.replaceAll(/(?<!\*)\*'([^']+)'\*/g, "'*$1*'");

  // 부분적인 따옴표 처리 - Bold
  for (const [pattern, replacement] of PARTIAL_QUOTE_RULES) {
    result = result.replaceAll(pattern, replacement);
  }

  // 부분적인 따옴표 처리 - Italic
  for (const [pattern, replacement] of ITALIC_PARTIAL_QUOTE_RULES) {
    result = result.replaceAll(pattern, replacement);
  }

  // 나머지 구두점 정리 규칙 적용 - Bold
  // 따옴표 관련 규칙은 이미 처리했으므로 제외
  const nonQuoteRules = PUNCTUATION_RULES.filter(([pattern]) => {
    const patternStr = pattern.toString();
    return !patternStr.includes('"') && !patternStr.includes("'");
  });

  for (const [pattern, replacement] of nonQuoteRules) {
    result = result.replaceAll(pattern, replacement);
  }

  // 나머지 구두점 정리 규칙 적용 - Italic
  // 따옴표 관련 규칙은 이미 처리했으므로 제외
  const nonQuoteItalicRules = ITALIC_PUNCTUATION_RULES.filter(([pattern]) => {
    const patternStr = pattern.toString();
    return !patternStr.includes('"') && !patternStr.includes("'");
  });

  for (const [pattern, replacement] of nonQuoteItalicRules) {
    result = result.replaceAll(pattern, replacement);
  }

  // 불완전한 이미지 markdown 제거
  for (const pattern of INCOMPLETE_IMAGE_PATTERNS) {
    result = result.replace(pattern, "");
  }

  return result;
}
