import { Link, useNavigate } from "react-router-dom";

function TopMenu() {
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

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
