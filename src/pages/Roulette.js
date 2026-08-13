import React, { useState, useEffect, useRef, useCallback } from "react";
import { dbService } from "../services/DbService";
import { showToast, showAlert } from "../utils/Alert";
import { IconRoulette, IconUser, IconClock } from "../components/Icons";
import PageHeader from "../components/PageHeader";

function triggerConfetti() {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "99999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#38bdf8"];
  const particles = Array.from({ length: 90 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height * 0.4,
    vx: (Math.random() - 0.5) * 18,
    vy: (Math.random() - 0.7) * 18,
    size: Math.random() * 8 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 12,
    opacity: 1
  }));

  let frame = 0;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.opacity -= 0.012;
      p.rotation += p.rSpeed;

      if (p.opacity > 0) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    frame++;
    if (frame < 120) {
      requestAnimationFrame(update);
    } else {
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    }
  }
  requestAnimationFrame(update);
}

const Roulette = () => {
  const [candidates, setCandidates] = useState([]);
  const [newCandidateName, setNewCandidateName] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

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
      }
    } catch (err) {
      console.error(err);
      showToast("참가자 목록을 불러오는 데 실패했습니다.", "error");
    }
  };

  const handleAddCandidate = (e) => {
    e.preventDefault();
    const trimmed = newCandidateName.trim();
    if (!trimmed) {
      showAlert("참가자 이름을 입력해주세요.");
      return;
    }
    const newEntry = {
      seq: `temp-${Date.now()}-${Math.random()}`,
      user_name: trimmed,
      gender: "N"
    };
    setCandidates((prev) => [...prev, newEntry]);
    setNewCandidateName("");
  };

  const handleRemoveCandidate = (index) => {
    if (isSpinning) return;
    setCandidates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    if (isSpinning) return;
    setCandidates([]);
  };

  const getSegmentColor = useCallback((index, total) => {
    // Harmonious Blue & Slate 6-color palette for clear adjacent contrast
    const colors = ["#3B82F6", "#475569", "#2563EB", "#64748B", "#1D4ED8", "#94A3B8"];
    return colors[index % colors.length];
  }, []);

  const getFontSize = useCallback((count, currentScale) => {
    let base = 22;
    if (count > 20) base = 14;
    else if (count > 12) base = 17;
    else if (count > 6) base = 20;
    return base * currentScale;
  }, []);

  const drawRoulette = useCallback(
    (ctx, centerX, centerY, radius, currentRotation, currentScale) => {
      if (!candidates || candidates.length === 0) {
        ctx.clearRect(0, 0, centerX * 2, centerY * 2);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = "#f8fafc";
        ctx.fill();
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#64748b";
        ctx.font = `bold ${18 * currentScale}px Pretendard, sans-serif`;
        ctx.fillText("참가자가 없습니다", centerX, centerY);
        return;
      }

      const arc = (Math.PI * 2) / candidates.length;
      ctx.clearRect(0, 0, centerX * 2, centerY * 2);

      const fontSize = getFontSize(candidates.length, currentScale);

      candidates.forEach((candidate, i) => {
        const angle = currentRotation + i * arc;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, angle, angle + arc, false);
        ctx.lineTo(centerX, centerY);
        ctx.fillStyle = getSegmentColor(i, candidates.length);
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.save();

        const textRadius = radius * 0.70;
        ctx.translate(centerX + Math.cos(angle + arc / 2) * textRadius, centerY + Math.sin(angle + arc / 2) * textRadius);
        ctx.rotate(angle + arc / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        ctx.font = `bold ${fontSize}px "Inter", "Pretendard", sans-serif`;

        let displayName = candidate.user_name || "";
        if (displayName.length > 8) {
          displayName = displayName.slice(0, 8) + "..";
        }
        ctx.fillText(displayName, 0, 0);
        ctx.restore();
      });
    },
    [candidates, getSegmentColor, getFontSize]
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
    setShowWinnerModal(false);

    const winnerIdx = Math.floor(Math.random() * candidates.length);
    const selectedWinner = candidates[winnerIdx];

    const arc = (Math.PI * 2) / candidates.length;
    const spins = Math.PI * 2 * 4;
    const finalRotation = spins - Math.PI / 2 - (winnerIdx + 0.5) * arc;

    let startTimestamp = null;
    const duration = 5500;
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
        setShowWinnerModal(true);
        triggerConfetti();
      }
    };

    requestAnimationFrame(animate);
  };

  const handleRemoveWinnerAndSpinAgain = () => {
    if (!winner) return;
    const winnerSeq = winner.seq;
    const updated = candidates.filter((c) => c.seq !== winnerSeq);
    setCandidates(updated);
    setShowWinnerModal(false);
    setWinner(null);

    if (updated.length > 0) {
      setTimeout(() => {
        // Trigger next spin smoothly
        const winnerIdx = Math.floor(Math.random() * updated.length);
        const selectedWinner = updated[winnerIdx];
        const arc = (Math.PI * 2) / updated.length;
        const spins = Math.PI * 2 * 4;
        const finalRotation = spins - Math.PI / 2 - (winnerIdx + 0.5) * arc;

        setIsSpinning(true);
        let startTimestamp = null;
        const duration = 5500;
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
            setShowWinnerModal(true);
            triggerConfetti();
          }
        };
        requestAnimationFrame(animate);
      }, 300);
    } else {
      showToast("더 이상 추첨할 참가자가 없습니다.", "info");
    }
  };

  return (
    <div className={isFullScreen ? "fullscreen-mode page-container" : "page-container"}>
      {/* Header Banner via PageHeader */}
      <PageHeader
        icon={IconRoulette}
        title="룰렛 돌리기 (Roulette)"
        description="참가자 명단으로 긴장감 넘치는 룰렛 추첨을 진행해보세요!"
      >
        <button className="btn-outline-sm font-semibold" onClick={() => setIsFullScreen(!isFullScreen)} style={{ height: "38px", padding: "0 16px", borderRadius: "8px" }}>
          {isFullScreen ? "↙️ 돌아가기" : "🔲 전체화면"}
        </button>
      </PageHeader>

      <div className="dashboard-card">
        {/* Wheel Box */}
        <div className="roulette-main-box">
          <div className="roulette-wheel-wrapper relative mx-auto mt10" style={{ width: `${wheelSize}px`, height: `${wheelSize}px` }}>
            {/* Top Pointer Arrow */}
            <div
              style={{
                position: "absolute",
                top: `-${25 * scale}px`,
                left: "50%",
                transform: "translateX(-50%)",
                width: "0",
                height: "0",
                borderLeft: `${22 * scale}px solid transparent`,
                borderRight: `${22 * scale}px solid transparent`,
                borderTop: `${44 * scale}px solid #0F172A`,
                zIndex: 10
              }}
            />
            <canvas ref={canvasRef} style={{ borderRadius: "50%", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }} />

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
                boxShadow: "0 6px 16px rgba(37, 99, 235, 0.3)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                border: `${4 * scale}px solid white`,
                background: "#2563EB",
                color: "white"
              }}
            >
              {isSpinning ? "추첨중" : "START"}
            </button>
          </div>
        </div>

        {/* Candidate ReadOnly & Management Panel */}
        <div className="mt32 pt24" style={{ borderTop: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb12 flex-wrap gap12">
            <div className="flex items-center gap8">
              <IconUser size={18} color="#2563EB" />
              <h4 className="text16 font-bold m0" style={{ color: "#0F172A" }}>
                참가자 대기 명단 ({candidates.length}명)
              </h4>
            </div>

            <div className="flex gap8 items-center flex-wrap">
              <button className="btn-primary" onClick={fetchCandidates} disabled={isSpinning} style={{ padding: "6px 14px", fontSize: "12px", background: "#2563EB", color: "white" }}>
                🔄 DB에서 다시 불러오기
              </button>
            </div>
          </div>

          <div className="p10 rounded-lg mb12 flex items-center gap8 text13" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", color: "#64748B" }}>
            <span style={{ fontSize: "14px" }}>ℹ️</span>
            <span>참가자 명단은 DB와 실시간 연동되어 있으며, 관리자 메뉴(룰렛 참가자 관리)에서 추가/수정이 가능합니다.</span>
          </div>

          {/* Read-Only Chip Tag Candidate List */}
          <div className="candidate-chip-list">
            {candidates.length > 0 ? (
              candidates.map((c, idx) => (
                <span key={c.seq || idx} className="candidate-chip">
                  <span>{c.user_name}</span>
                </span>
              ))
            ) : (
              <p className="text13 text-muted text-center w-full py12 m0">
                등록된 참가자가 없습니다. DB에서 다시 불러오기를 눌러주세요.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Winner Modal Overlay */}
      {showWinnerModal && winner && (
        <div className="winner-modal-overlay" onClick={() => setShowWinnerModal(false)}>
          <div className="winner-modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🎉</div>
            <h3 className="font-bold mb20" style={{ color: "#2563EB", fontSize: "28px", letterSpacing: "-0.5px" }}>
              당첨을 축하합니다!
            </h3>

            <div className="p24 rounded-xl" style={{ background: "#EFF6FF", border: "2px solid #BFDBFE", marginBottom: "28px" }}>
              <div style={{ fontSize: "34px", fontWeight: "800", color: "#0F172A" }}>
                {winner.user_name}
                {winner.gender === "M" ? " 형제" : winner.gender === "F" ? " 자매" : ""}
              </div>
            </div>

            <div className="flex justify-center" style={{ marginTop: "8px" }}>
              <button
                className="btn-primary"
                onClick={() => setShowWinnerModal(false)}
                style={{ padding: "12px 36px", background: "#2563EB", color: "white", fontSize: "16px", fontWeight: "700", borderRadius: "10px", width: "100%" }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roulette;
