import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { dbService } from "../services/DbService";
import { IconGithub, IconBlog, IconMail, IconUser, IconBell } from "./Icons";

function TopMenu({ onMenuToggle }) {
  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  const fetchUnreadCounts = useCallback(async () => {
    if (!loginUser?.seq) return;
    const { count: msgCount } = await dbService.getUnreadMessageCount(loginUser.seq);
    setUnreadMsgCount(msgCount || 0);

    const { count: notifCount } = await dbService.getUnreadNotificationCount(loginUser.seq);
    setUnreadNotifCount(notifCount || 0);
  }, [loginUser?.seq]);

  useEffect(() => {
    if (!loginUser) return;

    fetchUnreadCounts();

    const interval = setInterval(() => {
      fetchUnreadCounts();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [loginUser?.seq, loginUser, fetchUnreadCounts]);

  const handleLogout = () => {
    localStorage.removeItem("loginUser");
    navigate("/");
    window.location.reload();
  };

  return (
    <header className="app-header">
      <button className="menu-toggle-btn" onClick={onMenuToggle}>
        ☰
      </button>
      <h2 onClick={() => navigate("/")} className="app-logo" style={{ cursor: "pointer", fontSize: "18px", fontWeight: "700" }}>
        KTH <span className="logo-sub" style={{ fontSize: "14px", fontWeight: "500", opacity: 0.9 }}>| Dev Portfolio & Dashboard</span>
      </h2>

      <div className="header-right" style={{ display: "flex", alignItems: "center" }}>
        <div className="header-quick-links flex items-center gap12">
          <a href="https://github.com/kth0813" target="_blank" rel="noopener noreferrer" className="header-link flex items-center gap4" style={{ fontSize: "13px" }}>
            <IconGithub size={15} color="#cbd5e1" /> <span className="hide-mobile">GitHub</span>
          </a>
          <Link to="/board" className="header-link flex items-center gap4" style={{ fontSize: "13px" }}>
            <IconBlog size={15} color="#cbd5e1" /> <span className="hide-mobile">Blog</span>
          </Link>
          <a href="mailto:staehun0813@gmail.com" className="header-link flex items-center gap4" style={{ fontSize: "13px" }}>
            <IconMail size={15} color="#cbd5e1" /> <span className="hide-mobile">Contact</span>
          </a>
        </div>

        <div className="header-divider" />

        <div className="header-auth-group flex items-center gap12">
          {loginUser ? (
            <>
              <Link to="/mypage" className="header-link font-bold flex items-center gap8">
                {loginUser.profile_url ? <img src={loginUser.profile_url} alt="프로필" className="rounded-full object-cover profile-img-small" /> : <IconUser size={16} color="#cbd5e1" />}
                <span className="whitespace-nowrap overflow-hidden text-ellipsis inline-block align-bottom profile-name-small">{loginUser.name}</span>님
              </Link>

              <div className="flex items-center gap16">
                <div className="relative cursor-pointer flex items-center" onClick={() => navigate("/messages")} title="쪽지">
                  <IconMail size={18} color="#cbd5e1" />
                  {unreadMsgCount > 0 && <span className="absolute text12 font-bold text-center rounded-full unread-badge msg-badge">{unreadMsgCount}</span>}
                </div>

                <div className="relative cursor-pointer flex items-center" onClick={() => navigate("/notifications")} title="알림">
                  <IconBell size={18} color="#cbd5e1" />
                  {unreadNotifCount > 0 && <span className="absolute text12 font-bold text-center rounded-full unread-badge notif-badge">{unreadNotifCount}</span>}
                </div>
              </div>

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
      </div>
    </header>
  );
}

export default TopMenu;
