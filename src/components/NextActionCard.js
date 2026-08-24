import React from "react";
import { Link } from "react-router-dom";

/**
 * NextActionCard Component
 * 
 * @param {Object} props
 * @param {string} props.badge - 카테고리 태그 (기본값: "NEXT STEP")
 * @param {string} props.title - 추천 헤드라인
 * @param {string} props.description - 맥락적 유도 문구
 * @param {string} props.buttonText - 이동 버튼 텍스트
 * @param {string} props.to - 대상 라우팅 경로
 */
function NextActionCard({
  badge = "NEXT STEP",
  title,
  description,
  buttonText,
  to
}) {
  return (
    <div className="next-action-banner mt24 mb20" style={{ marginTop: "24px", marginBottom: "20px" }}>
      <div className="flex items-center gap16 flex-wrap justify-between" style={{ width: "100%" }}>
        {/* Left Teaser Text Group */}
        <div className="flex-1" style={{ minWidth: "260px" }}>
          <div className="flex items-center gap8 mb6">
            <span className="next-action-badge">
              ⚡ {badge}
            </span>
          </div>
          {title && <h4 className="next-action-title m0 mb4">{title}</h4>}
          {description && <p className="next-action-desc m0">{description}</p>}
        </div>

        {/* Right CTA Button */}
        <Link to={to} className="next-action-btn flex-shrink-0">
          <span>{buttonText}</span>
        </Link>
      </div>
    </div>
  );
}

export default NextActionCard;
