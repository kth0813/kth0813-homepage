import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import dayjs from "dayjs";
import { Highlight } from "../utils/Highlight";
import { SkeletonLine } from "../components/Skeleton";

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
  const globalKeyword = searchParams.get("globalKeyword"); // 전역 검색어 추출
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPosts, setSelectedPosts] = useState([]);

  const navigate = useNavigate();
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const from = (currentPage - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from("board")
      .select(`seq, title, cre_date, hit, user_seq, category_seq, user:user_seq(name, profile_url), category:category_seq(show_yn)`, { count: "exact" })
      .eq("del_yn", "N");

    // 일반 검색 조건 (현재 카테고리 내)
    if (category) {
      query = query.eq("category_seq", category);
    }

    // 비공개 게시판 제외 조건 (관리자가 아니면 show_yn = Y 인것만)
    if (loginUser?.admin_yn !== "Y") {
      query = query.eq("category.show_yn", "Y");
    }

    // 전역 검색어 (TopMenu에서 넘어온 param)
    if (globalKeyword) {
      query = query.or(`title.ilike.%${globalKeyword}%,contents.ilike.%${globalKeyword}%`);
    } else if (activeSearchKeyword.trim()) {
      // 컴포넌트 내부의 로컬 검색
      if (activeSearchType === "title_contents") {
        query = query.or(`title.ilike.%${activeSearchKeyword}%,contents.ilike.%${activeSearchKeyword}%`);
      } else {
        query = query.ilike(activeSearchType, `%${activeSearchKeyword}%`);
      }
    }

    query = query.order("seq", { ascending: false }).range(from, to);

    const { data: rawData, error, count } = await query;
    if (!error) {
      // inner join eq 필터링의 결과로 category 관련 null 이슈가 있을 수 있으므로 필터링 보완
      const filteredData = loginUser?.admin_yn === "Y" ? rawData : rawData.filter((post) => post.category && post.category.show_yn === "Y");
      setPosts(filteredData);
      setTotalCount(loginUser?.admin_yn === "Y" ? count : filteredData.length); // 페이지네이션 보완
    }
    setLoading(false);
  }, [currentPage, pageSize, activeSearchType, activeSearchKeyword, category, globalKeyword, loginUser?.admin_yn]);

  useEffect(() => {
    fetchPosts();
    setSelectedPosts([]);
  }, [fetchPosts]);

  useEffect(() => {
    if (globalKeyword) {
      setCategoryName(`"${globalKeyword}" 검색 결과`);
      setDescription("전체 게시판에서 검색된 결과야.");
    } else if (category) {
      const fetchCategoryName = async () => {
        const { data, error } = await supabase.from("category").select("name, description").eq("seq", category).single();
        if (data && !error) {
          setCategoryName(data.name);
          setDescription(data.description);
        } else {
          setCategoryName("알 수 없는 게시판");
        }
      };
      fetchCategoryName();
    } else {
      setCategoryName("전체 게시판");
      setDescription("");
    }
  }, [category, globalKeyword]);

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

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedPosts(posts.map((p) => p.seq));
    } else {
      setSelectedPosts([]);
    }
  };

  const handleSelect = (seq) => {
    setSelectedPosts((prev) => (prev.includes(seq) ? prev.filter((id) => id !== seq) : [...prev, seq]));
  };

  const handleDeleteSelected = async () => {
    if (selectedPosts.length === 0) {
      showAlert("삭제할 게시글을 선택해줘.");
      return;
    }

    if (!window.confirm(`선택한 ${selectedPosts.length}개의 게시글을 정말 삭제할 거야?`)) return;

    const { error } = await supabase.from("board").update({ del_yn: "Y" }).in("seq", selectedPosts);

    if (error) {
      showAlert("삭제 중 오류가 발생했어: " + error.message);
    } else {
      showAlert("선택한 게시글이 삭제되었어.");
      setSelectedPosts([]);
      fetchPosts();
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">📋 {categoryName}</h2>
          {description && <p className="page-description">{description}</p>}
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {loginUser?.admin_yn === "Y" && selectedPosts.length > 0 && (
            <button onClick={handleDeleteSelected} className="btn-danger" style={{ width: "auto", padding: "10px 24px" }}>
              선택 삭제 ({selectedPosts.length})
            </button>
          )}
          {(!category || category === "1" || loginUser?.admin_yn === "Y") && (
            <button onClick={handleWriteClick} className="btn-primary" style={{ width: "auto", padding: "10px 24px" }}>
              새 글 작성
            </button>
          )}
        </div>
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
              {loginUser?.admin_yn === "Y" && (
                <th style={{ width: "5%", textAlign: "center" }}>
                  <input type="checkbox" onChange={handleSelectAll} checked={posts.length > 0 && selectedPosts.length === posts.length} />
                </th>
              )}
              <th style={{ width: "10%" }}>번호</th>
              <th style={{ width: "40%" }}>제목</th>
              <th style={{ width: "15%" }}>작성자</th>
              <th style={{ width: "15%" }}>조회수</th>
              <th style={{ width: "15%" }}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  {loginUser?.admin_yn === "Y" && (
                    <td style={{ textAlign: "center" }}>
                      <input type="checkbox" disabled />
                    </td>
                  )}
                  <td>
                    <SkeletonLine height="20px" width="30px" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="80%" />
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div className="skeleton skeleton-circle" style={{ width: "28px", height: "28px" }}></div>
                      <SkeletonLine height="20px" width="60px" />
                    </div>
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="40px" />
                  </td>
                  <td>
                    <SkeletonLine height="20px" width="100px" />
                  </td>
                </tr>
              ))
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <tr key={post.seq}>
                  {loginUser?.admin_yn === "Y" && (
                    <td style={{ textAlign: "center" }}>
                      <input type="checkbox" checked={selectedPosts.includes(post.seq)} onChange={() => handleSelect(post.seq)} />
                    </td>
                  )}
                  <td>{post.seq}</td>
                  <td>
                    <Link to={`/board/${post.seq}`} className="text-link">
                      {Highlight(post.title, globalKeyword || activeSearchKeyword)}
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
                <td colSpan={loginUser?.admin_yn === "Y" ? "6" : "5"} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
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
