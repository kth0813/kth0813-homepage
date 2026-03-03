import { useEffect, useState, useCallback } from "react";
import { dbService } from "../services/DbService";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

function NotificationList() {
  const [notifications, setNotifications] = useState([]);
  const [selectedSeqs, setSelectedSeqs] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    if (!loginUser?.seq) return;
    const { data, error } = await dbService.getNotificationsByUserId(loginUser.seq);

    if (!error && data) {
      setNotifications(data);
    }
  }, [loginUser?.seq]);

  useEffect(() => {
    if (!loginUser) {
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, [loginUser, navigate, fetchNotifications]);

  const markAsRead = async (seq, target_seq, read_date) => {
    if (!read_date) {
      await dbService.readNotifications([seq]);
      fetchNotifications();
    }

    if (target_seq) {
      navigate(`/board/${target_seq}`);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSeqs(notifications.map((n) => n.seq));
    } else {
      setSelectedSeqs([]);
    }
  };

  const handleSelect = (seq) => {
    setSelectedSeqs((prev) => (prev.includes(seq) ? prev.filter((id) => id !== seq) : [...prev, seq]));
  };

  const handleReadSelected = async () => {
    if (selectedSeqs.length === 0) return;
    const unreadSeqs = notifications.filter((n) => selectedSeqs.includes(n.seq) && !n.read_date).map((n) => n.seq);
    if (unreadSeqs.length > 0) {
      await dbService.readNotifications(unreadSeqs);
    }
    setSelectedSeqs([]);
    fetchNotifications();
  };

  const handleDeleteSelected = async () => {
    if (selectedSeqs.length === 0) return;
    if (!window.confirm("선택한 알림을 삭제하시겠습니까?")) return;
    await dbService.softDeleteNotifications(selectedSeqs);
    setSelectedSeqs([]);
    fetchNotifications();
  };

  const handleReadAll = async () => {
    if (!window.confirm("모든 알림을 읽음 처리하시겠습니까?")) return;
    const unreadSeqs = notifications.filter((n) => !n.read_date).map((n) => n.seq);
    if (unreadSeqs.length > 0) {
      await dbService.readNotifications(unreadSeqs);
      fetchNotifications();
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("모든 알림을 삭제하시겠습니까?")) return;
    await dbService.softDeleteAllNotifications(loginUser.seq);
    fetchNotifications();
  };

  return (
    <div className="board-list-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>🔔 내 알림</h2>
        {notifications.length > 0 && (
          <div style={{ display: "flex", gap: "8px" }}>
            {selectedSeqs.length > 0 && (
              <>
                <button className="btn-secondary" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleReadSelected}>
                  선택 읽음
                </button>
                <button className="btn-secondary" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleDeleteSelected}>
                  선택 삭제
                </button>
              </>
            )}
            <button className="btn-outline" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleReadAll}>
              전체 읽음
            </button>
            <button className="btn-danger" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleDeleteAll}>
              전체 삭제
            </button>
          </div>
        )}
      </div>
      {notifications.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>새로운 알림이 없습니다.</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 15px", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedSeqs.length === notifications.length && notifications.length > 0}
              style={{ marginRight: "15px", cursor: "pointer", width: "16px", height: "16px" }}
            />
            <span>전체 선택</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {notifications.map((noti) => (
              <li
                key={noti.seq}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  backgroundColor: noti.read_date ? "transparent" : "#f0f8ff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selectedSeqs.includes(noti.seq)}
                    onChange={() => handleSelect(noti.seq)}
                    style={{ marginRight: "15px", cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  <div onClick={() => markAsRead(noti.seq, noti.target_seq, noti.read_date)} style={{ cursor: "pointer", flex: 1 }}>
                    <span style={{ fontWeight: noti.read_date ? "normal" : "bold", color: "#333" }}>{noti.message}</span>
                    <div style={{ fontSize: "12px", color: "#999", marginTop: "5px" }}>{dayjs(noti.cre_date).format("YYYY-MM-DD HH:mm")}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", marginLeft: "15px" }}>
                  {!noti.read_date ? (
                    <span style={{ color: "red", fontSize: "12px", fontWeight: "bold" }}>● N</span>
                  ) : (
                    <span style={{ color: "#999", fontSize: "12px" }}>읽음 ({dayjs(noti.read_date).format("YYYY-MM-DD HH:mm")})</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default NotificationList;
