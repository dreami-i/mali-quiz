# 프로젝트 안내 문서 — 악성메일일까? 정상메일일까?

> 이 문서는 코드 전체를 읽고 정리한 **개발/운영 안내서**입니다. `README.md`(배포 중심)와 함께 참고하세요.

---

## 1. 프로젝트 개요

Next.js 14(App Router) 기반의 **악성메일(피싱) 모의훈련 퀴즈 웹앱**입니다.
사용자는 홈 화면에서 START를 누르고, 9개 문항 중 무작위로 뽑힌 5문항(5지선다)을 풀고,
전 문항 정답 시 참가자 번호(1~33)를 등록해 "미션 성공"을 기록합니다.
관리자는 `/stats` 페이지에서 참여 현황을 실시간으로 확인할 수 있습니다.

- 프레임워크: **Next.js 14.2.5** (App Router), React 18.3.1
- 스타일: 별도 CSS 프레임워크 없이 `app/globals.css`에서 커스텀 디자인 토큰(`--lime`, `--sky`, `--pink` 등) 사용
- 데이터 저장: **Vercel KV(Upstash Redis)**, 연결 안 되어 있으면 서버 메모리로 자동 폴백
- 배포 대상: Vercel (서버리스)

---

## 2. 폴더 구조와 각 파일의 역할

```
app/
  page.js                     메인+퀴즈+결과 화면 (클라이언트 컴포넌트, 앱의 핵심 로직)
  layout.js                   전역 레이아웃, 폰트(Google Fonts) 로드, 메타데이터
  globals.css                 전체 스타일/애니메이션 정의
  stats/
    page.js                   통계 화면 (서버 컴포넌트, force-dynamic)
    ResetButton.js             통계 초기화 버튼 (클라이언트 컴포넌트, 비밀번호 모달)
  api/participants/route.js   참가자 등록/조회/초기화 API (GET/POST/DELETE)
lib/
  questions.js                문제 풀(9문항) + 라운드당 문항 수(5), 전체 참가자 수(33) 상수
  storage.js                  KV 연동 + 메모리 폴백 저장소 로직
jsconfig.json                 `@/*` → 프로젝트 루트 경로 별칭
next.config.js                Next.js 설정 (reactStrictMode만 활성화)
package.json                  의존성: next, react, react-dom (그 외 라이브러리 없음)
```

---

## 3. 사용자 플로우 (app/page.js)

`page.js`는 `view` 상태값(`"home" | "quiz" | "result"`) 하나로 화면 전환을 제어하는
단일 컴포넌트 구조입니다.

1. **home**: 타이틀 + 방패 애니메이션(`GuardHero`) + START 버튼
2. **quiz**:
   - `startQuiz()`가 `QUESTION_POOL`을 셔플(Fisher–Yates, `shuffle()`)해서 5문항을 뽑음
   - 문항마다 힌트 토글, 5지선다 옵션, "이전 문제로 돌아가기" 버튼 제공
   - 답을 고르면 `onAnswer()`가 정답 여부를 `answers` 배열에 기록하고 모달(`modal`)을 띄움
     - 정답: "방어 성공" + `explanation` 표시
     - 오답: "방어체계 위기 !" + 카드 흔들림(`shake` 클래스)
   - 모달의 "다음 문제/결과 보기" 버튼(`nextAfterModal`)으로 다음 문항 또는 결과 화면 진행
3. **result**:
   - `score`(정답 개수)가 5(= `QUESTIONS_PER_ROUND`)면 `perfect = true`
   - **만점**: 컨페티 애니메이션(`fireConfetti`) + 참가자 번호(1~33 또는 TEST) 선택 후 `/api/participants`에 POST
   - **만점 실패**: "다시 도전하기" 버튼으로 `startQuiz()` 재호출(문항도 다시 랜덤 셔플)

> 주의: 점수 판정은 **전적으로 클라이언트(브라우저)** 에서 이루어집니다. 서버는 "정답을 몇 개 맞혔는지"를 검증하지 않고, 프런트에서 보낸 참가자 번호를 그대로 저장합니다. 즉 이론상 퀴즈를 풀지 않고 `/api/participants`에 직접 POST 요청을 보내도 등록이 됩니다. 사내 모의훈련처럼 신뢰된 인원만 접근하는 환경에서는 문제가 되지 않지만, 외부에 공개되는 서비스라면 참고할 부분입니다.

---

## 4. 문제 데이터 (lib/questions.js)

```js
export const TOTAL_PARTICIPANTS = 33;
export const QUESTIONS_PER_ROUND = 5;
export const QUESTION_POOL = [ /* 9개 문항 객체 */ ];
```

각 문항 객체 구조:

| 필드 | 설명 |
|---|---|
| `tag` | 문항 분류 라벨 (예: "BEC (경영진 사칭)") |
| `text` | 문제 본문 |
| `options` | 5지선다 보기 배열 |
| `correct` | 정답 인덱스 (0부터 시작) |
| `hint` | 힌트 버튼을 눌렀을 때 보여줄 텍스트 |
| `explanation` | 정답 시 모달에 보여줄 부연 설명 |

현재 9개 문항은 출처 불분명 메일, 첨부파일 위장, QR코드 피싱(큐싱), BEC(경영진 사칭),
사회공학(긴급성 유도), 링크 검증(hover), 링크 목적지 확인, MFA, 감염 후 초동 대응을 다룹니다.

**문항 추가/수정**: 이 배열에 객체를 추가/편집하기만 하면 되고, `QUESTIONS_PER_ROUND`(5)보다 많은
문항이 풀에 있으면 매번 그중 5개가 무작위로 출제됩니다.

---

## 5. 데이터 저장 구조 (lib/storage.js)

Redis 해시 하나(`HASH_KEY = "phishing-quiz-participants"`)에 다음과 같이 저장합니다.

```json
{ "1": "2026-08-21T...", "5": "2026-08-21T...", "TEST_COUNT": "3" }
```

- **일반 참가자(1~33)**: 필드 키 = 번호, 값 = ISO 타임스탬프. `HSET`으로 저장하므로
  같은 번호로 여러 번 제출해도 값만 덮어써지고 "등록됨" 여부만 의미가 있습니다(1인 1카운트).
- **TEST**: `TEST_COUNT` 필드를 `HINCRBY`로 1씩 누적 — 테스트 목적상 여러 번 눌러도 되도록 설계.
- **KV 미연결 시**: `globalThis.__quizMemoryStore`에 저장하는 인메모리 폴백. 서버리스 인스턴스가
  재시작되면(예: 배포/콜드스타트) 초기화됩니다. 로컬 개발이나 KV 연결 전 테스트에는 문제없지만,
  실제 운영 데이터 영구 보관에는 **반드시 Vercel KV 연결이 필요**합니다.
- **KV 장애 시 폴백**: `addParticipant()`는 KV 호출이 실패하면 조용히 메모리 저장소로 폴백합니다
  (`storage: "memory-fallback"`). 사용자에게는 등록 실패로 보이지 않지만, 이 경우 데이터가
  KV에는 반영되지 않았다는 뜻이므로 운영 중 모니터링이 필요하다면 이 폴백 케이스를 로깅하는 것도
  고려해볼 만합니다.

### API 엔드포인트 (`app/api/participants/route.js`)

| 메서드 | 동작 | 검증 |
|---|---|---|
| `GET` | 전체 참가자 데이터 조회 | 없음 |
| `POST` | 참가자 번호(1~33) 또는 `TEST` 등록 | 숫자 범위(1~33) 또는 `"TEST"` 문자열만 허용 |
| `DELETE` | 전체 참가자 데이터 삭제(초기화) | body의 `password`가 `"123123"`과 일치해야 함 |

---

## 6. 통계 화면 (app/stats)

- `page.js`는 서버 컴포넌트이며 `export const dynamic = "force-dynamic"`로 캐시를 끄고
  매 요청마다 최신 데이터를 가져옵니다.
- KV의 필드들을 순회하며 `TEST_COUNT`는 따로 집계하고, 나머지는 1~33 범위인지 검사해
  "참가자 번호" / "미참가자 번호" 두 그룹으로 나눠 보여줍니다.
- `ResetButton.js`(클라이언트 컴포넌트)는 "⟲ 초기화" 버튼 → 모달에서 비밀번호 입력 →
  `/api/participants`에 `DELETE` 요청 → 성공 시 `router.refresh()`로 통계 화면 갱신.

> **보안 참고사항**: 초기화 비밀번호(`123123`)가 `ResetButton.js`(클라이언트 코드)와
> `route.js`(서버 코드) 두 곳에 **평문으로 하드코딩**되어 있습니다. 서버 쪽 검증이 있어
> 실제 삭제는 API를 통과해야 하지만, 클라이언트 번들에 비밀번호 문자열이 그대로 노출되므로
> 브라우저 개발자도구로 소스를 열어보면 누구나 값을 알 수 있습니다. 사내 소규모 모의훈련용으로는
> 실용적인 타협이지만, 더 안전하게 하려면 비밀번호를 서버 환경변수로 옮기고 클라이언트에서는
> 사전 검증 없이 서버 응답 결과만으로 성공/실패를 판단하도록 바꾸는 것을 권장합니다.
> 또한 `/stats` 페이지 자체에 접근 인증이 없어 URL만 알면 누구나 조회·초기화 시도가 가능합니다.

---

## 7. 로컬 실행

```bash
npm install
npm run dev
```

`http://localhost:3000` 접속. KV 미연결 상태이므로 참가자 데이터는 서버 메모리에만 저장되고
`npm run dev`를 재시작하면 초기화됩니다.

