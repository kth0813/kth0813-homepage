import { useEffect, useState } from "react";
import { dbService } from "../services/DbService";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import PostChart from "../components/PostChart";
import UserChart from "../components/UserChart";
import { SkeletonLine } from "../components/Skeleton";
import { IconBarChart, IconUsers, IconBoard, IconUser } from "../components/Icons";
import PageHeader from "../components/PageHeader";

function DashBoard() {
  const [stats, setStats] = useState({ userCount: 0, boardCount: 0 });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      {/* Standardized Header Banner */}
      <PageHeader
        icon={IconBarChart}
        title="통계 대시보드 (Admin Analytics)"
        description="사이트 전체 회원 가입 현황 및 게시글 관련 통계를 한눈에 확인하세요."
      />

      {/* KPI Cards */}
      <div className="grid-cols-2 gap24 mb32" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
        <div className="dashboard-card p20" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
          <div className="flex justify-between items-center mb12">
            <span className="text14 font-bold text-muted">총 회원 수</span>
            <div style={{ padding: "8px", background: "#EFF6FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconUsers size={20} color="#2563EB" />
            </div>
          </div>
          {loading ? (
            <SkeletonLine width="80px" height="36px" />
          ) : (
            <h3 className="text30 font-bold m0" style={{ color: "#2563EB", letterSpacing: "-0.5px" }}>
              {stats.userCount.toLocaleString()} <span className="text16 text-muted font-normal">명</span>
            </h3>
          )}
        </div>

        <div className="dashboard-card p20" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
          <div className="flex justify-between items-center mb12">
            <span className="text14 font-bold text-muted">전체 게시글</span>
            <div style={{ padding: "8px", background: "#EFF6FF", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBoard size={20} color="#2563EB" />
            </div>
          </div>
          {loading ? (
            <SkeletonLine width="80px" height="36px" />
          ) : (
            <h3 className="text30 font-bold m0" style={{ color: "#2563EB", letterSpacing: "-0.5px" }}>
              {stats.boardCount.toLocaleString()} <span className="text16 text-muted font-normal">개</span>
            </h3>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid-cols-2 gap24 mb32" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px" }}>
        <div style={{ minWidth: 0 }}>
          <UserChart />
        </div>
        <div style={{ minWidth: 0 }}>
          <PostChart />
        </div>
      </div>

      {/* Recent Posts Section */}
      <div className="dashboard-card p24" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "12px" }}>
        <div className="flex justify-between items-center mb16">
          <h3 className="text18 font-bold m0" style={{ color: "#0F172A" }}>
            최근 올라온 글
          </h3>
          <Link to="/board" className="btn-outline-sm font-semibold text12" style={{ padding: "4px 12px", borderRadius: "6px" }}>
            전체보기 →
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="data-table w-full" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={{ width: "50%" }}>제목</th>
                <th style={{ width: "25%" }}>작성자</th>
                <th style={{ width: "25%" }}>작성일</th>
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
                      <td className="whitespace-nowrap overflow-hidden text-ellipsis" title={post.title}>
                        <Link to={`/board/${post.seq}`} className="text-link font-semibold">
                          {post.title}
                        </Link>
                      </td>
                      <td className="flex items-center gap8 overflow-hidden text-ellipsis whitespace-nowrap" title={post.user?.name}>
                        {post.user?.profile_url ? (
                          <img src={post.user?.profile_url} alt="프로필" className="comment-img" style={{ width: "22px", height: "22px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <IconUser size={16} color="#64748B" />
                        )}
                        <span>{post.user?.name}</span>
                      </td>
                      <td className="text-muted text13">{dayjs(post.cre_date).format("YYYY.MM.DD HH:mm")}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
