import React from "react";
import { Link } from "react-router-dom";
import "../css/App.css";
import {
  IconProjects,
  IconGithub,
  IconCode,
  IconFlame,
  IconHome,
  IconExternal
} from "../components/Icons";

const Projects = () => {
  const practicalProjects = [
    {
      id: "P01",
      title: "아파트 관리 웹사이트 고도화",
      badge: "UI/UX & AI Prototyping",
      tags: ["React", "React-Quill", "AI Prototyping", "UI State Management"],
      desc: "React-Quill을 활용한 UI 상태 관리 기획 및 AI 프로토타이핑을 통한 검증 시간 단축으로 사용자의 리치 텍스트 작성 경험을 고도화하고 빠른 프로토타이핑 체계를 도입했습니다.",
      highlights: [
        "React-Quill 에디터 커스텀 컴포넌트 상태 관리 및 UX 기획",
        "AI 툴 기반 기술검증(PoC) 프로토타이핑으로 개발 리드타임 대폭 단축",
        "1년 장기 국가 과제 이기종 시스템 통합 대비 사전 요구사항 충돌 예방"
      ]
    },
    {
      id: "P02",
      title: "복잡한 회계 업무 시스템 구축",
      badge: "DB & Data Flow Optimization",
      tags: ["MSSQL", "DBeaver", "REST API", "Query Optimization"],
      desc: "DBeaver를 활용한 MSSQL 쿼리 병목 추적 및 데이터 플로우 역추적을 통한 백엔드/DB 아키텍처 최적화로 급여 계산 및 부가세 정산 데이터의 정밀도를 확보하고 휴먼 에러를 최소화했습니다.",
      highlights: [
        "DBeaver 모니터링 기반 MSSQL 쿼리 병목 지점 정밀 추적 및 인덱스 최적화",
        "복잡한 회계/급여/부가세 정산 프로시저 데이터 플로우 역추적 설계",
        "오차 없는 정밀 데이터 처리를 위한 고성능 REST API 구조 기획"
      ]
    },
    {
      id: "P03",
      title: "국가 과제 이기종 시스템 통합 연동",
      badge: "System Integration & Coordination",
      tags: ["System Integration", "React", "Vue2", "Cross-Platform API"],
      desc: "1년간 진행된 국가 과제에서 타 기업과의 이기종 시스템 통합 시 발생하는 요구사항 충돌을 사전에 조율하고 매끄러운 프론트엔드 연동과 데이터 파이프라인 연동을 주도했습니다.",
      highlights: [
        "타 기업 간 이기종 시스템 데이터 스펙 및 인터페이스 요구사항 사전 조율",
        "React / Vue2 기반 프론트엔드 크로스 플랫폼 모듈 연동 주도",
        "1년 장기 국가 과제 성공적 통합 배포 및 연동 완료"
      ]
    }
  ];

  const architectureStack = [
    { title: "Frontend Architecture", name: "React 18 + Vue2 / React Router", desc: "SPA 구조 기반의 유연한 컴포넌트 설계 및 상태 관리 기획으로 최상의 사용자 경험을 제공합니다." },
    { title: "Backend & Database", name: "Node.js Serverless + Neon PostgreSQL / MSSQL", desc: "안정적인 REST API 기획과 DBeaver 중심의 쿼리 병목 추적으로 고성능 데이터베이스 관리를 수행합니다." },
    { title: "Object Storage Engine", name: "Cloudflare R2 Storage", desc: "S3 호환 객체 스토리지를 도입하여 이미지 썸네일 캐싱과 게시물 첨부파일을 효율적으로 처리합니다." },
    { title: "Deployment Pipeline", name: "Vercel + AI Assisted Pipeline", desc: "AI 기반 프로토타이핑 체계와 자동 CI/CD 배포 파이프라인으로 개발 프로세스를 최적화합니다." }
  ];

  const dashboardFeatures = [
    {
      title: "개인 일정 관리 (Schedule System)",
      tags: ["React", "Day.js", "PostgreSQL"],
      desc: "월별/주별 일정 캘린더 그리드, 카테고리별 색상 구분 및 UTC-KST 타임존 동기화 정밀 보정 구현.",
      link: "/schedule"
    },
    {
      title: "계층형 게시판 & 파일 첨부 (Board System)",
      tags: ["React", "Cloudflare R2", "REST API"],
      desc: "카테고리별 게시판, 파일 업로드/다운로드, 댓글 기능 및 권한별 비공개 게시판 제어 구현.",
      link: "/board"
    },
    {
      title: "인터랙티브 파워 툴킷 (Lab & Utilities)",
      tags: ["Canvas 2D", "CSS Preserved-3D", "Web Audio"],
      desc: "3D 주사위 던지기 시뮬레이터, Canvas 룰렛, 사다리타기 유틸리티 3종 및 참가자 데이터 관리.",
      link: "/luckydraw"
    }
  ];

  return (
    <div className="page-container">
      {/* 🚀 Hero Header Card */}
      <div
        className="portfolio-hero-card mb24"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "28px",
          marginBottom: "24px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="flex justify-between items-start flex-wrap gap16">
          <div>
            <div className="flex items-center gap12 mb8 flex-wrap">
              <h1 className="page-title text28 m0 font-extrabold" style={{ color: "#0F172A", letterSpacing: "-0.4px" }}>
                Project Archive & Practical Experience
              </h1>
              <span
                className="badge-primary"
                style={{
                  background: "#EFF6FF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontWeight: "700"
                }}
              >
                Full-Stack & Service Architect
              </span>
            </div>
            <p className="text15 text-muted m0" style={{ lineHeight: "1.75", color: "#475569", wordBreak: "keep-all" }}>
              프론트엔드/백엔드/DB 아키텍처 기획, AI 기반 개발 환경 최적화, DBeaver 쿼리 병목 추적 및 이기종 시스템 통합 연동을 담은 실무 프로젝트 및 시스템 아카이브입니다.
            </p>
          </div>
          <a
            href="https://github.com/kth0813"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-sm flex items-center gap8 font-semibold"
            style={{ padding: "8px 16px", fontSize: "13px", borderRadius: "8px" }}
          >
            <IconGithub size={16} color="#334155" /> GitHub 저장소
          </a>
        </div>
      </div>

      {/* 🌟 Section Header Title 1 */}
      <div className="flex items-center gap10 mb16" style={{ paddingLeft: "4px" }}>
        <span className="p8 rounded-lg" style={{ background: "#EFF6FF", color: "#2563EB" }}>
          <IconProjects color="#2563EB" size={22} />
        </span>
        <div>
          <h2 className="text20 font-bold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
            핵심 실무 프로젝트 (Key Practical Projects)
          </h2>
          <span className="text13 text-slate-500">Core Real-World Engineering & Architecture Projects</span>
        </div>
      </div>

      {/* 📦 1. Independent Project White Cards */}
      <div className="flex flex-col gap24 mb32">
        {practicalProjects.map((proj) => (
          <div
            key={proj.id}
            className="dashboard-card p28 mb24"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              marginBottom: "0px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
            }}
          >
            {/* Title & Subtitle Hierarchy */}
            <div className="mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "16px" }}>
              <div className="flex items-center gap10 mb6 flex-wrap">
                <span
                  style={{
                    background: "#2563EB",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "6px"
                  }}
                >
                  {proj.id}
                </span>
                <h3 className="text22 font-extrabold m0" style={{ color: "#0F172A", letterSpacing: "-0.4px" }}>
                  {proj.title}
                </h3>
              </div>
              {/* Subtitle / Summary Badge placed directly below main title */}
              <div className="flex items-center gap8 mt8 flex-wrap">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#F0FDF4",
                    color: "#166534",
                    border: "1px solid #BBF7D0",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "700"
                  }}
                >
                  🏷️ {proj.badge}
                </span>
              </div>
            </div>

            {/* Description Text */}
            <p className="text15 text-slate-700 m0 mb20" style={{ lineHeight: "1.75", wordBreak: "keep-all" }}>
              {proj.desc}
            </p>

            {/* Clean SVG Bulleted Achievements List with 10px spacing & 12px gap */}
            <div className="p20 rounded-xl bg-slate-50 border border-slate-200 mb20">
              <div className="text13 font-bold text-slate-800 mb12 flex items-center gap6">
                <span>💡 기획 & 엔지니어링 주요 성과</span>
              </div>
              <ul className="m0 p0 flex flex-col gap10" style={{ listStyleType: "none" }}>
                {proj.highlights.map((item, hIdx) => (
                  <li key={hIdx} className="flex items-start gap12 text14 text-slate-700" style={{ lineHeight: "1.65", marginBottom: "2px" }}>
                    <span style={{ color: "#2563EB", flexShrink: 0, marginTop: "2px" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    <span style={{ wordBreak: "keep-all" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modern Unified Tech Stack Chips */}
            <div className="flex flex-wrap gap8 items-center pt4">
              <span className="text12 font-bold text-slate-400 mr4 uppercase" style={{ letterSpacing: "0.05em" }}>
                Core Tech:
              </span>
              {proj.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "5px 14px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#1D4ED8",
                    background: "#EFF6FF",
                    border: "1px solid #BFDBFE",
                    borderRadius: "20px",
                    boxShadow: "0 1px 2px rgba(37, 99, 235, 0.05)"
                  }}
                >
                  # {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🧩 Section Header Title 2 */}
      <div className="flex items-center gap10 mb16" style={{ paddingLeft: "4px" }}>
        <span className="p8 rounded-lg" style={{ background: "#F0FDF4", color: "#16A34A" }}>
          <IconCode color="#16A34A" size={22} />
        </span>
        <div>
          <h2 className="text20 font-bold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
            시스템 아키텍처 & 개발 프로세스 (System Architecture)
          </h2>
          <span className="text13 text-slate-500">End-to-End Infrastructure & AI Optimization</span>
        </div>
      </div>

      {/* 🧩 2. Standalone Architecture Mini Cards Grid */}
      <div className="grid-cols-2-md gap20 mb32">
        {architectureStack.map((arch, idx) => (
          <div
            key={idx}
            className="dashboard-card p24 flex flex-col justify-between"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
            }}
          >
            <div>
              <div className="text11 font-extrabold text-blue-600 uppercase mb6" style={{ letterSpacing: "0.06em" }}>
                {arch.title}
              </div>
              <h4 className="text17 font-extrabold mb10" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
                {arch.name}
              </h4>
              <p className="text14 text-slate-600 m0" style={{ lineHeight: "1.65", wordBreak: "keep-all" }}>
                {arch.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 📱 Section Header Title 3 */}
      <div className="flex items-center gap10 mb16" style={{ paddingLeft: "4px" }}>
        <span className="p8 rounded-lg" style={{ background: "#FFF7ED", color: "#EA580C" }}>
          <IconFlame color="#EA580C" size={22} />
        </span>
        <div>
          <h2 className="text20 font-bold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
            라이브 포트폴리오 유틸리티 모듈 (Live Dashboard Modules)
          </h2>
          <span className="text13 text-slate-500">Interactive Live Modules & Features</span>
        </div>
      </div>

      {/* 📱 3. Standalone Dashboard Utility Modules Grid */}
      <div className="grid-cols-2-md gap20 mb32">
        {dashboardFeatures.map((feat, idx) => (
          <div
            key={idx}
            className="dashboard-card p24 flex flex-col justify-between"
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
            }}
          >
            <div>
              <div className="text11 font-extrabold text-amber-600 uppercase mb6" style={{ letterSpacing: "0.06em" }}>
                Live Utility Module
              </div>
              <h4 className="text17 font-extrabold mb10" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
                {feat.title}
              </h4>
              <p className="text14 text-slate-600 m0 mb18" style={{ lineHeight: "1.65", wordBreak: "keep-all" }}>
                {feat.desc}
              </p>
            </div>

            <div>
              {/* Unified Pill Chip Components */}
              <div className="flex flex-wrap gap6 mb16">
                {feat.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "4px 12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      color: "#1D4ED8",
                      background: "#EFF6FF",
                      border: "1px solid #BFDBFE",
                      borderRadius: "16px"
                    }}
                  >
                    # {tag}
                  </span>
                ))}
              </div>

              {/* Action CTA Button */}
              <div className="pt12" style={{ borderTop: "1px solid #F1F5F9" }}>
                <Link
                  to={feat.link}
                  className="btn-outline-sm flex items-center justify-between font-bold"
                  style={{
                    padding: "10px 16px",
                    borderRadius: "10px",
                    background: "#EFF6FF",
                    color: "#2563EB",
                    border: "1px solid #BFDBFE",
                    width: "100%",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span className="text13">🚀 기능 체험하기</span>
                  <IconExternal size={14} color="#2563EB" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Back to Home CTA */}
      <div className="flex justify-center mt10">
        <Link
          to="/"
          className="btn-primary inline-flex items-center gap8 font-bold"
          style={{ padding: "12px 28px", background: "#2563EB", color: "white", borderRadius: "12px", fontSize: "14px" }}
        >
          <IconHome size={18} color="white" /> 메인 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default Projects;
