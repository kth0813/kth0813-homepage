import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function TopMenu() {
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const [globalSearchKeyword, setGlobalSearchKeyword] = useState("");

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (!globalSearchKeyword.trim()) return;
    navigate(`/board?globalKeyword=${encodeURIComponent(globalSearchKeyword)}`);
    setGlobalSearchKeyword(""); // 검색 후 초기화
  };

  const handleLogout = () => {
    localStorage.removeItem("loginUser");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="app-header">
      <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
        KTH homepage
      </h2>

      {/* 전역 검색창 추가 */}
      <form onSubmit={handleGlobalSearch} style={{ display: "flex", gap: "8px", margin: "0 auto", alignItems: "center" }}>
        <input
          type="text"
          placeholder="전체 게시글 검색..."
          value={globalSearchKeyword}
          onChange={(e) => setGlobalSearchKeyword(e.target.value)}
          className="input-field"
          style={{ width: "250px", padding: "8px 12px", borderRadius: "20px" }}
        />
        <button type="submit" className="btn-secondary" style={{ padding: "8px 16px", borderRadius: "20px" }}>
          검색
        </button>
      </form>

      <div className="header-right">
        {loginUser ? (
          <>
            <Link to="/mypage" className="header-link" style={{ fontWeight: "bold", marginRight: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
              {loginUser.profile_url ? <img src={loginUser.profile_url} alt="프로필" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} /> : <span>👤</span>}
              {loginUser.name}님
            </Link>
            <button onClick={handleLogout} className="header-btn">
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="header-link">
              로그인
            </Link>
            <Link to="/join" className="header-link">
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default TopMenu;
