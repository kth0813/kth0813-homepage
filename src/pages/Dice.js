import React, { useState, useEffect, useCallback } from "react";
import "../css/App.css";
import PageHeader from "../components/PageHeader";
import TechSpecLayer from "../components/TechSpecLayer";
import NextActionCard from "../components/NextActionCard";
import { IconDice } from "../components/Icons";
import { showToast, showAlert } from "../utils/Alert";

// --- Confetti Animation Helper ---
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

  const colors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#38BDF8", "#FACC15"];
  const particles = Array.from({ length: 90 }).map(() => ({
    x: canvas.width / 2,
    y: canvas.height * 0.4,
    vx: (Math.random() - 0.5) * 20,
    vy: (Math.random() - 0.7) * 18,
    size: Math.random() * 9 + 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rSpeed: (Math.random() - 0.5) * 14,
    opacity: 1
  }));

  let frame = 0;
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.38; // gravity
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
  update();
}

// --- Web Audio Synthesizer Sound Helper ---
function playRollSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Quick series of randomized click/thump sounds to simulate rolling
    for (let i = 0; i < 7; i++) {
      const startTime = now + i * 0.06 + Math.random() * 0.02;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = Math.random() > 0.5 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(250 + Math.random() * 700, startTime);
      osc.frequency.exponentialRampToValueAtTime(80, startTime + 0.04);

      gain.gain.setValueAtTime(0.35 - i * 0.04, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.05);
    }
  } catch (e) {
    // Audio context may be restricted by browser policy before user gesture
  }
}

// Target rotation degrees for 3D Cube faces
const FACE_ROTATIONS = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 }
};

// Calculate forward cumulative rotation angle to land precisely on target base degrees
function getNextRotation(currentRot = 0, targetBaseDeg = 0) {
  const currentMod = ((currentRot % 360) + 360) % 360;
  const targetMod = ((targetBaseDeg % 360) + 360) % 360;
  let diff = targetMod - currentMod;
  if (diff <= 0) diff += 360;
  const extraTurns = (Math.floor(Math.random() * 3) + 3) * 360;
  return currentRot + diff + extraTurns;
}

// Default Penalty Face Labels
const DEFAULT_PENALTY_ITEMS = [
  "☕ 커피 쏘기",
  "🍚 점심 쏘기",
  "🎤 노래 한 곡",
  "🧼 설거지 담당",
  "🍀 다음 기회에",
  "🎉 패스 (면제)"
];

