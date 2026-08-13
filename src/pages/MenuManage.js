import { useCallback, useEffect, useState, useMemo } from "react";
import { dbService } from "../services/DbService";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import { SkeletonLine } from "../components/Skeleton";
import { IconSettings } from "../components/Icons";
import PageHeader from "../components/PageHeader";

function MenuManage() {
  const navigate = useNavigate();
  const loginUser = useMemo(() => JSON.parse(localStorage.getItem("loginUser")), []);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newMenu, setNewMenu] = useState({ name: "", description: "", order: 2, show_yn: "Y" });
  const [editingSeq, setEditingSeq] = useState(null);
  const [editMenu, setEditMenu] = useState({ name: "", description: "", order: 2, show_yn: "Y" });

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    const { data, error } = await dbService.getCategories();

    if (!error) {
      setCategories(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loginUser || loginUser.admin_yn !== "Y") {
      showAlert("관리자만 접근할 수 있는 페이지입니다.");
      navigate("/");
      return;
    }
    fetchCategories();
  }, [fetchCategories, loginUser, navigate]);

  useEffect(() => {
    if (categories.length > 0) {
      const maxOrder = Math.max(...categories.map((c) => c.order || 0));
      setNewMenu((prev) => ({ ...prev, order: Math.max(2, maxOrder + 1) }));
    }
  }, [categories]);

  const handleAdd = async () => {
    if (!newMenu.name.trim()) {
      showAlert("메뉴 이름을 입력해주세요.");
      return;
    }

    if (newMenu.order < 2) {
      showAlert("순서는 2 이상이어야 합니다.");
      return;
    }

    const isDuplicateOrder = categories.some((cat) => cat.order === newMenu.order);
    if (isDuplicateOrder) {
      showAlert("이미 사용 중인 순서입니다. 다른 숫자를 지정해주세요.");
      return;
    }

    const { error } = await dbService.insertCategory({ name: newMenu.name, description: newMenu.description, order: newMenu.order, show_yn: newMenu.show_yn, del_yn: "N" });
    if (error) {
      showAlert("메뉴 생성 실패: " + error.message);
    } else {
      setNewMenu((prev) => ({ name: "", description: "", order: prev.order + 1, show_yn: "Y" }));
      fetchCategories();
      showAlert("메뉴가 생성되었습니다!");
    }
  };

  const startEdit = (cat) => {
    setEditingSeq(cat.seq);
    setEditMenu({ name: cat.name, description: cat.description || "", order: cat.order || 0, show_yn: cat.show_yn || "Y" });
  };

  const cancelEdit = () => {
    setEditingSeq(null);
    setEditMenu({ name: "", description: "", order: 2, show_yn: "Y" });
  };

  const handleUpdate = async () => {
    if (!editMenu.name.trim()) {
      showAlert("메뉴 이름을 입력해주세요.");
      return;
    }

    if (editMenu.order < 2) {
      showAlert("순서는 2 이상이어야 합니다.");
      return;
    }

    const isDuplicateOrder = categories.some((cat) => cat.seq !== editingSeq && cat.order === editMenu.order);
    if (isDuplicateOrder) {
      showAlert("이미 사용 중인 순서입니다. 다른 숫자를 지정해주세요.");
      return;
    }

    const { error } = await dbService.updateCategory(editingSeq, { name: editMenu.name, description: editMenu.description, order: editMenu.order, show_yn: editMenu.show_yn });
    if (error) {
      showAlert("수정 실패: " + error.message);
    } else {
      cancelEdit();
      fetchCategories();
      showAlert("메뉴가 수정되었습니다!");
    }
  };

  const handleDelete = async (seq) => {
    if (seq === 1) {
      showAlert("자유 게시판은 삭제할 수 없습니다.");
      return;
    }

    const { count, error: countError } = await dbService.getPostCountByCategory(seq);

    if (countError) {
      showAlert("게시글 확인 중 오류가 발생했습니다.");
      return;
    }

    if (count > 0) {
      showAlert(`현재 해당 메뉴에 ${count}개의 게시글이 존재하여 삭제할 수 없습니다. 게시글을 먼저 삭제해주세요.`);
      return;
    }

    if (!window.confirm("정말 이 메뉴를 삭제하시겠습니까? 복구할 수 없습니다.")) return;

    const { error } = await dbService.updateCategory(seq, { del_yn: "Y" });
    if (error) {
      showAlert("삭제 실패: " + error.message);
    } else {
      fetchCategories();
      showAlert("메뉴가 삭제되었습니다.");
    }
  };

  return (
    <div className="page-container">
      {/* Standardized Header Banner */}
      <PageHeader
        icon={IconSettings}
        title="메뉴 관리 (Menu Management)"
        description="사이트 전체 카테고리 메뉴 구조와 정렬 순서를 설정합니다."
      />

      <div className="dashboard-card mb32 p24" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
        <h3 className="text16 font-bold mb16" style={{ color: "#0F172A" }}>새 메뉴 추가</h3>
        <div className="flex items-center gap12 flex-wrap">
          <input
            type="text"
            placeholder="메뉴 이름"
            value={newMenu.name}
            onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
            className="input-field"
            style={{ flex: 1, minWidth: "150px", height: "38px", fontSize: "13px", padding: "0 12px" }}
          />
          <input
            type="text"
            placeholder="메뉴 설명"
            value={newMenu.description}
            onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
            className="input-field"
            style={{ flex: 2, minWidth: "200px", height: "38px", fontSize: "13px", padding: "0 12px" }}
          />
          <div className="flex items-center gap6">
            <span className="text13 font-semibold text-muted">순서:</span>
            <input
              type="number"
              placeholder="순서"
              value={newMenu.order}
              onChange={(e) => setNewMenu({ ...newMenu, order: Number(e.target.value) })}
              className="input-field font-semibold text-center"
              style={{ width: "70px", height: "38px", fontSize: "13px", padding: "0 8px" }}
              min={2}
            />
          </div>
          <select value={newMenu.show_yn} onChange={(e) => setNewMenu({ ...newMenu, show_yn: e.target.value })} className="select-field" style={{ width: "90px", height: "38px", fontSize: "13px", padding: "0 8px" }}>
            <option value="Y">공개</option>
            <option value="N">비공개</option>
          </select>
          <button onClick={handleAdd} className="btn-primary font-semibold flex items-center justify-center" style={{ width: "auto", height: "38px", padding: "0 20px", fontSize: "13px", background: "#2563EB", color: "white", borderRadius: "8px" }}>
            + 추가
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "10%", textAlign: "center" }}>순서</th>
              <th style={{ width: "25%" }}>이름</th>
              <th style={{ width: "35%" }}>설명</th>
              <th style={{ width: "15%", textAlign: "center" }}>공개 여부</th>
              <th style={{ width: "15%", textAlign: "center" }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td style={{ display: "flex", justifyContent: "center" }}>
                    <SkeletonLine height="20px" width="30px" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="80%" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="90%" />
                  </td>
                  <td style={{ display: "flex", justifyContent: "center" }}>
                    <SkeletonLine height="20px" width="40px" />
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
              categories.map((cat) => (
                <tr key={cat.seq}>
                  <td style={{ textAlign: "center" }}>
                    {editingSeq === cat.seq ? (
                      <input
                        type="number"
                        value={editMenu.order}
                        onChange={(e) => setEditMenu({ ...editMenu, order: Number(e.target.value) })}
                        className="input-field font-semibold text-center"
                        style={{ width: "60px", height: "30px", padding: "0 4px", fontSize: "13px" }}
                        min={2}
                      />
                    ) : (
                      <span className="font-semibold text-slate-700">{cat.order || cat.seq}</span>
                    )}
                  </td>
                  <td className="font-semibold" style={{ color: "#0F172A" }}>
                    {editingSeq === cat.seq ? (
                      <input type="text" value={editMenu.name} onChange={(e) => setEditMenu({ ...editMenu, name: e.target.value })} className="input-field" style={{ width: "100%", height: "30px", padding: "0 8px", fontSize: "13px" }} />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td>
                    {editingSeq === cat.seq ? (
                      <input
                        type="text"
                        value={editMenu.description}
                        onChange={(e) => setEditMenu({ ...editMenu, description: e.target.value })}
                        className="input-field"
                        style={{ width: "100%", height: "30px", padding: "0 8px", fontSize: "13px" }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{cat.description}</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {editingSeq === cat.seq ? (
                      <select value={editMenu.show_yn} onChange={(e) => setEditMenu({ ...editMenu, show_yn: e.target.value })} className="select-field" style={{ width: "90px", height: "30px", padding: "0 4px", fontSize: "12px" }}>
                        <option value="Y">공개</option>
                        <option value="N">비공개</option>
                      </select>
                    ) : cat.show_yn === "Y" ? (
                      <span className="badge-tech font-semibold" style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>
                        공개
                      </span>
                    ) : (
                      <span className="badge-tech font-semibold" style={{ background: "#F1F5F9", color: "#64748B", border: "1px solid #E2E8F0", padding: "3px 10px", borderRadius: "12px", fontSize: "12px" }}>
                        비공개
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {cat.seq === 1 ? (
                      <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>기본 메뉴</span>
                    ) : editingSeq === cat.seq ? (
                      <div className="flex gap6 justify-center">
                        <button onClick={handleUpdate} className="btn-primary font-semibold" style={{ height: "30px", padding: "0 12px", fontSize: "12px", background: "#2563EB", color: "white", borderRadius: "6px" }}>
                          저장
                        </button>
                        <button onClick={cancelEdit} className="btn-outline-sm font-semibold" style={{ height: "30px", padding: "0 10px", fontSize: "12px", borderRadius: "6px" }}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap6 justify-center">
                        <button onClick={() => startEdit(cat)} className="btn-outline-sm font-semibold" style={{ height: "30px", padding: "0 10px", fontSize: "12px", borderRadius: "6px" }}>
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
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  메뉴가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MenuManage;
