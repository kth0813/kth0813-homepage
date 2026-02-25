import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import PostChart from "../components/PostChart";
import UserChart from "../components/UserChart";
import { SkeletonLine } from "../components/Skeleton";

function DashBoard() {
  const [stats, setStats] = useState({ userCount: 0, boardCount: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { count: uCount } = await supabase.from("user").select("*", { count: "exact", head: true }).eq("del_yn", "N");
    const { count: bCount } = await supabase.from("board").select("*", { count: "exact", head: true }).eq("del_yn", "N");

    setStats({ userCount: uCount || 0, boardCount: bCount || 0 });

    const { data: posts } = await supabase.from("board").select(`seq, title, cre_date, user:user_seq ( name, profile_url )`).eq("del_yn", "N").order("seq", { ascending: false }).limit(5);

    setRecentPosts(posts || []);
    setLoading(false);
  }

  return (
    <div className="page-container">
      <section className="dashboard-welcome">
        <h2>{loginUser ? `${loginUser.name}님, 어서오세요!` : "방문해주셔서 감사합니다!"}</h2>
        <p>오늘도 즐거운 하루 되세요.</p>
      </section>

      <div className="stat-cards">
        <div className="stat-card">
          <h4>총 회원 수</h4>
          {loading ? <SkeletonLine width="60px" height="38px" style={{ marginTop: "4px" }} /> : <p className="stat-value">{stats.userCount} 명</p>}
        </div>
        <div className="stat-card">
          <h4>전체 게시글</h4>
          {loading ? <SkeletonLine width="60px" height="38px" style={{ marginTop: "4px" }} /> : <p className="stat-value">{stats.boardCount} 개</p>}
        </div>
      </div>
      <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <UserChart />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <PostChart />
        </div>
      </div>
      <section style={{ marginTop: "32px" }}>
        <div className="page-header" style={{ marginBottom: "16px" }}>
          <h3 className="page-title" style={{ fontSize: "20px" }}>
            최근 올라온 글
          </h3>
          <Link to="/board" className="text-link" style={{ fontSize: "14px" }}>
            더보기
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "55%" }}>제목</th>
                <th style={{ width: "30%" }}>작성자</th>
                <th style={{ width: "15%" }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr key={`skeleton-${index}`}>
                      <td>
                        <SkeletonLine height="20px" width="80%" />
                      </td>
                      <td>
                        <SkeletonLine height="20px" width="60px" />
                      </td>
                      <td>
                        <SkeletonLine height="20px" width="100px" />
                      </td>
                    </tr>
                  ))
                : recentPosts.map((post) => (
                    <tr key={post.seq}>
                      <td>
                        <Link to={`/board/${post.seq}`} className="text-link" style={{ color: "var(--text-main)" }}>
                          {post.title}
                        </Link>
                      </td>
                      <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {post.user?.profile_url ? (
                          <img src={post.user?.profile_url} alt="프로필" className="comment-img" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div className="mini-comment-profile">👤</div>
                        )}
                        {post.user?.name}
                      </td>
                      <td>{dayjs(post.cre_date).format("YYYY.MM.DD HH:mm")}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default DashBoard;
