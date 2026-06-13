import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { describe, expect, test } from 'vitest';

import { unbreak } from './index';

/**
 * Render with the same CommonMark+GFM parser stack consumers use
 * (react-markdown is built on micromark), so every assertion verifies
 * actual rendering behavior, not just string shapes.
 */
function render(markdown: string): string {
  return micromark(markdown, { extensions: [gfm()], htmlExtensions: [gfmHtml()] });
}

function rendersEmphasis(markdown: string): boolean {
  return /<(strong|em|del)>/.test(render(markdown));
}

/**
 * The core contract for every "broken" case:
 * 1. the input genuinely fails to render emphasis (proves the case is real)
 * 2. unbreak produces the exact expected string
 * 3. the output genuinely renders emphasis (proves the fix works)
 * 4. unbreak is idempotent on its own output
 */
function expectFixed(input: string, expected: string): void {
  expect(rendersEmphasis(input), `input should be broken: ${input}`).toBe(false);
  const output = unbreak(input);
  expect(output).toBe(expected);
  expect(rendersEmphasis(output), `output should render: ${output}`).toBe(true);
  expect(unbreak(output)).toBe(output);
}

/**
 * The contract for every "already fine" case: rendering works before and
 * after, and unbreak leaves the string untouched.
 */
function expectUntouched(input: string): void {
  expect(rendersEmphasis(input), `input should render: ${input}`).toBe(true);
  expect(unbreak(input)).toBe(input);
}

