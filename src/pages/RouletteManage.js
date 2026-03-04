import React, { useState, useEffect } from "react";
import { dbService } from "../services/DbService";
import { showToast, showConfirm } from "../utils/Alert";

const RouletteManage = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("N"); // 'M', 'F', 'N'

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await dbService.getAllRouletteParticipants();
      if (error) throw error;
      setParticipants(data || []);
    } catch (err) {
      console.error(err);
      showToast("참가자 목록을 불러오는 데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast("이름을 입력해주세요.", "error");
      return;
    }

    try {
      const { error } = await dbService.insertRouletteParticipant({
        user_name: newName.trim(),
        gender: newGender,
        win_yn: "N"
      });
      if (error) throw error;

      showToast("참가자가 추가되었습니다.");
      setNewName("");
      setNewGender("N");
      fetchParticipants();
    } catch (err) {
      console.error(err);
      showToast("참가자 추가 중 오류가 발생했습니다.", "error");
    }
  };

  const handleDelete = async (seq, name) => {
    const isConfirmed = await showConfirm(`'${name}' 참가자를 삭제하시겠습니까?`);
    if (!isConfirmed) return;

    try {
      const { error } = await dbService.deleteRouletteParticipant(seq);
      if (error) throw error;
      showToast("참가자가 삭제되었습니다.");
      fetchParticipants();
    } catch (err) {
      console.error(err);
      showToast("삭제 중 오류가 발생했습니다.", "error");
    }
  };

  const handleToggleWin = async (seq, currentStatus) => {
    const newStatus = currentStatus === "Y" ? "N" : "Y";
    try {
      const { error } = await dbService.updateRouletteParticipant(seq, { win_yn: newStatus });
      if (error) throw error;
      showToast("상태가 변경되었습니다.");
      fetchParticipants();
    } catch (err) {
      console.error(err);
      showToast("상태 갱신 중 오류가 발생했습니다.", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <h2 className="page-title">🎡 룰렛 참가자 관리</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>룰렛 게임에 사용할 기초 데이터베이스 참가자 명단을 관리합니다.</p>
      </div>

      <div className="game-container mb32" style={{ padding: "24px" }}>
        <h3 className="text16 font-bold mb16">신규 참가자 추가</h3>
        <form onSubmit={handleAddSubmit} style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "200px" }}>
            <label className="text14 font-bold" style={{ whiteSpace: "nowrap", margin: 0 }}>
              이름
            </label>
            <input type="text" className="input-field w-full" placeholder="참가자 이름" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ margin: 0 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "180px" }}>
            <label className="text14 font-bold" style={{ whiteSpace: "nowrap", margin: 0 }}>
              성별
            </label>
            <select className="input-field w-full" value={newGender} onChange={(e) => setNewGender(e.target.value)} style={{ margin: 0 }}>
              <option value="N">선택안함</option>
              <option value="M">남</option>
              <option value="F">여</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ padding: "0 24px", height: "42px", whiteSpace: "nowrap", width: "auto" }}>
            추가
          </button>
        </form>
      </div>

      <div className="game-container" style={{ padding: "24px" }}>
        <div className="flex justify-between items-center mb16">
          <h3 className="text16 font-bold">참가자 목록 (총 {participants.length}명)</h3>
          <button className="btn-secondary" onClick={fetchParticipants}>
            새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py32 text-muted">로딩 중...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py32 text-muted border-default rounded-md" style={{ background: "var(--bg-color)" }}>
            등록된 참가자가 없습니다.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="w-full" style={{ borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--bg-color)", borderBottom: "1px solid var(--border-color)" }}>
                  <th className="p12 font-bold text14">번호</th>
                  <th className="p12 font-bold text14">이름</th>
                  <th className="p12 font-bold text14">성별</th>
                  <th className="p12 font-bold text14">당첨 여부</th>
                  <th className="p12 font-bold text14 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.seq} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td className="p12 text14 text-muted">{p.seq}</td>
                    <td className="p12 text14 font-semibold">{p.user_name}</td>
                    <td className="p12 text14">{p.gender === "M" ? "남" : p.gender === "F" ? "여" : "선택안함"}</td>
                    <td className="p12 text14">
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          background: p.win_yn === "Y" ? "#dcfce7" : "#f1f5f9",
                          color: p.win_yn === "Y" ? "#166534" : "var(--text-muted)"
                        }}
                      >
                        {p.win_yn === "Y" ? "당첨 (Y)" : "대기 (N)"}
                      </span>
                    </td>
                    <td className="p12 text-center" style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button className="btn-secondary" onClick={() => handleToggleWin(p.seq, p.win_yn)} style={{ padding: "6px 12px", fontSize: "12px" }}>
                        상태 변경
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(p.seq, p.user_name)} style={{ padding: "6px 12px", fontSize: "12px" }}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouletteManage;
