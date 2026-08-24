import { useEffect, useState } from "react";
import { dbService } from "../services/DbService";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { SkeletonLine } from "../components/Skeleton";
import {
  IconCode,
  IconBoard,
  IconFlame,
  IconMusic,
  IconUser,
  IconProjects,
  IconDice,
  IconSchedule
} from "../components/Icons";

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

    // Fetch Recent Posts for Board Feed
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
        const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
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
    <div className="page-container" style={{ paddingBottom: "32px" }}>
      {/* 🚀 ① Clean Bright White Card Hero Banner */}
      <section
        className="dashboard-welcome mb20"
        style={{
          background: "#FFFFFF",
          color: "#0F172A",
          padding: "24px 28px",
          borderRadius: "16px",
          border: "1px solid #DBEAFE",
          boxShadow: "0 4px 16px rgba(37, 99, 235, 0.06)",
          marginBottom: "20px"
        }}
      >
        <div className="flex items-center gap10 mb10">
          <span
            style={{
              background: "#EFF6FF",
              color: "#2563EB",
              border: "1px solid #BFDBFE",
              padding: "4px 12px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: "700"
            }}
          >
            ✨ INTERACTIVE WEB SHOWCASE
          </span>
          {loginUser && (
            <span className="text13 text-slate-500 font-medium">
              ({loginUser.name}님 환영합니다)
            </span>
          )}
        </div>
        <h1
          className="text24 font-bold m0 mb10"
          style={{
            letterSpacing: "-0.4px",
            color: "#0F172A",
            wordBreak: "keep-all"
          }}
        >
          단순한 코딩을 넘어, 비즈니스와 사용자 경험을 기획하는 풀스택 개발자 김태훈입니다.
        </h1>
        <p
          className="text14 m0 mb16"
          style={{
            color: "#475569",
            lineHeight: "1.6",
            wordBreak: "keep-all"
          }}
        >
          비즈니스 요구사항 분석, AI 기반 개발 환경 최적화, 정밀 데이터 플로우 설계 및 유기적인 서비스 아키텍처를 추구하는 개발자 쇼케이스입니다.
        </p>
        <div className="hero-tech-badges flex flex-wrap gap8">
          <span className="badge-tech-hero">#React_Vue2</span>
          <span className="badge-tech-hero">#Java_Spring</span>
          <span className="badge-tech-hero">#MSSQL_PostgreSQL</span>
          <span className="badge-tech-hero">#AI_Prototyping</span>
          <span className="badge-tech-hero">#DBeaver_QueryOptimization</span>
          <span className="badge-tech-hero">#REST_API</span>
        </div>
      </section>

      {/* 🎯 ② 3-Track Quick Track Cards (3대 핵심 퀵 트랙) */}
      <section className="mb20" style={{ marginBottom: "20px" }}>
        <div className="flex items-center justify-between mb14">
          <div>
            <h2 className="text20 font-bold m0 text-slate-900" style={{ letterSpacing: "-0.3px", color: "#0F172A" }}>
              ⚡ 3대 핵심 퀵 트랙 (Quick Track)
            </h2>
            <p className="text13 text-slate-600 m0 mt2" style={{ color: "#475569" }}>
              원하시는 목적에 따라 탐색할 유저 트랙을 선택하세요.
            </p>
          </div>
        </div>

        <div className="quick-track-grid" style={{ gap: "18px" }}>
          {/* TRACK A: PORTFOLIO & CAREER */}
          <Link to="/about" className="quick-track-card">
            <div>
              <div className="quick-track-badge track-badge-a">
                <IconUser size={14} color="#2563EB" />
                <span>Track 01 · Portfolio</span>
              </div>
              <h3 className="quick-track-title">개발자 스토리 (About Me & Story)</h3>
              <p className="quick-track-desc">
                단순 반복을 줄이는 AI 기반 개발 프로세스 설계와 유기적인 서비스 아키텍처를 고민하는 개발 스토리를 확인하세요.
              </p>
              <div className="quick-track-highlights">
                <span className="quick-track-tag">AI 최적화</span>
                <span className="quick-track-tag">데이터 플로우 역추적</span>
                <span className="quick-track-tag">서비스 아키텍트</span>
              </div>
            </div>
            <div className="quick-track-cta">
              <span>개발자 프로필 & 프로젝트 탐색</span>
              <span className="cta-arrow">➔</span>
            </div>
          </Link>

          {/* TRACK B: INTERACTIVE UTILITIES */}
          <Link to="/dice" className="quick-track-card">
            <div>
              <div className="quick-track-badge track-badge-b">
                <IconDice size={14} color="#D97706" />
                <span>Track 02 · Interactive Tools</span>
              </div>
              <h3 className="quick-track-title">인터랙티브 툴킷 (3D Dice & Utilities)</h3>
              <p className="quick-track-desc">
                Web Audio API 사운드 합성 및 Preserved-3D 파워 주사위, 룰렛, 사다리타기 유틸리티를 직접 체험해보세요.
              </p>
              <div className="quick-track-highlights">
                <span className="quick-track-tag">3D 주사위 굴리기</span>
                <span className="quick-track-tag">룰렛 / 사다리타기</span>
                <span className="quick-track-tag">Web Audio API</span>
              </div>
            </div>
            <div className="quick-track-cta" style={{ color: "#D97706" }}>
              <span>3D 주사위 툴킷 체험하기</span>
              <span className="cta-arrow">➔</span>
            </div>
          </Link>

          {/* TRACK C: DATA & SYSTEM MANAGEMENT */}
          <Link to="/schedule" className="quick-track-card">
            <div>
              <div className="quick-track-badge track-badge-c">
                <IconSchedule size={14} color="#7C3AED" />
                <span>Track 03 · Data & System</span>
              </div>
              <h3 className="quick-track-title">시스템 & 데이터 (Schedule & Board)</h3>
              <p className="quick-track-desc">
                일정 관리 캘린더 시스템, 테크 스터디 피드 및 데이터베이스 관리 대시보드를 살펴봅니다.
              </p>
              <div className="quick-track-highlights">
                <span className="quick-track-tag">일정관리 캘린더</span>
                <span className="quick-track-tag">게시판 Feed</span>
                <span className="quick-track-tag">어드민 통계</span>
              </div>
            </div>
            <div className="quick-track-cta" style={{ color: "#7C3AED" }}>
              <span>시스템 데이터 관리 보기</span>
              <span className="cta-arrow">➔</span>
            </div>
          </Link>
        </div>
      </section>

      {/* 📊 ③ Secondary Content Section (Developer Competencies & Study Feed) */}
      <div className="grid-cols-2-md gap18 mb16 items-stretch" style={{ gap: "18px", marginBottom: "16px" }}>
        {/* Competencies Card */}
        <section className="dashboard-card flex flex-col justify-between" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "22px", marginBottom: "0px" }}>
          <div>
            <div className="dashboard-card-header mb16">
              <div className="flex items-center gap10">
                <span className="card-header-icon" style={{ background: "#EFF6FF" }}>
                  <IconCode color="#2563EB" size={18} />
                </span>
                <div>
                  <h3 className="dashboard-card-title text16 font-bold m0" style={{ color: "#0F172A" }}>
                    Developer Core Competencies
                  </h3>
                  <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>Full-Stack Technical Strengths & Tech Stack</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap12 mb12">
              <div>
                <span className="text11 font-bold block mb6" style={{ letterSpacing: "0.05em", color: "#475569" }}>FRONTEND & UI</span>
                <div className="flex flex-wrap gap6">
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>React</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>Vue2</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>JavaScript (ES6+)</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#F8FAFC", color: "#334155", border: "1px solid #CBD5E1", borderRadius: "8px" }}>React-Quill</span>
                </div>
              </div>

              <div>
                <span className="text11 font-bold block mb6" style={{ letterSpacing: "0.05em", color: "#475569" }}>BACKEND & DATABASE</span>
                <div className="flex flex-wrap gap6">
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>Node.js</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>Java / Spring</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>MSSQL</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE", borderRadius: "8px" }}>PostgreSQL</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#F8FAFC", color: "#334155", border: "1px solid #CBD5E1", borderRadius: "8px" }}>REST API</span>
                </div>
              </div>

              <div>
                <span className="text11 font-bold block mb6" style={{ letterSpacing: "0.05em", color: "#475569" }}>TOOLS & PROCESS OPTIMIZATION</span>
                <div className="flex flex-wrap gap6">
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", borderRadius: "8px" }}>AI Prototyping</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", borderRadius: "8px" }}>DBeaver (Query Optimization)</span>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", fontSize: "12px", fontWeight: "600", background: "#F8FAFC", color: "#334155", border: "1px solid #CBD5E1", borderRadius: "8px" }}>VSCode & IntelliJ</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap10 mt10 pt10" style={{ borderTop: "1px solid #F1F5F9" }}>
            <Link to="/about" className="btn-outline-sm font-semibold flex items-center gap8" style={{ height: "34px", padding: "0 12px", borderRadius: "8px", color: "#334155" }}>
              <IconUser size={14} color="#2563EB" /> <span>소개 (About Me)</span>
            </Link>
            <Link to="/projects" className="btn-outline-sm font-semibold flex items-center gap8" style={{ height: "34px", padding: "0 12px", borderRadius: "8px", color: "#334155" }}>
              <IconProjects size={14} color="#2563EB" /> <span>프로젝트 (Projects)</span>
            </Link>
          </div>
        </section>

        {/* Board Recent Posts Card */}
        <section className="dashboard-card flex flex-col justify-between" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "14px", padding: "22px", marginBottom: "0px" }}>
          <div>
            <div className="dashboard-card-header mb16">
              <div className="flex items-center gap10">
                <span className="card-header-icon">
                  <IconBoard color="#2563EB" size={18} />
                </span>
                <div>
                  <h3 className="dashboard-card-title text16 font-bold m0" style={{ color: "#0F172A" }}>게시판 & 스터디 피드</h3>
                  <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>Community & Tech Feed</span>
                </div>
              </div>
              <Link to="/board" className="btn-outline-sm font-semibold text12" style={{ padding: "4px 12px", borderRadius: "6px" }}>
                전체보기 ➔
              </Link>
            </div>

            {loading ? (
              <div className="table-wrapper">
                <table className="data-table">
                  <tbody>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <tr key={`skeleton-${idx}`}>
                        <td><SkeletonLine height="18px" width="100%" /></td>
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
                      <th style={{ width: "55%", color: "#475569" }}>제목</th>
                      <th style={{ width: "25%", color: "#475569" }}>작성자</th>
                      <th style={{ width: "20%", color: "#475569" }}>작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPosts.map((post) => (
                      <tr key={post.seq}>
                        <td className="whitespace-nowrap overflow-hidden text-ellipsis" title={post.title}>
                          <Link to={`/board/${post.seq}`} className="text-link font-semibold" style={{ color: "#2563EB" }}>
                            {post.title}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap overflow-hidden text-ellipsis text13" style={{ color: "#64748B" }}>
                          {post.user?.name || "익명"}
                        </td>
                        <td className="text13" style={{ color: "#64748B" }}>
                          {dayjs(post.cre_date).format("YYYY.MM.DD")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py24 text13" style={{ color: "#64748B" }}>
                최근 작성된 게시글이 없습니다.
              </div>
            )}
          </div>
        </section>
      </div>

      {/* 🎵 ④ Media Trending Feeds */}
      <div className="grid-cols-2-md gap18 mb16 items-stretch" style={{ gap: "18px", marginBottom: "16px" }}>
        {/* Trending Videos */}
        <section className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "22px", marginBottom: "0px" }}>
          <div className="dashboard-card-header mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            <div className="flex items-center gap10">
              <span className="card-header-icon" style={{ background: "#FEF2F2" }}>
                <IconFlame color="#EF4444" size={18} />
              </span>
              <div>
                <div className="flex items-center gap8 flex-wrap">
                  <h3 className="dashboard-card-title text16 font-bold m0" style={{ color: "#0F172A" }}>인기 동영상 TOP 4</h3>
                  <span style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                    YouTube Data API v3 연동
                  </span>
                </div>
                <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>YouTube KR Trending Feed</span>
              </div>
            </div>
            <span className="badge-tech font-semibold" style={{ background: "#FEF2F2", color: "#EF4444", border: "1px solid #FCA5A5", fontSize: "11px" }}>🔥 HOT</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap12">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`sk-v-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "14px 16px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px"
                  }}
                >
                  <SkeletonLine height="76px" width="135px" />
                  <div className="flex-1 flex flex-col gap6">
                    <SkeletonLine height="18px" width="90%" />
                    <SkeletonLine height="14px" width="50%" />
                  </div>
                </div>
              ))}
            </div>
          ) : trendingVideos.length > 0 ? (
            <div className="flex flex-col gap12">
              {trendingVideos.map((video) => (
                <a
                  key={video.seq || video.video_id}
                  href={`https://www.youtube.com/watch?v=${video.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "14px 16px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    textDecoration: "none",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    className="relative flex-shrink-0"
                    style={{
                      width: "135px",
                      aspectRatio: "16 / 9",
                      background: "#0F172A",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)"
                    }}
                  >
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                        display: "block"
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        right: "6px",
                        background: "rgba(15, 23, 42, 0.85)",
                        color: "#FFFFFF",
                        padding: "2px 7px",
                        borderRadius: "5px",
                        fontSize: "10px",
                        fontWeight: "700"
                      }}
                    >
                      👁️ {formatViewCount(video.view_count)}회
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4
                      className="text14 font-bold m0 mb6"
                      style={{
                        color: "#0F172A",
                        lineHeight: "1.45",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={video.title}
                    >
                      {video.title}
                    </h4>
                    <div className="flex items-center gap8 text12" style={{ color: "#64748B" }}>
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis font-medium" style={{ color: "#475569" }}>
                        {video.channel_title}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py24 text13" style={{ color: "#64748B" }}>인기 동영상 데이터를 불러올 수 없습니다.</div>
          )}
        </section>

        {/* Trending Music */}
        <section className="dashboard-card" style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "16px", padding: "22px", marginBottom: "0px" }}>
          <div className="dashboard-card-header mb16" style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            <div className="flex items-center gap10">
              <span className="card-header-icon" style={{ background: "#F0FDF4" }}>
                <IconMusic color="#10B981" size={18} />
              </span>
              <div>
                <div className="flex items-center gap8 flex-wrap">
                  <h3 className="dashboard-card-title text16 font-bold m0" style={{ color: "#0F172A" }}>인기 음악 TOP 4</h3>
                  <span style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #BBF7D0", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700" }}>
                    YouTube Music Charts API 연동
                  </span>
                </div>
                <span className="card-subtitle text12 text-muted" style={{ color: "#64748B" }}>YouTube Music Feed</span>
              </div>
            </div>
            <span className="badge-tech font-semibold" style={{ background: "#F0FDF4", color: "#10B981", border: "1px solid #6EE7B7", fontSize: "11px" }}>🎵 MUSIC</span>
          </div>

          {loading ? (
            <div className="flex flex-col gap12">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={`sk-m-${idx}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "14px 16px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px"
                  }}
                >
                  <SkeletonLine height="76px" width="135px" />
                  <div className="flex-1 flex flex-col gap6">
                    <SkeletonLine height="18px" width="90%" />
                    <SkeletonLine height="14px" width="50%" />
                  </div>
                </div>
              ))}
            </div>
          ) : trendingMusic.length > 0 ? (
            <div className="flex flex-col gap12">
              {trendingMusic.map((music) => (
                <a
                  key={music.seq || music.video_id}
                  href={`https://www.youtube.com/watch?v=${music.video_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "20px",
                    padding: "14px 16px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    textDecoration: "none",
                    boxSizing: "border-box",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div
                    className="relative flex-shrink-0"
                    style={{
                      width: "135px",
                      aspectRatio: "16 / 9",
                      background: "#0F172A",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)"
                    }}
                  >
                    <img
                      src={music.thumbnail_url}
                      alt={music.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "12px",
                        display: "block"
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        right: "6px",
                        background: "rgba(15, 23, 42, 0.85)",
                        color: "#FFFFFF",
                        padding: "2px 7px",
                        borderRadius: "5px",
                        fontSize: "10px",
                        fontWeight: "700"
                      }}
                    >
                      👁️ {formatViewCount(music.view_count)}회
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4
                      className="text14 font-bold m0 mb6"
                      style={{
                        color: "#0F172A",
                        lineHeight: "1.45",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                      title={music.title}
                    >
                      {music.title}
                    </h4>
                    <div className="flex items-center gap8 text12" style={{ color: "#64748B" }}>
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis font-medium" style={{ color: "#475569" }}>
                        {music.channel_title}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py24 text13" style={{ color: "#64748B" }}>인기 음악 데이터를 불러올 수 없습니다.</div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Main;
