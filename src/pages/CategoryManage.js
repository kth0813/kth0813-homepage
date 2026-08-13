import React, { useState, useEffect } from "react";
import { dbService } from "../services/DbService";
import { showToast } from "../utils/Alert";
import { SkeletonLine } from "../components/Skeleton";
import "../css/App.css";

const PRESET_COLORS = [
  "#2563EB", // Blue
  "#10B981", // Emerald / Green
  "#F59E0B", // Amber / Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#EF4444", // Red
  "#64748B"  // Slate / Gray
];

const CategoryManage = ({ onClose }) => {
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);

  // Edit state
  const [editingSeq, setEditingSeq] = useState(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  useEffect(() => {
    if (!loginUser) {
      showToast("로그인이 필요합니다.", "warning");
      onClose();
      return;
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginUser?.seq]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await dbService.getScheduleCategories(loginUser.seq);
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      showToast("카테고리를 불러오는데 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCatName.trim()) {
      showToast("카테고리 이름을 입력해주세요.", "warning");
      return;
    }

    try {
      const { error } = await dbService.insertScheduleCategory({
        category_name: newCatName,
        default_color: newCatColor,
        del_yn: "N",
        user_seq: loginUser.seq
      });

      if (error) throw error;

      showToast("새 카테고리가 추가되었습니다.", "success");
      setNewCatName("");
      setNewCatColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast("카테고리 추가에 실패했습니다.", "error");
    }
  };

  const handleEditClick = (category) => {
    setEditingSeq(category.seq);
    setEditCatName(category.category_name);
    setEditCatColor(category.default_color || "#2563EB");
  };

  const handleUpdate = async () => {
    if (!editCatName.trim()) {
      showToast("카테고리 이름을 입력해주세요.", "warning");
      return;
    }

    try {
      const { error } = await dbService.updateScheduleCategory(editingSeq, {
        category_name: editCatName,
        default_color: editCatColor
      });
      if (error) throw error;
      showToast("카테고리가 수정되었습니다.", "success");
      setEditingSeq(null);
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast("카테고리 수정에 실패했습니다.", "error");
    }
  };

  const handleDelete = async (seq) => {
    if (!window.confirm("정말 카테고리를 삭제하시겠습니까? 관련된 일정의 색상이 초기화될 수 있습니다.")) return;
    try {
      const { error } = await dbService.deleteScheduleCategory(seq);
      if (error) throw error;
      showToast("카테고리가 삭제되었습니다.", "success");
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast("카테고리 삭제에 실패했습니다.", "error");
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1100
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="dashboard-card p24"
        style={{
          background: "#FFFFFF",
          borderRadius: "12px",
          width: "680px",
          maxWidth: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
        }}
      >
        <div className="flex justify-between items-center mb20 pb12" style={{ borderBottom: "1px solid #E2E8F0" }}>
          <h2 className="text18 font-bold m0" style={{ color: "#0F172A" }}>🏷️ 카테고리 관리</h2>
          <button className="candidate-chip-remove" onClick={onClose} style={{ width: "24px", height: "24px", fontSize: "12px" }}>
            ✕
          </button>
        </div>

        {/* Add Category Form Card */}
        <div className="mb24 p16" style={{ background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
          <h3 className="text14 font-bold mb12" style={{ color: "#0F172A" }}>새 카테고리 추가</h3>
          <div className="flex items-center gap12 flex-wrap">
            <input
              type="text"
              placeholder="예: 회사 업무, 취미 생활, 생일"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="input-field"
              style={{ flex: 1, minWidth: "160px", height: "38px", fontSize: "13px", padding: "0 12px" }}
            />

            {/* Color Swatch Picker */}
            <div className="flex items-center gap6">
              {PRESET_COLORS.map((color) => (
                <div
                  key={color}
                  onClick={() => setNewCatColor(color)}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: color,
                    cursor: "pointer",
                    border: newCatColor.toLowerCase() === color.toLowerCase() ? "2px solid #0F172A" : "1px solid rgba(0,0,0,0.1)",
                    transform: newCatColor.toLowerCase() === color.toLowerCase() ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s ease"
                  }}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: "28px", height: "28px", padding: 0, border: "1px solid #CBD5E1", borderRadius: "50%", cursor: "pointer" }}
                title="커스텀 색상 선택"
              />
            </div>

            <button onClick={handleAdd} className="btn-primary font-bold" style={{ height: "38px", padding: "0 20px", fontSize: "13px", background: "#2563EB", color: "white", borderRadius: "8px" }}>
              + 추가
            </button>
          </div>
        </div>

        {/* Categories Table */}
        <div className="table-wrapper" style={{ margin: 0 }}>
          <table className="data-table w-full" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "12%", textAlign: "center" }}>No.</th>
                <th style={{ width: "43%" }}>카테고리 이름</th>
                <th style={{ width: "25%", textAlign: "center" }}>색상</th>
                <th style={{ width: "20%", textAlign: "center" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={`skeleton-${index}`}>
                    <td style={{ display: "flex", justifyContent: "center" }}>
                      <SkeletonLine height="20px" width="30px" />
                    </td>
                    <td>
                      <SkeletonLine height="20px" width="70%" />
                    </td>
                    <td style={{ display: "flex", justifyContent: "center" }}>
                      <SkeletonLine height="30px" width="30px" />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <SkeletonLine height="28px" width="50px" />
                        <SkeletonLine height="28px" width="50px" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : categories.length > 0 ? (
                categories.map((cat, idx) => (
                  <tr key={cat.seq}>
                    <td style={{ textAlign: "center", color: "#64748B" }}>{idx + 1}</td>
                    <td>
                      {editingSeq === cat.seq ? (
                        <input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="input-field" style={{ width: "100%", height: "32px", padding: "0 8px", fontSize: "13px" }} />
                      ) : (
                        <span className="font-semibold" style={{ color: "#0F172A" }}>{cat.category_name}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div className="flex justify-center items-center gap6">
                        {editingSeq === cat.seq ? (
                          <div className="flex items-center gap4">
                            {PRESET_COLORS.map((c) => (
                              <div
                                key={c}
                                onClick={() => setEditCatColor(c)}
                                style={{
                                  width: "18px",
                                  height: "18px",
                                  borderRadius: "50%",
                                  background: c,
                                  cursor: "pointer",
                                  border: editCatColor.toLowerCase() === c.toLowerCase() ? "2px solid #0F172A" : "1px solid rgba(0,0,0,0.1)"
                                }}
                              />
                            ))}
                            <input
                              type="color"
                              value={editCatColor}
                              onChange={(e) => setEditCatColor(e.target.value)}
                              style={{ width: "22px", height: "22px", padding: 0, border: "1px solid #CBD5E1", borderRadius: "50%", cursor: "pointer" }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: cat.default_color || "#2563EB",
                              border: "1px solid rgba(0,0,0,0.15)",
                              display: "inline-block"
                            }}
                            title={cat.default_color || "#2563EB"}
                          />
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {cat.seq === 1 ? (
                        <span style={{ color: "#94A3B8", fontSize: "12px" }}>기본 카테고리</span>
                      ) : editingSeq === cat.seq ? (
                        <div className="flex gap6 justify-center">
                          <button onClick={handleUpdate} className="btn-primary font-semibold" style={{ height: "30px", padding: "0 10px", fontSize: "12px", background: "#2563EB", color: "white", borderRadius: "6px" }}>
                            저장
                          </button>
                          <button onClick={() => setEditingSeq(null)} className="btn-outline-sm font-semibold" style={{ height: "30px", padding: "0 10px", fontSize: "12px", borderRadius: "6px" }}>
                            취소
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap6 justify-center">
                          <button onClick={() => handleEditClick(cat)} className="btn-outline-sm font-semibold" style={{ height: "30px", padding: "0 10px", fontSize: "12px", color: "#334155", borderColor: "#CBD5E1", borderRadius: "6px" }}>
                            수정
                          </button>
                          <button onClick={() => handleDelete(cat.seq)} className="btn-outline-sm font-semibold" style={{ height: "30px", padding: "0 10px", fontSize: "12px", color: "#EF4444", borderColor: "#FECDD3", borderRadius: "6px" }}>
                            삭제
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                    등록된 카테고리가 없습니다. 나만의 카테고리를 추가해 보세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Bottom Close Action */}
        <div className="flex justify-end mt24 pt16" style={{ borderTop: "1px solid #E2E8F0" }}>
          <button className="btn-outline-sm font-semibold" onClick={onClose} style={{ height: "36px", padding: "0 20px", fontSize: "13px", color: "#334155", background: "#F1F5F9", borderRadius: "8px" }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManage;
