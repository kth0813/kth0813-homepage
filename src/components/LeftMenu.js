import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { dbService } from "../services/DbService";
import { showAlert } from "../utils/Alert";
import {
  IconSearch,
  IconHome,
  IconUser,
  IconProjects,
  IconSchedule,
  IconBoard,
  IconFlame,
  IconDice,
  IconLadder,
  IconRoulette,
  IconBarChart,
  IconUsers,
  IconSettings
} from "./Icons";

const KOREAN_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function LeftMenu({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category");

  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");
  const [currentTime, setCurrentTime] = useState(dayjs());
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      let data, error;
      if (loginUser?.admin_yn === "Y") {
        const res = await dbService.getCategories();
        data = res.data;
        error = res.error;
      } else {
        const res = await dbService.getPublicCategories();
        data = res.data;
        error = res.error;
      }

      if (!error) {
        setCategories(data);
      } else {
        console.error("카테고리 로딩 실패:", error.message);
      }
    };
    fetchCategories();
  }, [loginUser?.admin_yn]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Global shortcut Ctrl+K / Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearchKeyword.trim()) {
      showAlert("검색어를 입력해주세요.");
      return;
    }
    navigate(`/board?globalKeyword=${encodeURIComponent(globalSearchKeyword)}`);
    setGlobalSearchKeyword("");
  };

  return (
    <nav className={`app-nav ${isOpen ? "open" : ""}`}>
      <div className="flex justify-end lg:hidden mb-2">
        <button
          className="mobile-close-btn"
          onClick={onClose}
          aria-label="닫기"
        >
          ✕
        </button>
      </div>

      {/* Live Clock Status Indicator Bar (No Outer Box) */}
      <div className="sidebar-live-status flex items-center justify-center gap8 mb10 px4" title="실시간 시스템 상태">
        <span
          style={{
            width: "7px",
            height: "7px",
            borderRadius: "50%",
            background: "#10B981",
            boxShadow: "0 0 6px rgba(16, 185, 129, 0.7)",
            flexShrink: 0
          }}
          className="animate-pulse"
        />
        <span className="text12 font-medium text-slate-500 whitespace-nowrap" style={{ color: "#64748B", letterSpacing: "-0.2px" }}>
          {currentTime.format("YYYY. MM. DD")} ({KOREAN_DAYS[currentTime.day()]}) {currentTime.format("HH:mm:ss")}
        </span>
      </div>

      {/* Modern Search Input Container */}
      <form onSubmit={handleGlobalSearch} className="sidebar-search-container mb24 relative flex items-center">
        <span
          className="sidebar-search-icon"
          onClick={handleGlobalSearch}
          style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", cursor: "pointer", zIndex: 1 }}
        >
          <IconSearch size={14} color="#94A3B8" />
        </span>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="전체 게시글 검색..."
          value={globalSearchKeyword}
          onChange={(e) => setGlobalSearchKeyword(e.target.value)}
          className="sidebar-search-input"
          style={{
            width: "100%",
            height: "36px",
            paddingLeft: "32px",
            paddingRight: "50px",
            fontSize: "12px",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "8px",
            color: "#1E293B",
            outline: "none",
            boxSizing: "border-box"
          }}
        />
        <span
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "10px",
            fontWeight: "600",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            color: "#94A3B8",
            padding: "2px 6px",
            borderRadius: "4px",
            pointerEvents: "none"
          }}
        >
          Ctrl K
        </span>
      </form>

      <Link to="/" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/" ? "active" : ""}`}>
        <IconHome size={16} color={location.pathname === "/" ? "#2563EB" : "#64748B"} />
        <span>메인 (Home)</span>
      </Link>

      {/* 1. PORTFOLIO Section */}
      <div className="nav-group mb12">
        <div className="nav-group-title">PORTFOLIO</div>
        <Link to="/about" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/about" ? "active" : ""}`}>
          <IconUser size={16} color={location.pathname === "/about" ? "#2563EB" : "#64748B"} />
          <span>소개 (About Me)</span>
        </Link>
        <Link to="/projects" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/projects" ? "active" : ""}`}>
          <IconProjects size={16} color={location.pathname === "/projects" ? "#2563EB" : "#64748B"} />
          <span>프로젝트 (Projects)</span>
        </Link>
      </div>

      {/* 2. DASHBOARD Section */}
      <div className="nav-group mb12">
        <div className="nav-group-title">DASHBOARD</div>
        <Link to="/schedule" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/schedule" ? "active" : ""}`}>
          <IconSchedule size={16} color={location.pathname === "/schedule" ? "#2563EB" : "#64748B"} />
          <span>일정관리 (Schedule)</span>
        </Link>
        <Link to="/board" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/board" && !currentCategory ? "active" : ""}`}>
          <IconBoard size={16} color={location.pathname === "/board" && !currentCategory ? "#2563EB" : "#64748B"} />
          <span>전체 게시판 (Board)</span>
        </Link>
        {categories.length > 0 && (
          <div className="flex flex-col gap2 mt2">
            {categories.map((cat) => (
              <Link key={cat.seq} to={`/board?category=${cat.seq}`} className={`nav-link sub-link text13 flex items-center gap8 ${location.pathname === "/board" && currentCategory === String(cat.seq) ? "active" : ""}`}>
                <IconBoard size={14} color={location.pathname === "/board" && currentCategory === String(cat.seq) ? "#2563EB" : "#94A3B8"} />
                <span>{cat.show_yn === "N" ? `[비공개] ${cat.name}` : cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 3. UTILS Section */}
      <div className="nav-group mb12">
        <div className="nav-group-title">UTILS</div>
        <Link to="/luckydraw" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/luckydraw" ? "active" : ""}`}>
          <IconFlame size={16} color={location.pathname === "/luckydraw" ? "#2563EB" : "#64748B"} />
          <span>추첨하기 (Lucky Draw)</span>
        </Link>
        <Link to="/dice" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/dice" ? "active" : ""}`}>
          <IconDice size={16} color={location.pathname === "/dice" ? "#2563EB" : "#64748B"} />
          <span>주사위 던지기 (Dice)</span>
        </Link>
        <Link to="/ladder" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/ladder" ? "active" : ""}`}>
          <IconLadder size={16} color={location.pathname === "/ladder" ? "#2563EB" : "#64748B"} />
          <span>사다리타기 (Ladder)</span>
        </Link>
        <Link to="/roulette" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/roulette" ? "active" : ""}`}>
          <IconRoulette size={16} color={location.pathname === "/roulette" ? "#2563EB" : "#64748B"} />
          <span>룰렛돌리기 (Roulette)</span>
        </Link>
      </div>

      {/* 4. ADMIN Section */}
      <div className="nav-group mb12">
        <div className="nav-group-title text-blue-600 flex items-center justify-between" style={{ paddingRight: "4px" }}>
          <span>ADMIN</span>
          {loginUser?.admin_yn !== "Y" && (
            <span
              style={{
                fontSize: "10px",
                background: "#FEF3C7",
                color: "#D97706",
                border: "1px solid #FDE68A",
                padding: "2px 8px",
                borderRadius: "10px",
                fontWeight: "700",
                marginLeft: "auto",
                lineHeight: "1.2",
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              체험 모드
            </span>
          )}
        </div>
        <Link to="/admin" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/admin" || location.pathname === "/dashboard" ? "active" : ""}`}>
          <IconBarChart size={16} color={location.pathname === "/admin" || location.pathname === "/dashboard" ? "#2563EB" : "#64748B"} />
          <span>통계 대시보드</span>
        </Link>
        <Link to="/users" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/users" ? "active" : ""}`}>
          <IconUsers size={16} color={location.pathname === "/users" ? "#2563EB" : "#64748B"} />
          <span>사용자 목록</span>
        </Link>
        <Link to="/menus" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/menus" ? "active" : ""}`}>
          <IconSettings size={16} color={location.pathname === "/menus" ? "#2563EB" : "#64748B"} />
          <span>메뉴 관리</span>
        </Link>
        <Link to="/roulette/manage" className={`nav-link sub-link flex items-center gap8 ${location.pathname === "/roulette/manage" || location.pathname === "/roulette-manage" ? "active" : ""}`}>
          <IconRoulette size={16} color={location.pathname === "/roulette/manage" || location.pathname === "/roulette-manage" ? "#2563EB" : "#64748B"} />
          <span>룰렛 참가자 관리</span>
        </Link>
      </div>
    </nav>
  );
}

export default LeftMenu;
