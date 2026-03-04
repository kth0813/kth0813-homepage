import React, { useState, useEffect } from "react";
import { dbService } from "../services/DbService";
import { showToast } from "../utils/Alert";
import { SkeletonLine } from "../components/Skeleton";
import "../css/App.css";

const CategoryManage = ({ onClose }) => {
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add state
  const getRandomColor = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(getRandomColor());

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
      setNewCatColor(getRandomColor());
      fetchCategories();
    } catch (err) {
      console.error(err);
      showToast("카테고리 추가에 실패했습니다.", "error");
    }
  };

  const handleEditClick = (category) => {
    setEditingSeq(category.seq);
    setEditCatName(category.category_name);
    setEditCatColor(category.default_color || "#3b82f6");
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
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1100
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card-bg)",
          padding: "24px",
          borderRadius: "12px",
          width: "700px",
          maxWidth: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.2)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid var(--primary-color)", paddingBottom: "10px" }}>
          <h2 style={{ margin: 0, color: "var(--header-bg)", fontSize: "20px" }}>🏷️ 카테고리 관리</h2>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: "16px", padding: "4px 8px" }}>
            ✕
          </button>
        </div>

        <div className="filter-bar" style={{ marginBottom: "20px", padding: "12px", background: "var(--bg-color)", borderRadius: "8px" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "var(--text-main)" }}>새 카테고리 추가</h3>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="예: 회사 업무, 취미 생활"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="input-field"
              style={{ flex: 1, minWidth: "150px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", fontWeight: "bold" }}>색상</span>
              <input
                type="color"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                style={{ width: "40px", height: "40px", padding: "0", border: "1px solid var(--border-color)", borderRadius: "8px", cursor: "pointer" }}
              />
            </div>
            <button onClick={handleAdd} className="btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
              추가
            </button>
          </div>
        </div>

        <div className="table-wrapper" style={{ margin: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "15%", textAlign: "center" }}>No.</th>
                <th style={{ width: "45%" }}>카테고리 이름</th>
                <th style={{ width: "15%", textAlign: "center" }}>색상</th>
                <th style={{ width: "25%", textAlign: "center" }}>관리</th>
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
                    <td style={{ textAlign: "center", color: "var(--text-muted)" }}>{idx + 1}</td>
                    <td>
                      {editingSeq === cat.seq ? (
                        <input type="text" value={editCatName} onChange={(e) => setEditCatName(e.target.value)} className="input-field" style={{ width: "100%", padding: "6px" }} />
                      ) : (
                        <span style={{ fontWeight: cat.seq === 1 ? "bold" : "normal", color: cat.seq === 1 ? "var(--primary-color)" : "inherit" }}>{cat.category_name}</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {editingSeq === cat.seq ? (
                          <input
                            type="color"
                            value={editCatColor}
                            onChange={(e) => setEditCatColor(e.target.value)}
                            style={{ width: "30px", height: "30px", padding: "0", border: "1px solid var(--border-color)", borderRadius: "4px", cursor: "pointer" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: cat.default_color || "#3b82f6",
                              border: "1px solid rgba(0,0,0,0.1)"
                            }}
                            title={cat.default_color || "#3b82f6"}
                          />
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {cat.seq === 1 ? (
                        <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>공개 카테고리 (수정 불가)</span>
                      ) : editingSeq === cat.seq ? (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button onClick={handleUpdate} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                            저장
                          </button>
                          <button onClick={() => setEditingSeq(null)} className="btn-ghost" style={{ padding: "6px 12px", fontSize: "13px" }}>
                            취소
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          <button onClick={() => handleEditClick(cat)} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                            수정
                          </button>
                          <button onClick={() => handleDelete(cat.seq)} className="btn-ghost" style={{ padding: "6px 12px", fontSize: "13px", color: "var(--danger-color)" }}>
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

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
          <button className="btn-primary" onClick={onClose} style={{ padding: "8px 24px" }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryManage;
