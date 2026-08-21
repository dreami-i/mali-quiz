"use client";

import { useState, useEffect, useRef } from "react";
import { QUESTION_POOL, QUESTIONS_PER_ROUND, TOTAL_PARTICIPANTS } from "@/lib/questions";

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRoundQuestions() {
  return shuffle(QUESTION_POOL).slice(0, QUESTIONS_PER_ROUND);
}

/* ---------- decorative icons (fun, cheerful, security themed) ---------- */
function LockIcon({ color }) {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <rect x="9" y="18" width="22" height="16" rx="4" fill={color} opacity="0.9" />
      <path d="M14 18v-5a6 6 0 0112 0v5" stroke={color} strokeWidth="3" fill="none" />
      <circle cx="20" cy="26" r="2.4" fill="#06110E" />
    </svg>
  );
}
function ShieldCheckIcon({ color }) {
  return (
    <svg viewBox="0 0 40 44" fill="none">
      <path d="M20 2 L36 8 V20 C36 30 29 37 20 41 C11 37 4 30 4 20 V8 Z" fill={color} opacity="0.9" />
      <path d="M13 21 L18 27 L28 14" stroke="#06110E" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SparkIcon({ color }) {
  return (
    <svg viewBox="0 0 30 30" fill="none">
      <path d="M15 0 L18 12 L30 15 L18 18 L15 30 L12 18 L0 15 L12 12 Z" fill={color} />
    </svg>
  );
}
function ThumbsUpIcon({ color }) {
  return (
    <svg viewBox="0 0 40 40" fill="none">
      <path d="M6 18h6v18H6zM14 18l6-13c2 0 4 2 4 5l-2 8h11c2 0 3 2 2 4l-4 12c-1 2-2 3-4 3H14V18z" fill={color} opacity="0.9" />
    </svg>
  );
}
function MailCheckIcon({ color }) {
  return (
    <svg viewBox="0 0 40 30" fill="none">
      <rect x="2" y="2" width="36" height="26" rx="4" fill="none" stroke={color} strokeWidth="2.6" />
      <path d="M4 4l16 14L36 4" fill="none" stroke={color} strokeWidth="2.6" />
      <circle cx="32" cy="24" r="9" fill="#06110E" stroke={color} strokeWidth="2.4" />
      <path d="M28 24l3 3l6-6" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const DECOR = [
  { Icon: ShieldCheckIcon, color: "var(--lime)", style: { top: "-26px", left: "-18px", width: 56 }, delay: "0s" },
  { Icon: LockIcon, color: "var(--sky)", style: { top: "10px", right: "-30px", width: 46 }, delay: "0.6s" },
  { Icon: SparkIcon, color: "var(--pink)", style: { top: "60%", left: "-40px", width: 30 }, delay: "1.1s" },
  { Icon: SparkIcon, color: "var(--amber)", style: { top: "-10px", right: "18%", width: 22 }, delay: "1.8s" },
  { Icon: ThumbsUpIcon, color: "var(--cyan)", style: { bottom: "-30px", right: "-16px", width: 48 }, delay: "0.3s" },
  { Icon: MailCheckIcon, color: "var(--lime)", style: { bottom: "-16px", left: "6%", width: 50 }, delay: "0.9s" },
];

function FunDecoration() {
  return (
    <>
      {DECOR.map((d, i) => (
        <div
          key={i}
          className={`fun-icon${d.Icon === SparkIcon ? " spin" : ""}`}
          style={{ ...d.style, animationDelay: d.delay }}
        >
          <d.Icon color={d.color} />
        </div>
      ))}
    </>
  );
}

function GuardHero() {
  return (
    <div className="guard-stage">
      <div className="guard-ring" />
      <div className="guard-ring r2" />
      {["m1", "m2", "m3"].map((cls) => (
        <div className={`mail ${cls}`} key={cls}>
          <svg viewBox="0 0 24 18" fill="none">
            <rect x="1" y="1" width="22" height="16" rx="2" stroke="#FF4D5E" strokeWidth="1.6" />
            <path d="M2 2L12 10L22 2" stroke="#FF4D5E" strokeWidth="1.6" />
          </svg>
        </div>
      ))}
      <div className="shield">
        <svg viewBox="0 0 150 170" fill="none">
          <path
            d="M75 6 L140 30 V80 C140 122 112 150 75 164 C38 150 10 122 10 80 V30 Z"
            fill="#0E1A2B"
            stroke="#29D9C2"
            strokeWidth="3"
          />
          <path
            d="M75 6 L140 30 V80 C140 122 112 150 75 164 C38 150 10 122 10 80 V30 Z"
            fill="url(#shieldGrad)"
            opacity="0.5"
          />
          <defs>
            <linearGradient id="shieldGrad" x1="10" y1="6" x2="140" y2="164" gradientUnits="userSpaceOnUse">
              <stop stopColor="#29D9C2" stopOpacity="0.35" />
              <stop offset="1" stopColor="#29D9C2" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="75" cy="66" r="15" fill="#EAF0FB" />
          <path
            d="M50 118 C50 96 60 86 75 86 C90 86 100 96 100 118 L100 128 C100 133 96 136 90 136 L60 136 C54 136 50 133 50 128 Z"
            fill="#EAF0FB"
          />
          <path d="M60 128 L52 150 M90 128 L98 150" stroke="#EAF0FB" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

function ShieldOkSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="26" fill="rgba(41,217,194,0.12)" stroke="#29D9C2" strokeWidth="2" />
      <path d="M18 29 L25 36 L39 20" stroke="#29D9C2" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ShieldBadSvg() {
  return (
    <svg viewBox="0 0 56 56" fill="none">
      <circle cx="28" cy="28" r="26" fill="rgba(255,77,94,0.12)" stroke="#FF4D5E" strokeWidth="2" />
      <path d="M20 20 L36 36 M36 20 L20 36" stroke="#FF4D5E" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

function fireConfetti(layerEl) {
  if (!layerEl) return;
  const colors = ["#8CE85C", "#29D9C2", "#FF6FB0", "#F5B942", "#B18CFF", "#4DD8FF"];
  const pieceCount = 90;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < pieceCount; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    const left = Math.random() * 100;
    const drift = Math.random() * 160 - 80 + "px";
    const duration = 2.6 + Math.random() * 1.8;
    const delay = Math.random() * 0.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 6 + Math.random() * 6;
    piece.style.left = left + "vw";
    piece.style.setProperty("--drift", drift);
    piece.style.animationDuration = duration + "s";
    piece.style.animationDelay = delay + "s";
    piece.style.background = color;
    piece.style.width = size + "px";
    piece.style.height = size * 1.5 + "px";
    piece.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
    frag.appendChild(piece);
  }
  layerEl.innerHTML = "";
  layerEl.appendChild(frag);
  setTimeout(() => {
    layerEl.innerHTML = "";
  }, 4800);
}

export default function HomePage() {
  const [view, setView] = useState("home");
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [modal, setModal] = useState(null); // { correct, isLast }
  const [numValue, setNumValue] = useState("");
  const [regStatus, setRegStatus] = useState(null); // { ok, message }
  const [submitting, setSubmitting] = useState(false);
  const confettiRef = useRef(null);

  const score = answers.filter((a) => a === "ok").length;
  const perfect = score === QUESTIONS_PER_ROUND;

  useEffect(() => {
    if (view === "result" && perfect) {
      fireConfetti(confettiRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  function startQuiz() {
    setQuestions(pickRoundQuestions());
    setCurrentQ(0);
    setAnswers([]);
    setShowHint(false);
    setRegStatus(null);
    setNumValue("");
    setView("quiz");
  }

  function onAnswer(idx) {
    const q = questions[currentQ];
    const correct = idx === q.correct;
    const nextAnswers = answers.slice();
    nextAnswers[currentQ] = correct ? "ok" : "fail";
    setAnswers(nextAnswers);
    setModal({ correct, isLast: currentQ === questions.length - 1 });
  }

  function nextAfterModal() {
    const wasLast = modal.isLast;
    setModal(null);
    if (wasLast) {
      setView("result");
    } else {
      setCurrentQ((c) => c + 1);
      setShowHint(false);
    }
  }

  function goToPrevQuestion() {
    if (currentQ === 0) return;
    setCurrentQ((c) => c - 1);
    setShowHint(false);
  }

  async function submitParticipant() {
    if (!numValue) return;
    setSubmitting(true);
    setRegStatus(null);
    try {
      const res = await fetch("/api/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number: numValue }),
      });
      const data = await res.json();
      if (data.ok) {
        setRegStatus({
          ok: true,
          message:
            numValue === "TEST"
              ? "TEST 계정으로 응시가 기록되었습니다."
              : `등록 완료 — 참가자 ${numValue}번, 미션 성공으로 기록되었습니다.`,
        });
      } else {
        setRegStatus({ ok: false, message: data.error || "등록에 실패했습니다." });
      }
    } catch (e) {
      setRegStatus({ ok: false, message: "네트워크 오류로 등록에 실패했습니다." });
    } finally {
      setSubmitting(false);
    }
  }

  const q = questions[currentQ];
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <div className={`app${view === "quiz" ? " quiz-view" : ""}`}>
      <div className="confetti-layer" ref={confettiRef} />
      <div className="topbar">
        <div className="brand">
          <span className="dot" />
          SECURITY AWARENESS DRILL
        </div>
        <a className="linklike" href="/stats">
          참여 현황 보기 →
        </a>
      </div>

      <main>
        <div className="view-wrap">
          {/* ---------------- HOME ---------------- */}
          {view === "home" && (
            <>
              <div className="home-eyebrow">MALICIOUS MAIL SIMULATION TRAINING</div>
              <h1 className="title">악성메일일까? 정상메일일까?</h1>
              <div className="subtitle">
                악성메일 <span className="bar">원천</span> 방어
              </div>
              <GuardHero />
              <div className="cta-wrap">
                <button className="cta" onClick={startQuiz}>
                  START
                </button>
              </div>
              <div className="home-foot">9문항 중 5문항 랜덤 출제 · 5지선다 · 전 문항 정답 시 미션 성공</div>
            </>
          )}

          {/* ---------------- QUIZ ---------------- */}
          {view === "quiz" && q && (
            <div className="quiz-stage">
              <FunDecoration />
              <div className="progress-row">
                <div className="progress-label">
                  방어선 <b>{currentQ + 1}</b> / {questions.length}
                </div>
                <div className="segments">
                  {questions.map((_, i) => (
                    <span key={i} className={answers[i] === "ok" ? "done" : answers[i] === "fail" ? "fail" : ""} />
                  ))}
                </div>
              </div>

              <div className="q-card">
                <div className="q-tag">{q.tag}</div>
                <div className="q-text">{q.text}</div>

                <div className="hint-row">
                  <button className="hint-toggle" onClick={() => setShowHint((s) => !s)}>
                    {showHint ? "힌트 숨기기" : "💡 힌트 보기"}
                  </button>
                  {showHint && <div className="hint-box">{q.hint}</div>}
                </div>

                <div className="options">
                  {q.options.map((opt, idx) => (
                    <button key={idx} className="option" disabled={!!modal} onClick={() => onAnswer(idx)}>
                      <span className="idx">{letters[idx]}</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
                <div className="q-nav-row">
                  <button className="prev-btn" disabled={currentQ === 0 || !!modal} onClick={goToPrevQuestion}>
                    ← 이전 문제로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- RESULT ---------------- */}
          {view === "result" && (
            <div className="result-card">
              <div className="result-score">
                SCORE {score} / {QUESTIONS_PER_ROUND}
              </div>
              {perfect ? (
                <>
                  <div className="result-title success">미션 성공</div>
                  <div className="result-desc">모든 위협 메일을 정확히 방어했습니다. 아래에 참가자 번호를 등록해 주세요.</div>
                  <div className="celebrate-box">
                    <div className="celebrate-line1">
                      미션성공을 축하합니다.
                      <button
                        type="button"
                        className="firework-btn"
                        title="클릭하면 축포가 다시 터져요"
                        aria-label="축포 다시 보기"
                        onClick={() => fireConfetti(confettiRef.current)}
                      >
                        🎆
                      </button>
                    </div>
                    <div className="celebrate-line2">
                      단 한번의 악성메일 클릭이 개인 및 회사에 큰 손해를 끼칠 수 있다는 점, 꼭 기억해주세요!
                    </div>
                  </div>
                  <div className="reg-block">
                    <div className="reg-label">참가자 번호를 선택하고 제출해 주세요 (1~33번, 테스트는 TEST)</div>
                    <div className="reg-row">
                      <select className="num-select" value={numValue} onChange={(e) => setNumValue(e.target.value)}>
                        <option value="" disabled>
                          참가자 번호 선택
                        </option>
                        <option value="TEST" className="test-opt">TEST (테스트 계정)</option>
                        {Array.from({ length: TOTAL_PARTICIPANTS }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n} className="number-opt">
                            {n}번
                          </option>
                        ))}
                      </select>
                      <button className="submit-btn" disabled={!numValue || submitting} onClick={submitParticipant}>
                        {submitting ? "제출 중..." : "제출"}
                      </button>
                    </div>
                    {regStatus && (
                      <div className={`reg-done${regStatus.ok ? "" : " err"}`}>{regStatus.message}</div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="result-title retry">방어체계 재정비 필요</div>
                  <div className="result-desc">일부 문항에서 위협을 놓쳤습니다. 다시 도전해서 전 문항을 방어해 보세요.</div>
                  <button className="retry-btn" onClick={startQuiz}>
                    다시 도전하기
                  </button>
                </>
              )}
              <div>
                <button className="home-link-btn" onClick={() => setView("home")}>
                  메인으로 돌아가기
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ---------------- MODAL ---------------- */}
      {modal && (
        <div className="modal-overlay">
          <div className={`modal-card${modal.correct ? "" : " shake"}`}>
            <div className="modal-icon">{modal.correct ? <ShieldOkSvg /> : <ShieldBadSvg />}</div>
            <div className={`modal-title ${modal.correct ? "ok" : "bad"}`}>
              {modal.correct ? "방어 성공" : "방어체계 위기 !"}
            </div>
            <div className="modal-desc">
              {modal.correct
                ? q.explanation
                : "잘못된 대응입니다. 이 유형의 메일에 다시 한번 주의가 필요합니다. 힌트를 참고해 다음 문제에 도전해 보세요."}
            </div>
            <button
              className={`modal-next ${modal.correct ? "ok-btn" : "bad-btn"}`}
              onClick={nextAfterModal}
            >
              {modal.isLast ? "결과 보기" : "다음 문제"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
