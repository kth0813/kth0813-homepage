import React, { useState } from "react";
import { IconLadder } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import TechSpecLayer from "../components/TechSpecLayer";
import NextActionCard from "../components/NextActionCard";

const Ladder = () => {
  const [participantCount, setParticipantCount] = useState(4);
  const [participants, setParticipants] = useState(["", "", "", ""]);
  const [results, setResults] = useState(["", "", "", ""]);

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

    while (newP.length < count) newP.push("");
    while (newP.length > count) newP.pop();

    while (newR.length < count) newR.push("");
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

  const fillNumbers = () => {
    const existingNumbers = new Set();
    results.forEach((r) => {
      const num = parseInt(r, 10);
      if (!isNaN(num)) existingNumbers.add(num);
    });

    let nextNum = 1;
    const newR = [...results];
    for (let i = 0; i < newR.length; i++) {
      if (!newR[i].trim()) {
        while (existingNumbers.has(nextNum)) {
          nextNum++;
        }
        newR[i] = String(nextNum);
        existingNumbers.add(nextNum);
      }
    }
    setResults(newR);
  };

  const fillBlanks = () => {
    const newR = [...results];
    for (let i = 0; i < newR.length; i++) {
      if (!newR[i].trim()) {
        newR[i] = "꽝";
      }
    }
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

      const goingRight = ladderData.horizontalLines.find((line) => line.row === r && line.col === path[path.length - 1].col);
      const goingLeft = ladderData.horizontalLines.find((line) => line.row === r && line.col === path[path.length - 1].col - 1);

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

      const goingRight = ladderData.horizontalLines.find((line) => line.row === r && line.col === path[path.length - 1].col);
      const goingLeft = ladderData.horizontalLines.find((line) => line.row === r && line.col === path[path.length - 1].col - 1);

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
      <PageHeader
        icon={IconLadder}
        title="사다리 타기 (Ladder)"
        description="참가자와 결과를 입력하고 사다리를 그려보세요!"
      >
        <button className="btn-outline-sm font-semibold" onClick={() => setIsFullScreen(!isFullScreen)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px" }}>
          {isFullScreen ? "↙️ 돌아가기" : "🔲 전체화면"}
        </button>
      </PageHeader>

      <div className="game-container mb32">
        <div className="mb32 flex items-center justify-between gap16" style={{ width: "100%" }}>
          <div className="flex items-center gap16 flex-shrink-0 flex-wrap">
            <div className="flex items-center gap10 flex-wrap">
              <div className="flex items-center gap6">
                <button
                  onClick={() => handleCountChange(participantCount - 1)}
                  disabled={isAnimating || participantCount <= 2}
                  className="btn-outline-sm font-bold flex items-center justify-center"
                  style={{ width: "38px", height: "38px", borderRadius: "8px" }}
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
                  style={{ width: "65px", fontSize: "15px", height: "38px", textAlign: "center", borderRadius: "8px" }}
                />
                <button
                  onClick={() => handleCountChange(participantCount + 1)}
                  disabled={isAnimating || participantCount >= 16}
                  className="btn-outline-sm font-bold flex items-center justify-center"
                  style={{ width: "38px", height: "38px", borderRadius: "8px" }}
                >
                  ➕
                </button>
              </div>
              <span className="badge-tech" style={{ fontSize: "11px", background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0", padding: "4px 10px", borderRadius: "6px", whiteSpace: "nowrap" }}>
                16명까지 가능
              </span>
            </div>
          </div>

          <div className="flex gap8 flex-wrap justify-end items-center">
            <button onClick={fillNumbers} className="btn-outline-sm font-semibold inline-flex items-center justify-center" style={{ height: "38px", padding: "0 16px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0, borderRadius: "8px", lineHeight: 1 }} disabled={isAnimating}>
              숫자 넣기
            </button>
            <button onClick={fillBlanks} className="btn-outline-sm font-semibold inline-flex items-center justify-center" style={{ height: "38px", padding: "0 16px", fontSize: "13px", whiteSpace: "nowrap", flexShrink: 0, borderRadius: "8px", lineHeight: 1 }} disabled={isAnimating}>
              꽝 넣기
            </button>
            <button onClick={generateLadder} className="btn-primary font-bold inline-flex items-center justify-center" style={{ width: "auto", height: "38px", padding: "0 20px", fontSize: "13px", background: "#2563EB", color: "white", whiteSpace: "nowrap", flexShrink: 0, borderRadius: "8px", lineHeight: 1 }} disabled={isAnimating}>
              사다리 생성
            </button>
          </div>
        </div>

        <div className="flex flex-col gap24 mb24">
          <div>
            <label className="font-bold text14 block mb8 mt16" style={{ color: "#1E40AF" }}>👤 참가자명</label>
            <div className="grid-cols-4 gap16">
              {participants.map((_, i) => (
                <div key={`p-input-${i}`} className="game-input-wrapper">
                  <div className="font-bold text12 text-muted w-6">#{i + 1}</div>
                  <input
                    type="text"
                    placeholder="참가자를 입력하세요"
                    className="input-field w-full text13 font-semibold"
                    style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "8px", color: "#1E3A8A" }}
                    value={participants[i]}
                    onChange={(e) => handleParticipantChange(i, e.target.value)}
                    disabled={isAnimating}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="font-bold text14 block mb8" style={{ color: "#065F46" }}>🎁 결과</label>
            <div className="grid-cols-4 gap16">
              {results.map((_, i) => (
                <div key={`r-input-${i}`} className="game-input-wrapper">
                  <div className="font-bold text12 text-muted w-6">#{i + 1}</div>
                  <input
                    type="text"
                    placeholder="결과를 입력하세요"
                    className="input-field w-full text13 font-semibold"
                    style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: "8px", color: "#064E3B" }}
                    value={results[i]}
                    onChange={(e) => handleResultChange(i, e.target.value)}
                    disabled={isAnimating}
                  />
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

      {/* Tech Spec & Intent Overlay */}
      <TechSpecLayer
        intentText="Dynamic Path Finder 알고리즘과 Canvas 좌표 동기화를 통해 당첨 경로 탐색 과정과 트레이스 애니메이션을 시각화한 사다리타기 시뮬레이터입니다."
        techStack={["Dynamic Path Finder", "Canvas Path Tracer", "SVG Coordinate Matrix", "Interactive Sound Engine"]}
        isOpen={false}
      />

      {/* Contextual Next Action CTA Banner */}
      <NextActionCard
        badge="NEXT ACTION"
        title="다른 방식의 무작위 추첨 유틸리티가 궁금하다면?"
        description="Fisher-Yates 무작위 셔플 알고리즘과 비복원 난수 추첨 시스템을 이용해보세요."
        buttonText="🎯 무작위 추첨하기 체험하기 ➔"
        to="/luckydraw"
      />
    </div>
  );
};

export default Ladder;