## 8. 배포 (Vercel)

1. 이 저장소를 GitHub에 push (이미 `origin: dreami-i/mali-quiz`에 연결되어 있고 최신 상태입니다)
2. Vercel에서 New Project → 해당 저장소 Import → Next.js 자동 감지 → Deploy
3. **운영 데이터 영구 보관을 위해 Vercel KV 연결 필수**
   - Vercel 대시보드 → Storage → Create Database → KV(Redis) → 프로젝트에 Connect
   - 연결하면 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 환경변수가 자동 주입됨
   - 재배포하면 코드 수정 없이 자동으로 KV 저장 모드로 전환됨(`lib/storage.js`의 `hasKV()`가 감지)

---

## 9. 요약 체크리스트 (실제 모의훈련 전 확인사항)

- [ ] Vercel KV를 연결했는가 (안 하면 참가자 데이터가 재배포/콜드스타트 시 날아갈 수 있음)
- [ ] `lib/questions.js`의 문항이 이번 훈련 목적에 맞게 최신화되었는가
- [ ] 초기화 비밀번호(`123123`)를 그대로 쓸지, 더 안전한 값/환경변수로 바꿀지 결정했는가
- [ ] `/stats` URL을 관리자만 알고 있도록 공유 범위를 제한했는가 (접근 인증이 없으므로)
- [ ] 참가자 33명이라는 고정 값(`TOTAL_PARTICIPANTS`)이 실제 훈련 인원과 맞는가
