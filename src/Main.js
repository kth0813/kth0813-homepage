import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { Link } from "react-router-dom";

function Main() {
  const [stats, setStats] = useState({ userCount: 0, boardCount: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    const { count: uCount } = await supabase.from("user").select("*", { count: "exact", head: true }).eq("del_yn", "N");
    const { count: bCount } = await supabase.from("board").select("*", { count: "exact", head: true }).eq("del_yn", "N");

    setStats({ userCount: uCount || 0, boardCount: bCount || 0 });

    const { data: posts } = await supabase.from("board").select(`seq, title, cre_date, user:user_seq ( name )`).eq("del_yn", "N").order("seq", { ascending: false }).limit(5);

    setRecentPosts(posts || []);
  }

  return (
    <div className="page-container">
      <section className="dashboard-welcome">
        <h2>{loginUser ? `${loginUser.name}님, 어서오세요!` : "방문해주셔서 감사합니다!"}</h2>
        <p>오늘도 즐거운 코딩 되세요. 현재 우리 서비스의 현황입니다.</p>
      </section>

      <div className="stat-cards">
        <div className="stat-card">
          <h4>총 회원 수</h4>
          <p className="stat-value">{stats.userCount} 명</p>
        </div>
        <div className="stat-card">
          <h4>전체 게시글</h4>
          <p className="stat-value">{stats.boardCount} 개</p>
        </div>
      </div>

      <section style={{ marginTop: "32px" }}>
        <div className="page-header" style={{ marginBottom: "16px" }}>
          <h3 className="page-title" style={{ fontSize: "20px" }}>최근 올라온 글</h3>
          <Link to="/board" className="text-link" style={{ fontSize: "14px" }}>
            더보기
          </Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <tbody>
              {recentPosts.map((post) => (
                <tr key={post.seq}>
                  <td>
                    <Link to={`/board/${post.seq}`} className="text-link" style={{ color: "var(--text-main)" }}>
                      {post.title}
                    </Link>
                  </td>
                  <td style={{ width: "100px", textAlign: "right", color: "var(--text-muted)" }}>{post.user?.name}</td>
                  <td style={{ width: "120px", textAlign: "right", color: "var(--text-muted)", fontSize: "14px" }}>{new Date(post.cre_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Main;
