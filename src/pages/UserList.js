import { useCallback, useEffect, useState, useMemo } from "react";
import { dbService } from "../services/DbService";
import dayjs from "dayjs";
import { Highlight } from "../utils/Highlight";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import { SkeletonLine } from "../components/Skeleton";

function UserList() {
  const navigate = useNavigate();
  const loginUser = useMemo(() => JSON.parse(localStorage.getItem("loginUser")), []);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchType, setSearchType] = useState("id");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSearchType, setActiveSearchType] = useState("id");
  const [activeSearchKeyword, setActiveSearchKeyword] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);

    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = dbService.getUsersQuery().order("seq", { ascending: false }).range(from, to);

    if (activeSearchKeyword.trim()) {
      query = query.ilike(activeSearchType, `%${activeSearchKeyword}%`);
    }

    const { data, error, count } = await query;

    if (!error) {
      setUsers(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, pageSize, activeSearchType, activeSearchKeyword]);

  useEffect(() => {
    if (!loginUser || loginUser.admin_yn !== "Y") {
      showAlert("관리자만 접근할 수 있는 페이지입니다.");
      navigate("/");
      return;
    }
    fetchUsers();
  }, [fetchUsers, currentPage, pageSize, loginUser, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveSearchType(searchType);
    setActiveSearchKeyword(searchKeyword);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">👥 사용자 목록</h2>
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} className="filter-group">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-field">
            <option value="id">아이디</option>
            <option value="name">이름</option>
          </select>
          <input
            type="text"
            placeholder="검색어 입력"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field"
            style={{ width: "200px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e);
              }
            }}
          />
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

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>번호</th>
              <th style={{ width: "40%" }}>아이디</th>
              <th style={{ width: "30%" }}>이름</th>
              <th style={{ width: "15%" }}>가입일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td>
                    <SkeletonLine height="20px" width="30px" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="120px" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="80px" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="120px" />
                  </td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user) => (
                <tr key={user.seq}>
                  <td>{user.seq}</td>
                  <td>{Highlight(user.id, activeSearchKeyword)}</td>
                  <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {user.profile_url ? (
                      <img src={user.profile_url} alt="프로필" className="comment-img" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <div className="mini-comment-profile">👤</div>
                    )}
                    {Highlight(user.name, activeSearchKeyword)}
                  </td>
                  <td style={{ color: "var(--text-muted)", fontSize: "14px" }}>{dayjs(user.cre_date).format("YYYY.MM.DD HH:mm")}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  해당하는 유저가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
