import { useCallback, useEffect, useState, useMemo } from "react";
import { dbService } from "../services/DbService";
import dayjs from "dayjs";
import { Highlight } from "../utils/Highlight";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import { SkeletonLine } from "../components/Skeleton";
import { IconUsers, IconUser } from "../components/Icons";
import PageHeader from "../components/PageHeader";

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
      {/* Standardized Header Banner */}
      <PageHeader
        icon={IconUsers}
        title="사용자 목록 (User Management)"
        description="사이트에 등록된 전체 회원 목록을 검색하고 관리합니다."
      />

      <div className="filter-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "nowrap", marginBottom: "16px" }}>
        <form onSubmit={handleSearch} className="filter-group" style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1 }}>
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-field" style={{ height: "38px", fontSize: "13px", padding: "0 10px" }}>
            <option value="id">아이디</option>
            <option value="name">이름</option>
          </select>
          <input
            type="text"
            placeholder="검색어 입력"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field"
            style={{ width: "200px", height: "38px", fontSize: "13px", padding: "0 12px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e);
              }
            }}
          />
          <button type="submit" className="btn-secondary font-semibold" style={{ padding: "0 18px", height: "38px", fontSize: "13px", display: "flex", alignItems: "center", borderRadius: "8px" }}>
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
          style={{ height: "38px", fontSize: "13px", padding: "0 10px" }}
        >
          <option value={10}>10명씩 보기</option>
          <option value={25}>25명씩 보기</option>
          <option value={50}>50명씩 보기</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table w-full" style={{ tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "15%" }}>번호</th>
              <th style={{ width: "35%" }}>아이디</th>
              <th style={{ width: "30%" }}>이름</th>
              <th style={{ width: "20%" }}>가입일</th>
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
                  <td className="flex items-center gap8 whitespace-nowrap overflow-hidden text-ellipsis">
                    {user.profile_url ? (
                      <img src={user.profile_url} alt="프로필" className="comment-img" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }} />
                    ) : (
                      <IconUser size={16} color="#64748B" />
                    )}
                    <span>{Highlight(user.name, activeSearchKeyword)}</span>
                  </td>
                  <td className="text-muted text13">{dayjs(user.cre_date).format("YYYY.MM.DD HH:mm")}</td>
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
        <div className="flex justify-center items-center gap6 mt24 mb16" style={{ paddingTop: "12px" }}>
          <button
            className="btn-outline-sm font-semibold"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            style={{ height: "34px", padding: "0 10px", borderRadius: "6px" }}
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={currentPage === pageNum ? "btn-primary font-bold" : "btn-outline-sm"}
              style={{
                height: "34px",
                width: "34px",
                padding: 0,
                borderRadius: "6px",
                fontSize: "13px",
                background: currentPage === pageNum ? "#2563EB" : "#FFFFFF",
                color: currentPage === pageNum ? "#FFFFFF" : "#1E293B"
              }}
            >
              {pageNum}
            </button>
          ))}
          <button
            className="btn-outline-sm font-semibold"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            style={{ height: "34px", padding: "0 10px", borderRadius: "6px" }}
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default UserList;
