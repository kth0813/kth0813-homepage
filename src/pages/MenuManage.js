import { useCallback, useEffect, useState, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import { SkeletonLine } from "../components/Skeleton";

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
    const { data, error } = await supabase.from("category").select("*").eq("del_yn", "N").order("order", { ascending: true, nullsFirst: false }).order("seq", { ascending: true });

    if (!error) {
      setCategories(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loginUser || loginUser.admin_yn !== "Y") {
      showAlert("관리자만 접근할 수 있는 페이지야.");
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
      showAlert("메뉴 이름을 입력해줘.");
      return;
    }

    if (newMenu.order < 2) {
      showAlert("순서는 2 이상이어야 해.");
      return;
    }

    const isDuplicateOrder = categories.some((cat) => cat.order === newMenu.order);
    if (isDuplicateOrder) {
      showAlert("이미 사용 중인 순서야. 다른 숫자를 지정해줘.");
      return;
    }

    const { error } = await supabase.from("category").insert([{ name: newMenu.name, description: newMenu.description, order: newMenu.order, show_yn: newMenu.show_yn, del_yn: "N" }]);
    if (error) {
      showAlert("메뉴 생성 실패: " + error.message);
    } else {
      setNewMenu((prev) => ({ name: "", description: "", order: prev.order + 1, show_yn: "Y" }));
      fetchCategories();
      showAlert("메뉴가 생성되었어!");
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
      showAlert("메뉴 이름을 입력해줘.");
      return;
    }

    if (editMenu.order < 2) {
      showAlert("순서는 2 이상이어야 해.");
      return;
    }

    const isDuplicateOrder = categories.some((cat) => cat.seq !== editingSeq && cat.order === editMenu.order);
    if (isDuplicateOrder) {
      showAlert("이미 사용 중인 순서야. 다른 숫자를 지정해줘.");
      return;
    }

    const { error } = await supabase.from("category").update({ name: editMenu.name, description: editMenu.description, order: editMenu.order, show_yn: editMenu.show_yn }).eq("seq", editingSeq);
    if (error) {
      showAlert("수정 실패: " + error.message);
    } else {
      cancelEdit();
      fetchCategories();
      showAlert("메뉴가 수정되었어!");
    }
  };

  const handleDelete = async (seq) => {
    if (seq === 1) {
      showAlert("자유 게시판은 삭제할 수 없어.");
      return;
    }

    const { count, error: countError } = await supabase.from("board").select("*", { count: "exact", head: true }).eq("category_seq", seq).eq("del_yn", "N");

    if (countError) {
      showAlert("게시글 확인 중 오류가 발생했어.");
      return;
    }

    if (count > 0) {
      showAlert(`현재 해당 메뉴에 ${count}개의 게시글이 존재해서 삭제할 수 없어. 게시글을 먼저 삭제해줘.`);
      return;
    }

    if (!window.confirm("정말 이 메뉴를 삭제할 거야? 복구할 수 없어.")) return;

    const { error } = await supabase.from("category").update({ del_yn: "Y" }).eq("seq", seq);
    if (error) {
      showAlert("삭제 실패: " + error.message);
    } else {
      fetchCategories();
      showAlert("메뉴가 삭제되었어.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">⚙️ 메뉴 관리</h2>
      </div>

      <div style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "32px", boxShadow: "var(--shadow-sm)" }}>
        <h3 style={{ fontSize: "18px", marginBottom: "16px", color: "var(--header-bg)" }}>새 메뉴 추가</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="메뉴 이름"
            value={newMenu.name}
            onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })}
            className="input-field"
            style={{ flex: 1, minWidth: "150px" }}
          />
          <input
            type="text"
            placeholder="메뉴 설명"
            value={newMenu.description}
            onChange={(e) => setNewMenu({ ...newMenu, description: e.target.value })}
            className="input-field"
            style={{ flex: 2, minWidth: "200px" }}
          />
          <input
            type="number"
            placeholder="순서"
            value={newMenu.order}
            onChange={(e) => setNewMenu({ ...newMenu, order: Number(e.target.value) })}
            className="input-field"
            style={{ width: "80px" }}
            min={2}
          />
          <select value={newMenu.show_yn} onChange={(e) => setNewMenu({ ...newMenu, show_yn: e.target.value })} className="select-field" style={{ width: "100px" }}>
            <option value="Y">공개</option>
            <option value="N">비공개</option>
          </select>
          <button onClick={handleAdd} className="btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
            추가
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "10%", textAlign: "center" }}>순서</th>
              <th style={{ width: "20%" }}>이름</th>
              <th style={{ width: "35%" }}>설명</th>
              <th style={{ width: "15%", textAlign: "center" }}>공개 여부</th>
              <th style={{ width: "20%", textAlign: "center" }}>관리</th>
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
                        className="input-field"
                        style={{ width: "60px", padding: "6px" }}
                        min={2}
                      />
                    ) : (
                      cat.order || cat.seq
                    )}
                  </td>
                  <td>
                    {editingSeq === cat.seq ? (
                      <input type="text" value={editMenu.name} onChange={(e) => setEditMenu({ ...editMenu, name: e.target.value })} className="input-field" style={{ width: "100%", padding: "6px" }} />
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
                        style={{ width: "100%", padding: "6px" }}
                      />
                    ) : (
                      <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>{cat.description}</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {editingSeq === cat.seq ? (
                      <select value={editMenu.show_yn} onChange={(e) => setEditMenu({ ...editMenu, show_yn: e.target.value })} className="select-field" style={{ width: "100%", padding: "6px" }}>
                        <option value="Y">공개</option>
                        <option value="N">비공개</option>
                      </select>
                    ) : (
                      <span style={{ color: cat.show_yn === "Y" ? "var(--primary-color)" : "var(--text-muted)", fontWeight: "bold", fontSize: "14px" }}>{cat.show_yn === "Y" ? "공개" : "비공개"}</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {cat.seq === 1 ? (
                      <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>기본 메뉴</span>
                    ) : editingSeq === cat.seq ? (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={handleUpdate} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
                          저장
                        </button>
                        <button onClick={cancelEdit} className="btn-outline" style={{ padding: "6px 12px", fontSize: "13px" }}>
                          취소
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button onClick={() => startEdit(cat)} className="btn-outline" style={{ padding: "6px 12px", fontSize: "13px" }}>
                          수정
                        </button>
                        <button onClick={() => handleDelete(cat.seq)} className="btn-danger" style={{ padding: "6px 12px", fontSize: "13px" }}>
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
                  메뉴가 없어.
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
