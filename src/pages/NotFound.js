import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ textAlign: "center", padding: "100px 20px" }}>
      <h1 style={{ fontSize: "72px", color: "var(--primary-color)", marginBottom: "16px" }}>404</h1>
      <h2 style={{ fontSize: "24px", color: "var(--header-bg)", marginBottom: "24px" }}>페이지를 찾을 수 없어요.</h2>
      <p style={{ color: "var(--text-muted)", marginBottom: "40px" }}>요청하신 페이지가 존재하지 않거나, 이름이 변경되었거나, 일시적으로 사용이 중지되었습니다.</p>
      <button onClick={() => navigate("/")} className="btn-primary" style={{ width: "auto", padding: "12px 32px" }}>
        홈으로 돌아가기
      </button>
    </div>
  );
}

export default NotFound;
