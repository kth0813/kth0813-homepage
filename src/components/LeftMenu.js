import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";

function LeftMenu() {
  const [categories, setCategories] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("category").select("seq, name").eq("del_yn", "N").order("seq", { ascending: true });

      if (!error) {
        setCategories(data);
      } else {
        console.error("카테고리 로딩 실패:", error.message);
      }
    };
    fetchCategories();
  }, []);

  return (
    <nav className="app-nav">
      <Link to="/" className="nav-link">
        📊 대시보드
      </Link>
      {categories.length > 0 ? (
        categories.map((cat) => (
          <Link key={cat.seq} to={`/board?category=${cat.seq}`} className="nav-link">
            📝 {cat.name}
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
          <Link to="/users" className="nav-link sub-link">
            👥 사용자 목록
          </Link>
        </div>
      )}
    </nav>
  );
}

export default LeftMenu;
