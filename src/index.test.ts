import { describe, expect, test } from 'vitest';

import { unbreak } from './index';

describe('unbreak', () => {
  test('should correctly format quotes outside of bold text', () => {
    const input = '**"Some text"**';
    const expected = '"**Some text**"';
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format single quotes outside of bold text', () => {
    const input = "**'Some text'**";
    const expected = "'**Some text**'";
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format parentheses outside of bold text', () => {
    const input = '**Text (with parentheses)**';
    const expected = '**Text** (with parentheses)';
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format text with parentheses and trailing text', () => {
    const input = '**Text (with parentheses)**suffix';
    const expected = '**Text** (with parentheses)suffix';
    expect(unbreak(input)).toBe(expected);
  });

  test('should handle multiple replacements in a single string', () => {
    const input = '**\'Quote\'** and **"Another quote"** and **Text (with parentheses)**suffix';
    const expected = '\'**Quote**\' and "**Another quote**" and **Text** (with parentheses)suffix';
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format text with Asian characters and parentheses', () => {
    const input = '**Sumiyoshi Nagaya(住吉の長屋)**suffix';
    const expected = '**Sumiyoshi Nagaya**(住吉の長屋)suffix';
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format text with single quotes and trailing text', () => {
    const input = "**'Church of Light'** mentioned";
    const expected = "'**Church of Light**' mentioned";
    expect(unbreak(input)).toBe(expected);
  });

  test('should process complex markdown text according to current behavior', () => {
    const input =
      '- **LLM의 현재 상태**: 대부분의 LLM은 **챗봇**으로 기능하며, OpenAI의 "5단계 프레임워크"를 기준으로 보면, 우리는 챗봇(레벨 1)과 추론자(reasoners, 레벨 2)에서 상당히 발전했습니다. 하지만 **에이전트(레벨 3)**, 즉 **행동을 수행하고 복잡한 작업을 처리하는 시스템**으로의 전환은 아직 초기 단계입니다.';
    const expected =
      '- **LLM의 현재 상태**: 대부분의 LLM은 **챗봇**으로 기능하며, OpenAI의 "5단계 프레임워크"를 기준으로 보면, 우리는 챗봇(레벨 1)과 추론자(reasoners, 레벨 2)에서 상당히 발전했습니다. 하지만 **에이전트**(레벨 3), 즉 **행동을 수행하고 복잡한 작업을 처리하는 시스템**으로의 전환은 아직 초기 단계입니다.';
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format complex quotes with bold text', () => {
    const input = "**Slow Ventures의 'Growth Buyout(GBO) 논리'**";
    const expected = "Slow Ventures의 '**Growth Buyout(GBO) 논리**'";
    expect(unbreak(input)).toBe(expected);

    const input2 = '필자는 **Slow Ventures의 ‘Growth Buyout(GBO) 논리’**에 부분적으로 동의합니다.';
    const expected2 =
      "필자는 Slow Ventures의 '**Growth Buyout(GBO) 논리**'에 부분적으로 동의합니다.";
    expect(unbreak(input2)).toBe(expected2);
  });

  test('should return the string unchanged if no patterns match', () => {
    const input = 'Normal text without any bold formatting';
    expect(unbreak(input)).toBe(input);
  });

  test('should handle empty strings', () => {
    expect(unbreak('')).toBe('');
  });

  test('should correctly format percentage text', () => {
    const input = '**21%** are bestsellers with over 100 paid subscribers';
    const expected = '**21**% are bestsellers with over 100 paid subscribers';
    expect(unbreak(input)).toBe(expected);
  });

  test('should handle multiple percentages', () => {
    const input = 'The difference between **50%** and **75%**';
    const expected = 'The difference between **50**% and **75**%';
    expect(unbreak(input)).toBe(expected);
  });

  test('should handle percentage with complex text', () => {
    const input = '**Growth rate (YoY) 25%**';
    const expected = '**Growth rate (YoY) 25**%'; // Move only percentage outside
    expect(unbreak(input)).toBe(expected);
  });

  test('should not create empty bold tags for percentage only', () => {
    const input = '**%**';
    const expected = '**%**'; // Should remain unchanged
    expect(unbreak(input)).toBe(expected);
  });

  test('should correctly format quotes with complex text', () => {
    const input =
      '오늘 이야기할 주제가 **"엔터프라이즈에 특화된 에이전트(Enterprise Aware Agents)를 어떻게 만들 것인가"**임을 밝힙니다.';
    const expected =
      '오늘 이야기할 주제가 "**엔터프라이즈에 특화된 에이전트(Enterprise Aware Agents)를 어떻게 만들 것인가**"임을 밝힙니다.';
    expect(unbreak(input)).toBe(expected);
  });

  test('should move bold inside quotes for multiple quoted words', () => {
    const input = 'Chau는 워크플로우와 에이전트를 각각 **"토요타"**와 **"테슬라"**에 비유합니다.';
    const expected =
      'Chau는 워크플로우와 에이전트를 각각 "**토요타**"와 "**테슬라**"에 비유합니다.';
    expect(unbreak(input)).toBe(expected);
  });

  test('should convert bold markdown links to standard format', () => {
    const input =
      '지난 두 달 동안 필자는 **Miro**와 긴밀히 협력하여 **[GTM Strategy Blueprint](https://mirohq.click/gtm-strategy-blueprint)**를 만들었습니다.';
    const expected =
      '지난 두 달 동안 필자는 **Miro**와 긴밀히 협력하여 [**GTM Strategy Blueprint**](https://mirohq.click/gtm-strategy-blueprint)를 만들었습니다.';

    expect(unbreak(input)).toBe(expected);
  });

  test('should move bold inside single quotes and parentheses for partial bold phrases', () => {
    const input =
      "논의는 AI가 **평균적인 역량을 끌어올리는 '바닥 올리기(floor raiser)'**인지, 아니면 **최고 수준의 역량을 더 높이는 '천장 올리기(ceiling raiser)'**인지에 집중되었습니다.";
    const expected =
      "논의는 AI가 평균적인 역량을 끌어올리는 '**바닥 올리기**(floor raiser)'인지, 아니면 최고 수준의 역량을 더 높이는 '**천장 올리기**(ceiling raiser)'인지에 집중되었습니다.";

    expect(unbreak(input)).toBe(expected);
  });

  test('should move bold inside quotes and parentheses for app names with explanations', () => {
    const input = `*   **Berkeley 학생의 "장학금 앱 (Scholar GPT)"**: 장학금 신청서를 자동으로 작성하는 데 어려움을 겪는 학생을 위한 앱으로, 항상 원했던 장학금 앱을 직접 만들고 있습니다.`;
    const expected = `*   Berkeley 학생의 "**장학금 앱** (Scholar GPT)": 장학금 신청서를 자동으로 작성하는 데 어려움을 겪는 학생을 위한 앱으로, 항상 원했던 장학금 앱을 직접 만들고 있습니다.`;

    expect(unbreak(input)).toBe(expected);
  });

  test('should not change bold inside single quotes', () => {
    const input =
      "그동안 지도 앱은 장소 검색이나 길 찾기 등 **'도구'** 성격이 강했습니다. 지도 서비스에서 '콘텐츠'를 본다는 것은 다소 어색하게 느껴졌죠. 하지만 자신의 취향을 드러내고 기록하며 공유하는 사용자들이 많아지면서 지도 서비스에도 콘텐츠가 쌓이기 시작했습니다. 과거 X(구 트위터)에서 유행했던 '추천 장소 타래'처럼, 이제는 지도 앱의 '찜' 기능과 연동하여 취향 장소 리스트를 쉽게 공유하고, 이를 공개 설정하여 누구나 볼 수 있는 **'큐레이션 콘텐츠'**로 활용하고 있습니다.";
    const expected =
      "그동안 지도 앱은 장소 검색이나 길 찾기 등 '**도구**' 성격이 강했습니다. 지도 서비스에서 '콘텐츠'를 본다는 것은 다소 어색하게 느껴졌죠. 하지만 자신의 취향을 드러내고 기록하며 공유하는 사용자들이 많아지면서 지도 서비스에도 콘텐츠가 쌓이기 시작했습니다. 과거 X(구 트위터)에서 유행했던 '추천 장소 타래'처럼, 이제는 지도 앱의 '찜' 기능과 연동하여 취향 장소 리스트를 쉽게 공유하고, 이를 공개 설정하여 누구나 볼 수 있는 '**큐레이션 콘텐츠**'로 활용하고 있습니다.";

    expect(unbreak(input)).toBe(expected);
  });

  test('should move bold inside single quotes and parentheses for Korean phrase with English explanation', () => {
    const input = '바로 **‘확장되지 않는 일(Do Things That Don’t Scale)’**입니다.';
    const expected = "바로 '**확장되지 않는 일**(Do Things That Don't Scale)'입니다.";

    expect(unbreak(input)).toBe(expected);
  });

  test('should move bold inside quotes and parentheses for complex nested phrases', () => {
    const input = `**가상의 AI 애플리케이션:** "**AI 기반의 비즈니스 이메일 자동화 및 최적화 솔루션 '메일마스터 (MailMaster)'**"`;
    const expected = `**가상의 AI 애플리케이션:** "AI 기반의 비즈니스 이메일 자동화 및 최적화 솔루션 '**메일마스터** (MailMaster)'"`;

    expect(unbreak(input)).toBe(expected);
  });

  test('should convert bold with Korean phrases and smart/double quotes to standard markdown style', () => {
    const input = `Guillermo Rauch는 **자동화를 향한 집착, 실시간 데이터 프레임워크 개발 경험, 그리고 첫 스타트업의 성공적인 엑싯**을 바탕으로 Vercel을 창업했습니다. 그는 기술적 변화뿐 아니라, 스타트업 CTO로서 **“최고의 개발 환경과 효율적인 CI/CD(지속적 통합, 배포) 시스템을 팀에 제공하는 것이 얼마나 강력한 혁신이 될 수 있는지”** 몸소 체감했다고 합니다.

> "내가 우리 팀에 해줬던 정말 혁신적인 일은, 코드의 CI/CD—즉, 코드를 쓰고 깃에 푸시하면 바로 실시간으로 URL에서 결과를 볼 수 있는 시스템을 만든 거였어요. 이 느낌이 곧 ‘내가 인터넷을 실시간으로 편집하는 것’ 같았죠."

Guillermo는 “**개발자가 새 노트북을 받을 때 느끼는 쾌적한 준비 상태**”처럼, 누구나 즉시 개발에 몰입할 수 있는 툴 환경을 만들고자 했다고 밝혔습니다. 그는 이런 경험을 바탕으로 “**개발자의 생산성과 행복, 그리고 클라우드 기술의 복잡성 간 간극을 줄여주는 것**”이야말로 거대한 비즈니스 기회라고 내다봤습니다.`;
    const expected = `Guillermo Rauch는 **자동화를 향한 집착, 실시간 데이터 프레임워크 개발 경험, 그리고 첫 스타트업의 성공적인 엑싯**을 바탕으로 Vercel을 창업했습니다. 그는 기술적 변화뿐 아니라, 스타트업 CTO로서 "**최고의 개발 환경과 효율적인 CI/CD(지속적 통합, 배포) 시스템을 팀에 제공하는 것이 얼마나 강력한 혁신이 될 수 있는지**" 몸소 체감했다고 합니다.

> "내가 우리 팀에 해줬던 정말 혁신적인 일은, 코드의 CI/CD—즉, 코드를 쓰고 깃에 푸시하면 바로 실시간으로 URL에서 결과를 볼 수 있는 시스템을 만든 거였어요. 이 느낌이 곧 '내가 인터넷을 실시간으로 편집하는 것' 같았죠."

Guillermo는 "**개발자가 새 노트북을 받을 때 느끼는 쾌적한 준비 상태**"처럼, 누구나 즉시 개발에 몰입할 수 있는 툴 환경을 만들고자 했다고 밝혔습니다. 그는 이런 경험을 바탕으로 "**개발자의 생산성과 행복, 그리고 클라우드 기술의 복잡성 간 간극을 줄여주는 것**"이야말로 거대한 비즈니스 기회라고 내다봤습니다.`;

    expect(unbreak(input)).toBe(expected);
  });

  test('should move italic inside double quotes for quoted phrase', () => {
    const input = `저자는 솔직하게 털어놓는다. *"정말 멋진 리더를 뽑기 위해선, 우선 본인이 리더로 성장해야 한다"*는 점이다. 그래서 코딩을 잠시 내려두고 **좋은 리더란 무엇일까 깊이 고민**하기로 마음먹는다. 20년의 시행착오 끝에, 그는 이렇게 요약한다.`;
    const expected = `저자는 솔직하게 털어놓는다. "*정말 멋진 리더를 뽑기 위해선, 우선 본인이 리더로 성장해야 한다*"는 점이다. 그래서 코딩을 잠시 내려두고 **좋은 리더란 무엇일까 깊이 고민**하기로 마음먹는다. 20년의 시행착오 끝에, 그는 이렇게 요약한다.`;

    expect(unbreak(input)).toBe(expected);
  });

  test('should move italic inside single quotes for quoted phrase', () => {
    const input = `진짜 리더십에는 필연적으로 힘든 결정이 따라온다. 중요한 사업 파트너와 결별하거나 인사 문제 등, *'되돌릴 수 없는 결정을 내려야 할 때, 정말 어려운 점은 정답을 확신할 수 없다는 것'*이라고 말한다. 그렇다고 결정을 미루면 조직 전체에 악영향을 미친다.`;
    const expected = `진짜 리더십에는 필연적으로 힘든 결정이 따라온다. 중요한 사업 파트너와 결별하거나 인사 문제 등, '*되돌릴 수 없는 결정을 내려야 할 때, 정말 어려운 점은 정답을 확신할 수 없다는 것*'이라고 말한다. 그렇다고 결정을 미루면 조직 전체에 악영향을 미친다.`;

    expect(unbreak(input)).toBe(expected);
  });

  describe('Italic punctuation rules', () => {
    test('should correctly format italic text with parentheses', () => {
      const input = '*Text (with parentheses)*';
      const expected = '*Text* (with parentheses)';
      expect(unbreak(input)).toBe(expected);
    });

    test('should correctly format italic text with parentheses and no space', () => {
      const input = '*Text(info)*';
      const expected = '*Text*(info)';
      expect(unbreak(input)).toBe(expected);
    });

    test('should correctly format italic quotes outside of text', () => {
      const input = '*"Some text"*';
      const expected = '"*Some text*"';
      expect(unbreak(input)).toBe(expected);
    });

    test('should correctly format italic single quotes outside of text', () => {
      const input = "*'Some text'*";
      const expected = "'*Some text*'";
      expect(unbreak(input)).toBe(expected);
    });

    test('should correctly format italic text with trailing text after parentheses', () => {
      const input = '*Text (with parentheses)*suffix';
      const expected = '*Text* (with parentheses)suffix';
      expect(unbreak(input)).toBe(expected);
    });

    test('should correctly format italic percentage text', () => {
      const input = '*21%* are bestsellers';
      const expected = '*21*% are bestsellers';
      expect(unbreak(input)).toBe(expected);
    });

    test('should convert italic markdown links to standard format', () => {
      const input = '*[text](url)*';
      const expected = '[*text*](url)';
      expect(unbreak(input)).toBe(expected);
    });

    test('should handle multiple italic replacements in a single string', () => {
      const input = '*\'Quote\'* and *"Another quote"* and *Text (with parentheses)*suffix';
      const expected = '\'*Quote*\' and "*Another quote*" and *Text* (with parentheses)suffix';
      expect(unbreak(input)).toBe(expected);
    });

    test('should handle italic text with Asian characters and parentheses', () => {
      const input = '*Sumiyoshi Nagaya(住吉の長屋)*suffix';
      const expected = '*Sumiyoshi Nagaya*(住吉の長屋)suffix';
      expect(unbreak(input)).toBe(expected);
    });

    test('should handle complex italic phrases with quotes and parentheses', () => {
      const input = "*Slow Ventures의 'Growth Buyout(GBO) 논리'*";
      const expected = "Slow Ventures의 '*Growth Buyout(GBO) 논리*'";
      expect(unbreak(input)).toBe(expected);
    });

    test('should not affect bold patterns when processing italic', () => {
      const input = '**Bold (text)** and *Italic (text)*';
      const expected = '**Bold** (text) and *Italic* (text)';
      expect(unbreak(input)).toBe(expected);
    });

    test('should handle mixed bold and italic patterns correctly', () => {
      const input = '**Bold%** and *Italic%* text';
      const expected = '**Bold**% and *Italic*% text';
      expect(unbreak(input)).toBe(expected);
    });
  });
});
