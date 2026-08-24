import React, { useState } from "react";

/**
 * TechSpecLayer Common Component
 * 
 * @param {Object} props
 * @param {string} props.intentText - 기획 의도 및 엔지니어링 목표 설명
 * @param {Array<string>} props.techStack - 주요 핵심 기술 스택 목록
 * @param {boolean} [props.isOpen=false] - 아코디언 초기 열림 상태
 */
function TechSpecLayer({ intentText, techStack = [], isOpen = false }) {
  const [expanded, setExpanded] = useState(isOpen);

  return (
    <div className="tech-spec-wrapper">
      {/* Accordion Header Toggle */}
      <div
        className="tech-spec-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
      >
        <div className="tech-spec-title-group">
          <span className="tech-spec-btn-chip">
            ⚙️ 기술 명세 & 기획 의도
          </span>
          <span className="tech-spec-hint hide-mobile">
            {expanded ? "엔지니어링 사양 접기" : "클릭하여 시뮬레이터 적용 스펙 및 기획 배경 확인"}
          </span>
        </div>

        <div className="flex items-center gap10">
          <span className="text12 font-semibold text-slate-500 hide-mobile">
            {techStack.length} Core Specs
          </span>
          <div className="tech-spec-toggle-icon">
            {expanded ? "▲" : "▼"}
          </div>
        </div>
      </div>

      {/* Accordion Content Area */}
      {expanded && (
        <div className="tech-spec-content">
          {/* 1. Planning Intent */}
          {intentText && (
            <div className="tech-spec-section">
              <div className="tech-spec-section-title">💡 PLANNING INTENT & ENGINEERING GOAL</div>
              <p className="tech-spec-intent-text">
                {intentText}
              </p>
            </div>
          )}

          {/* 2. Core Tech Stack */}
          {techStack.length > 0 && (
            <div className="tech-spec-section">
              <div className="tech-spec-section-title">⚡ CORE TECH STACK</div>
              <div className="tech-spec-chip-list">
                {techStack.map((tech, idx) => (
                  <span key={idx} className="tech-spec-chip-item">
                    # {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TechSpecLayer;
