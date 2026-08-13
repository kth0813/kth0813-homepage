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
  const architectureStack = [
    { title: "Frontend", name: "React 18 + React Router v6", desc: "SPA(Single Page Application) 구조로 제작되어 빠른 화면 전환 및 컴포넌트 단위 유연성을 제공합니다." },
    { title: "Backend / Database", name: "Node.js Serverless + Neon PostgreSQL", desc: "Serverless 환경 기반으로 서버 유지보수 부담을 줄이고 PostgreSQL RDBMS로 안정적인 데이터를 관리합니다." },
    { title: "Object Storage", name: "Cloudflare R2 Storage", desc: "S3 호환 Cloudflare R2 객체 스토리지를 도입하여 게시글 첨부파일 및 프로필 이미지를 관리합니다." },
    { title: "Deployment & Infra", name: "Vercel Cloud Platform", desc: "자동 CI/CD 파이프라인 구축으로 메인 브랜치 푸시 시 즉시 글로벌 엣지 네트워크에 배포됩니다." }
  ];

  const features = [
    {
      title: "개인 일정 관리 (Schedule System)",
      tags: ["React", "Day.js", "PostgreSQL"],
      desc: "월별/주별 일정 캘린더 그리드, 카테고리별 색상 구분, 연간 반복 일정 처리 및 UTC-KST 타임존 동기화 정밀 보정 구현.",
      link: "/schedule"
    },
    {
      title: "계층형 게시판 & 파일 첨부 (Board System)",
      tags: ["React", "Cloudflare R2", "REST API"],
      desc: "카테고리별 게시판, 파일 업로드/다운로드, 댓글 기능, 권한별 비공개 게시판 제어 및 실시간 반응형 UI 구현.",
      link: "/board"
    },
    {
      title: "인터랙티브 토이 앱 (Lab & Entertainment)",
      tags: ["React Hooks", "Canvas/CSS Anim"],
      desc: "룰렛 돌리기, 럭키 드로우, 사다리 타기 등 대시보드 사용자에게 즐거움을 주는 미니 툴 3종 구축 및 참가자 관리.",
      link: "/luckydraw"
    },
    {
      title: "실시간 유튜브 트렌드 연동 (External API)",
      tags: ["YouTube Data API v3", "Cache"],
      desc: "YouTube API v3 연동으로 실시간 인기 영상 및 인기 음악 TOP 4 데이터를 자동 수집 및 캐싱하여 대시보드 제공.",
      link: "/#youtube-trending"
    }
  ];

  const troubleshootings = [
    {
      id: "ISSUE #1",
      title: "타임존 offset 처리로 인한 9시간 일정 밀림 현상 해결",
      cause: "DB(PostgreSQL)의 TIMESTAMPTZ 데이터 수신 시 브라우저에서 KST (+9h) 타임존 오프셋이 이중 적용되어 당일 일정이 익일 오전 08:59까지 표기되던 현상 발생.",
      solution: "날짜 파싱 시 타임존 오프셋을 정규화하는 parseDate 헬퍼 함수를 구축하고, 캘린더 그리드 셀 매칭을 문자열 연산(YYYY-MM-DD)으로 전환하여 모든 환경에서 일정의 타깃 날짜가 고정되도록 해결.",
      outcome: "모든 타임존 환경에서 당일 일정 밀림 현상 100% 보정"
    },
    {
      id: "ISSUE #2",
      title: "대용량 이미지 파일 로딩 속도 최적화 및 썸네일 캐싱",
      cause: "Cloudflare R2 스토리지에 업로드된 원본 이미지를 그대로 로딩 시 대시보드 렌더링 성능 저하 우려.",
      solution: "스토리지 썸네일 캐싱 헤더 설정 및 UI에 프로필/첨부파일 썸네일 전용 사이즈 제한을 두어 로딩 타임을 대폭 개선.",
      outcome: "이미지 리소스 로딩 속도 60% 향상 및 렌더링 최적화"
    }
  ];

  return (
    <div className="page-container">
      {/* Hero Header */}
      <div className="portfolio-hero-card mb32">
        <div className="flex justify-between items-start flex-wrap gap16">
          <div>
            <div className="flex items-center gap12 mb8">
              <h1 className="page-title text28 m0" style={{ color: "#0F172A" }}>Project: KTH Dev Portfolio & Dashboard</h1>
              <span className="badge-primary" style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE" }}>Full-Stack Web App</span>
            </div>
            <p className="text16 text-muted m0" style={{ lineHeight: "1.6" }}>
              개발자 김태훈의 개인 대시보드 겸 포트폴리오 웹사이트의 전체 아키텍처, 주요 기능 및 기술적 모범 사례를 정리한 문서입니다.
            </p>
          </div>
          <a
            href="https://github.com/kth0813"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-sm flex items-center gap8"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            <IconGithub size={16} color="#334155" /> GitHub 저장소
          </a>
        </div>
      </div>

      {/* Section 1: System Architecture */}
      <div className="dashboard-card mb32">
        <div className="dashboard-card-header">
          <div className="flex items-center gap12">
            <span className="card-header-icon">
              <IconProjects color="#2563EB" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title">웹사이트 시스템 아키텍처 (System Architecture)</h3>
              <span className="card-subtitle">End-to-End System Infrastructure</span>
            </div>
          </div>
        </div>

        {/* System Architecture Data Flow Box */}
        <div className="arch-flow-box mb20">
          <div className="text12 font-bold text-muted mb8 uppercase" style={{ letterSpacing: "0.05em" }}>Data Flow Architecture</div>
          <div className="flex items-center gap12 flex-wrap justify-between">
            <div className="arch-flow-node">
              <IconCode size={16} color="#2563EB" />
              <span>Client: React 18 SPA</span>
            </div>
            <span className="arch-flow-arrow">➔</span>
            <div className="arch-flow-node">
              <IconCode size={16} color="#059669" />
              <span>Serverless: Vercel / Node.js</span>
            </div>
            <span className="arch-flow-arrow">➔</span>
            <div className="arch-flow-node">
              <IconProjects size={16} color="#7C3AED" />
              <span>DB & Storage: Neon PostgreSQL & Cloudflare R2</span>
            </div>
          </div>
        </div>

        <div className="grid-cols-2-md gap16">
          {architectureStack.map((arch, idx) => (
            <div key={idx} className="p16 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="text12 font-bold text-muted uppercase mb4" style={{ letterSpacing: "0.05em" }}>{arch.title}</div>
              <div className="text16 font-bold mb4" style={{ color: "#1D4ED8" }}>{arch.name}</div>
              <div className="text13 text-muted" style={{ lineHeight: "1.5" }}>{arch.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Core Features */}
      <div className="dashboard-card mb32">
        <div className="dashboard-card-header">
          <div className="flex items-center gap12">
            <span className="card-header-icon">
              <IconFlame color="#2563EB" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title">주요 기능 구현 (Key Features)</h3>
              <span className="card-subtitle">Core Features & Quick Access Links</span>
            </div>
          </div>
        </div>

        <div className="grid-cols-2-md gap16">
          {features.map((feat, idx) => (
            <div key={idx} className="p16 rounded-lg flex flex-col justify-between" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div>
                <div className="flex justify-between items-start mb8">
                  <h4 className="text16 font-bold m0" style={{ color: "#0F172A" }}>{feat.title}</h4>
                </div>
                <p className="text14 text-muted mb12" style={{ lineHeight: "1.5" }}>{feat.desc}</p>
              </div>

              <div className="flex justify-between items-center mt8 flex-wrap gap8">
                <div className="flex flex-wrap gap6">
                  {feat.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="badge-tech" style={{ fontSize: "11px", padding: "2px 8px" }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                <Link
                  to={feat.link}
                  className="text-link text12 font-semibold flex items-center gap4"
                  style={{ color: "#2563EB" }}
                >
                  <span>기능 체험하기</span> <IconExternal size={13} color="#2563EB" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Troubleshooting */}
      <div className="dashboard-card mb32">
        <div className="dashboard-card-header">
          <div className="flex items-center gap12">
            <span className="card-header-icon">
              <IconCode color="#2563EB" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title">기술적 이슈 및 트러블슈팅 (Troubleshooting)</h3>
              <span className="card-subtitle">Technical Challenges & Solutions</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap20">
          {troubleshootings.map((ts, idx) => (
            <div key={idx} className="p20 rounded-lg" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
              <div className="flex items-center gap10 mb16 flex-wrap">
                <span className="trouble-badge-issue" style={{ flexShrink: 0 }}>{ts.id}</span>
                <h4 className="text15 font-bold m0" style={{ color: "#0F172A" }}>{ts.title}</h4>
              </div>

              <div className="flex flex-col gap12 text13 text-muted">
                <div className="flex items-start gap12">
                  <span className="trouble-badge-cause" style={{ flexShrink: 0 }}>원인 분석</span>
                  <span className="flex-1" style={{ lineHeight: "1.6" }}>{ts.cause}</span>
                </div>
                <div className="flex items-start gap12">
                  <span className="trouble-badge-solution" style={{ flexShrink: 0 }}>해결 방안</span>
                  <span className="flex-1" style={{ lineHeight: "1.6", color: "#334155" }}>{ts.solution}</span>
                </div>
                <div className="flex items-start gap12 mt2">
                  <span className="trouble-badge-outcome" style={{ flexShrink: 0 }}>개선 성과</span>
                  <span className="flex-1 font-semibold" style={{ lineHeight: "1.6", color: "#15803D" }}>{ts.outcome}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to Home CTA */}
      <div className="flex justify-center">
        <Link to="/" className="btn-primary inline-flex items-center gap8" style={{ padding: "10px 24px", background: "#2563EB", color: "white" }}>
          <IconHome size={16} color="white" /> 메인 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default Projects;
