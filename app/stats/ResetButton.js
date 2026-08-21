"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function openModal() {
    setPassword("");
    setError("");
    setOpen(true);
  }
  function closeModal() {
    if (busy) return;
    setOpen(false);
  }

  async function confirmReset() {
    if (password !== "123123") {
      setError("비밀번호가 올바르지 않습니다.");
      setPassword("");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/participants", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(data.error || "초기화에 실패했습니다.");
        setPassword("");
      }
    } catch (e) {
      setError("네트워크 오류로 초기화에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter") confirmReset();
  }

  return (
    <>
      <button className="reset-stats-btn" onClick={openModal}>
        ⟲ 초기화
      </button>

      {open && (
        <div className="modal-overlay" style={{ display: "flex" }}>
          <div className="modal-card">
            <div className="reset-modal-title">통계 초기화</div>
            <div className="reset-modal-desc">모든 참가자 데이터를 삭제합니다. 관리자 비밀번호를 입력해 주세요.</div>
            <input
              type="password"
              className="reset-pw-input"
              placeholder="비밀번호"
              autoComplete="off"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
            />
            {error && <div className="reset-pw-error">{error}</div>}
            <div className="reset-modal-btns">
              <button className="reset-cancel-btn" onClick={closeModal} disabled={busy}>
                취소
              </button>
              <button className="reset-confirm-btn" onClick={confirmReset} disabled={busy}>
                {busy ? "초기화 중..." : "초기화"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
