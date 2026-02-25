import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { SkeletonLine } from "../components/Skeleton";

function Main() {
  const [categories, setCategories] = useState([]);
  const [categoryPosts, setCategoryPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    const { data: cats } = await supabase.from("category").select("*").eq("del_yn", "N").eq("show_yn", "Y").order("order", { ascending: true, nullsFirst: false }).order("seq", { ascending: true });

    if (cats) {
      setCategories(cats);

      const postsMap = {};
      const postPromises = cats.map(async (cat) => {
        const { data: posts } = await supabase
          .from("board")
          .select(`seq, title, cre_date, user:user_seq ( name, profile_url )`)
          .eq("category_seq", cat.seq)
          .eq("del_yn", "N")
          .order("seq", { ascending: false })
          .limit(5);
        return { catSeq: cat.seq, posts: posts || [] };
      });

      const results = await Promise.all(postPromises);
      results.forEach((res) => {
        postsMap[res.catSeq] = res.posts;
      });

      setCategoryPosts(postsMap);
    }

    setLoading(false);
  }

  return (
    <div className="page-container">
      <section className="dashboard-welcome">
        <h2>{loginUser ? `${loginUser.name}님, 어서오세요!` : "방문해주셔서 감사합니다!"}</h2>
        <p>오늘도 즐거운 하루 되세요.</p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(calc(50% - 12px), 1fr))", gap: "24px", marginTop: "32px", alignItems: "start" }}>
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <section
                key={`skeleton-section-${index}`}
                style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}
              >
                <div className="page-header" style={{ marginBottom: "16px" }}>
                  <SkeletonLine height="24px" width="150px" />
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <tbody>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={`skeleton-${idx}`}>
                          <td>
                            <SkeletonLine height="20px" width="100%" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))
          : categories.map((cat) => (
              <section key={cat.seq} style={{ background: "var(--card-bg)", padding: "24px", borderRadius: "12px", border: "1px solid var(--border-color)", boxShadow: "var(--shadow-sm)" }}>
                <div className="page-header" style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 className="page-title" style={{ fontSize: "18px", margin: 0 }}>
                    {cat.name}
                  </h3>
                  <Link to={`/board?category=${cat.seq}`} className="text-link" style={{ fontSize: "14px", color: "var(--text-muted)" }}>
                    더보기
                  </Link>
                </div>
                <div className="table-wrapper">
                  <table className="data-table" style={{ fontSize: "14px", width: "100%", tableLayout: "fixed" }}>
                    <colgroup>
                      <col style={{ width: "calc(100% - 250px)" }} />
                      <col style={{ width: "80px" }} />
                      <col style={{ width: "150px" }} />
                    </colgroup>
                    <tbody>
                      {categoryPosts[cat.seq] && categoryPosts[cat.seq].length > 0 ? (
                        categoryPosts[cat.seq].map((post) => (
                          <tr key={post.seq}>
                            <td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "8px" }} title={post.title}>
                              <Link to={`/board/${post.seq}`} className="text-link" style={{ color: "var(--text-main)", display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {post.title}
                              </Link>
                            </td>
                            <td
                              style={{ display: "flex", alignItems: "center", gap: "6px", justifyContent: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              title={post.user?.name}
                            >
                              {post.user?.profile_url ? (
                                <img src={post.user?.profile_url} alt="프로필" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
                              ) : (
                                <div className="mini-comment-profile" style={{ width: "20px", height: "20px" }}>
                                  👤
                                </div>
                              )}
                              <span style={{ color: "var(--text-muted)" }}>{post.user?.name}</span>
                            </td>
                            <td style={{ color: "var(--text-muted)", textAlign: "right", whiteSpace: "nowrap" }}>{dayjs(post.cre_date).format("YYYY.MM.DD HH:mm")}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)", padding: "30px 0" }}>
                            등록된 게시글이 없어.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
      </div>
    </div>
  );
}

export default Main;
