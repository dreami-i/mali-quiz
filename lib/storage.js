// 참가자 데이터 저장소
// - Vercel Storage(KV) 를 연결하면 Upstash Redis REST API를 통해 영구 저장됩니다.
//   Vercel 대시보드 > Storage > KV(Redis) 생성 후 프로젝트에 연결하면
//   KV_REST_API_URL / KV_REST_API_TOKEN 환경변수가 자동으로 주입됩니다.
// - KV가 연결되지 않은 로컬 개발 환경에서는 메모리 저장소로 동작합니다.
//   (서버리스 환경에서는 인스턴스가 재시작되면 초기화되므로, 운영 배포 시에는
//    반드시 Vercel KV(또는 Upstash Redis)를 연결해 주세요.)

const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const HASH_KEY = "phishing-quiz-participants";
const TEST_FIELD = "TEST_COUNT";

function hasKV() {
  return Boolean(KV_URL && KV_TOKEN);
}

// 서버리스 웜 인스턴스 사이에서라도 값을 유지하기 위해 globalThis에 보관
const g = globalThis;
if (!g.__quizMemoryStore) {
  g.__quizMemoryStore = {};
}
const memoryStore = g.__quizMemoryStore;

async function kvCommand(pathSegments) {
  const url = `${KV_URL}/${pathSegments.map((s) => encodeURIComponent(s)).join("/")}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`KV request failed with status ${res.status}`);
  }
  return res.json();
}

// { "1": "2026-...", "5": "2026-...", "TEST_COUNT": "3" } 형태로 반환
export async function getAllParticipants() {
  if (!hasKV()) {
    return { ...memoryStore };
  }
  const data = await kvCommand(["hgetall", HASH_KEY]);
  const flat = data.result || [];
  const obj = {};
  for (let i = 0; i < flat.length; i += 2) {
    obj[flat[i]] = flat[i + 1];
  }
  return obj;
}

// 참가자 번호(1~33) 또는 "TEST" 등록
// - 일반 번호: 동일 인물의 중복 제출을 덮어쓰기(1인 1카운트)
// - TEST: 테스트 목적상 제출할 때마다 카운트가 누적됨
// - KV 연결에 일시적 문제가 있어도 사용자에게는 "등록 실패"가 보이지 않도록
//   메모리 저장소로 폴백합니다 (서버 재시작 전까지는 유지됨).
export async function addParticipant(idRaw) {
  const id = String(idRaw).trim().toUpperCase();
  const timestamp = new Date().toISOString();

  if (id === "TEST") {
    if (!hasKV()) {
      memoryStore[TEST_FIELD] = (Number(memoryStore[TEST_FIELD]) || 0) + 1;
      return { ok: true, storage: "memory", testCount: memoryStore[TEST_FIELD] };
    }
    try {
      const result = await kvCommand(["hincrby", HASH_KEY, TEST_FIELD, "1"]);
      return { ok: true, storage: "kv", testCount: result.result };
    } catch (err) {
      memoryStore[TEST_FIELD] = (Number(memoryStore[TEST_FIELD]) || 0) + 1;
      return { ok: true, storage: "memory-fallback", testCount: memoryStore[TEST_FIELD] };
    }
  }

  if (!hasKV()) {
    memoryStore[id] = timestamp;
    return { ok: true, storage: "memory" };
  }
  try {
    await kvCommand(["hset", HASH_KEY, id, timestamp]);
    return { ok: true, storage: "kv" };
  } catch (err) {
    memoryStore[id] = timestamp;
    return { ok: true, storage: "memory-fallback" };
  }
}

export function isUsingKV() {
  return hasKV();
}

// 모든 참가자 데이터(1~33, TEST 카운트)를 삭제합니다.
export async function clearAllParticipants() {
  for (const key of Object.keys(memoryStore)) {
    delete memoryStore[key];
  }
  if (!hasKV()) {
    return { ok: true, storage: "memory" };
  }
  try {
    await kvCommand(["del", HASH_KEY]);
    return { ok: true, storage: "kv" };
  } catch (err) {
    return { ok: true, storage: "memory-fallback" };
  }
}

export const TEST_COUNT_FIELD = TEST_FIELD;
