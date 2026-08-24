import React, { useState } from "react";
import "../css/App.css";
import {
  IconCode,
  IconMail,
  IconGithub,
  IconProjects,
  IconFlame,
  IconClock
} from "../components/Icons";

const AboutMe = () => {
  const [showToast, setShowToast] = useState(false);
  const emailAddress = "staehun0813@gmail.com";

  const handleCopyEmail = (e) => {
    e.preventDefault();
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(emailAddress).then(() => {
        triggerToast();
      }).catch(() => {
        fallbackCopyTextToClipboard(emailAddress);
      });
    } else {
      fallbackCopyTextToClipboard(emailAddress);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      triggerToast();
    } catch (err) {
      alert("이메일 주소: " + text);
    }
    document.body.removeChild(textArea);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  return (
    <div className="page-container">
      {/* 🚀 Modern Left-Right Split Profile Hero Card */}
      <div
        className="portfolio-hero-card mb20"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          padding: "32px 36px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="portfolio-hero-split-layout">
          {/* Left Avatar Icon Circle (Fixed Size) */}
          <div
            className="profile-avatar-large flex-shrink-0"
            style={{
              width: "92px",
              height: "92px",
              borderRadius: "50%",
              background: "#EFF6FF",
              border: "2px solid #BFDBFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(37, 99, 235, 0.12)"
            }}
          >
            <IconCode size={46} color="#2563EB" />
          </div>

          {/* Right Info Section (Left-aligned & Hierarchical) */}
          <div className="flex-1 text-left w-full">
            {/* Row 1: Big Bold Name */}
            <h1
              className="page-title text28 m0 font-extrabold"
              style={{ color: "#0F172A", letterSpacing: "-0.4px", lineHeight: "1.25" }}
            >
              김태훈 (Kim Tae-hun)
            </h1>

            {/* Row 2: Subtitle Job Title Badge (Directly below name) */}
            <div className="mt8 mb14 flex flex-wrap items-center">
              <span
                className="badge-primary inline-flex items-center gap6 font-bold"
                style={{
                  background: "#EFF6FF",
                  color: "#2563EB",
                  border: "1px solid #BFDBFE",
                  padding: "5px 14px",
                  borderRadius: "12px",
                  fontSize: "13px"
                }}
              >
                🚀 Full-Stack Developer & Service Architect
              </span>
            </div>

            {/* Row 3: Bio Description Text */}
            <p
              className="text15 text-slate-600 m0 mb20"
              style={{ lineHeight: "1.75", color: "#475569", wordBreak: "keep-all" }}
            >
              단순한 코딩을 넘어, 비즈니스 목표와 사용자 경험(UX)을 주도적으로 기획하고 설계하는 풀스택 개발자입니다.<br />
              프론트엔드와 백엔드, 데이터베이스를 통합적으로 조망하며 AI 보조 프로세스를 도입해 생산성을 극대화합니다.
            </p>

            {/* Row 4: Balanced Equal-height CTA Button Group with Clipboard Copy */}
            <div className="flex items-center gap12 flex-wrap">
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "42px",
                  padding: "0 22px",
                  background: "#2563EB",
                  color: "#FFFFFF",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "700",
                  lineHeight: "1"
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <IconMail size={16} color="white" />
                </span>
                <span style={{ lineHeight: "1", display: "inline-block" }}>이메일 문의하기</span>
              </button>
              <a
                href="https://github.com/kth0813"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-sm"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  height: "42px",
                  padding: "0 20px",
                  color: "#334155",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  textDecoration: "none",
                  boxSizing: "border-box",
                  fontSize: "13px",
                  fontWeight: "600",
                  lineHeight: "1"
                }}
              >
                <span style={{ display: "inline-flex", alignItems: "center" }}>
                  <IconGithub size={16} color="#334155" />
                </span>
                <span style={{ lineHeight: "1", display: "inline-block" }}>GitHub 방문하기</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 📝 Cover Letter Section 1 */}
      <div
        className="dashboard-card p28 mb20"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="dashboard-card-header mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <div className="flex items-center gap12">
            <span className="card-header-icon" style={{ background: "#EFF6FF" }}>
              <IconCode color="#2563EB" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title text18 font-extrabold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
                섹션 1. 비즈니스 로직에 집중하는 최적화된 개발 프로세스 기획
              </h3>
              <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>
                Development Process Optimization & AI Prototyping
              </span>
            </div>
          </div>
        </div>

        <div className="text14 text-slate-700 flex flex-col gap16" style={{ lineHeight: "1.85", wordBreak: "keep-all" }}>
          <p className="m0">
            프론트엔드(<span className="tech-highlight-badge">React</span>, <span className="tech-highlight-badge">Vue2</span>)와 백엔드(<span className="tech-highlight-badge">Java</span>, <span className="tech-highlight-badge">Spring</span>)를 아우르며, 단순한 기능 구현을 넘어 서비스의 전체적인 아키텍처와 사용자 경험을 기획하는 관점으로 개발에 임해 왔습니다. 특히 6개월간의 전문 AI 교육을 거치며, AI 보조 툴을 실무 프로세스에 도입하는 '<strong className="text-blue-700 font-bold bg-blue-50 px6 py2 rounded">개발 환경 최적화</strong>'를 직접 기획하고 적용했습니다. 이를 통해 단순 반복 작업에 소요되는 리소스를 대폭 줄이고, 대신 비즈니스 요구사항 분석과 아키텍처 설계에 더 많은 시간을 할애할 수 있는 효율적인 파이프라인을 구축했습니다.
          </p>
          <p className="m0">
            아파트 관리 웹사이트 고도화 시에도 단순히 <span className="tech-highlight-badge">React-Quill</span> 라이브러리를 적용하는 것에 그치지 않고, 사용자의 리치 텍스트 작성 경험을 분석해 UI 컴포넌트의 상태 관리를 기획했습니다. <strong className="text-blue-700 font-bold bg-blue-50 px6 py2 rounded">AI를 활용한 프로토타이핑</strong>으로 기술 검증 시간을 단축시킨 덕분에, 1년간 이어진 국가 과제에서도 타 기업과의 이기종 시스템 통합 시 발생하는 요구사항 충돌을 사전에 조율하고 매끄럽게 연동을 주도할 수 있었습니다.
          </p>
        </div>
      </div>

      {/* 📝 Cover Letter Section 2 */}
      <div
        className="dashboard-card p28 mb20"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="dashboard-card-header mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <div className="flex items-center gap12">
            <span className="card-header-icon" style={{ background: "#F0FDF4" }}>
              <IconProjects color="#16A34A" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title text18 font-extrabold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
                섹션 2. 데이터 흐름 기획과 선제적 리스크 관리
              </h3>
              <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>
                Data Flow Reverse Engineering & Query Optimization
              </span>
            </div>
          </div>
        </div>

        <div className="text14 text-slate-700 flex flex-col gap16" style={{ lineHeight: "1.85", wordBreak: "keep-all" }}>
          <p className="m0">
            저의 문제 해결 방식은 단순한 버그 수정을 넘어, 시스템의 구조적 맥락을 파악하고 데이터 플로우를 재설계하는 기획적 접근에 기반합니다. 급여 계산 및 부가세 처리와 같은 복잡한 회계 시스템을 구축할 때, 오차 없는 정밀한 데이터 처리를 위해 안정적인 <span className="tech-highlight-badge">REST API</span> 구조를 먼저 기획했습니다.
          </p>
          <p className="m0">
            특히 <span className="tech-highlight-badge">DBeaver</span>를 활용해 <span className="tech-highlight-badge">MSSQL</span>의 쿼리 병목을 추적하고 복잡한 정산 프로시저를 검증하는 과정에서, 데이터가 흘러가는 전체 파이프라인을 논리적으로 <strong className="text-emerald-700 font-bold bg-emerald-50 px6 py2 rounded">데이터 플로우 역추적</strong>했습니다. 이 과정에서 <strong className="text-emerald-700 font-bold bg-emerald-50 px6 py2 rounded">AI 모델</strong>을 크로스 체크 도구로 활용하도록 문제 해결 방식을 구조화하여, 퍼포먼스 저하의 근본 원인을 찾아내고 휴먼 에러를 최소화하는 시스템 개선안을 기획 및 적용했습니다.
          </p>
        </div>
      </div>

      {/* 📝 Cover Letter Section 3 */}
      <div
        className="dashboard-card p28 mb20"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="dashboard-card-header mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <div className="flex items-center gap12">
            <span className="card-header-icon" style={{ background: "#FFF7ED" }}>
              <IconFlame color="#EA580C" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title text18 font-extrabold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
                섹션 3. 비즈니스 목적을 달성하는 유기적 서비스 설계
              </h3>
              <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>
                Service Architect Perspective & Flexible Tech Adoption
              </span>
            </div>
          </div>
        </div>

        <div className="text14 text-slate-700 flex flex-col gap16" style={{ lineHeight: "1.85", wordBreak: "keep-all" }}>
          <p className="m0">
            단순히 주어진 명세서대로 코딩하는 것을 넘어, 비즈니스의 성장 목표와 사용자 경험(UX)을 동시에 충족시키는 '<strong className="text-amber-700 font-bold bg-amber-50 px6 py2 rounded">서비스 아키텍트</strong>' 관점에서 시스템을 고도화하고 있습니다. <span className="tech-highlight-badge">JavaScript</span>와 <span className="tech-highlight-badge">TypeScript</span> 생태계에 대한 깊은 이해를 바탕으로, 프로젝트의 기획 의도와 요구사항에 가장 적합한 기술 스택(<span className="tech-highlight-badge">Vue2</span>, <span className="tech-highlight-badge">React</span> 등)을 유연하게 채택하여 실무에 적용해 왔습니다.
          </p>
          <p className="m0">
            이러한 기술적 유연함과 프론트엔드, 백엔드, 데이터베이스를 통합적으로 조망하는 기획력은, 유기적인 서비스 확장이 필요한 환경에서 확실한 시너지를 냅니다. 회계 시스템의 정밀한 데이터 설계와 이기종 시스템 간의 통합 연동 경험을 바탕으로, 요구사항을 완벽하게 담아내는 동시에 지속적으로 확장이 가능한 완성도 높은 서비스를 기획하고 구현하겠습니다.
          </p>
        </div>
      </div>

      {/* 📝 Cover Letter Section 4 */}
      <div
        className="dashboard-card p28 mb20"
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "16px",
          marginBottom: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)"
        }}
      >
        <div className="dashboard-card-header mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "14px" }}>
          <div className="flex items-center gap12">
            <span className="card-header-icon" style={{ background: "#F3E8FF" }}>
              <IconClock color="#9333EA" size={20} />
            </span>
            <div>
              <h3 className="dashboard-card-title text18 font-extrabold m0" style={{ color: "#0F172A", letterSpacing: "-0.3px" }}>
                섹션 4. 기술과 기획을 연결하는 핵심 개발자로의 성장
              </h3>
              <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>
                Short-term & Long-term Professional Roadmap
              </span>
            </div>
          </div>
        </div>

        <div className="text14 text-slate-700 flex flex-col gap16" style={{ lineHeight: "1.85", wordBreak: "keep-all" }}>
          <p className="m0">
            그동안 쌓아온 풀스택 개발 역량과 효율적인 프로세스 기획력을 바탕으로, 입사 후 다음과 같은 목표를 달성하겠습니다.
          </p>
          <div className="p18 rounded-xl bg-purple-50 border border-purple-100 flex flex-col gap8">
            <div className="font-bold text-purple-900 text14">📌 단기적 목표 (Immediate Goals):</div>
            <p className="m0 text13 text-purple-950" style={{ lineHeight: "1.7" }}>
              기업의 비즈니스 도메인과 기존 시스템의 구조적 특징을 최우선으로 파악하겠습니다. <span className="tech-highlight-badge">IntelliJ</span>, <span className="tech-highlight-badge">VSCode</span>, <span className="tech-highlight-badge">DBeaver</span> 등 익숙한 도구를 활용해 팀의 개발 문화에 즉시 녹아드는 것은 물론, 기획 및 유관 부서와의 긴밀한 소통을 통해 현재 진행 중인 스프린트의 목적을 정확히 이해하고 주도적으로 시스템 개선을 이끌겠습니다.
            </p>
          </div>
          <div className="p18 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col gap8">
            <div className="font-bold text-indigo-900 text14">🚀 장기적 목표 (Long-term Vision):</div>
            <p className="m0 text13 text-indigo-950" style={{ lineHeight: "1.7" }}>
              기능 구현을 넘어, 확장성과 재사용성을 고려한 <strong className="text-indigo-700 font-bold">프론트엔드 공통 컴포넌트 설계</strong>와 데이터베이스 처리 효율성 최적화를 주도하겠습니다. 기술 부채와 레거시를 혁신적으로 줄여가는 <strong className="text-indigo-700 font-bold">아키텍처 개선안</strong>을 끊임없이 기획하고 제안하며, 전체적인 개발 생산성을 높이고 비즈니스 임팩트를 창출하는 핵심 개발자로 자리매김하겠습니다.
            </p>
          </div>
        </div>
      </div>

      {/* 📧 Toast Notification Bar */}
      {showToast && (
        <div
          style={{
            position: "fixed",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#0F172A",
            color: "#FFFFFF",
            padding: "12px 24px",
            borderRadius: "30px",
            fontSize: "14px",
            fontWeight: "700",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.25)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            animation: "fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <span style={{ fontSize: "16px" }}>📧</span>
          <span>이메일 주소({emailAddress})가 클립보드에 복사되었습니다.</span>
        </div>
      )}
    </div>
  );
};

export default AboutMe;
