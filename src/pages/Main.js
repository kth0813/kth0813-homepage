import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Link } from "react-router-dom";
import dayjs from "dayjs";
import { SkeletonLine } from "../components/Skeleton";

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
  const [categories, setCategories] = useState([]);
  const [categoryPosts, setCategoryPosts] = useState({});
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [trendingMusic, setTrendingMusic] = useState([]);
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

    const { data: trendingVideosData } = await supabase.from("youtube_trending").select("*").eq("type", "VIDEO").order("seq", { ascending: false }).limit(4);

    const { data: trendingMusicData } = await supabase.from("youtube_trending").select("*").eq("type", "MUSIC").order("seq", { ascending: false }).limit(4);

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
    if (needsUpdate) {
      try {
        const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
        if (YOUTUBE_API_KEY) {
          const videoResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&maxResults=4&key=${YOUTUBE_API_KEY}`);
          const videoData = await videoResponse.json();

          const musicResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=KR&videoCategoryId=10&maxResults=4&key=${YOUTUBE_API_KEY}`
          );
          const musicData = await musicResponse.json();

          if (videoData.items && musicData.items) {
            await supabase.from("youtube_trending").delete().in("type", ["VIDEO", "MUSIC"]);

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
              await supabase.from("youtube_trending").insert(insertData);

              const { data: newVideos } = await supabase.from("youtube_trending").select("*").eq("type", "VIDEO").order("seq", { ascending: false }).limit(4);
              const { data: newMusic } = await supabase.from("youtube_trending").select("*").eq("type", "MUSIC").order("seq", { ascending: false }).limit(4);

              if (newVideos) setTrendingVideos(newVideos);
              if (newMusic) setTrendingMusic(newMusic);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching YouTube data:", error);
        if (trendingVideosData) setTrendingVideos(trendingVideosData);
        if (trendingMusicData) setTrendingMusic(trendingMusicData);
      }
    } else {
      if (trendingVideosData) setTrendingVideos(trendingVideosData);
      if (trendingMusicData) setTrendingMusic(trendingMusicData);
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
                        <>
                          {categoryPosts[cat.seq].map((post) => (
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
                          ))}
                          {Array.from({ length: Math.max(0, 5 - categoryPosts[cat.seq].length) }).map((_, idx) => (
                            <tr key={`empty-${cat.seq}-${idx}`}>
                              <td colSpan="3" style={{ padding: "16px", visibility: "hidden" }}>
                                &nbsp;
                              </td>
                            </tr>
                          ))}
                        </>
                      ) : (
                        <>
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center", color: "var(--text-muted)", padding: "16px" }}>
                              등록된 게시글이 없어.
                            </td>
                          </tr>
                          {Array.from({ length: 4 }).map((_, idx) => (
                            <tr key={`empty-no-data-${cat.seq}-${idx}`}>
                              <td colSpan="3" style={{ padding: "16px", visibility: "hidden" }}>
                                &nbsp;
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(calc(50% - 12px), 1fr))", gap: "24px", marginTop: "32px", alignItems: "start" }}>
        <section className="youtube-section">
          <div className="youtube-section-header">
            <h3 className="youtube-section-title">
              <span style={{ fontSize: "24px" }}>🔥</span> 유튜브 인기 영상 ({dayjs().format("YYYY년 MM월 DD일")})
            </h3>
          </div>
          <div className="youtube-grid-container">
            {trendingVideos.map((video) => (
              <a key={`video-${video.seq}`} href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer" className="youtube-card">
                <div className="youtube-thumbnail-wrapper">
                  <img src={video.thumbnail_url} alt={video.title} className="youtube-thumbnail" />
                </div>
                <div className="youtube-info">
                  <div className="youtube-title" title={video.title}>
                    {video.title}
                  </div>
                  <div className="youtube-meta">
                    <span className="youtube-channel" title={video.channel_title}>
                      {video.channel_title}
                    </span>
                    {video.view_count && (
                      <>
                        <span>•</span>
                        <span>조회수 {formatViewCount(video.view_count)}회</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="youtube-section">
          <div className="youtube-section-header">
            <h3 className="youtube-section-title">
              <span style={{ fontSize: "24px" }}>🎵</span> 유튜브 인기 음악 ({dayjs().format("YYYY년 MM월 DD일")})
            </h3>
          </div>
          <div className="youtube-grid-container">
            {trendingMusic.map((music) => (
              <a key={`music-${music.seq}`} href={`https://www.youtube.com/watch?v=${music.video_id}`} target="_blank" rel="noopener noreferrer" className="youtube-card">
                <div className="youtube-thumbnail-wrapper">
                  <img src={music.thumbnail_url} alt={music.title} className="youtube-thumbnail" />
                </div>
                <div className="youtube-info">
                  <div className="youtube-title" title={music.title}>
                    {music.title}
                  </div>
                  <div className="youtube-meta">
                    <span className="youtube-channel" title={music.channel_title}>
                      {music.channel_title}
                    </span>
                    {music.view_count && (
                      <>
                        <span>•</span>
                        <span>조회수 {formatViewCount(music.view_count)}회</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Main;
