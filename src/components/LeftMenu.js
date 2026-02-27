import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { supabase } from "../supabaseClient";

function LeftMenu() {
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
      let query = supabase.from("category").select("seq, name, show_yn").eq("del_yn", "N");
      if (loginUser?.admin_yn !== "Y") {
        query = query.eq("show_yn", "Y");
      }
      const { data, error } = await query.order("order", { ascending: true, nullsFirst: false }).order("seq", { ascending: true });

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
    if (!globalSearchKeyword.trim()) return;
    navigate(`/board?globalKeyword=${encodeURIComponent(globalSearchKeyword)}`);
    setGlobalSearchKeyword("");
  };

  return (
    <nav className="app-nav">
      <div style={{ marginBottom: "16px", padding: "0 8px" }}>
        <form onSubmit={handleGlobalSearch} style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="전체 게시글 검색..."
            value={globalSearchKeyword}
            onChange={(e) => setGlobalSearchKeyword(e.target.value)}
            className="input-field"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", fontSize: "14px" }}
          />
          <button type="submit" className="btn-secondary" style={{ width: "100%", padding: "8px", borderRadius: "8px", fontSize: "13px" }}>
            검색
          </button>
        </form>
        <div style={{ textAlign: "center", fontSize: "14px", fontWeight: "600", color: "var(--primary-color)", background: "#f1f5f9", padding: "8px", borderRadius: "8px" }}>
          🕒 {currentTime.format("YYYY-MM-DD HH:mm:ss")}
        </div>
      </div>

      <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`}>
        🏠 메인
      </Link>
      {categories.length > 0 ? (
        categories.map((cat) => (
          <Link key={cat.seq} to={`/board?category=${cat.seq}`} className={`nav-link ${location.pathname === "/board" && currentCategory === String(cat.seq) ? "active" : ""}`}>
            📝 {cat.show_yn === "N" ? `[비공개] ${cat.name}` : cat.name}
          </Link>
        ))
      ) : (
        <div className="nav-link" style={{ fontSize: "12px", color: "#999" }}>
          등록된 게시판이 없어.
        </div>
      )}
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
        </div>
      )}
    </nav>
  );
}

export default LeftMenu;
