import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { dbService } from "../services/DbService";
import dayjs from "dayjs";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { showAlert } from "../utils/Alert";
import { SkeletonLine, SkeletonRect } from "../components/Skeleton";
import { IconUser } from "../components/Icons";

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
    const { data, error } = await dbService.getPostBySeq(seq);

    if (error) {
      showAlert("존재하지 않거나 삭제된 게시글입니다.");
      navigate("/board");
    } else {
      setPost(data);
      if (data.category_seq) {
        const { data: catData } = await dbService.getCategory(data.category_seq);
        if (catData) setCategoryName(catData.name);
      }

      const { data: filesData } = await dbService.getBoardFiles(seq);
      if (filesData) setAttachedFiles(filesData);
    }
  }, [seq, navigate]);

  const fetchComments = useCallback(async () => {
    const { data, error } = await dbService.getCommentsByBoardSeq(seq);

    if (!error) setComments(data);
  }, [seq]);

  useEffect(() => {
    const loadData = async () => {
      const { error: rpcError } = await dbService.incrementPostHit(seq);
      if (rpcError) console.error("조회수 증가 실패:", rpcError.message);

      fetchPostDetail();
      fetchComments();
    };
    loadData();
  }, [seq, fetchPostDetail, fetchComments]);

  const handlePostDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제하시겠습니까?")) return;

    const { error } = await dbService.softDeletePost(seq, loginUser.seq, loginUser.admin_yn === "Y");

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
      showAlert("파일을 다운로드하는 중 오류가 발생했습니다.");
    }
  };

  async function handleCommentSave() {
    if (!newComment.trim()) return;
    const { error } = await dbService.insertComment({
      board_seq: seq,
      user_seq: loginUser.seq,
      contents: newComment
    });

    if (!error) {
      setNewComment("");
      fetchComments();

      if (post && String(post.user_seq) !== String(loginUser.seq)) {
        await dbService.insertNotification({
          user_seq: post.user_seq,
          type: "COMMENT",
          target_seq: seq,
          message: `${loginUser.name}님이 회원님의 게시글에 댓글을 남겼습니다.`
        });
      }
    }
  }

  async function handleCommentDelete(cSeq) {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    const { error } = await dbService.softDeleteComment(cSeq, loginUser.seq, loginUser.admin_yn === "Y");

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
      <div className="detail-header mb24">
        <div style={{ color: "#2563EB", fontSize: "14px", fontWeight: "bold", marginBottom: "8px" }}>[{categoryName}]</div>
        <h2 className="detail-title text24 font-bold" style={{ color: "#0F172A", marginBottom: "12px" }}>{post.title}</h2>
        <div className="detail-meta flex items-center gap12 text13 text-muted" style={{ borderTop: "1px solid #E2E8F0", borderBottom: "1px solid #E2E8F0", padding: "12px 0" }}>
          <div className="flex items-center gap6">
            <span className="font-semibold" style={{ color: "#475569" }}>작성자:</span>
            {post.user?.profile_url ? (
              <img src={post.user?.profile_url} alt="프로필" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <IconUser size={16} color="#64748B" />
            )}
            <strong style={{ color: "#1E293B" }}>{post.user?.name}</strong>
          </div>
          <span style={{ color: "#CBD5E1" }}>·</span>
          <div>
            <span className="font-semibold" style={{ color: "#475569" }}>작성일:</span> {dayjs(post.cre_date).format("YYYY.MM.DD HH:mm")}
          </div>
          <span style={{ color: "#CBD5E1" }}>·</span>
          <div>
            <span className="font-semibold" style={{ color: "#475569" }}>조회수:</span> {post.hit}
          </div>
        </div>
      </div>

      <div className="detail-body mb32" style={{ lineHeight: "1.7", color: "#334155" }}>
        <ReactMarkdown
          children={post.contents}
          components={{
            code({ inline, className, children, ...props }) {
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
        <div className="mb32 p16" style={{ background: "#F8FAFC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700", color: "#0F172A" }}>📎 첨부파일 ({attachedFiles.length})</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {attachedFiles.map((file) => (
              <li key={file.seq} style={{ fontSize: "13px" }}>
                <a
                  href="#!"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDownload(file.file_url, file.file_name);
                  }}
                  className="text-link flex items-center gap6"
                  style={{ color: "#2563EB", fontWeight: "600" }}
                >
                  <span>💾</span>
                  <span>{file.file_name}</span>
                  <span style={{ color: "#94A3B8", fontSize: "12px" }}>({(file.file_size / 1024 / 1024).toFixed(2)} MB)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-bar flex justify-between items-center mb32" style={{ borderTop: "1px solid #E2E8F0", paddingTop: "20px" }}>
        <button onClick={() => navigate(post.category_seq ? `/board?category=${post.category_seq}` : "/board")} className="btn-outline-sm font-semibold" style={{ height: "38px", padding: "0 16px", borderRadius: "8px" }}>
          ← 목록으로
        </button>
        {loginUser && (String(loginUser.seq) === String(post.user_seq) || loginUser.admin_yn === "Y") && (
          <div className="action-bar-right flex gap8">
            <button onClick={() => navigate(`/board/edit/${post.seq}`)} className="btn-outline-sm font-semibold" style={{ height: "38px", padding: "0 16px", borderRadius: "8px" }}>
              수정
            </button>
            <button onClick={handlePostDelete} className="btn-outline-sm font-semibold" style={{ height: "38px", padding: "0 16px", fontSize: "13px", color: "#EF4444", borderColor: "#FECDD3", borderRadius: "8px" }}>
              삭제
            </button>
          </div>
        )}
      </div>

      <section className="comment-section" style={{ borderTop: "1px solid #E2E8F0", paddingTop: "24px" }}>
        <h4 className="text16 font-bold mb16" style={{ color: "#0F172A" }}>💬 댓글 {comments.length}</h4>
        <div className="comment-list flex flex-col gap12 mb24">
          {comments.map((c) => (
            <div key={c.seq} className="comment-item p16" style={{ background: "#F8FAFC", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
              {c.del_yn === "Y" ? (
                <p style={{ color: "#94A3B8", fontStyle: "italic", fontSize: "13px", margin: 0 }}>삭제된 댓글입니다.</p>
              ) : (
                <>
                  <div className="comment-meta flex justify-between items-center mb8">
                    <div className="flex items-center gap8">
                      {c.user?.profile_url ? <img src={c.user.profile_url} alt="프로필" className="comment-img" style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }} /> : <IconUser size={16} color="#64748B" />}
                      <strong className="comment-author text13" style={{ color: "#1E293B" }}>{c.user?.name}</strong>
                      <span style={{ color: "#CBD5E1" }}>·</span>
                      <span className="comment-date text12 text-muted">{dayjs(c.cre_date).format("YYYY.MM.DD HH:mm")}</span>
                    </div>

                    {loginUser && (String(loginUser.seq) === String(c.user_seq) || loginUser.admin_yn === "Y") && (
                      <button
                        onClick={() => handleCommentDelete(c.seq)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "#94A3B8", padding: 0 }}
                        className="hover:text-red-600"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  <p className="comment-content text14 m0" style={{ color: "#334155", lineHeight: "1.5" }}>{c.contents}</p>
                </>
              )}
            </div>
          ))}
        </div>

        {loginUser ? (
          <div className="comment-input-area flex gap12 items-end mt16">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="input-field"
              placeholder="댓글을 남겨주세요."
              style={{ flex: 1, padding: "12px", borderRadius: "8px", minHeight: "70px", fontSize: "13px", resize: "vertical", boxSizing: "border-box" }}
            />
            <button
              onClick={handleCommentSave}
              className="btn-primary font-bold flex items-center justify-center"
              style={{ width: "90px", height: "70px", background: "#2563EB", color: "white", borderRadius: "8px", fontSize: "14px", flexShrink: 0 }}
            >
              등록
            </button>
          </div>
        ) : (
          <div className="text-center p16 text-muted text13" style={{ background: "#F8FAFC", borderRadius: "8px" }}>
            댓글을 작성하려면 로그인이 필요합니다.
          </div>
        )}
      </section>
    </div>
  );
}

export default BoardDetail;
