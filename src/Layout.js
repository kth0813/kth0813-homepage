import { Link, useNavigate } from "react-router-dom";

function Layout({ children }) {
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const handleLogout = () => {
    localStorage.removeItem("loginUser");
    navigate("/");
    window.location.reload();
  };
  return (
    <div className="app-container">
      <header className="app-header">
        <h2 onClick={() => navigate("/")}>
          KTH Home
        </h2>
        <div className="header-right">
          {loginUser ? (
            <>
              <Link to="/mypage" className="header-link" style={{ fontWeight: "bold", marginRight: "5px", display: "flex", alignItems: "center", gap: "8px" }}>
                {loginUser.profile_url ? (
                  <img src={loginUser.profile_url} alt="프로필" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                ) : (
                  <span>👤</span>
                )}
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
              <Link to="/signin" className="header-link">
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
      <div className="app-body">
        <nav className="app-nav">
          <Link to="/" className="nav-link">🏠 홈</Link>
          <Link to="/users" className="nav-link">👥 사용자 목록</Link>
          <Link to="/board" className="nav-link">📋 게시판</Link>
        </nav>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
