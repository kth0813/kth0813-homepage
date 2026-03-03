import { useEffect, useState } from "react";
import { dbService } from "../services/DbService";
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
    const { count: uCount } = await dbService.getUserCount();
    const { count: bCount } = await dbService.getBoardCount();

    setStats({ userCount: uCount || 0, boardCount: bCount || 0 });

    const { data: posts } = await dbService.getRecentPosts(5);

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
          {loading ? <SkeletonLine width="60px" height="38px" className="mt4" /> : <p className="stat-value">{stats.userCount} 명</p>}
        </div>
        <div className="stat-card">
          <h4>전체 게시글</h4>
          {loading ? <SkeletonLine width="60px" height="38px" className="mt4" /> : <p className="stat-value">{stats.boardCount} 개</p>}
        </div>
      </div>
      <div className="flex gap24 mb32">
        <div className="flex-1" style={{ minWidth: 0 }}>
          <UserChart />
        </div>
        <div className="flex-1" style={{ minWidth: 0 }}>
          <PostChart />
        </div>
      </div>
      <section className="mt32">
        <div className="page-header mb16">
          <h3 className="page-title text20">최근 올라온 글</h3>
          <Link to="/board" className="text-link text14">
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
                        <Link to={`/board/${post.seq}`} className="text-link text-main">
                          {post.title}
                        </Link>
                      </td>
                      <td className="flex items-center gap8">
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
