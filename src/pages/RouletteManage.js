import React, { useState, useEffect } from "react";
import { dbService } from "../services/DbService";
import { showToast, showConfirm } from "../utils/Alert";
import { IconRoulette } from "../components/Icons";
import PageHeader from "../components/PageHeader";
import AdminDemoBanner from "../components/AdminDemoBanner";

const RouletteManage = () => {
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("N"); // 'M', 'F', 'N'

  const checkDemoGuard = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const loginUser = JSON.parse(localStorage.getItem("loginUser"));
    if (loginUser?.admin_yn !== "Y") {
      showToast("포트폴리오 체험 모드에서는 읽기 권한만 제공됩니다.", "warning");
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await dbService.getAllRouletteParticipants();
      if (error) throw error;
      const sorted = (data || []).sort((a, b) =>
        (a.user_name || a.name || "").localeCompare(b.user_name || b.name || "", "ko")
      );
      setParticipants(sorted);
    } catch (err) {
      console.error(err);
      showToast("참가자 목록을 불러오는 데 실패했습니다.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (checkDemoGuard(e)) return;
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
    if (checkDemoGuard()) return;
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
    if (checkDemoGuard()) return;
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
      {/* Admin Demo Banner */}
      <AdminDemoBanner />

      {/* Standardized Header Banner */}
      <PageHeader
        icon={IconRoulette}
        title="룰렛 참가자 관리 (Roulette Candidates)"
        description="룰렛 돌리기 게임에 사용할 참가자 명단을 등록하고 관리합니다."
      />

      {/* Add New Candidate Card */}
      <div className="dashboard-card mb20 p24" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px", marginBottom: "20px" }}>
        <h3 className="text16 font-bold mb16" style={{ color: "#0F172A" }}>신규 참가자 추가</h3>
        <form onSubmit={handleAddSubmit} className="flex items-center gap16 flex-wrap">
          <div className="flex items-center gap8 flex-1" style={{ minWidth: "200px" }}>
            <label className="text13 font-bold text-muted whitespace-nowrap m0">
              이름
            </label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="참가자 이름 입력"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ height: "38px", fontSize: "13px", padding: "0 12px", margin: 0 }}
            />
          </div>
          <div className="flex items-center gap8" style={{ width: "160px" }}>
            <label className="text13 font-bold text-muted whitespace-nowrap m0">
              성별
            </label>
            <select
              className="select-field w-full"
              value={newGender}
              onChange={(e) => setNewGender(e.target.value)}
              style={{ height: "38px", fontSize: "13px", padding: "0 8px", margin: 0 }}
            >
              <option value="N">선택안함</option>
              <option value="M">남</option>
              <option value="F">여</option>
            </select>
          </div>
          <button
            type="submit"
            className="btn-primary font-bold flex items-center justify-center"
            style={{ width: "auto", height: "38px", padding: "0 24px", fontSize: "13px", background: "#2563EB", color: "white", borderRadius: "8px" }}
          >
            + 추가
          </button>
        </form>
      </div>

      {/* Candidates Table List */}
      <div className="dashboard-card p24" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
        <div className="flex justify-between items-center mb16">
          <h3 className="text16 font-bold m0" style={{ color: "#0F172A" }}>
            참가자 목록 <span className="text13 text-muted font-normal">(총 {participants.length}명)</span>
          </h3>
          <button className="btn-outline-sm font-semibold text12" onClick={fetchParticipants} style={{ height: "32px", padding: "0 12px", borderRadius: "6px" }}>
            🔄 새로고침
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py32 text-muted">로딩 중...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py32 text-muted border-default rounded-md" style={{ background: "#F8FAFC" }}>
            등록된 참가자가 없습니다.
          </div>
        ) : (
          <div style={{ maxHeight: "550px", overflowY: "auto", border: "1px solid #E2E8F0", borderRadius: "8px" }}>
            <table className="data-table w-full" style={{ tableLayout: "fixed" }}>
              <thead>
                <tr>
                  <th style={{ width: "10%", textAlign: "center" }}>번호</th>
                  <th style={{ width: "35%" }}>이름</th>
                  <th style={{ width: "15%", textAlign: "center" }}>성별</th>
                  <th style={{ width: "20%", textAlign: "center" }}>당첨 여부</th>
                  <th style={{ width: "20%", textAlign: "center" }}>관리</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, index) => (
                  <tr key={p.seq}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td className="font-semibold" style={{ color: "#0F172A" }}>{p.user_name || p.name}</td>
                    <td style={{ textAlign: "center" }} className="text-muted text13">
                      {p.gender === "M" ? "남" : p.gender === "F" ? "여" : "-"}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {p.win_yn === "Y" ? (
                        <span className="badge-tech font-semibold" style={{ background: "#DCFCE7", color: "#166534", border: "1px solid #BBF7D0", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>
                          당첨 (Y)
                        </span>
                      ) : (
                        <span className="badge-tech font-semibold" style={{ background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>
                          대기 (N)
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="flex gap6 justify-center">
                        <button
                          className="btn-outline-sm font-semibold"
                          onClick={() => handleToggleWin(p.seq, p.win_yn)}
                          style={{ height: "30px", padding: "0 10px", fontSize: "12px", color: "#334155", borderRadius: "6px" }}
                        >
                          상태 변경
                        </button>
                        <button
                          className="btn-outline-sm font-semibold"
                          onClick={() => handleDelete(p.seq, p.user_name || p.name)}
                          style={{ height: "30px", padding: "0 10px", fontSize: "12px", color: "#EF4444", borderColor: "#FECDD3", borderRadius: "6px" }}
                        >
                          삭제
                        </button>
                      </div>
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
