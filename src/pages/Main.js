import { useEffect, useState } from "react";
import { dbService } from "../services/DbService";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { SkeletonLine } from "../components/Skeleton";
import { IconCode, IconBoard, IconFlame, IconMusic, IconUser, IconProjects } from "../components/Icons";

function formatViewCount(count) {
  if (!count) return "0";
  const num = parseInt(count, 10);
  if (num >= 10000) {
    return (num / 10000).toFixed(1).replace(".0", "") + "만";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(".0", "") + "천";
  }
  return num.toString();
}

function Main() {
  const [recentPosts, setRecentPosts] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingMusic, setTrendingMusic] = useState([]);
  const [loading, setLoading] = useState(true);
  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);

    // Fetch Recent Posts for Zone 2
    const { data: posts } = await dbService.getRecentPosts(5);
    if (posts) setRecentPosts(posts);

    // Fetch up to 10 YouTube Trending items from DB
    const { data: trendingVideosData } = await dbService.getYoutubeTrending("VIDEO", 10);
    const { data: trendingMusicData } = await dbService.getYoutubeTrending("MUSIC", 10);

    let needsUpdate = false;
    const today = dayjs().startOf("day");

    if (!trendingVideosData || trendingVideosData.length === 0 || !trendingMusicData || trendingMusicData.length === 0) {
      needsUpdate = true;
    } else {
      const latestVideoDate = dayjs(trendingVideosData[0].cre_date);
      if (latestVideoDate.isBefore(today)) {
        needsUpdate = true;
      }
    }

    let videosList = trendingVideosData || [];
    let musicList = trendingMusicData || [];

    if (needsUpdate) {
      try {
        const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
        if (YOUTUBE_API_KEY) {
          const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&maxResults=10&key=${YOUTUBE_API_KEY}`);
          const videoData = await videoResponse.json();

          const musicResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&videoCategoryId=10&maxResults=10&key=${YOUTUBE_API_KEY}`
          );
          const musicData = await musicResponse.json();

          if (videoData.items && musicData.items) {
            await dbService.deleteYoutubeTrending();

            const insertData = [];

            videoData.items.forEach((item) => {
              insertData.push({
                video_id: item.id,
                title: item.snippet.title,
                thumbnail_url: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.default.url,
                channel_title: item.snippet.channelTitle,
                view_count: item.statistics.viewCount,
                type: "VIDEO"
              });
            });

            musicData.items.forEach((item) => {
              insertData.push({
                video_id: item.id,
                title: item.snippet.title,
                thumbnail_url: item.snippet.thumbnails.high ? item.snippet.thumbnails.high.url : item.snippet.thumbnails.default.url,
                channel_title: item.snippet.channelTitle,
                view_count: item.statistics.viewCount,
                type: "MUSIC"
              });
            });

            if (insertData.length > 0) {
              await dbService.insertYoutubeTrending(insertData);

              const { data: newVideos } = await dbService.getYoutubeTrending("VIDEO", 10);
              const { data: newMusic } = await dbService.getYoutubeTrending("MUSIC", 10);

              if (newVideos) videosList = newVideos;
              if (newMusic) musicList = newMusic;
            }
          }
        }
      } catch (error) {
        console.error("Error fetching YouTube data:", error);
      }
    }

    // Deduplicate videos internally, then pick top 4
    const uniqueVideos = [];
    const videoSeen = new Set();

    videosList.forEach((v) => {
      const id = v.video_id || v.title;
      if (id && !videoSeen.has(id)) {
        videoSeen.add(id);
        uniqueVideos.push(v);
      }
    });

    // Deduplicate music internally, then pick top 4
    const uniqueMusic = [];
    const musicSeen = new Set();

    musicList.forEach((m) => {
      const id = m.video_id || m.title;
      if (id && !musicSeen.has(id)) {
        musicSeen.add(id);
        uniqueMusic.push(m);
      }
    });

    setTrendingVideos(uniqueVideos.slice(0, 4));
    setTrendingMusic(uniqueMusic.slice(0, 4));

    setLoading(false);
  }


  return (
    <div className="page-container">
      {/* ① Hero Banner */}
      <section className="dashboard-welcome">
        <h2>
          {loginUser ? `${loginUser.name}님, 어서오세요!` : "안녕하세요, 풀스택 개발자 김태훈의 개인 대시보드입니다."}
        </h2>
        <p>
          React / Node.js / PostgreSQL / Cloudflare R2 기반으로 제작된 대시보드 겸 포트폴리오 웹사이트입니다.
        </p>
        <div className="hero-tech-badges">
          <span className="badge-tech-hero">#React</span>
          <span className="badge-tech-hero">#Node.js</span>
          <span className="badge-tech-hero">#PostgreSQL</span>
          <span className="badge-tech-hero">#RestAPI</span>
          <span className="badge-tech-hero">#Vercel</span>
          <span className="badge-tech-hero">#CloudflareR2</span>
        </div>
      </section>

      {/* ② 2x2 Grid Layout */}
      {/* Row 1: Zone 1 (Developer Profile, Key Strengths & Tech Stack) + Zone 2 (Recent Board Posts) */}
      <div className="grid-cols-2-md gap24 mt32 items-stretch">
        {/* Zone 1 (Top-Left): Developer Profile, Key Strengths & Tech Stack Card */}
        <section className="dashboard-card p28 flex flex-col justify-between" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
          <div>
            {/* Card Header */}
            <div className="dashboard-card-header mb20">
              <div className="flex items-center gap12">
                <span className="card-header-icon" style={{ background: "#EFF6FF" }}>
                  <IconCode color="#2563EB" size={20} />
                </span>
                <div>
                  <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>
                    Developer & Core Competencies
                  </h3>
                  <span className="card-subtitle text13 text-muted">Full-Stack Technical Strengths & Tech Stack</span>
                </div>
              </div>
              <span className="badge-primary" style={{ fontSize: "12px", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", padding: "4px 10px", borderRadius: "6px" }}>
                Full-Stack
              </span>
            </div>

            {/* Intro Description */}
            <p className="text14 mb20" style={{ lineHeight: "1.6", color: "#334155" }}>
              사용자 경험 개선과 효율적인 데이터 처리에 가치를 두는 풀스택 개발자 김태훈입니다. 웹 애플리케이션 아키텍처 설계부터 UI/UX 구현, DB 모델링 및 배포까지 주도적으로 수행합니다.
            </p>
            <div className="mb20">
              <div className="flex flex-col gap12">
                <div>
                  <span className="text11 font-bold text-muted block mb6" style={{ letterSpacing: "0.05em" }}>FRONTEND</span>
                  <div className="flex flex-wrap gap6">
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>React</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>JavaScript (ES6+)</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>HTML5 / CSS3</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Tailwind CSS</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Axios</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Day.js</span>
                  </div>
                </div>

                <div>
                  <span className="text11 font-bold text-muted block mb6" style={{ letterSpacing: "0.05em" }}>BACKEND & DATABASE</span>
                  <div className="flex flex-wrap gap6">
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>Node.js</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>PostgreSQL (Neon)</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>MSSQL</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Express</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>MariaDB</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>RESTful API</span>
                  </div>
                </div>

                <div>
                  <span className="text11 font-bold text-muted block mb6" style={{ letterSpacing: "0.05em" }}>CLOUD & INFRASTRUCTURE</span>
                  <div className="flex flex-wrap gap6">
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Cloudflare R2 Storage</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Vercel Serverless</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "600", lineHeight: "1.2", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "10px", boxSizing: "border-box" }}>Git / GitHub</span>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: "32px", padding: "6px 14px", fontSize: "12px", fontWeight: "500", lineHeight: "1.2", background: "#F8FAFC", color: "#475569", border: "1px solid #E2E8F0", borderRadius: "10px", boxSizing: "border-box" }}>Docker</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap10 mt16" style={{ borderTop: "1px solid #F1F5F9", paddingTop: "16px" }}>
            <Link to="/about" className="btn-outline-sm font-semibold flex items-center gap8" style={{ height: "36px", padding: "0 14px", borderRadius: "8px", color: "#334155" }}>
              <IconUser size={15} color="#2563EB" /> <span>About Me</span>
            </Link>
            <Link to="/projects" className="btn-outline-sm font-semibold flex items-center gap8" style={{ height: "36px", padding: "0 14px", borderRadius: "8px", color: "#334155" }}>
              <IconProjects size={15} color="#2563EB" /> <span>Projects</span>
            </Link>
          </div>
        </section>

        {/* Zone 2 (Top-Right): Board / Tech Blog Recent Posts */}
        <section className="dashboard-card p28 flex flex-col justify-between" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
          <div>
            <div className="dashboard-card-header mb20">
              <div className="flex items-center gap12">
                <span className="card-header-icon">
                  <IconBoard color="#2563EB" size={20} />
                </span>
                <div>
                  <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>게시판 & 스터디 최신글</h3>
                  <span className="card-subtitle text13 text-muted">Community & Tech Feed</span>
                </div>
              </div>
              <Link to="/board" className="btn-outline-sm font-semibold text12" style={{ padding: "6px 14px", borderRadius: "6px" }}>
                게시판으로 이동 ➔
              </Link>
            </div>

            {loading ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <tbody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`}>
                        <td><SkeletonLine height="20px" width="100%" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="table-wrapper">
                <table className="data-table w-full" style={{ tableLayout: "fixed" }}>
                  <thead>
                    <tr>
                      <th style={{ width: "55%" }}>제목</th>
                      <th style={{ width: "25%" }}>작성자</th>
                      <th style={{ width: "20%" }}>작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.seq}>
                        <td className="whitespace-nowrap overflow-hidden text-ellipsis" title={post.title}>
                          <Link to={`/board/${post.seq}`} className="text-link font-semibold">
                            {post.title}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap overflow-hidden text-ellipsis text-muted text13">
                          {post.user?.name || "익명"}
                        </td>
                        <td className="text-muted text13">
                          {dayjs(post.cre_date).format("YYYY.MM.DD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py32 text-muted text14">
                최근 작성된 게시글이 없습니다.
              </div>
            )}
          </div>

          <div className="flex justify-end mt16">

          </div>
        </section>
      </div>

      {/* Row 2: Zone 3 (YouTube Trending Videos) + Zone 4 (YouTube Trending Music) */}
      <div className="grid-cols-2-md gap24 mt32 items-stretch">
        {/* Zone 3: YouTube Trending Videos */}
        <section className="dashboard-card p28" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
          <div className="dashboard-card-header mb20">
            <div className="flex items-center gap12">
              <span className="card-header-icon" style={{ background: "#FEF2F2" }}>
                <IconFlame color="#EF4444" size={20} />
              </span>
              <div>
                <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>인기 동영상 TOP 4</h3>
                <span className="card-subtitle text13 text-muted">YouTube KR Trending</span>
              </div>
            </div>
            <span className="badge-tech font-semibold" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5", fontSize: "12px" }}>🔥 HOT</span>
          </div>

          {loading ? (
            <div className="grid-cols-2 gap16">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`sk-v-${idx}`} className="flex flex-col gap8">
                  <SkeletonLine height="100px" width="100%" />
                  <SkeletonLine height="16px" width="80%" />
                </div>
              ))}
            </div>
          ) : trendingVideos.length > 0 ? (
            <div className="grid-cols-2 gap16">
              {trendingVideos.map((video) => (
                <a
                  key={video.seq || video.video_id}
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-card-item p10 rounded-xl flex flex-col justify-between"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", textDecoration: "none" }}
                >
                  <div className="mb8 overflow-hidden rounded-lg relative" style={{ height: "95px" }}>
                    <img src={video.thumbnail_url} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: "4px", right: "6px", background: "rgba(0,0,0,0.75)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>
                      👁️ {formatViewCount(video.view_count)}회
                    </div>
                  </div>
                  <h4 className="text13 font-bold line-clamp-2 m0 mb4" style={{ color: "#0F172A", lineHeight: "1.4" }} title={video.title}>
                    {video.title}
                  </h4>
                  <span className="text12 text-muted whitespace-nowrap overflow-hidden text-ellipsis">{video.channel_title}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py32 text-muted text14">인기 동영상 데이터를 불러올 수 없습니다.</div>
          )}
        </section>

        {/* Zone 4: YouTube Trending Music */}
        <section className="dashboard-card p28" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px" }}>
          <div className="dashboard-card-header mb20">
            <div className="flex items-center gap12">
              <span className="card-header-icon" style={{ background: "#F0FDF4" }}>
                <IconMusic color="#10B981" size={20} />
              </span>
              <div>
                <h3 className="dashboard-card-title text18 font-bold m0" style={{ color: "#0F172A" }}>인기 음악 TOP 4</h3>
                <span className="card-subtitle text13 text-muted">YouTube Music Charts</span>
              </div>
            </div>
            <span className="badge-tech font-semibold" style={{ background: "#F0FDF4", color: "#10B981", border: "1px solid #6EE7B7", fontSize: "12px" }}>🎵 MUSIC</span>
          </div>

          {loading ? (
            <div className="grid-cols-2 gap16">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`sk-m-${idx}`} className="flex flex-col gap8">
                  <SkeletonLine height="100px" width="100%" />
                  <SkeletonLine height="16px" width="80%" />
                </div>
              ))}
            </div>
          ) : trendingMusic.length > 0 ? (
            <div className="grid-cols-2 gap16">
              {trendingMusic.map((music) => (
                <a
                  key={music.seq || music.video_id}
                  href={`https://www.youtube.com/watch?v=${music.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="youtube-card-item p10 rounded-xl flex flex-col justify-between"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", textDecoration: "none" }}
                >
                  <div className="mb8 overflow-hidden rounded-lg relative" style={{ height: "95px" }}>
                    <img src={music.thumbnail_url} alt={music.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", bottom: "4px", right: "6px", background: "rgba(0,0,0,0.75)", color: "white", padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold" }}>
                      👁️ {formatViewCount(music.view_count)}회
                    </div>
                  </div>
                  <h4 className="text13 font-bold line-clamp-2 m0 mb4" style={{ color: "#0F172A", lineHeight: "1.4" }} title={music.title}>
                    {music.title}
                  </h4>
                  <span className="text12 text-muted whitespace-nowrap overflow-hidden text-ellipsis">{music.channel_title}</span>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py32 text-muted text14">인기 음악 데이터를 불러올 수 없습니다.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Main;