function Dice() {
  const [activeTab, setActiveTab] = useState("standard"); // standard | penalty | rpg | battle
  const [diceCount, setDiceCount] = useState(2);
  const [diceTheme, setDiceTheme] = useState("classic"); // classic, crimson, cyber, gold, dark
  const [soundEnabled, setSoundEnabled] = useState(true);

  // States for Standard Dice
  const [isRolling, setIsRolling] = useState(false);
  const [diceList, setDiceList] = useState([
    { id: 1, value: 1, rotX: 0, rotY: 0 },
    { id: 2, value: 6, rotX: 0, rotY: 180 }
  ]);
  const [rollSummary, setRollSummary] = useState(null);

  // History & Statistics
  const [history, setHistory] = useState([]);
  const [faceStats, setFaceStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });

  // Penalty / Choice Dice States
  const [penaltyInputs, setPenaltyInputs] = useState(DEFAULT_PENALTY_ITEMS);
  const [penaltyResult, setPenaltyResult] = useState(null);
  const [penaltyDiceState, setPenaltyDiceState] = useState({ value: 1, rotX: 0, rotY: 0 });

  // RPG / Polyhedral Dice States
  const [rpgType, setRpgType] = useState(20); // D4, D6, D8, D10, D12, D20, D100
  const [rpgQuantity, setRpgQuantity] = useState(1);
  const [rpgModifier, setRpgModifier] = useState(0);
  const [rpgResult, setRpgResult] = useState(null);
  const [isRpgRolling, setIsRpgRolling] = useState(false);

  // 1v1 Battle Mode States
  const [battleDiceCount, setBattleDiceCount] = useState(2);
  const [p1Dice, setP1Dice] = useState([
    { id: "p1-1", value: 3, rotX: 0, rotY: -90 },
    { id: "p1-2", value: 4, rotX: 0, rotY: 90 }
  ]);
  const [p2Dice, setP2Dice] = useState([
    { id: "p2-1", value: 2, rotX: -90, rotY: 0 },
    { id: "p2-2", value: 5, rotX: 90, rotY: 0 }
  ]);
  const [battleWinner, setBattleWinner] = useState(null); // 'P1' | 'P2' | 'DRAW' | null
  const [battleScore, setBattleScore] = useState({ p1: 0, p2: 0, draws: 0 });
  const [isBattleRolling, setIsBattleRolling] = useState(false);

  // Update Standard Dice count
  useEffect(() => {
    setDiceList((prev) => {
      if (prev.length === diceCount) return prev;
      const newList = [];
      for (let i = 0; i < diceCount; i++) {
        if (prev[i]) {
          newList.push(prev[i]);
        } else {
          const val = Math.floor(Math.random() * 6) + 1;
          const rot = FACE_ROTATIONS[val];
          newList.push({
            id: i + 1,
            value: val,
            rotX: rot.x,
            rotY: rot.y
          });
        }
      }
      return newList;
    });
  }, [diceCount]);

  // Sync 1v1 Battle Dice count
  useEffect(() => {
    setP1Dice((prev) =>
      Array.from({ length: battleDiceCount }).map((_, idx) => {
        if (prev[idx]) return prev[idx];
        const val = Math.floor(Math.random() * 6) + 1;
        const rot = FACE_ROTATIONS[val];
        return { id: `p1-${idx}`, value: val, rotX: rot.x, rotY: rot.y };
      })
    );
    setP2Dice((prev) =>
      Array.from({ length: battleDiceCount }).map((_, idx) => {
        if (prev[idx]) return prev[idx];
        const val = Math.floor(Math.random() * 6) + 1;
        const rot = FACE_ROTATIONS[val];
        return { id: `p2-${idx}`, value: val, rotX: rot.x, rotY: rot.y };
      })
    );
  }, [battleDiceCount]);

  // Keyboard shortcut listener (Spacebar to roll)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && e.target === document.body) {
        e.preventDefault();
        if (activeTab === "standard" && !isRolling) handleRollStandard();
        else if (activeTab === "penalty" && !isRolling) handleRollPenalty();
        else if (activeTab === "rpg" && !isRpgRolling) handleRollRpg();
        else if (activeTab === "battle" && !isBattleRolling) handleRollBattle();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isRolling, isRpgRolling, isBattleRolling, diceCount, penaltyInputs, rpgType, rpgQuantity, rpgModifier, battleDiceCount]);

  // Roll Standard Dice
  const handleRollStandard = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    if (soundEnabled) playRollSound();

    const newDice = diceList.map((d) => {
      const nextVal = Math.floor(Math.random() * 6) + 1;
      const baseRot = FACE_ROTATIONS[nextVal];
      return {
        ...d,
        value: nextVal,
        rotX: getNextRotation(d.rotX, baseRot.x),
        rotY: getNextRotation(d.rotY, baseRot.y)
      };
    });

    setDiceList(newDice);

    setTimeout(() => {
      setIsRolling(false);
      const values = newDice.map((d) => d.value);
      const sum = values.reduce((a, b) => a + b, 0);
      const maxVal = Math.max(...values);
      const minVal = Math.min(...values);

      // Check special combos
      let comboName = "";
      const isAllSame = values.every((v) => v === values[0]);
      if (values.length > 1 && isAllSame) {
        comboName = `🔥 트리플/올세임 (${values[0]} 세트!)`;
        triggerConfetti();
      } else if (values.length >= 3) {
        const sorted = [...new Set(values)].sort((a, b) => a - b);
        if (sorted.length === values.length && sorted[sorted.length - 1] - sorted[0] === values.length - 1) {
          comboName = "✨ 연속 스트레이트!";
          triggerConfetti();
        }
      }

      if (!comboName && sum >= diceCount * 5) {
        comboName = "🎉 대박 고득점!";
      }

      setRollSummary({ values, sum, maxVal, minVal, comboName });

      // Update History & Stats
      const newHistoryItem = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        values,
        sum,
        comboName,
        mode: "일반 주사위"
      };

      setHistory((prev) => [newHistoryItem, ...prev.slice(0, 29)]);

      setFaceStats((prev) => {
        const updated = { ...prev };
        values.forEach((v) => {
          updated[v] = (updated[v] || 0) + 1;
        });
        return updated;
      });
    }, 1100);
  }, [isRolling, soundEnabled, diceList, diceCount]);

  // Roll Penalty / Choice Dice
  const handleRollPenalty = () => {
    if (isRolling) return;
    if (penaltyInputs.some((item) => !item.trim())) {
      showAlert("모든 주사위 면에 텍스트를 입력해주세요!");
      return;
    }
    setIsRolling(true);
    setPenaltyResult(null);
    if (soundEnabled) playRollSound();

    const selectedFace = Math.floor(Math.random() * 6) + 1;
    const baseRot = FACE_ROTATIONS[selectedFace];

    setPenaltyDiceState((prev) => ({
      value: selectedFace,
      rotX: getNextRotation(prev.rotX, baseRot.x),
      rotY: getNextRotation(prev.rotY, baseRot.y)
    }));

    setTimeout(() => {
      setIsRolling(false);
      const winnerText = penaltyInputs[selectedFace - 1];
      setPenaltyResult({ face: selectedFace, text: winnerText });
      triggerConfetti();

      setHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          values: [selectedFace],
          sum: selectedFace,
          comboName: `벌칙: ${winnerText}`,
          mode: "벌칙 주사위"
        },
        ...prev.slice(0, 29)
      ]);
    }, 1100);
  };

  // Roll RPG / Polyhedral Dice
  const handleRollRpg = () => {
    if (isRpgRolling) return;
    setIsRpgRolling(true);
    if (soundEnabled) playRollSound();

    setTimeout(() => {
      setIsRpgRolling(false);
      const rolls = [];
      for (let i = 0; i < rpgQuantity; i++) {
        rolls.push(Math.floor(Math.random() * rpgType) + 1);
      }
      const rawSum = rolls.reduce((a, b) => a + b, 0);
      const finalTotal = rawSum + rpgModifier;

      let critFlag = null;
      if (rpgType === 20 && rpgQuantity === 1) {
        if (rolls[0] === 20) critFlag = "NAT 20! 크리티컬 대성공! 🔥";
        else if (rolls[0] === 1) critFlag = "NAT 1! 크리티컬 대실패! 💀";
      }

      if (critFlag) triggerConfetti();

      setRpgResult({ rolls, rawSum, modifier: rpgModifier, total: finalTotal, critFlag });

      setHistory((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
          values: rolls,
          sum: finalTotal,
          comboName: `D${rpgType}x${rpgQuantity}${rpgModifier >= 0 ? "+" + rpgModifier : rpgModifier} ${critFlag || ""}`,
          mode: "TRPG 다면체"
        },
        ...prev.slice(0, 29)
      ]);
    }, 800);
  };

  // Roll 1v1 Battle Dice
  const handleRollBattle = () => {
    if (isBattleRolling) return;
    setIsBattleRolling(true);
    setBattleWinner(null);
    if (soundEnabled) playRollSound();

    const newP1 = p1Dice.map((d) => {
      const val = Math.floor(Math.random() * 6) + 1;
      const baseRot = FACE_ROTATIONS[val];
      return {
        ...d,
        value: val,
        rotX: getNextRotation(d.rotX, baseRot.x),
        rotY: getNextRotation(d.rotY, baseRot.y)
      };
    });

    const newP2 = p2Dice.map((d) => {
      const val = Math.floor(Math.random() * 6) + 1;
      const baseRot = FACE_ROTATIONS[val];
      return {
        ...d,
        value: val,
        rotX: getNextRotation(d.rotX, baseRot.x),
        rotY: getNextRotation(d.rotY, baseRot.y)
      };
    });

    setP1Dice(newP1);
    setP2Dice(newP2);

    setTimeout(() => {
      setIsBattleRolling(false);
      const sum1 = newP1.reduce((acc, cur) => acc + cur.value, 0);
      const sum2 = newP2.reduce((acc, cur) => acc + cur.value, 0);

      let winner = "DRAW";
      if (sum1 > sum2) {
        winner = "P1";
        triggerConfetti();
      } else if (sum2 > sum1) {
        winner = "P2";
        triggerConfetti();
      }

      setBattleWinner(winner);
      setBattleScore((prev) => ({
        p1: winner === "P1" ? prev.p1 + 1 : prev.p1,
        p2: winner === "P2" ? prev.p2 + 1 : prev.p2,
        draws: winner === "DRAW" ? prev.draws + 1 : prev.draws
      }));
    }, 1100);
  };

  // Helper for copying share link / results
  const handleCopyResult = () => {
    let resultText = "";
    if (activeTab === "standard" && rollSummary) {
      resultText = `[주사위 결과] 주사위 ${diceCount}개 던짐! 눈금: ${rollSummary.values.join(", ")} (총합: ${rollSummary.sum})`;
    } else if (activeTab === "penalty" && penaltyResult) {
      resultText = `[벌칙 주사위 결과] 당첨: ${penaltyResult.text} (${penaltyResult.face}번 눈금)`;
    } else if (activeTab === "rpg" && rpgResult) {
      resultText = `[TRPG 주사위 결과] D${rpgType} ${rpgQuantity}개: ${rpgResult.rolls.join(" + ")} (최종: ${rpgResult.total})`;
    } else if (activeTab === "battle" && battleWinner) {
      const p1Sum = p1Dice.reduce((a, b) => a + b.value, 0);
      const p2Sum = p2Dice.reduce((a, b) => a + b.value, 0);
      const winStr = battleWinner === "P1" ? "플레이어 1 승리!" : battleWinner === "P2" ? "플레이어 2 승리!" : "무승부!";
      resultText = `[주사위 대결] P1(${p1Sum}) vs P2(${p2Sum}) -> ${winStr}`;
    }

    if (!resultText) {
      showToast("공유할 최근 주사위 결과가 없습니다.");
      return;
    }

    navigator.clipboard.writeText(resultText);
    showToast("주사위 결과가 클립보드에 복사되었습니다! 📋");
  };

  // Reset face stats
  const handleResetStats = () => {
    setFaceStats({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    setHistory([]);
    showToast("통계 및 최근 기록이 초기화되었습니다.");
  };

  // Standard D6 Face Dot Rendering
  const renderDiceFaceDots = (faceNumber) => {
    switch (faceNumber) {
      case 1:
        return <div className="dot dot-center" />;
      case 2:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 3:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-center" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 4:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-top-right" />
            <div className="dot dot-bottom-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 5:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-top-right" />
            <div className="dot dot-center" />
            <div className="dot dot-bottom-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      case 6:
        return (
          <>
            <div className="dot dot-top-left" />
            <div className="dot dot-top-right" />
            <div className="dot dot-middle-left" />
            <div className="dot dot-middle-right" />
            <div className="dot dot-bottom-left" />
            <div className="dot dot-bottom-right" />
          </>
        );
      default:
        return null;
    }
  };

  // Render a Single 3D Cube (Standard or Custom Text Face)
  const render3DCube = (rotX, rotY, customFaceTexts = null, isMini = false) => {
    const sizeClass = isMini ? "cube-mini" : "";
    return (
      <div className={`dice-scene ${sizeClass}`}>
        <div
          className={`dice-cube theme-${diceTheme}`}
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg)`
          }}
        >
          {/* Face 1: Front */}
          <div className="cube-face face-front">
            {customFaceTexts ? <span className="custom-face-text">{customFaceTexts[0]}</span> : renderDiceFaceDots(1)}
          </div>
          {/* Face 2: Top */}
          <div className="cube-face face-top">
            {customFaceTexts ? <span className="custom-face-text">{customFaceTexts[1]}</span> : renderDiceFaceDots(2)}
          </div>
          {/* Face 3: Right */}
          <div className="cube-face face-right">
            {customFaceTexts ? <span className="custom-face-text">{customFaceTexts[2]}</span> : renderDiceFaceDots(3)}
          </div>
          {/* Face 4: Left */}
          <div className="cube-face face-left">
            {customFaceTexts ? <span className="custom-face-text">{customFaceTexts[3]}</span> : renderDiceFaceDots(4)}
          </div>
          {/* Face 5: Bottom */}
          <div className="cube-face face-bottom">
            {customFaceTexts ? <span className="custom-face-text">{customFaceTexts[4]}</span> : renderDiceFaceDots(5)}
          </div>
          {/* Face 6: Back */}
          <div className="cube-face face-back">
            {customFaceTexts ? <span className="custom-face-text">{customFaceTexts[5]}</span> : renderDiceFaceDots(6)}
          </div>
        </div>
      </div>
    );
  };

  const totalStatRolls = Object.values(faceStats).reduce((a, b) => a + b, 0);

  return (
    <div className="page-container" style={{ paddingBottom: "40px" }}>
      {/* Page Header */}
      <PageHeader
        icon={IconDice}
        iconColor="#2563EB"
        title="주사위 던지기 (3D Dice Roll)"
        description="스릴 넘치는 3D 주사위 굴리기! 기본 주사위, 벌칙 내기 주사위, TRPG 다면체 및 1v1 대결 모드를 즐겨보세요."
      >
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="btn-outline flex items-center gap6 text13"
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            background: soundEnabled ? "#EFF6FF" : "#F8FAFC",
            borderColor: soundEnabled ? "#3B82F6" : "#CBD5E1",
            color: soundEnabled ? "#2563EB" : "#64748B"
          }}
          title="효과음 설정"
        >
          <span>{soundEnabled ? "🔊 사운드 ON" : "🔇 사운드 OFF"}</span>
        </button>

        <button
          onClick={handleCopyResult}
          className="btn-outline flex items-center gap6 text13"
          style={{ padding: "6px 14px", borderRadius: "8px" }}
        >
          <span>📋 결과 공유</span>
        </button>
      </PageHeader>

      {/* Navigation Mode Tabs */}
      <div className="dice-tab-nav mb24">
        <button
          className={`dice-tab-btn ${activeTab === "standard" ? "active" : ""}`}
          onClick={() => setActiveTab("standard")}
        >
          🎲 기본 주사위 (1~6개)
        </button>
        <button
          className={`dice-tab-btn ${activeTab === "penalty" ? "active" : ""}`}
          onClick={() => setActiveTab("penalty")}
        >
          🎯 벌칙 / 내기 주사위
        </button>
        <button
          className={`dice-tab-btn ${activeTab === "rpg" ? "active" : ""}`}
          onClick={() => setActiveTab("rpg")}
        >
          ⚔️ TRPG 다면체 (D4~D100)
        </button>
        <button
          className={`dice-tab-btn ${activeTab === "battle" ? "active" : ""}`}
          onClick={() => setActiveTab("battle")}
        >
          🥊 1v1 주사위 대결
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap24">
        {/* Left 2 Columns: Main Interactive Stage */}
        <div className="lg:col-span-2 flex flex-col gap24">
          
          {/* TAB 1: STANDARD DICE MODE */}
          {activeTab === "standard" && (
            <div className="dashboard-card flex flex-col items-center justify-between" style={{ minHeight: "440px", padding: "28px" }}>
              {/* Controls Bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap16 mb20 pb16 border-b border-slate-100">
                <div className="flex items-center gap12">
                  <span className="font-semibold text14 text-slate-700">주사위 개수:</span>
                  <div className="flex gap6">
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        className={`dice-count-btn ${diceCount === num ? "active" : ""}`}
                        onClick={() => setDiceCount(num)}
                        disabled={isRolling}
                      >
                        {num}개
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap12">
                  <span className="font-semibold text14 text-slate-700">테마:</span>
                  <select
                    value={diceTheme}
                    onChange={(e) => setDiceTheme(e.target.value)}
                    className="dice-theme-select"
                    disabled={isRolling}
                  >
                    <option value="classic">⚪ 화이트 (클래식)</option>
                    <option value="crimson">🔴 루비 레드</option>
                    <option value="cyber">🔵 사이버 블루</option>
                    <option value="gold">🟡 로열 골드</option>
                    <option value="dark">🖤 흑曜석 (다크)</option>
                  </select>
                </div>
              </div>

              {/* 3D Dice Display Arena */}
              <div
                className="dice-stage flex flex-wrap items-center justify-center gap32 w-full my20 cursor-pointer"
                onClick={handleRollStandard}
                title="클릭하여 주사위 던지기"
              >
                {diceList.map((dice) => (
                  <div key={dice.id} className="dice-container-item">
                    {render3DCube(dice.rotX, dice.rotY)}
                  </div>
                ))}
              </div>

              {/* Result Banner */}
              {rollSummary && (
                <div className="dice-result-banner animate-bounce-short text-center w-full mb16">
                  <div className="text14 text-slate-500 font-medium">던진 결과 총합</div>
                  <div className="text36 font-black text-blue-600 my4" style={{ letterSpacing: "-1px" }}>
                    {rollSummary.sum}
                    <span className="text18 text-slate-400 font-normal ml8">
                      ({rollSummary.values.join(" + ")})
                    </span>
                  </div>
                  {rollSummary.comboName && (
                    <div className="inline-block bg-amber-100 text-amber-800 text13 font-bold px12 py4 rounded-full">
                      {rollSummary.comboName}
                    </div>
                  )}
                </div>
              )}

              {/* Roll Trigger Button */}
              <div className="w-full flex flex-col items-center gap8 mt12">
                <button
                  className="dice-roll-main-btn"
                  onClick={handleRollStandard}
                  disabled={isRolling}
                >
                  {isRolling ? "🎲 주사위가 구르는 중..." : "🎲 주사위 던지기! (Space)"}
                </button>
                <span className="text12 text-slate-400">
                  Tip: 키보드 Spacebar 키를 눌러 손쉽게 주사위를 던질 수 있습니다.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PENALTY / CHOICE DICE MODE */}
          {activeTab === "penalty" && (
            <div className="dashboard-card flex flex-col items-center" style={{ minHeight: "440px", padding: "28px" }}>
              <div className="w-full text-center mb20">
                <h3 className="text18 font-bold text-slate-800">🎯 벌칙 / 내기 주사위</h3>
                <p className="text13 text-slate-500 mt4">
                  주사위 6개의 면에 원하는 내기 항목이나 벌칙을 입력하고 던져보세요!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap24 w-full mb24 items-center">
                {/* 3D Dice Display */}
                <div className="flex flex-col items-center justify-center p16 bg-slate-50 rounded-xl" style={{ minHeight: "220px" }}>
                  {render3DCube(
                    penaltyDiceState.rotX,
                    penaltyDiceState.rotY,
                    penaltyInputs.map((val, idx) => `${idx + 1}. ${val.slice(0, 5)}`)
                  )}

                  {penaltyResult && (
                    <div className="mt20 text-center animate-fade-in">
                      <span className="text12 text-slate-400 block font-medium">선택된 눈금: {penaltyResult.face}번</span>
                      <span className="text22 font-extrabold text-blue-600 block mt2 bg-blue-50 px16 py8 rounded-lg border border-blue-200">
                        {penaltyResult.text}
                      </span>
                    </div>
                  )}
                </div>

                {/* 6 Face Inputs */}
                <div className="flex flex-col gap8">
                  <span className="text13 font-semibold text-slate-700 mb4">각 면 (1~6번) 항목 설정:</span>
                  {penaltyInputs.map((val, index) => (
                    <div key={index} className="flex items-center gap8">
                      <span className="w24 text13 font-bold text-slate-400 text-center">{index + 1}면</span>
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => {
                          const newInputs = [...penaltyInputs];
                          newInputs[index] = e.target.value;
                          setPenaltyInputs(newInputs);
                        }}
                        placeholder={`벌칙/선택 ${index + 1}`}
                        className="sidebar-search-input flex-1"
                        style={{ height: "34px", fontSize: "13px" }}
                        disabled={isRolling}
                      />
                    </div>
                  ))}
                  <button
                    className="btn-outline text12 mt6"
                    onClick={() => setPenaltyInputs(DEFAULT_PENALTY_ITEMS)}
                    disabled={isRolling}
                  >
                    🔄 기본 벌칙 예시로 복원
                  </button>
                </div>
              </div>

              <button
                className="dice-roll-main-btn"
                onClick={handleRollPenalty}
                disabled={isRolling}
              >
                {isRolling ? "🎯 벌칙 결정 중..." : "🎯 벌칙 주사위 굴리기! (Space)"}
              </button>
            </div>
          )}

          {/* TAB 3: TRPG / POLYHEDRAL DICE MODE */}
          {activeTab === "rpg" && (
            <div className="dashboard-card flex flex-col items-center" style={{ minHeight: "440px", padding: "28px" }}>
              <div className="w-full text-center mb20">
                <h3 className="text18 font-bold text-slate-800">⚔️ TRPG / 다면체 주사위 (Polyhedral)</h3>
                <p className="text13 text-slate-500 mt4">
                  D4, D6, D8, D10, D12, D20, D100 등 다양한 다면체 주사위와 보정치 판정을 수행합니다.
                </p>
              </div>

              {/* RPG Controls */}
              <div className="flex flex-wrap items-center justify-center gap16 mb24 w-full bg-slate-50 p16 rounded-xl border border-slate-200">
                <div className="flex items-center gap8">
                  <span className="text14 font-semibold text-slate-700">주사위 종류:</span>
                  <div className="flex gap4 flex-wrap">
                    {[4, 6, 8, 10, 12, 20, 100].map((type) => (
                      <button
                        key={type}
                        className={`dice-count-btn ${rpgType === type ? "active" : ""}`}
                        onClick={() => setRpgType(type)}
                        disabled={isRpgRolling}
                      >
                        D{type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap8">
                  <span className="text14 font-semibold text-slate-700">수량:</span>
                  <select
                    value={rpgQuantity}
                    onChange={(e) => setRpgQuantity(Number(e.target.value))}
                    className="dice-theme-select"
                    disabled={isRpgRolling}
                  >
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((q) => (
                      <option key={q} value={q}>{q}개</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap8">
                  <span className="text14 font-semibold text-slate-700">보정치 (+/-):</span>
                  <input
                    type="number"
                    value={rpgModifier}
                    onChange={(e) => setRpgModifier(Number(e.target.value))}
                    className="sidebar-search-input text-center"
                    style={{ width: "64px", height: "34px", fontSize: "14px" }}
                    disabled={isRpgRolling}
                  />
                </div>
              </div>

              {/* Polyhedral Visual Stage */}
              <div className="flex flex-col items-center justify-center my20 py20 w-full">
                <div className={`rpg-dice-orb ${isRpgRolling ? "rolling" : ""}`}>
                  <div className="rpg-dice-inner">
                    <span className="text14 font-bold text-slate-400 block mb2">D{rpgType}</span>
                    <span className="text36 font-black text-blue-600">
                      {isRpgRolling ? "?" : rpgResult ? rpgResult.total : rpgType}
                    </span>
                  </div>
                </div>

                {rpgResult && !isRpgRolling && (
                  <div className="mt20 text-center animate-fade-in">
                    {rpgResult.critFlag && (
                      <div className="text18 font-extrabold text-amber-600 mb8 animate-pulse">
                        {rpgResult.critFlag}
                      </div>
                    )}
                    <div className="text14 text-slate-600 font-medium">
                      개별 결과: [{rpgResult.rolls.join(", ")}] {rpgModifier !== 0 ? `| 보정: ${rpgModifier >= 0 ? "+" + rpgModifier : rpgModifier}` : ""}
                    </div>
                    <div className="text24 font-black text-slate-900 mt4">
                      최종 합계: <span className="text-blue-600">{rpgResult.total}</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                className="dice-roll-main-btn"
                onClick={handleRollRpg}
                disabled={isRpgRolling}
              >
                {isRpgRolling ? "⚔️ 다면체 굴리는 중..." : `⚔️ D${rpgType} x ${rpgQuantity} 굴리기! (Space)`}
              </button>
            </div>
          )}

          {/* TAB 4: 1v1 BATTLE MODE */}
          {activeTab === "battle" && (
            <div className="dashboard-card flex flex-col items-center" style={{ minHeight: "440px", padding: "28px" }}>
              <div className="w-full text-center mb16">
                <h3 className="text18 font-bold text-slate-800">🥊 1v1 주사위 대결 (High-Roll Battle)</h3>
                <p className="text13 text-slate-500 mt4">
                  두 플레이어가 동시에 주사위를 던져 높은 합계로 승부를 가립니다!
                </p>
              </div>

              <div className="w-full flex items-center justify-between gap16 mb16 pb12 border-b border-slate-100">
                <div className="flex items-center gap12">
                  <span className="font-semibold text14 text-slate-700">대결 주사위 개수:</span>
                  <div className="flex gap6">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        className={`dice-count-btn ${battleDiceCount === num ? "active" : ""}`}
                        onClick={() => setBattleDiceCount(num)}
                        disabled={isBattleRolling}
                      >
                        {num}개씩
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Scoreboard Header */}
              <div className="flex items-center justify-around w-full bg-slate-900 text-white py12 px24 rounded-xl mb24">
                <div className="text-center">
                  <span className="text12 text-blue-400 font-semibold block">PLAYER 1 (파란)</span>
                  <span className="text24 font-black">{battleScore.p1}승</span>
                </div>
                <div className="text-center border-x border-slate-700 px20">
                  <span className="text12 text-slate-400 font-semibold block">무승부</span>
                  <span className="text20 font-bold text-slate-300">{battleScore.draws}회</span>
                </div>
                <div className="text-center">
                  <span className="text12 text-rose-400 font-semibold block">PLAYER 2 (붉은)</span>
                  <span className="text24 font-black">{battleScore.p2}승</span>
                </div>
              </div>

              {/* Battle Arena */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap24 w-full mb24">
                {/* P1 Corner */}
                <div className="flex flex-col items-center p16 rounded-xl border-2 border-blue-200 bg-blue-50/40">
                  <span className="font-extrabold text15 text-blue-700 mb12">🔵 Player 1</span>
                  <div className="flex gap16 my10">
                    {p1Dice.map((d) => (
                      <div key={d.id}>{render3DCube(d.rotX, d.rotY, null, true)}</div>
                    ))}
                  </div>
                  <div className="mt12 text16 font-extrabold text-blue-900">
                    합계: {isBattleRolling ? "?" : p1Dice.reduce((a, b) => a + b.value, 0)}
                  </div>
                </div>

                {/* P2 Corner */}
                <div className="flex flex-col items-center p16 rounded-xl border-2 border-rose-200 bg-rose-50/40">
                  <span className="font-extrabold text15 text-rose-700 mb12">🔴 Player 2</span>
                  <div className="flex gap16 my10">
                    {p2Dice.map((d) => (
                      <div key={d.id}>{render3DCube(d.rotX, d.rotY, null, true)}</div>
                    ))}
                  </div>
                  <div className="mt12 text16 font-extrabold text-rose-900">
                    합계: {isBattleRolling ? "?" : p2Dice.reduce((a, b) => a + b.value, 0)}
                  </div>
                </div>
              </div>

              {/* Winner Reveal Banner */}
              {battleWinner && !isBattleRolling && (
                <div className="mb20 text-center animate-bounce-short">
                  {battleWinner === "P1" && (
                    <span className="text22 font-extrabold text-blue-600 bg-blue-100 px20 py10 rounded-full border border-blue-300">
                      🏆 Player 1 승리! 🎉
                    </span>
                  )}
                  {battleWinner === "P2" && (
                    <span className="text22 font-extrabold text-rose-600 bg-rose-100 px20 py10 rounded-full border border-rose-300">
                      🏆 Player 2 승리! 🎉
                    </span>
                  )}
                  {battleWinner === "DRAW" && (
                    <span className="text22 font-extrabold text-slate-700 bg-slate-200 px20 py10 rounded-full border border-slate-300">
                      🤝 무승부! 무승부!
                    </span>
                  )}
                </div>
              )}

              <button
                className="dice-roll-main-btn"
                onClick={handleRollBattle}
                disabled={isBattleRolling}
              >
                {isBattleRolling ? "🥊 대결 진행 중..." : "🥊 주사위 대결 시작! (Space)"}
              </button>
            </div>
          )}

        </div>

        {/* Right 1 Column: Stats & History Sidebar */}
        <div className="flex flex-col gap24">
          
          {/* Face Frequency Statistics */}
          <div className="dashboard-card p20">
            <div className="flex items-center justify-between mb16">
              <h4 className="font-bold text15 text-slate-800 flex items-center gap6">
                <span>📊 눈금 출현 통계</span>
              </h4>
              <button
                onClick={handleResetStats}
                className="text12 text-slate-400 hover:text-slate-600"
                title="통계 초기화"
              >
                초기화
              </button>
            </div>

            <div className="flex flex-col gap12">
              {[1, 2, 3, 4, 5, 6].map((face) => {
                const count = faceStats[face];
                const pct = totalStatRolls > 0 ? Math.round((count / totalStatRolls) * 100) : 0;
                return (
                  <div key={face} className="flex items-center gap12 text13">
                    <span className="w24 font-bold text-slate-700 text-center">{face}면</span>
                    <div className="flex-1 bg-slate-100 h12 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w60 text-right text-slate-500 font-medium">
                      {count}회 ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt16 pt12 border-t border-slate-100 text12 text-slate-400 text-center">
              총 {totalStatRolls}개 눈금 기록됨
            </div>
          </div>

          {/* Recent Roll History */}
          <div className="dashboard-card p20 flex-1 flex flex-col">
            <h4 className="font-bold text15 text-slate-800 mb16">
              📜 최근 던진 기록 (History)
            </h4>

            {history.length === 0 ? (
              <div className="text-center text-slate-400 py32 text13">
                아직 던진 기록이 없습니다. <br />
                주사위를 굴려보세요!
              </div>
            ) : (
              <div className="flex flex-col gap10 overflow-y-auto max-h400 pr4 custom-scrollbar">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text13"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {item.mode}: <span className="text-blue-600 font-extrabold">{item.sum}</span>
                        <span className="text11 text-slate-400 font-normal ml6">
                          ({item.values.join(", ")})
                        </span>
                      </div>
                      {item.comboName && (
                        <div className="text11 text-amber-700 font-medium mt2">
                          {item.comboName}
                        </div>
                      )}
                    </div>
                    <span className="text11 text-slate-400 whitespace-nowrap ml8">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Tech Spec & Intent Overlay */}
      <TechSpecLayer
        intentText="외부 라이브러리 없이 순수 CSS3 Preserved-3D Matrix와 Web Audio API 사운드 합성으로 구현된 무소스 3D 주사위 시뮬레이터입니다."
        techStack={["CSS3 Preserved-3D", "Web Audio API", "Matrix Transformation", "Confetti Canvas Engine"]}
        isOpen={false}
      />

      {/* Contextual Next Action CTA Banner */}
      <NextActionCard
        badge="NEXT ACTION"
        title="이 시뮬레이터들에 적용된 기술 스택과 개발 과정이 궁금하다면?"
        description="개발자 김태훈의 기술적 강점, 풀스택 아키텍처 커리어 및 주요 프로젝트 아카이브를 탐색하세요."
        buttonText="👨‍💻 주요 프로젝트 갤러리 탐색 ➔"
        to="/projects"
      />
    </div>
  );
}

export default Dice;
