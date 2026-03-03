import { useEffect, useState, useCallback } from "react";
import { dbService } from "../services/DbService";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { showAlert, showToast, showConfirm } from "../utils/Alert";

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState("received");
  const [selectedSeqs, setSelectedSeqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receiverSearch, setReceiverSearch] = useState("");
  const [receiverResults, setReceiverResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const [messageContent, setMessageContent] = useState("");

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    if (!loginUser?.seq) return;

    const { data, error } = await dbService.getMessagesByUserId(loginUser.seq, tab);
    if (!error && data) {
      setMessages(data);
    } else {
      console.error(error);
    }
  }, [loginUser?.seq, tab]);

  useEffect(() => {
    setSelectedSeqs([]);
  }, [tab]);

  useEffect(() => {
    if (!loginUser) {
      navigate("/login");
      return;
    }
    fetchMessages();

    const channel = supabase
      .channel("message-realtime-list")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "message",
          filter: `receiver_seq=eq.${loginUser.seq}`
        },
        (payload) => {
          if (tab === "received") {
            fetchMessages();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loginUser, tab, navigate, fetchMessages]);

  const markAsRead = async (seq, read_date) => {
    if (tab === "received" && !read_date) {
      await dbService.readMessages([seq]);
      fetchMessages();
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSeqs(messages.map((m) => m.seq));
    } else {
      setSelectedSeqs([]);
    }
  };

  const handleSelect = (seq) => {
    setSelectedSeqs((prev) => (prev.includes(seq) ? prev.filter((id) => id !== seq) : [...prev, seq]));
  };

  const handleReadSelected = async () => {
    if (tab !== "received" || selectedSeqs.length === 0) return;
    const unreadSeqs = messages.filter((m) => selectedSeqs.includes(m.seq) && !m.read_date).map((m) => m.seq);
    if (unreadSeqs.length > 0) {
      await dbService.readMessages(unreadSeqs);
    }
    setSelectedSeqs([]);
    fetchMessages();
  };

  const handleDeleteSelected = async () => {
    if (selectedSeqs.length === 0) return;
    const isConfirmed = await showConfirm("선택한 쪽지를 삭제하시겠습니까?");
    if (!isConfirmed) return;
    await dbService.softDeleteMessages(selectedSeqs);
    setSelectedSeqs([]);
    fetchMessages();
  };

  const handleReadAll = async () => {
    if (tab !== "received") return;
    const isConfirmed = await showConfirm("모든 받은 쪽지를 읽음 처리하시겠습니까?");
    if (!isConfirmed) return;
    const unreadSeqs = messages.filter((m) => !m.read_date).map((m) => m.seq);
    if (unreadSeqs.length > 0) {
      await dbService.readMessages(unreadSeqs);
      fetchMessages();
    }
  };

  const handleDeleteAll = async () => {
    const isConfirmed = await showConfirm(`모든 ${tab === "received" ? "받은" : "보낸"} 쪽지를 삭제하시겠습니까?`);
    if (!isConfirmed) return;
    await dbService.softDeleteAllMessages(loginUser.seq, tab);
    fetchMessages();
  };

  const handleSearchReceiver = async () => {
    if (!receiverSearch.trim()) {
      showAlert("검색할 아이디를 입력해주세요.");
      return;
    }
    const { data, error } = await dbService.searchUserById(receiverSearch);

    setHasSearched(true);
    if (!error && data) {
      setReceiverResults(data);
    } else {
      setReceiverResults([]);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchReceiver();
    }
  };

  const handleSendMessage = async () => {
    if (!selectedReceiver) {
      showAlert("받는 사람을 선택해주세요.");
      return;
    }
    if (!messageContent.trim()) {
      showAlert("내용을 입력해주세요.");
      return;
    }

    const isConfirmed = await showConfirm(`${selectedReceiver.name}(${selectedReceiver.id})님에게 쪽지를 보내시겠습니까?`);

    if (isConfirmed) {
      const { error } = await dbService.insertMessage({
        sender_seq: loginUser.seq,
        receiver_seq: selectedReceiver.seq,
        content: messageContent
      });

      if (!error) {
        showToast("쪽지를 보냈습니다.", "success");
        setIsModalOpen(false);
        setSelectedReceiver(null);
        setMessageContent("");
        setReceiverSearch("");
        setReceiverResults([]);
        setHasSearched(false);
        if (tab === "sent") {
          fetchMessages();
        }
      } else {
        showAlert("쪽지 전송에 실패했습니다.");
      }
    }
  };

  return (
    <div className="board-list-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>✉️ 내 쪽지함</h2>
        <button className="btn-primary" style={{ width: "auto", padding: "8px 16px" }} onClick={() => setIsModalOpen(true)}>
          쪽지 보내기
        </button>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className={tab === "received" ? "btn-primary" : "btn-secondary"} style={{ width: "auto", padding: "8px 16px" }} onClick={() => setTab("received")}>
            받은 쪽지
          </button>
          <button className={tab === "sent" ? "btn-primary" : "btn-secondary"} style={{ width: "auto", padding: "8px 16px" }} onClick={() => setTab("sent")}>
            보낸 쪽지
          </button>
        </div>
        {messages.length > 0 && (
          <div style={{ display: "flex", gap: "8px" }}>
            {tab === "received" && (
              <>
                {selectedSeqs.length > 0 && (
                  <button className="btn-secondary" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleReadSelected}>
                    선택 읽음
                  </button>
                )}
                <button className="btn-outline" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleReadAll}>
                  전체 읽음
                </button>
              </>
            )}
            {selectedSeqs.length > 0 && (
              <button className="btn-secondary" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleDeleteSelected}>
                선택 삭제
              </button>
            )}
            <button className="btn-danger" style={{ width: "auto", padding: "6px 12px", fontSize: "13px" }} onClick={handleDeleteAll}>
              전체 삭제
            </button>
          </div>
        )}
      </div>

      {messages.length === 0 ? (
        <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>{tab === "received" ? "받은 쪽지가 없습니다." : "보낸 쪽지가 없습니다."}</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", padding: "10px 15px", borderBottom: "2px solid #ddd", fontWeight: "bold" }}>
            <input
              type="checkbox"
              onChange={handleSelectAll}
              checked={selectedSeqs.length === messages.length && messages.length > 0}
              style={{ marginRight: "15px", cursor: "pointer", width: "16px", height: "16px" }}
            />
            <span>전체 선택</span>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {messages.map((msg) => (
              <li
                key={msg.seq}
                style={{
                  padding: "15px",
                  borderBottom: "1px solid #eee",
                  backgroundColor: tab === "received" && !msg.read_date ? "#f0f8ff" : "transparent",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={selectedSeqs.includes(msg.seq)}
                    onChange={() => handleSelect(msg.seq)}
                    style={{ marginRight: "15px", cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  <div onClick={() => markAsRead(msg.seq, msg.read_date)} style={{ cursor: tab === "received" && !msg.read_date ? "pointer" : "default", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontWeight: "bold", color: "#555" }}>
                        {tab === "received" ? `보낸 사람: ${msg.sender?.name || "알 수 없음"}` : `받는 사람: ${msg.receiver?.name || "알 수 없음"}`}
                      </span>
                      <span style={{ fontSize: "12px", color: "#999" }}>{dayjs(msg.cre_date).format("YYYY-MM-DD HH:mm")}</span>
                    </div>
                    <p style={{ margin: 0, color: "#333", whiteSpace: "pre-wrap" }}>{msg.content}</p>
                  </div>
                </div>
                {tab === "received" && (
                  <div style={{ textAlign: "right", marginLeft: "15px", fontSize: "12px", fontWeight: "bold", color: !msg.read_date ? "red" : "#999" }}>
                    {!msg.read_date ? "안 읽음" : `읽음 (${dayjs(msg.read_date).format("YYYY-MM-DD HH:mm")})`}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}
        >
          <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "90%" }}>
            <h3 style={{ marginBottom: "16px", marginTop: "0" }}>쪽지 보내기</h3>

            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">받는 사람 검색 (아이디)</label>
              <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                <input
                  type="text"
                  className="input-field"
                  value={receiverSearch}
                  onChange={(e) => setReceiverSearch(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="아이디를 입력하세요"
                />
                <button className="btn-secondary" onClick={handleSearchReceiver}>
                  검색
                </button>
              </div>

              {hasSearched && receiverResults.length === 0 && (
                <div style={{ padding: "8px", color: "#666", fontSize: "14px", border: "1px solid #eee", borderRadius: "8px", textAlign: "center", backgroundColor: "#fafafa" }}>
                  검색 결과가 없습니다.
                </div>
              )}

              {receiverResults.length > 0 && (
                <ul style={{ listStyle: "none", padding: 0, border: "1px solid #eee", maxHeight: "150px", overflowY: "auto", borderRadius: "8px" }}>
                  {receiverResults.map((user) => (
                    <li
                      key={user.seq}
                      onClick={() => {
                        setSelectedReceiver(user);
                        setReceiverResults([]);
                        setHasSearched(false);
                      }}
                      style={{ padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid #eee", backgroundColor: selectedReceiver?.seq === user.seq ? "#f0f8ff" : "transparent" }}
                    >
                      {user.name} ({user.id})
                    </li>
                  ))}
                </ul>
              )}
              {selectedReceiver && (
                <div style={{ marginTop: "8px", fontSize: "14px", fontWeight: "bold", color: "var(--primary-color)" }}>
                  받는 사람: {selectedReceiver.name} ({selectedReceiver.id})
                </div>
              )}
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="form-label">내용</label>
              <textarea
                className="input-field"
                style={{ height: "120px", resize: "none" }}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="쪽지 내용을 입력하세요"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                className="btn-secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedReceiver(null);
                  setReceiverResults([]);
                  setHasSearched(false);
                  setReceiverSearch("");
                  setMessageContent("");
                }}
              >
                취소
              </button>
              <button className="btn-primary" style={{ width: "auto" }} onClick={handleSendMessage}>
                보내기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessageList;
