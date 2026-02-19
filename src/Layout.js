import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
const linkStyle = {
  color: "#fff",
  marginRight: "15px",
  textDecoration: "none",
};
const btnStyle = {
  background: "none",
  border: "1px solid #fff",
  color: "#fff",
  cursor: "pointer",
};
function Layout({ children }) {
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const handleLogout = () => {
    localStorage.removeItem("loginUser");
    navigate("/");
    window.location.reload();
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <header
        style={{
          height: "60px",
          background: "#333",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
        }}
      >
        <h2 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          KTH Home
        </h2>
        <div style={{ marginLeft: "auto" }}>
          {loginUser ? (
            <>
              <span style={{ marginRight: "15px" }}>{loginUser.name}님</span>
              <button onClick={handleLogout} style={btnStyle}>
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={linkStyle}>
                로그인
              </Link>
              <Link to="/signin" style={linkStyle}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </header>
      <div style={{ display: "flex", flex: 1 }}>
        <nav
          style={{
            width: "200px",
            background: "#f4f4f4",
            borderRight: "1px solid #ddd",
            padding: "20px",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/">🏠 홈</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/users">👥 사용자 목록</Link>
            </li>
            <li style={{ marginBottom: "10px" }}>
              <Link to="/board">📋 게시판</Link>
            </li>
          </ul>
        </nav>

        <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
