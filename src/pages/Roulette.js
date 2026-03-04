import React, { useState, useEffect, useRef, useCallback } from "react";
import { dbService } from "../services/DbService";
import { showToast } from "../utils/Alert";

const Roulette = () => {
  const [candidatesText, setCandidatesText] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const canvasRef = useRef(null);
  const [rotation, setRotation] = useState(0);

  const wheelSize = isFullScreen ? 850 : 600;
  const scale = wheelSize / 600;

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await dbService.getRouletteCandidates();
      if (error) throw error;
      if (data) {
        setCandidates(data);
        const textStr = data.map((c) => c.user_name).join(", ");
        setCandidatesText(textStr);
      }
    } catch (err) {
      console.error(err);
      showToast("참가자 목록을 불러오는 데 실패했습니다.", "error");
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCandidatesText(val);

    // Parse text to generate candidates array for the wheel
    const names = val
      .split(",")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    const updatedCandidates = names.map((name, index) => ({
      seq: `temp-${index}`,
      user_name: name,
      gender: "N"
    }));
    setCandidates(updatedCandidates);
  };

  const getSegmentColor = useCallback((index, total) => {
    // Black & Blue color palette
    const colors = ["#3b82f6", "#334155", "#2563eb", "#38bdf8"];
    return colors[index % colors.length];
  }, []);

  const drawRoulette = useCallback(
    (ctx, centerX, centerY, radius, currentRotation, currentScale) => {
      if (!candidates || candidates.length === 0) {
        // Draw empty wheel
        ctx.clearRect(0, 0, centerX * 2, centerY * 2);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.fill();
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 16px Arial";
        ctx.fillText("참가자가 없습니다", centerX, centerY);
        return;
      }

      const arc = (Math.PI * 2) / candidates.length;
      ctx.clearRect(0, 0, centerX * 2, centerY * 2);

      candidates.forEach((candidate, i) => {
        const angle = currentRotation + i * arc;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = getSegmentColor(i, candidates.length);
        ctx.fill();
        ctx.save();

        const textRadius = radius * 0.75;
        ctx.translate(centerX + Math.cos(angle + arc / 2) * textRadius, centerY + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${18 * currentScale}px Pretendard, sans-serif`;
        ctx.fillText(candidate.user_name, 0, 0);
        ctx.restore();
      });
    },
    [candidates, getSegmentColor]
  );

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      const size = wheelSize;
      const dpr = window.devicePixelRatio || 1;
      canvasRef.current.width = size * dpr;
      canvasRef.current.height = size * dpr;
      ctx.scale(dpr, dpr);
      canvasRef.current.style.width = `${size}px`;
      canvasRef.current.style.height = `${size}px`;

      drawRoulette(ctx, size / 2, size / 2, size / 2 - 10, rotation, scale);
    }
  }, [candidates, rotation, drawRoulette, wheelSize, scale]);

  const handleSpin = () => {
    if (isSpinning || candidates.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    const winnerIdx = Math.floor(Math.random() * candidates.length);
    const selectedWinner = candidates[winnerIdx];

    const arc = (Math.PI * 2) / candidates.length;
    const spins = Math.PI * 2 * 4;
    const finalRotation = spins - Math.PI / 2 - (winnerIdx + 0.5) * arc;

    let startTimestamp = null;
    const duration = 6000;
    const startRotation = rotation % (Math.PI * 2);

    const animate = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;

      if (progress < duration) {
        const t = progress / duration;
        const easeOut = 1 - Math.pow(1 - t, 3);
        const currentR = startRotation + (finalRotation - startRotation) * easeOut;
        setRotation(currentR);
        requestAnimationFrame(animate);
      } else {
        setRotation(finalRotation);
        setIsSpinning(false);
        setWinner(selectedWinner);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className={isFullScreen ? "fullscreen-mode page-container" : "page-container"}>
      <div className="header-full-width mb24">
        <div className="text-left flex-1">
          <h2 className="page-title">🎡 룰렛 돌리기</h2>
          <p className="page-description mt8 mb0">데이터베이스에 등록된 참여자로 룰렛을 돌려보세요!</p>
        </div>
        <div className="text-right">
          <button className="btn-fullscreen" onClick={() => setIsFullScreen(!isFullScreen)}>
            {isFullScreen ? "↙️ 돌아가기" : "🔲 전체화면"}
          </button>
        </div>
      </div>

      <div className="game-container">
        <div className="roulette-main-box">
          <div className="roulette-wheel-wrapper relative mx-auto mt20" style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}>
            <div
              style={{
                position: "absolute",
                top: `-${25 * scale}px`,
                left: "50%",
                transform: "translateX(-50%)",
                width: "0",
                height: "0",
                borderLeft: `${24 * scale}px solid transparent`,
                borderRight: `${24 * scale}px solid transparent`,
                borderTop: `${48 * scale}px solid var(--header-bg)`,
                zIndex: 10,
                dropShadow: "0 4px 6px rgba(0,0,0,0.3)"
              }}
            ></div>
            <canvas ref={canvasRef} style={{ borderRadius: "50%", boxShadow: "var(--shadow-md)" }} />

            <button
              className="btn-primary"
              onClick={handleSpin}
              disabled={isSpinning || candidates.length === 0}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: `${100 * scale}px`,
                height: `${100 * scale}px`,
                borderRadius: "50%",
                fontSize: `${20 * scale}px`,
                fontWeight: "bold",
                boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                border: `${4 * scale}px solid white`
              }}
            >
              {isSpinning ? "추첨중" : "START"}
            </button>

            {winner && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  left: "0",
                  width: "100%",
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "50%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 30,
                  animation: "fadeIn 0.5s ease-out",
                  border: `${8 * scale}px solid var(--primary-color)`
                }}
              >
                <button
                  onClick={() => setWinner(null)}
                  style={{
                    position: "absolute",
                    top: `${40 * scale}px`,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: `${60 * scale}px`,
                    height: `${60 * scale}px`,
                    borderRadius: "50%",
                    background: "var(--bg-color)",
                    border: `${2 * scale}px solid var(--border-color)`,
                    fontSize: `${36 * scale}px`,
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease"
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = "var(--border-color)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = "var(--bg-color)";
                  }}
                  title="닫기"
                >
                  &times;
                </button>
                <h3 style={{ color: "var(--primary-color)", fontSize: `${36 * scale}px`, margin: `0 0 ${16 * scale}px 0`, textShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>🎉 축하합니다! 🎉</h3>
                <div style={{ fontSize: `${96 * scale}px`, fontWeight: "bold", color: "var(--header-bg)", textShadow: "0 4px 8px rgba(0,0,0,0.15)", marginTop: `${10 * scale}px` }}>
                  {winner.user_name}
                  {winner.gender === "M" ? " 형제" : winner.gender === "F" ? " 자매" : ""}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb16">
            <h4 className="text-16 m0">참가자 대기 명단 ({candidates.length}명)</h4>
            <button className="btn-secondary" onClick={fetchCandidates} disabled={isSpinning}>
              DB에서 다시 불러오기
            </button>
          </div>
          <div className="game-options-panel">
            <textarea className="input-field lucky-textarea" value={candidatesText} onChange={handleTextChange} disabled={isSpinning} placeholder="참가자를 쉼표(,)로 구분하여 입력하세요." />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
