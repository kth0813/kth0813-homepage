import React from "react";
import "../css/App.css";
import {
  IconCode,
  IconMail,
  IconGithub,
  IconClock,
  IconProjects
} from "../components/Icons";

const AboutMe = () => {
  const techStack = [
    {
      category: "Frontend",
      items: [
        { name: "React", primary: true },
        { name: "JavaScript (ES6+)", primary: true },
        { name: "HTML5 / CSS3", primary: false },
        { name: "Tailwind CSS", primary: false },
        { name: "Axios", primary: false },
        { name: "Day.js", primary: false }
      ]
    },
    {
      category: "Backend & Database",
      items: [
        { name: "Node.js", primary: true },
        { name: "PostgreSQL (Neon)", primary: true },
        { name: "MSSQL", primary: true },
        { name: "Express", primary: false },
        { name: "MariaDB", primary: false },
        { name: "RESTful API", primary: true }
      ]
    },
    {
      category: "Cloud & Infrastructure",
      items: [
        { name: "Cloudflare R2 Storage", primary: false },
        { name: "Vercel Serverless", primary: false },
        { name: "Git / GitHub", primary: true },
        { name: "Docker", primary: false }
      ]
    }
  ];

  const highlights = [
    {
      title: "효율적인 데이터베이스 설계 & 쿼리 최적화",
      desc: "대용량 데이터 처리 경험 및 MSSQL/PostgreSQL 중심의 관계형 데이터베이스 모델링 및 인덱스 최적화 능력"
    },
    {
      title: "유지보수성이 높은 컴포넌트 아키텍처",
      desc: "React 기반의 재사용 가능한 UI 컴포넌트 설계 및 직관적인 상태 관리 체계 구축"
    },
    {
      title: "풀스택 데이터 흐름 이해 & API 연동",
      desc: "RESTful API 설계부터 Serverless 환경 및 외부 서비스(유튜브, 스토리지) 연동까지 전반적인 데이터 흐름 제어"
    }
  ];

  const careers = [
    {
      period: "2022.03 ~ 현재",
      role: "Full-Stack Developer",
      company: "웹 애플리케이션 개발 & 시스템 유지보수",
      details: [
        "웹 애플리케이션 프론트엔드 및 백엔드 시스템 개발/유지보수",
        "RESTful API 연동 및 데이터베이스 성능 최적화",
        "사용자 요구사항 분석 기반 신규 기능 설계 및 배포"
      ]
    },
    {
      period: "학부 및 이력",
      role: "Computer Science & Software Education",
      company: "소프트웨어공학 전공 & 역량 개발",
      details: [
        "컴퓨터공학 전공 및 핵심 기술 스택(React, Node.js, RDBMS) 습득",
        "다양한 풀스택 토이 프로젝트 및 대시보드 시스템 독립 개발"
      ]
    }
  ];

  return (
    <div className="page-container">
      {/* 1. Profile Hero Card */}
      <div className="portfolio-hero-card mb32" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "28px" }}>
        <div className="flex flex-col md:flex-row items-center gap24">
          <div className="profile-avatar-large">
            <IconCode size={40} color="#2563EB" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap12 mb8 flex-wrap">
              <h1 className="page-title text28 m0" style={{ color: "#0F172A" }}>김태훈 (Kim Tae-hun)</h1>
              <span className="badge-primary" style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE", padding: "4px 12px", borderRadius: "12px" }}>Full-Stack Developer</span>
            </div>
            <p className="text16 text-muted m0 mb16" style={{ lineHeight: "1.6" }}>
              사용자 경험 개선과 효율적인 데이터 처리에 가치를 두는 풀스택 개발자입니다.<br />
              웹 애플리케이션 아키텍처 설계부터 UI/UX 구현, 데이터베이스 모델링 및 배포까지 주도적으로 수행합니다.
            </p>
            <div className="flex gap12 flex-wrap items-center">
              <a
                href="mailto:staehun0813@gmail.com"
                className="btn-primary flex items-center gap8 font-bold"
                style={{ padding: "8px 18px", background: "#2563EB", color: "white", fontSize: "13px", borderRadius: "8px" }}
              >
                <IconMail size={16} color="white" /> 이메일 문의하기
              </a>
              <a
                href="https://github.com/kth0813"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-sm flex items-center gap8 font-semibold"
                style={{ padding: "8px 16px", fontSize: "13px", color: "#334155", borderRadius: "8px" }}
              >
                <IconGithub size={16} color="#334155" /> GitHub 방문하기
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Grid: Key Strengths & Tech Stack (Balanced Height & Header Layout) */}
      <div className="grid-cols-2-md gap24 mb32 items-stretch">
        {/* Key Strengths Card */}
        <div className="dashboard-card p28 flex flex-col justify-between" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
          <div>
            <div className="dashboard-card-header mb20">
              <div className="flex items-center gap12">
                <span className="card-header-icon" style={{ background: "#EFF6FF" }}>
                  <IconCode color="#2563EB" size={20} />
                </span>
                <div>
                  <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>핵심 강점 (Key Strengths)</h3>
                  <span className="card-subtitle text13 text-muted">Core Technical Competencies</span>
                </div>
              </div>
            </div>

            {/* List with Blue Dot Header Line & 10px Gap Spacing */}
            <div className="flex flex-col gap12">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex flex-col gap6 mb2" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "18px 20px" }}>
                  <div className="flex items-center gap10">
                    <span
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#2563EB",
                        flexShrink: 0
                      }}
                    />
                    <h4 className="text14 font-bold m0" style={{ color: "#1E293B" }}>{item.title}</h4>
                  </div>
                  <p className="text12 text-muted m0" style={{ lineHeight: "1.6", color: "#475569", paddingLeft: "18px" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack Card */}
        <div className="dashboard-card p28 flex flex-col justify-between" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
          <div>
            <div className="dashboard-card-header mb20">
              <div className="flex items-center gap12">
                <span className="card-header-icon" style={{ background: "#EFF6FF" }}>
                  <IconProjects color="#2563EB" size={20} />
                </span>
                <div>
                  <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>기술 스택 (Tech Stack)</h3>
                  <span className="card-subtitle text13 text-muted">Main & Specialized Tech Stack</span>
                </div>
              </div>
            </div>

            {/* Tech Stack Tag Buttons with Perfect X/Y Center Alignment & text-center */}
            <div className="flex flex-col gap16">
              {techStack.map((group, idx) => (
                <div key={idx}>
                  <h4 className="text12 font-bold text-muted mb8" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>{group.category}</h4>
                  <div className="flex flex-wrap gap8">
                    {group.items.map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          minHeight: "32px",
                          padding: "6px 14px",
                          fontSize: "12px",
                          fontWeight: tech.primary ? "600" : "500",
                          lineHeight: "1.2",
                          background: tech.primary ? "#EFF6FF" : "#F8FAFC",
                          color: tech.primary ? "#2563EB" : "#475569",
                          border: tech.primary ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                          borderRadius: "10px",
                          boxSizing: "border-box"
                        }}
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Experience & History Vertical Timeline Card */}
      <div className="dashboard-card p28 mb32" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
        <div className="dashboard-card-header mb20">
          <div className="flex items-center gap12">
            <span className="card-header-icon" style={{ background: "#EFF6FF" }}>
              <IconClock color="#2563EB" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>경력 및 이력 (Experience & History)</h3>
              <span className="card-subtitle text13 text-muted">Work Experience & Software Background</span>
            </div>
          </div>
        </div>

        <div className="timeline-container">
          {careers.map((career, idx) => (
            <div key={idx} className="timeline-item">
              <div className="timeline-dot" />
              <div className="flex flex-col md:flex-row md:items-center justify-between mb6 gap4">
                <div className="flex items-center gap10 flex-wrap">
                  <h4 className="text16 font-bold m0" style={{ color: "#0F172A" }}>{career.role}</h4>
                  <span className="text13 text-muted">| {career.company}</span>
                </div>
                <span className="font-semibold" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "24px", padding: "0 10px", fontSize: "11px", color: "#2563EB", background: "#EFF6FF", border: "1px solid #DBEAFE", borderRadius: "6px" }}>
                  {career.period}
                </span>
              </div>
              <ul className="text14 text-muted m0 p0 flex flex-col gap6" style={{ listStyleType: "none", lineHeight: "1.6" }}>
                {career.details.map((detail, dIdx) => (
                  <li key={dIdx} className="flex items-start gap6">
                    <span style={{ color: "#94A3B8", userSelect: "none" }}>-</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
