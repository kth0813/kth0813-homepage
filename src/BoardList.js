import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { showAlert } from "./Alert";

function BoardList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 페이징 및 검색 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchType, setSearchType] = useState("title");
  const [searchKeyword, setSearchKeyword] = useState("");

  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("board")
      .select(
        `
        seq, title, cre_date, hit,
        user:user_seq ( name )
      `,
        { count: "exact" }
      )
      .eq("del_yn", "N")
      .order("seq", { ascending: false })
      .range(from, to);

    if (searchKeyword.trim()) {
      if (searchType === "title_contents") {
        query = query.or(`title.ilike.%${searchKeyword}%,contents.ilike.%${searchKeyword}%`);
      } else {
        query = query.ilike(searchType, `%${searchKeyword}%`);
      }
    }

    const { data, error, count } = await query;
    if (!error) {
      setPosts(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  });

  useEffect(() => {
    fetchPosts();
  }, [currentPage, pageSize, fetchPosts]);

  // 글쓰기 버튼 클릭 핸들러
  const handleWriteClick = () => {
    if (!loginUser) {
      showAlert("로그인이 필요한 서비스야. 로그인 페이지로 이동할게!");
      navigate("/login");
    } else {
      navigate("/board/write");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="page-container">
      <div className="page-header">
        <h2 className="page-title">📋 자유 게시판</h2>
        {/* 버튼은 항상 노출하고 클릭 시 체크함 */}
        <button onClick={handleWriteClick} className="btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
          새 글 작성
        </button>
      </div>

      {/* 검색 및 필터 바 */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="filter-group">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-field">
            <option value="title">제목</option>
            <option value="title_contents">제목+내용</option>
            <option value="author">작성자</option>
          </select>
          <input type="text" placeholder="검색어 입력" value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} className="input-field" style={{ width: "220px" }} />
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
          <option value={10}>10개씩 보기</option>
          <option value={25}>25개씩 보기</option>
          <option value={50}>50개씩 보기</option>
        </select>
      </div>

      {/* 테이블 영역 */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th>제목</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                  로딩 중...
                </td>
              </tr>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.seq}>
                  <td>{post.seq}</td>
                  <td>
                    <Link to={`/board/${post.seq}`} className="text-link">
                      {post.title}
                    </Link>
                  </td>
                  <td>{post.user?.name}</td>
                  <td style={{ color: "var(--text-muted)" }}>{post.hit || 0}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "14px" }}>{new Date(post.cre_date).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                  게시글이 없어.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
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

export default BoardList;
