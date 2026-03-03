import React, { useState } from "react";
import "../css/App.css";

function LuckyDraw() {
  const [candidatesText, setCandidatesText] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [winners, setWinners] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

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
      <div className="page-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
        <div style={{ textAlign: "left", flex: 1 }}>
          <h2 className="page-title">🎲 럭키 드로우</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>후보를 쉼표(,)로 구분지어 입력하고 추첨을 진행하세요!</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <button className="btn-fullscreen" onClick={() => setIsFullScreen(!isFullScreen)}>
            {isFullScreen ? "↙️ 돌아가기" : "🔲 전체화면"}
          </button>
        </div>
      </div>

      <div className="game-container">
        <div style={{ marginBottom: "20px" }}>
          <div className="game-options-panel" style={{ marginBottom: "12px" }}>
            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>🔢 숫자 추가:</span>
            <input
              type="number"
              className="input-field"
              placeholder="시작"
              value={minNumber}
              onChange={(e) => setMinNumber(e.target.value)}
              disabled={isDrawing}
              style={{ width: "70px", padding: "8px", fontSize: "15px" }}
            />
            <span style={{ fontWeight: "bold" }}>~</span>
            <input
              type="number"
              className="input-field"
              placeholder="끝"
              value={maxNumber}
              onChange={(e) => setMaxNumber(e.target.value)}
              disabled={isDrawing}
              style={{ width: "70px", padding: "8px", fontSize: "15px" }}
            />
            <button className="btn-secondary" onClick={handleAddNumbers} disabled={isDrawing} style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700" }}>
              추가하기
            </button>
            <button
              className="btn-secondary"
              onClick={handleRemoveDuplicates}
              disabled={isDrawing || !candidatesText.trim()}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700", marginLeft: "4px" }}
            >
              중복제거
            </button>

            <div style={{ width: "1px", height: "24px", background: "var(--border-color)", margin: "0 4px" }}></div>

            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>당첨자 수:</span>
            <input
              type="number"
              className="input-field"
              value={winnerCount}
              onChange={(e) => setWinnerCount(parseInt(e.target.value, 10) || 1)}
              min="1"
              disabled={isDrawing}
              style={{ width: "70px", padding: "8px", fontSize: "16px", fontWeight: "bold", textAlign: "center" }}
            />
            <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>
              /{" "}
              {
                candidatesText
                  .split(",")
                  .map((c) => c.trim())
                  .filter((c) => c).length
              }
              명
            </span>

            <button
              className="btn-primary"
              onClick={handleDraw}
              disabled={isDrawing}
              style={{ padding: "10px 24px", fontSize: "16px", fontWeight: "800", borderRadius: "8px", marginLeft: "auto", boxShadow: "var(--shadow-sm)", flexGrow: 1, maxWidth: "200px" }}
            >
              {isDrawing ? `추첨 진행중...` : "🎉 추첨 시작!"}
            </button>
          </div>

          <textarea
            className="input-field"
            placeholder="참가자를 쉼표(,)로 구분지어 자유롭게 입력해 주세요. (예: 사과, 바나나, 포도, 딸기...)"
            value={candidatesText}
            onChange={(e) => setCandidatesText(e.target.value)}
            disabled={isDrawing}
            style={{ width: "100%", padding: "16px", resize: "vertical", minHeight: "120px", fontSize: "16px", lineHeight: "1.6", borderRadius: "12px", boxSizing: "border-box" }}
          ></textarea>
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
    </div>
  );
}

export default LuckyDraw;
