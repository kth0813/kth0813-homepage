import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";

function LeftMenu() {
  const [categories, setCategories] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentCategory = searchParams.get("category");

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

  return (
    <nav className="app-nav">
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
