import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 페이징 및 검색 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchType, setSearchType] = useState("id"); // id 또는 name
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, currentPage, pageSize]); // 페이지 번호나 출력 개수가 바뀌면 다시 호출

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    // 1. 페이징 인덱스 계산 (0부터 시작)
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    // 2. 쿼리 생성 (전체 카운트를 위해 count: 'exact' 설정)
    let query = supabase.from("user").select("seq, id, name, cre_date", { count: "exact" }).eq("del_yn", "N").order("seq", { ascending: false }).range(from, to);

    // 검색 조건 추가
    if (searchKeyword.trim()) {
      query = query.ilike(searchType, `%${searchKeyword}%`);
    }

    const { data, error, count } = await query;

    if (!error) {
      setUsers(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, pageSize, searchKeyword, searchType]);

  // 검색 버튼 클릭 시 (항상 1페이지로 리셋)
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">👥 유저 관리 목록</h2>
      </div>

      {/* 상단 검색 및 필터 바 */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="filter-group">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-field">
            <option value="id">아이디</option>
            <option value="name">이름</option>
          </select>
          <input type="text" placeholder="검색어 입력" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="input-field" style={{ width: "200px" }} />
          <button type="submit" className="btn-secondary">
            검색
          </button>
        </form>

        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="select-field"
        >
          <option value={10}>10명씩 보기</option>
          <option value={25}>25명씩 보기</option>
          <option value={50}>50명씩 보기</option>
        </select>
      </div>

      {/* 유저 테이블 리스트 */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Seq</th>
              <th>아이디</th>
              <th>이름</th>
              <th>가입일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px" }}>
                  로딩 중...
                </td>
              </tr>
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.seq}>
                  <td>{user.seq}</td>
                  <td className="text-link" style={{ cursor: "pointer" }}>
                    {user.id}
                  </td>
                  <td>{user.name}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "14px" }}>{new Date(user.cre_date).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  해당하는 유저가 없어.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 하단 페이지네이션 번호 */}
      {totalPages > 0 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`page-btn ${currentPage === pageNum ? "active" : ""}`}>
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;