describe('CJK flanking fixes', () => {
  describe('bold with trailing ASCII punctuation directly followed by CJK', () => {
    test('colon', () => {
      expectFixed('**제목:**내용이 이어진다', '**제목**:내용이 이어진다');
    });

    test('exclamation mark', () => {
      expectFixed('**대박!**이라고 했다', '**대박**!이라고 했다');
    });

    test('period', () => {
      expectFixed('**끝.**입니다', '**끝**.입니다');
    });

    test('comma', () => {
      expectFixed('**먼저,**그리고', '**먼저**,그리고');
    });

    test('semicolon', () => {
      expectFixed('**구분;**다음', '**구분**;다음');
    });

    test('tilde (breaks only without GFM: the strikethrough tokenizer changes ~ handling)', () => {
      const input = '**3시~**까지';
      const plainCommonmark = (md: string) => /<(strong|em)>/.test(micromark(md));
      expect(plainCommonmark(input), 'broken under plain CommonMark').toBe(false);
      const output = unbreak(input);
      expect(output).toBe('**3시**~까지');
      expect(plainCommonmark(output), 'fixed under plain CommonMark').toBe(true);
      expect(rendersEmphasis(output), 'still renders under GFM').toBe(true);
      expect(unbreak(output)).toBe(output);
    });

    test('consecutive punctuation', () => {
      expectFixed('**정말!.**이라며', '**정말**!.이라며');
    });
  });

  describe('bold with trailing full-width punctuation', () => {
    test('full-width question mark (Korean)', () => {
      expectFixed('**질문？**에 대한 답', '**질문**？에 대한 답');
    });

    test('full-width exclamation mark (Korean)', () => {
      expectFixed('**경고！**라고', '**경고**！라고');
    });

    test('ideographic full stop (Japanese)', () => {
      expectFixed('**文章。**次の文', '**文章**。次の文');
    });

    test('ideographic comma (Japanese)', () => {
      expectFixed('**まず、**次に', '**まず**、次に');
    });

    test('full-width comma (Chinese)', () => {
      expectFixed('**首先，**然后', '**首先**，然后');
    });

    test('full-width colon', () => {
      expectFixed('**제목：**내용', '**제목**：내용');
    });

    test('full-width semicolon', () => {
      expectFixed('**구분；**다음', '**구분**；다음');
    });

    test('horizontal ellipsis', () => {
      expectFixed('**그리고…**다음', '**그리고**…다음');
    });

    test('full-width full stop', () => {
      expectFixed('**完．**次', '**完**．次');
    });

    test('wave dash (Japanese)', () => {
      expectFixed('**３時～**まで', '**３時**～まで');
    });
  });

  describe('bold with full-width parentheses', () => {
    test('trailing parenthetical directly followed by CJK', () => {
      expectFixed('**텍스트（설명）**뒤에 온다', '**텍스트**（설명）뒤에 온다');
    });

    test('fully wrapped content is moved outside', () => {
      expectFixed('**（참고）**내용', '（**참고**）내용');
    });

    test('Japanese annotation pattern', () => {
      expectFixed(
        '**住吉の長屋（じゅうよしのながや）**は名作だ',
        '**住吉の長屋**（じゅうよしのながや）は名作だ'
      );
    });
  });

  describe('bold with CJK bracket pairs', () => {
    test('black lenticular brackets (Chinese notice)', () => {
      expectFixed('**【公告】**内容', '【**公告**】内容');
    });

    test('black lenticular brackets (Korean)', () => {
      expectFixed('**【중요】**확인 바랍니다', '【**중요**】확인 바랍니다');
    });

    test('tortoise shell brackets', () => {
      expectFixed('**〔注〕**本文', '〔**注**〕本文');
    });
  });

  describe('italic variants', () => {
    test('trailing colon directly followed by CJK', () => {
      expectFixed('*제목:*내용이 이어진다', '*제목*:내용이 이어진다');
    });

    test('trailing ideographic full stop', () => {
      expectFixed('*文章。*次の文', '*文章*。次の文');
    });

    test('trailing full-width parenthetical', () => {
      expectFixed('*텍스트（설명）*뒤에 온다', '*텍스트*（설명）뒤에 온다');
    });

    test('fully wrapped full-width parentheses', () => {
      expectFixed('*（참고）*내용', '（*참고*）내용');
    });

    test('black lenticular brackets', () => {
      expectFixed('*【公告】*内容', '【*公告*】内容');
    });

    test('tortoise shell brackets', () => {
      expectFixed('*〔注〕*本文', '〔*注*〕本文');
    });
  });

  describe('GFM strikethrough', () => {
    test('trailing exclamation directly followed by CJK', () => {
      expectFixed('~~취소!~~라고', '~~취소~~!라고');
    });

    test('trailing ideographic full stop', () => {
      expectFixed('~~削除。~~次', '~~削除~~。次');
    });

    test('plain strikethrough stays untouched', () => {
      expectUntouched('~~취소~~라고');
    });
  });

  describe('cases that must stay untouched', () => {
    test('trailing punctuation followed by a space renders fine', () => {
      expectUntouched('**Note:** this is fine');
      expectUntouched('**제목:** 내용');
      expectUntouched('**대박!** 이라고');
    });

    test('trailing punctuation at end of input renders fine', () => {
      expectUntouched('결론은 **이것입니다.**');
      expectUntouched('**文章。**');
    });

    test('trailing punctuation followed by punctuation renders fine', () => {
      expectUntouched('**제목:**, 그리고');
    });

    test('full-width parenthetical at end of input renders fine', () => {
      expectUntouched('**텍스트（설명）**');
    });

    test('plain CJK bold with attached particle renders fine', () => {
      expectUntouched('**단어**가 좋다');
      expectUntouched('**言葉**が好き');
      expectUntouched('**词语**很好');
    });

    test('punctuation inside the middle of bold renders fine', () => {
      expectUntouched('**A・B 비교: 결과**가 나왔다');
    });
  });

  describe('rendering verification of pre-existing rules', () => {
    test('Korean corner brackets', () => {
      expectFixed('**「제목」**을 읽다', '「**제목**」을 읽다');
    });

    test('ASCII double quotes', () => {
      expectFixed('그는 **"인용"**이라 했다', '그는 "**인용**"이라 했다');
    });

    test('percentage', () => {
      expectFixed('**50%**가 늘었다', '**50**%가 늘었다');
    });

    test('ASCII question mark', () => {
      expectFixed('**무엇인가?**라는 질문', '**무엇인가**?라는 질문');
    });
  });

  describe('interaction with other features', () => {
    test('does not modify trailing punctuation patterns inside code segments', () => {
      const inline = '코드 `**제목:**내용` 예시';
      expect(unbreak(inline)).toBe(inline);
      const fence = '```\n**제목:**내용\n```';
      expect(unbreak(fence)).toBe(fence);
    });

    test('multiple fixes in one line', () => {
      expectFixed(
        '**첫째,**하나와 **둘째!**둘과 **【셋】**셋',
        '**첫째**,하나와 **둘째**!둘과 【**셋**】셋'
      );
    });

    test('mixed bold and italic in one line', () => {
      expectFixed('**제목:**내용과 *부제목.*설명', '**제목**:내용과 *부제목*.설명');
    });
  });
});
