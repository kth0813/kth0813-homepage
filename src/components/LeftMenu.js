import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { dbService } from "../services/DbService";
import { showAlert } from "../utils/Alert";

function LeftMenu({ isOpen, onClose }) {
  const [categories, setCategories] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category");

  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");
  const [currentTime, setCurrentTime] = useState(dayjs());

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
      <div className="mb16 px12 relative">
        <div className="text-center text14 font-semibold p8 rounded-md left-menu-clock mt4" style={{ whiteSpace: "nowrap" }}>
          🕒 {currentTime.format("YYYY-MM-DD HH:mm:ss")}
        </div>
        <form onSubmit={handleGlobalSearch} className="flex flex-col gap8 mt16">
          <input
            type="text"
            placeholder="전체 게시글 검색..."
            value={globalSearchKeyword}
            onChange={(e) => setGlobalSearchKeyword(e.target.value)}
            className="input-field w-full px16 rounded-md text14"
          />
          <button type="submit" className="btn-secondary w-full py8 rounded-md text12">
            검색
          </button>
        </form>
      </div>

      <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
        🏠 메인
      </Link>
      <Link to="/schedule" className={`nav-link ${location.pathname === "/schedule" ? "active" : ""}`}>
        📅 일정관리
      </Link>
      <div className="nav-group mb16">
        <div className="nav-group-title">🎁 추첨하기</div>
        <Link to="/luckydraw" className={`nav-link sub-link ${location.pathname === "/luckydraw" ? "active" : ""}`}>
          🎲 럭키 드로우
        </Link>
        <Link to="/ladder" className={`nav-link sub-link ${location.pathname === "/ladder" ? "active" : ""}`}>
          🔀 사다리 타기
        </Link>
        <Link to="/roulette" className={`nav-link sub-link ${location.pathname === "/roulette" ? "active" : ""}`}>
          🎡 룰렛 돌리기
        </Link>
      </div>
      <div className="nav-group mb16">
        <div className="nav-group-title">📋 게시판</div>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <Link key={cat.seq} to={`/board?category=${cat.seq}`} className={`nav-link sub-link ${location.pathname === "/board" && currentCategory === String(cat.seq) ? "active" : ""}`}>
              📝 {cat.show_yn === "N" ? `[비공개] ${cat.name}` : cat.name}
            </Link>
          ))
        ) : (
          <div className="nav-link sub-link text12 text-muted">등록된 게시판이 없습니다.</div>
        )}
      </div>
      {loginUser?.admin_yn === "Y" && (
        <div className="nav-group">
          <div className="nav-group-title">🛡️ 관리자 메뉴</div>
          <Link to="/dashboard" className={`nav-link sub-link ${location.pathname === "/dashboard" ? "active" : ""}`}>
            📊 대시보드
          </Link>
          <Link to="/users" className={`nav-link sub-link ${location.pathname === "/users" ? "active" : ""}`}>
            👥 사용자 목록
          </Link>
          <Link to="/menus" className={`nav-link sub-link ${location.pathname === "/menus" ? "active" : ""}`}>
            ⚙️ 메뉴 관리
          </Link>
          <Link to="/roulette-manage" className={`nav-link sub-link ${location.pathname === "/roulette-manage" ? "active" : ""}`}>
            🎡 룰렛 참가자 관리
          </Link>
        </div>
      )}
    </nav>
  );
}

export default LeftMenu;
