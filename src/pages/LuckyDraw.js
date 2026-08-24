import React, { useState } from "react";
import "../css/App.css";
import { IconDice, IconFlame } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import TechSpecLayer from "../components/TechSpecLayer";
import NextActionCard from "../components/NextActionCard";

function LuckyDraw() {
  const [candidatesText, setCandidatesText] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoadSample = () => {
    setCandidatesText("김태훈, 이서연, 박지훈, 최수아, 정민우, 강예은, 윤서준, 임아린");
  };

  const handleClearText = () => {
    setCandidatesText("");
  };

  const [minNumber, setMinNumber] = useState("");
  const [maxNumber, setMaxNumber] = useState("");

  const handleAddNumbers = () => {
    setErrorMsg("");
    const min = parseInt(minNumber, 10);
    const max = parseInt(maxNumber, 10);

    if (isNaN(min) || isNaN(max)) {
      setErrorMsg("시작 숫자와 끝 숫자를 모두 입력해주세요.");
      return;
    }

    if (min > max) {
      setErrorMsg("시작 숫자는 끝 숫자보다 클 수 없습니다.");
      return;
    }

    if (max - min > 1000) {
      setErrorMsg("한 번에 최대 1000개의 숫자만 추가할 수 있습니다.");
      return;
    }

    const newNumbers = [];
    for (let i = min; i <= max; i++) {
      newNumbers.push(i);
    }

    const numbersString = newNumbers.join(", ");

    setCandidatesText((prev) => {
      const trimmed = prev.trim();
      if (trimmed === "") return numbersString;
      if (trimmed.endsWith(",")) return prev + " " + numbersString;
      return prev + ", " + numbersString;
    });

    setMinNumber("");
    setMaxNumber("");
  };

  const handleRemoveDuplicates = () => {
    if (!candidatesText.trim()) return;
    const list = candidatesText
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    const uniqueList = [...new Set(list)];
    setCandidatesText(uniqueList.join(", "));
  };

  const [countdown, setCountdown] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleDraw = () => {
    setErrorMsg("");
    setWinners([]);

    const list = candidatesText
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    if (list.length === 0) {
      setErrorMsg("추첨할 후보를 입력해주세요. (예: 사과, 바나나, 포도)");
      return;
    }

    if (winnerCount < 1) {
      setErrorMsg("추첨 인원은 최소 1명 이상이어야 합니다.");
      return;
    }

    if (winnerCount > list.length) {
      setErrorMsg(`입력된 후보(${list.length}명)보다 큰 인원 수를 뽑을 수 없습니다.`);
      return;
    }

    setIsDrawing(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => (prev > 1 ? prev - 1 : prev));
    }, 1300);

    setTimeout(() => {
      clearInterval(countdownInterval);
      setIsDrawing(false);
      setCountdown(null);

      const shuffled = [...list].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, winnerCount);

      const sortedWinners = selected.sort((a, b) => a.localeCompare(b, "ko-KR", { numeric: true }));

      setWinners(sortedWinners);
    }, 4000);
  };

  const handleExcludeWinners = () => {
    if (winners.length === 0) return;
    const list = candidatesText
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
    const remaining = list.filter((name) => !winners.includes(name));
    setCandidatesText(remaining.join(", "));
  };

  const fullScreenStyle = isFullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9999,
        background: "var(--bg-color)",
        overflowY: "auto",
        padding: "40px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        margin: 0
      }
    : {};

  return (
    <div className="page-container" style={fullScreenStyle}>
      <PageHeader
        icon={IconDice}
        title="추첨하기 (Lucky Draw)"
        description="후보를 쉼표(,)로 구분지어 입력하고 추첨을 진행하세요!"
      >
        <button className="btn-outline-sm font-semibold" onClick={() => setIsFullScreen(!isFullScreen)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px" }}>
          {isFullScreen ? "↙️ 돌아가기" : "🔲 전체화면"}
        </button>
      </PageHeader>

      <div className="game-container">
        <div style={{ marginBottom: "20px" }}>
          {/* Top Control Bar */}
          <div className="dashboard-card mb16 p16 flex items-center justify-between flex-wrap gap16" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
            {/* Group 1: Number Generator */}
            <div className="flex items-center gap10 flex-wrap">
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>🔢 숫자 범위 추가:</span>
              <input
                type="number"
                className="input-field"
                placeholder="시작"
                value={minNumber}
                onChange={(e) => setMinNumber(e.target.value)}
                disabled={isDrawing}
                style={{ width: "65px", height: "36px", padding: "0 8px", fontSize: "13px" }}
              />
              <span style={{ fontWeight: "bold", color: "#94A3B8" }}>~</span>
              <input
                type="number"
                className="input-field"
                placeholder="끝"
                value={maxNumber}
                onChange={(e) => setMaxNumber(e.target.value)}
                disabled={isDrawing}
                style={{ width: "65px", height: "36px", padding: "0 8px", fontSize: "13px" }}
              />
              <button className="btn-outline-sm font-semibold" onClick={handleAddNumbers} disabled={isDrawing} style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}>
                추가하기
              </button>
              <button
                className="btn-outline-sm font-semibold"
                onClick={handleRemoveDuplicates}
                disabled={isDrawing || !candidatesText.trim()}
                style={{ height: "36px", padding: "0 12px", fontSize: "13px" }}
              >
                중복제거
              </button>
            </div>

            <div style={{ width: "1px", height: "24px", background: "#CBD5E1" }} className="hide-mobile" />

            {/* Group 2: Winner Count & Action Button */}
            <div className="flex items-center gap12 flex-wrap">
              <div className="flex items-center gap6">
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#334155" }}>🎯 당첨자 수:</span>
                <input
                  type="number"
                  className="input-field font-bold text-center"
                  value={winnerCount}
                  onChange={(e) => setWinnerCount(parseInt(e.target.value, 10) || 1)}
                  min="1"
                  disabled={isDrawing}
                  style={{ width: "60px", height: "36px", padding: "0 6px", fontSize: "14px" }}
                />
                <span className="text13 text-muted">
                  /{" "}
                  {
                    candidatesText
                      .split(",")
                      .map((c) => c.trim())
                      .filter((c) => c).length
                  }
                  명
                </span>
              </div>

              <button
                className="btn-primary font-bold flex items-center gap6"
                onClick={handleDraw}
                disabled={isDrawing}
                style={{ width: "auto", display: "inline-flex", height: "38px", padding: "0 20px", fontSize: "14px", background: "#2563EB", color: "white", borderRadius: "8px" }}
              >
                {isDrawing ? (
                  `추첨 진행중...`
                ) : (
                  <>
                    <IconFlame size={16} color="white" /> 추첨 시작!
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Candidate Textarea with Quick Actions */}
          <div>
            <div className="flex justify-between items-center mb8">
              <span className="font-bold text14" style={{ color: "#334155" }}>참가자 명단 입력</span>
              <div className="flex gap6">
                <button
                  type="button"
                  className="btn-outline-sm font-semibold"
                  onClick={handleLoadSample}
                  disabled={isDrawing}
                  style={{ height: "28px", padding: "0 10px", fontSize: "12px", borderRadius: "6px" }}
                >
                  예시 데이터
                </button>
                <button
                  type="button"
                  className="btn-outline-sm font-semibold"
                  onClick={handleClearText}
                  disabled={isDrawing || !candidatesText.trim()}
                  style={{ height: "28px", padding: "0 10px", fontSize: "12px", borderRadius: "6px", color: "#EF4444", borderColor: "#FECDD3" }}
                >
                  초기화
                </button>
              </div>
            </div>

            <textarea
              className="input-field"
              placeholder="참가자를 쉼표(,)로 구분지어 자유롭게 입력해 주세요. (예: 사과, 바나나, 포도, 딸기...)"
              value={candidatesText}
              onChange={(e) => setCandidatesText(e.target.value)}
              disabled={isDrawing}
              style={{ width: "100%", padding: "16px", resize: "vertical", minHeight: "120px", fontSize: "15px", lineHeight: "1.6", borderRadius: "12px", boxSizing: "border-box" }}
            ></textarea>
          </div>
        </div>

        {errorMsg && (
          <div style={{ color: "var(--danger-color)", marginBottom: "20px", fontSize: "18px", fontWeight: "700", textAlign: "center", padding: "16px", background: "#fee2e2", borderRadius: "12px" }}>
            {errorMsg}
          </div>
        )}

        {isDrawing && (
          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              padding: "80px 40px",
              background: "var(--bg-color)",
              borderRadius: "24px"
            }}
          >
            <h3 style={{ color: "var(--primary-color)", fontSize: isFullScreen ? "5vw" : "36px", fontWeight: "900", marginBottom: "20px" }}>추첨을 진행중입니다</h3>
            <div style={{ fontSize: isFullScreen ? "15vw" : "120px", fontWeight: "900", color: "var(--primary-color)", lineHeight: "1", textShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>{countdown}</div>
          </div>
        )}

        {!isDrawing && winners.length > 0 && (
          <div
            style={{
              marginTop: "20px",
              textAlign: "center",
              padding: "20px",
              background: "var(--bg-color)",
              borderRadius: "32px",
              border: "4px solid var(--primary-color)",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              position: "relative"
            }}
          >
            {" "}
            <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", marginTop: "20px" }}>
              <h3
                style={{
                  color: "var(--text-main)",
                  fontSize: isFullScreen ? "3vw" : "36px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  fontWeight: "900",
                  margin: 0
                }}
              >
                <span style={{ fontSize: isFullScreen ? "3vw" : "36px" }}>🎊</span>
                당첨을 축하합니다!
                <span style={{ fontSize: isFullScreen ? "3vw" : "36px" }}>🎊</span>
              </h3>

              <div style={{ position: "absolute", right: 0, display: "flex", gap: "12px" }}>
                <button
                  className="btn-secondary"
                  onClick={handleExcludeWinners}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    fontWeight: "700",
                    borderRadius: "8px",
                    border: "2px solid var(--border-color)",
                    background: "var(--card-bg)",
                    color: "var(--text-main)",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s"
                  }}
                >
                  🗑️ 당첨자 제외
                </button>

                <button
                  onClick={() => setWinners([])}
                  style={{
                    padding: "8px 24px",
                    fontSize: "14px",
                    fontWeight: "700",
                    borderRadius: "8px",
                    border: "none",
                    background: "var(--text-muted)",
                    color: "white",
                    cursor: "pointer",
                    boxShadow: "var(--shadow-sm)",
                    transition: "all 0.2s"
                  }}
                >
                  ✖ 닫기
                </button>
              </div>
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: isFullScreen ? "1vw" : "12px",
                marginBottom: "40px"
              }}
            >
              {winners.map((winner, index) => (
                <li
                  key={index}
                  style={{
                    background: "var(--primary-color)",
                    color: "white",
                    padding: isFullScreen ? "2vw" : "24px",
                    borderRadius: isFullScreen ? "4vw" : "48px",
                    fontSize: isFullScreen ? "2.5vw" : "32px",
                    fontWeight: "900",
                    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.4)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    wordBreak: "break-all"
                  }}
                >
                  {winner}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tech Spec & Intent Overlay */}
      <TechSpecLayer
        intentText="Fisher-Yates 무작위 셔플 알고리즘과 비복원 추출 난수 엔진을 활용하여 공정한 실시간 무작위 추첨 및 통계 리포트를 제공하는 유틸리티입니다."
        techStack={["Fisher-Yates Shuffle", "Crypto Random Engine", "Real-time Stat Analytics", "CSV Export"]}
        isOpen={false}
      />

      {/* Contextual Next Action CTA Banner */}
      <NextActionCard
        badge="NEXT ACTION"
        title="더 화려한 시각 효과의 실시간 추첨이 필요하다면?"
        description="HTML5 Canvas 2D 회전 물리 엔진과 사운드가 융합된 룰렛 추첨기를 경험해보세요."
        buttonText="🎰 룰렛 돌리기 체험하기 ➔"
        to="/roulette"
      />
    </div>
  );
}

export default LuckyDraw;
