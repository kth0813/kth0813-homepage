import React, { useState } from "react";

const Ladder = () => {
  const [participantCount, setParticipantCount] = useState(4);
  const [participants, setParticipants] = useState(["참가자1", "참가자2", "참가자3", "참가자4"]);
  const [results, setResults] = useState(["꽝", "당첨", "꽝", "꽝"]);

  const [ladderData, setLadderData] = useState(null);
  const [activePath, setActivePath] = useState(null);
  const [activeResultIdx, setActiveResultIdx] = useState(null);
  const [activeParticipantIdx, setActiveParticipantIdx] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleCountChange = (newCount) => {
    let count = parseInt(newCount, 10);
    if (isNaN(count)) return;
    if (count < 2) count = 2;
    if (count > 16) count = 16;

    setParticipantCount(count);

    const newP = [...participants];
    const newR = [...results];

    while (newP.length < count) newP.push(`참가자${newP.length + 1}`);
    while (newP.length > count) newP.pop();

    while (newR.length < count) newR.push("꽝");
    while (newR.length > count) newR.pop();

    setParticipants(newP);
    setResults(newR);
  };

  const handleParticipantChange = (idx, value) => {
    const newP = [...participants];
    newP[idx] = value;
    setParticipants(newP);
  };

  const handleResultChange = (idx, value) => {
    const newR = [...results];
    newR[idx] = value;
    setResults(newR);
  };

  const generateLadder = () => {
    if (isAnimating) return;

    const pList = participants.map((p) => (p.trim() ? p : "익명"));
    const rList = results.map((r) => (r.trim() ? r : "결과없음"));

    const rows = 10;
    const horizontalLines = [];

    for (let r = 0; r < rows; r++) {
      let c = 0;
      while (c < pList.length - 1) {
        if (Math.random() > 0.5) {
          horizontalLines.push({ row: r, col: c });
          c += 2;
        } else {
          c++;
        }
      }
    }

    setLadderData({
      participants: pList,
      results: rList,
      horizontalLines,
      rows
    });
    setActivePath(null);
    setActiveResultIdx(null);
    setActiveParticipantIdx(null);
  };

  const playLadder = (startCol) => {
    if (!ladderData || isAnimating) return;

    setActivePath(null);
    setActiveResultIdx(null);
    setActiveParticipantIdx(null);
    setIsAnimating(true);
    const path = [];
    let currentCol = startCol;

    path.push({ col: currentCol, row: -1 });

    for (let r = 0; r < ladderData.rows; r++) {
      path.push({ col: currentCol, row: r });

      const findRight = (line) => line.row === r && line.col === currentCol;
      const findLeft = (line) => line.row === r && line.col === currentCol - 1;

      const goingRight = ladderData.horizontalLines.find(findRight);
      const goingLeft = ladderData.horizontalLines.find(findLeft);

      if (goingRight) {
        currentCol++;
        path.push({ col: currentCol, row: r });
      } else if (goingLeft) {
        currentCol--;
        path.push({ col: currentCol, row: r });
      }
    }
    path.push({ col: currentCol, row: ladderData.rows });

    setActivePath(path);

    // Animate over 3 seconds
    setTimeout(() => {
      setActiveResultIdx(currentCol);
      setActiveParticipantIdx(startCol);
      setIsAnimating(false);
    }, 3000);
  };

  const playLadderReverse = (endCol) => {
    if (!ladderData || isAnimating) return;

    setActivePath(null);
    setActiveResultIdx(null);
    setActiveParticipantIdx(null);
    setIsAnimating(true);
    const path = [];
    let currentCol = endCol;

    path.push({ col: currentCol, row: ladderData.rows });

    for (let r = ladderData.rows - 1; r >= 0; r--) {
      path.push({ col: currentCol, row: r });

      const findRight = (line) => line.row === r && line.col === currentCol;
      const findLeft = (line) => line.row === r && line.col === currentCol - 1;

      const goingRight = ladderData.horizontalLines.find(findRight);
      const goingLeft = ladderData.horizontalLines.find(findLeft);

      if (goingRight) {
        currentCol++;
        path.push({ col: currentCol, row: r });
      } else if (goingLeft) {
        currentCol--;
        path.push({ col: currentCol, row: r });
      }
    }
    path.push({ col: currentCol, row: -1 });

    setActivePath(path);

    setTimeout(() => {
      setActiveParticipantIdx(currentCol);
      setActiveResultIdx(endCol);
      setIsAnimating(false);
    }, 3000);
  };

  const colWidth = 100;
  const rowHeight = 40;

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
          <h2 className="page-title">🔀 사다리 타기</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>참가자와 결과를 입력하고 사다리를 그려보세요!</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <button className="btn-fullscreen" onClick={() => setIsFullScreen(!isFullScreen)}>
            {isFullScreen ? "↙️ 돌아가기" : "🔲 전체화면"}
          </button>
        </div>
      </div>

      <div className="game-container mb32">
        <div className="mb24 flex items-end justify-between gap16" style={{ width: "100%" }}>
          <div style={{ flexShrink: 0 }}>
            <label className="font-bold text14 block mb8">참가 인원 (2명 ~ 16명)</label>
            <div className="flex items-center gap16">
              <button
                onClick={() => handleCountChange(participantCount - 1)}
                disabled={isAnimating || participantCount <= 2}
                className="btn-secondary px12 py8 rounded-md"
                style={{ fontWeight: "bold" }}
              >
                ➖
              </button>
              <input
                type="number"
                min="2"
                max="16"
                className="input-field text-center font-bold no-spinners"
                value={participantCount}
                onChange={(e) => handleCountChange(e.target.value)}
                disabled={isAnimating}
                style={{ width: "80px", fontSize: "16px", height: "42px", textAlign: "center" }}
              />
              <button
                onClick={() => handleCountChange(participantCount + 1)}
                disabled={isAnimating || participantCount >= 16}
                className="btn-secondary px12 py8 rounded-md"
                style={{ fontWeight: "bold" }}
              >
                ➕
              </button>
            </div>
          </div>
          <button onClick={generateLadder} className="btn-primary w-auto" style={{ height: "42px", padding: "0 24px", fontSize: "14px", whiteSpace: "nowrap", flexShrink: 0 }} disabled={isAnimating}>
            사다리 생성
          </button>
        </div>

        <div className="flex flex-col gap24 mb24">
          <div>
            <label className="font-bold text14 block mb8">참가자명</label>
            <div className="grid-cols-4 gap16">
              {participants.map((_, i) => (
                <div key={`p-input-${i}`} className="game-input-wrapper">
                  <div className="font-bold text12 text-muted w-6">#{i + 1}</div>
                  <input
                    type="text"
                    placeholder="참가자명"
                    className="input-field w-full text14"
                    value={participants[i]}
                    onChange={(e) => handleParticipantChange(i, e.target.value)}
                    disabled={isAnimating}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text14 block mb8">결과</label>
            <div className="grid-cols-4 gap16">
              {results.map((_, i) => (
                <div key={`r-input-${i}`} className="game-input-wrapper">
                  <div className="font-bold text12 text-muted w-6">#{i + 1}</div>
                  <input type="text" placeholder="결과" className="input-field w-full text14" value={results[i]} onChange={(e) => handleResultChange(i, e.target.value)} disabled={isAnimating} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {ladderData && (
        <div className="game-container" style={{ overflowX: "auto", textAlign: "center" }}>
          <div style={{ display: "inline-block", position: "relative" }}>
            <div className="flex" style={{ width: ladderData.participants.length * colWidth }}>
              {ladderData.participants.map((p, idx) => (
                <div key={`p-${idx}`} style={{ width: colWidth }} className="text-center">
                  <button
                    onClick={() => playLadder(idx)}
                    disabled={isAnimating}
                    className="btn-secondary px12 py8 text12 rounded-md mb8 whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{
                      maxWidth: "80px",
                      opacity: isAnimating && activeParticipantIdx !== idx ? 0.5 : 1,
                      backgroundColor: activeParticipantIdx === idx ? "var(--primary-color)" : "",
                      color: activeParticipantIdx === idx ? "white" : ""
                    }}
                  >
                    {p}
                  </button>
                </div>
              ))}
            </div>

            <svg width={ladderData.participants.length * colWidth} height={(ladderData.rows + 1) * rowHeight} style={{ overflow: "visible" }}>
              {ladderData.participants.map((_, i) => (
                <line key={`v-${i}`} x1={i * colWidth + colWidth / 2} y1={0} x2={i * colWidth + colWidth / 2} y2={(ladderData.rows + 1) * rowHeight} stroke="#e2e8f0" strokeWidth="4" />
              ))}
              {ladderData.horizontalLines.map((line, i) => (
                <line
                  key={`h-${i}`}
                  x1={line.col * colWidth + colWidth / 2}
                  y1={(line.row + 1) * rowHeight}
                  x2={(line.col + 1) * colWidth + colWidth / 2}
                  y2={(line.row + 1) * rowHeight}
                  stroke="#e2e8f0"
                  strokeWidth="4"
                />
              ))}

              {activePath && (
                <polyline
                  points={activePath.map((p) => `${p.col * colWidth + colWidth / 2},${(p.row + 1) * rowHeight}`).join(" ")}
                  fill="none"
                  stroke="var(--primary-color)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength="100"
                  style={{
                    strokeDasharray: 100,
                    strokeDashoffset: isAnimating ? 100 : 0,
                    animation: isAnimating ? "drawPath 3s linear forwards" : "none"
                  }}
                />
              )}
            </svg>

            <style>
              {`
                @keyframes drawPath {
                  from { stroke-dashoffset: 100; }
                  to { stroke-dashoffset: 0; }
                }
              `}
            </style>

            <div className="flex mt16" style={{ width: ladderData.participants.length * colWidth }}>
              {ladderData.results.map((r, idx) => (
                <div key={`r-${idx}`} style={{ width: colWidth }} className="text-center">
                  <button
                    onClick={() => playLadderReverse(idx)}
                    disabled={isAnimating}
                    style={{
                      maxWidth: "80px",
                      width: "100%",
                      padding: "8px 12px",
                      fontSize: "14px",
                      fontWeight: "800",
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: activeResultIdx === idx ? "var(--primary-color)" : "var(--border-color)",
                      backgroundColor: activeResultIdx === idx ? "var(--primary-color)" : "white",
                      color: activeResultIdx === idx ? "white" : "var(--text-main)",
                      opacity: isAnimating && activeResultIdx !== idx ? 0.5 : 1,
                      cursor: isAnimating ? "not-allowed" : "pointer",
                      boxShadow: activeResultIdx === idx ? "0 4px 12px rgba(59, 130, 246, 0.3)" : "none",
                      transition: "all 0.2s"
                    }}
                    className="whitespace-nowrap overflow-hidden text-ellipsis mx-auto"
                  >
                    {r}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ladder;
