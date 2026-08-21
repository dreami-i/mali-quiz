import { getAllParticipants, TEST_COUNT_FIELD } from "@/lib/storage";
import { TOTAL_PARTICIPANTS } from "@/lib/questions";
import ResetButton from "./ResetButton";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  let data = {};
  let loadError = null;
  try {
    data = await getAllParticipants();
  } catch (e) {
    loadError = "데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }

  const doneSet = new Set();
  let testCount = 0;

  for (const key of Object.keys(data)) {
    if (key === TEST_COUNT_FIELD) {
      testCount = Number(data[key]) || 0;
      continue;
    }
    const n = Number(key);
    if (Number.isInteger(n) && n >= 1 && n <= TOTAL_PARTICIPANTS) {
      doneSet.add(n);
    }
  }

  const doneCount = doneSet.size;
  const pendingCount = TOTAL_PARTICIPANTS - doneCount;
  const doneNumbers = [];
  const pendingNumbers = [];
  for (let i = 1; i <= TOTAL_PARTICIPANTS; i++) {
    (doneSet.has(i) ? doneNumbers : pendingNumbers).push(i);
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          <span className="dot" />
          SECURITY AWARENESS DRILL
        </div>
        <a className="linklike" href="/">
          ← 메인으로
        </a>
      </div>

      <main>
        <div className="view-wrap">
          <div className="stats-header">
            <div className="eyebrow">TRAINING PARTICIPATION</div>
            <h2>모의훈련 참여 현황</h2>
            <ResetButton />
          </div>

          <div className="summary-grid">
            <div className="summary-card total">
              <div className="num">{TOTAL_PARTICIPANTS}</div>
              <div className="lbl">전체 인원</div>
            </div>
            <div className="summary-card done">
              <div className="num">{doneCount}</div>
              <div className="lbl">미션 성공 (참가)</div>
            </div>
            <div className="summary-card pending">
              <div className="num">{pendingCount}</div>
              <div className="lbl">미참가</div>
            </div>
            <div className="summary-card test">
              <div className="num">{testCount}</div>
              <div className="lbl">TEST 응시 횟수</div>
            </div>
          </div>

          <div className="stats-cols">
            <div className="stats-col done-col">
              <h3>✔ 참가자 번호</h3>
              <div className="num-grid">
                {doneNumbers.length === 0 ? (
                  <span className="empty-note">아직 참가자가 없습니다</span>
                ) : (
                  doneNumbers.map((n) => (
                    <div className="num-chip" key={n}>
                      {n}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="stats-col pending-col">
              <h3>· 미참가자 번호</h3>
              <div className="num-grid">
                {pendingNumbers.map((n) => (
                  <div className="num-chip" key={n}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="stats-refresh-note">
            {loadError ? loadError : "실시간 참여 데이터 · TEST 응시는 참가자 번호(1~33)와 별도로 집계됩니다"}
          </div>
        </div>
      </main>
    </div>
  );
}
