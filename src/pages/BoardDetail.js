import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { showAlert } from "../utils/Alert";
import { SkeletonLine, SkeletonRect } from "../components/Skeleton";

function BoardDetail() {
  const { seq } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [categoryName, setCategoryName] = useState("전체 게시판");

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const fetchPostDetail = useCallback(async () => {
    const { data, error } = await supabase.from("board").select(`*, user:user_seq ( name, profile_url )`).eq("seq", seq).eq("del_yn", "N").single();

    if (error) {
      showAlert("존재하지 않거나 삭제된 게시글이야.");
      navigate("/board");
    } else {
      setPost(data);
      if (data.category_seq) {
        const { data: catData } = await supabase.from("category").select("name").eq("seq", data.category_seq).single();
        if (catData) setCategoryName(catData.name);
      }

      // 첨부파일 가져오기
      const { data: filesData } = await supabase.from("board_file").select("*").eq("board_seq", seq).order("cre_date", { ascending: true });
      if (filesData) setAttachedFiles(filesData);
    }
  }, [seq, navigate]);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase.from("board_comment").select(`*, user:user_seq ( name, profile_url )`).eq("board_seq", seq).order("seq", { ascending: true });

    if (!error) setComments(data);
  }, [seq]);

  useEffect(() => {
    const loadData = async () => {
      const { error: rpcError } = await supabase.rpc("increment_hit", { row_id: seq });
      if (rpcError) console.error("조회수 증가 실패:", rpcError.message);

      fetchPostDetail();
      fetchComments();
    };
    loadData();
  }, [seq, fetchPostDetail, fetchComments]);

  const handlePostDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제할 거야?")) return;

    let query = supabase.from("board").update({ del_yn: "Y" }).eq("seq", seq);
    if (loginUser.admin_yn !== "Y") {
      query = query.eq("user_seq", loginUser.seq);
    }
    const { error } = await query;

    if (!error) {
      navigate("/board");
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      showAlert("파일을 다운로드하는 중 오류가 발생했어.");
    }
  };

  async function handleCommentSave() {
    if (!newComment.trim()) return;
    const { error } = await supabase.from("board_comment").insert([
      {
        board_seq: seq,
        user_seq: loginUser.seq,
        contents: newComment
      }
    ]);

    if (!error) {
      setNewComment("");
      fetchComments();
    }
  }

  async function handleCommentDelete(cSeq) {
    if (!window.confirm("댓글을 삭제할래?")) return;

    let query = supabase.from("board_comment").update({ del_yn: "Y" }).eq("seq", cSeq);
    if (loginUser.admin_yn !== "Y") {
      query = query.eq("user_seq", loginUser.seq);
    }
    const { error } = await query;

    if (!error) fetchComments();
  }

  if (!post) {
    return (
      <div className="detail-container">
        <div className="detail-header">
          <SkeletonLine width="100px" height="16px" style={{ marginBottom: "8px" }} />
          <SkeletonLine width="60%" height="40px" style={{ marginBottom: "12px" }} />
          <div className="detail-meta">
            <SkeletonLine width="200px" height="20px" />
            <SkeletonLine width="50px" height="20px" />
          </div>
        </div>
        <div className="detail-body">
          <SkeletonRect width="100%" height="200px" />
        </div>
      </div>
    );
  }

  return (
    <div className="detail-container">
      <div className="detail-header">
        <div style={{ color: "var(--primary-color)", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>[{categoryName}]</div>
        <h2 className="detail-title">{post.title}</h2>
        <div className="detail-meta">
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            작성자:{" "}
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {post.user?.profile_url ? (
                <img src={post.user?.profile_url} alt="프로필" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f0f0f0", borderRadius: "50%", fontSize: "10px" }}>
                  👤
                </div>
              )}
              <strong>{post.user?.name}</strong>
            </span>{" "}
            | 작성일: {dayjs(post.cre_date).format("YYYY.MM.DD HH:mm")}
          </span>
          <span>👁️ {post.hit}</span>
        </div>
      </div>

      <div className="detail-body">
        <ReactMarkdown
          children={post.contents}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter children={String(children).replace(/\n$/, "")} style={atomDark} language={match[1]} PreTag="div" {...props} />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        />
      </div>

      {attachedFiles.length > 0 && (
        <div style={{ marginTop: "24px", padding: "16px", background: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "15px", color: "var(--text-main)" }}>📎 첨부파일 ({attachedFiles.length})</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {attachedFiles.map((file) => (
              <li key={file.seq} style={{ fontSize: "14px" }}>
                <a
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(file.file_url, file.file_name);
                  }}
                  className="text-link"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>💾</span>
                  <span>{file.file_name}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>({(file.file_size / 1024 / 1024).toFixed(2)} MB)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-bar">
        <button onClick={() => navigate(post.category_seq ? `/board?category=${post.category_seq}` : "/board")} className="btn-outline">
          목록으로
        </button>
        {loginUser && (loginUser.seq === post.user_seq || loginUser.admin_yn === "Y") && (
          <div className="action-bar-right">
            <button onClick={() => navigate(`/board/edit/${post.seq}`)} className="btn-outline">
              수정
            </button>
            <button onClick={handlePostDelete} className="btn-danger">
              삭제
            </button>
          </div>
        )}
      </div>

      <section className="comment-section">
        <h4>💬 댓글 {comments.length}</h4>
        <div className="comment-list">
          {comments.map((c) => (
            <div key={c.seq} className="comment-item">
              {c.del_yn === "Y" ? (
                <p style={{ color: "#bbb", fontStyle: "italic", fontSize: "14px", margin: 0 }}>삭제된 댓글입니다.</p>
              ) : (
                <>
                  <div className="comment-meta">
                    {c.user?.profile_url ? <img src={c.user.profile_url} alt="프로필" className="comment-img" /> : <div className="comment-profile">👤</div>}
                    <strong className="comment-author">{c.user?.name}</strong>
                    <span className="comment-date">{dayjs(c.cre_date).format("YYYY.MM.DD HH:mm")}</span>
                  </div>
                  <p className="comment-content">{c.contents}</p>
                  {loginUser && (loginUser.seq === c.user_seq || loginUser.admin_yn === "Y") && (
                    <button onClick={() => handleCommentDelete(c.seq)} className="btn-text-danger">
                      삭제
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {loginUser ? (
          <div className="comment-input-area">
            <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="comment-textarea" placeholder="댓글을 남겨주세요." />
            <button onClick={handleCommentSave} className="btn-primary" style={{ width: "100px", padding: "16px" }}>
              등록
            </button>
          </div>
        ) : (
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "20px" }}>로그인 후 댓글을 남길 수 있어.</p>
        )}
      </section>
    </div>
  );
}

export default BoardDetail;
