import React from "react";
import { Link } from "react-router-dom";
import "../css/App.css";
import { IconHome, IconFlame } from "../components/Icons";

const NotFound = () => {
  return (
    <div className="page-container flex justify-center items-center" style={{ minHeight: "65vh", padding: "40px 20px" }}>
      <div
        className="dashboard-card text-center p36"
        style={{
          maxWidth: "520px",
          width: "100%",
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)"
        }}
      >
        {/* 404 Badge Icon */}
        <div
          className="mb20 inline-flex items-center justify-center"
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#FEF2F2",
            border: "2px solid #FCA5A5",
            margin: "0 auto"
          }}
        >
          <IconFlame size={40} color="#EF4444" />
        </div>

        {/* 404 Code & Main Title */}
        <div className="text13 font-extrabold text-red-500 uppercase mb6" style={{ letterSpacing: "0.1em" }}>
          Error Code 404
        </div>
        <h1 className="text28 font-extrabold mb12" style={{ color: "#0F172A", letterSpacing: "-0.4px" }}>
          페이지를 찾을 수 없습니다
        </h1>

        {/* Subtitle Message */}
        <p className="text15 text-slate-600 m0 mb28" style={{ lineHeight: "1.6", wordBreak: "keep-all" }}>
          요청하신 페이지 경로가 존재하지 않거나, 삭제 또는 주소가 변경되었을 수 있습니다.<br />
          아래 버튼을 눌러 안전하게 메인 대시보드로 이동해 보세요.
        </p>

        {/* Action Button */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center gap8 font-bold"
            style={{
              padding: "12px 28px",
              background: "#2563EB",
              color: "white",
              borderRadius: "12px",
              fontSize: "14px",
              textDecoration: "none"
            }}
          >
            <IconHome size={18} color="white" />
            <span>메인 대시보드로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
