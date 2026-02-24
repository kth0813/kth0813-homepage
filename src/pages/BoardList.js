import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import dayjs from "dayjs";
import { Highlight } from "../utils/Highlight";

function BoardList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchType, setSearchType] = useState("title");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeSearchType, setActiveSearchType] = useState("title");
  const [activeSearchKeyword, setActiveSearchKeyword] = useState("");

  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");
  const [categoryName, setCategoryName] = useState("전체 게시판");

  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase.from("board").select(`seq, title, cre_date, hit, user:user_seq ( name )`, { count: "exact" }).eq("del_yn", "N").order("seq", { ascending: false }).range(from, to);

    if (category) {
      query = query.eq("category_seq", category);
    }

    if (activeSearchKeyword.trim()) {
      if (activeSearchType === "title_contents") {
        query = query.or(`title.ilike.%${activeSearchKeyword}%,contents.ilike.%${activeSearchKeyword}%`);
      } else {
        query = query.ilike(activeSearchType, `%${activeSearchKeyword}%`);
      }
    }

    const { data, error, count } = await query;
    if (!error) {
      setPosts(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  }, [currentPage, pageSize, activeSearchType, activeSearchKeyword, category]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (category) {
      const fetchCategoryName = async () => {
        const { data, error } = await supabase.from("category").select("name").eq("seq", category).single();
        if (data && !error) {
          setCategoryName(data.name);
        } else {
          setCategoryName("알 수 없는 게시판");
        }
      };
      fetchCategoryName();
    } else {
      setCategoryName("전체 게시판");
    }
  }, [category]);

  const handleWriteClick = () => {
    if (!loginUser) {
      showAlert("로그인이 필요한 서비스야. 로그인 페이지로 이동할게!");
      navigate("/login");
    } else {
      let writeUrl = "/board/write";
      if (category) {
        writeUrl += `?category=${category}`;
      }
      navigate(writeUrl);
    }
  };

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
        <h2 className="page-title">📋 {categoryName}</h2>
        <button onClick={handleWriteClick} className="btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
          새 글 작성
        </button>
      </div>

      <div className="filter-bar">
        <form onSubmit={handleSearch} className="filter-group">
          <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="select-field">
            <option value="title">제목</option>
            <option value="title_contents">제목+내용</option>
            <option value="author">작성자</option>
          </select>
          <input
            type="text"
            placeholder="검색어 입력"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field"
            style={{ width: "220px" }}
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
          <option value={10}>10개씩 보기</option>
          <option value={25}>25개씩 보기</option>
          <option value={50}>50개씩 보기</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: "15%" }}>번호</th>
              <th style={{ width: "40%" }}>제목</th>
              <th style={{ width: "15%" }}>작성자</th>
              <th style={{ width: "15%" }}>조회수</th>
              <th style={{ width: "15%" }}>작성일</th>
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
                      {Highlight(post.title, activeSearchKeyword)}
                    </Link>
                  </td>
                  <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {post.user?.profile_url ? <img src={post.user.profile_url} alt="프로필" className="comment-img" /> : <div className="comment-profile">👤</div>}
                    {post.user?.name}
                  </td>
                  <td style={{ color: "var(--text-muted)" }}>{post.hit || 0}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "14px" }}>{dayjs(post.cre_date).format("YYYY.MM.DD HH:mm")}</td>
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
