import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "./supabaseClient";

// 마크다운 및 코드 하이라이팅 관련 임포트
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { showAlert } from "./Alert";

function BoardDetail() {
  const { seq } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    const loadData = async () => {
      // 1. 조회수 증가 (RPC)
      const { error: rpcError } = await supabase.rpc("increment_hit", { row_id: seq });
      if (rpcError) console.error("조회수 증가 실패:", rpcError.message);

      fetchPostDetail();
      fetchComments();
    };
    loadData();
  }, [seq]);

  async function fetchPostDetail() {
    const { data, error } = await supabase.from("board").select(`*, user:user_seq ( name )`).eq("seq", seq).eq("del_yn", "N").single();

    if (error) {
      showAlert("존재하지 않거나 삭제된 게시글이야.");
      navigate("/board");
    } else {
      setPost(data);
    }
  }

  async function fetchComments() {
    const { data, error } = await supabase.from("board_comment").select(`*, user:user_seq ( name )`).eq("board_seq", seq).order("seq", { ascending: true });

    if (!error) setComments(data);
  }

  const handlePostDelete = async () => {
    if (!window.confirm("정말 이 게시글을 삭제할 거야?")) return;
    const { error } = await supabase.from("board").update({ del_yn: "Y" }).eq("seq", seq).eq("user_seq", loginUser.seq);

    if (!error) {
      navigate("/board");
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
    const { error } = await supabase.from("board_comment").update({ del_yn: "Y" }).eq("seq", cSeq);

    if (!error) fetchComments();
  }

  if (!post) return <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>;

  return (
    <div className="detail-container">
      {/* 게시글 헤더 */}
      <div className="detail-header">
        <h2 className="detail-title">{post.title}</h2>
        <div className="detail-meta">
          <span>
            작성자: <strong>{post.user?.name}</strong> | 작성일: {new Date(post.cre_date).toLocaleString()}
          </span>
          <span>👁️ {post.hit}</span>
        </div>
      </div>

      {/* 마크다운 본문 영역 */}
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

      {/* 제어 버튼 */}
      <div className="action-bar">
        <button onClick={() => navigate("/board")} className="btn-outline">
          목록으로
        </button>
        {loginUser && loginUser.seq === post.user_seq && (
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

      {/* 댓글 섹션 */}
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
                    <strong className="comment-author">{c.user?.name}</strong>
                    <span className="comment-date">{new Date(c.cre_date).toLocaleString()}</span>
                  </div>
                  <p className="comment-content">{c.contents}</p>
                  {loginUser && loginUser.seq === c.user_seq && (
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
