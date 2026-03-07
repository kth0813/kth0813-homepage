import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { dbService } from "../services/DbService";
import { supabase } from "../supabaseClient";
import { showToast } from "../utils/Alert";

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

    const channel = supabase
      .channel("top-menu-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "message", filter: `receiver_seq=eq.${loginUser.seq}` }, (payload) => {
        fetchUnreadCounts();
        showToast("새로운 쪽지가 도착했습니다!");
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notification", filter: `user_seq=eq.${loginUser.seq}` }, (payload) => {
        fetchUnreadCounts();
        showToast("새로운 알림이 도착했습니다!");
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "message", filter: `receiver_seq=eq.${loginUser.seq}` }, () => {
        fetchUnreadCounts();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "notification", filter: `user_seq=eq.${loginUser.seq}` }, () => {
        fetchUnreadCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      <h2 onClick={() => navigate("/")} className="app-logo">
        KTH homepage
      </h2>

      <div className="header-right">
        {loginUser ? (
          <>
            <Link to="/mypage" className="header-link font-bold flex items-center gap8 mr-2">
              {loginUser.profile_url ? <img src={loginUser.profile_url} alt="프로필" className="rounded-full object-cover profile-img-small" /> : <span>👤</span>}
              <span className="whitespace-nowrap overflow-hidden text-ellipsis inline-block align-bottom profile-name-small">{loginUser.name}</span>님
            </Link>

            <div className="flex items-center gap16 mr-4">
              <div className="relative cursor-pointer text20" onClick={() => navigate("/messages")}>
                ✉️
                {unreadMsgCount > 0 && <span className="absolute text12 font-bold text-center rounded-full unread-badge msg-badge">{unreadMsgCount}</span>}
              </div>

              <div className="relative cursor-pointer text20" onClick={() => navigate("/notifications")}>
                🔔
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
    </header>
  );
}

export default TopMenu;
