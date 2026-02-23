import { useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";

// 상세페이지에서 썼던 마크다운 컴포넌트들 동일하게 사용
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { showAlert } from "./Alert";

function BoardWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [viewMode, setViewMode] = useState("split"); // split, write, preview

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  const handleSave = async () => {
    if (!title.trim() || !contents.trim()) {
      showAlert("제목과 내용을 입력해줘.");
      return;
    }

    const { error } = await supabase.from("board").insert([
      {
        title,
        contents,
        user_seq: loginUser.seq,
        del_yn: "N"
      }
    ]);

    if (!error) {
      showAlert("등록 완료!");
      navigate("/board");
    } else {
      showAlert("등록 실패: " + error.message);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "1200px" }}>
      <div className="editor-top-bar">
        <h2 className="page-title">📝 새 글 작성</h2>
        <div className="editor-tabs">
          <button onClick={() => setViewMode("write")} className={`tab-btn ${viewMode === "write" ? "active" : ""}`}>
            Write
          </button>
          <button onClick={() => setViewMode("preview")} className={`tab-btn ${viewMode === "preview" ? "active" : ""}`}>
            Preview
          </button>
          <button onClick={() => setViewMode("split")} className={`tab-btn ${viewMode === "split" ? "active" : ""}`}>
            Split
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-field"
        style={{ fontSize: "20px", padding: "16px", marginBottom: "24px" }}
      />

      <div
        className="editor-container"
        style={{
          flexDirection: viewMode === "write" ? "column" : viewMode === "preview" ? "column" : "row"
        }}
      >
        {/* 입력창 (Write) */}
        {(viewMode === "write" || viewMode === "split") && (
          <textarea
            placeholder="마크다운 문법으로 내용을 입력하세요... (예: # 제목, **강조**, ```js 코드)"
            value={contents}
            onChange={(e) => setContents(e.target.value)}
            className="editor-textarea"
            style={{ flex: viewMode === "split" ? 1 : "none", height: viewMode === "write" ? "100%" : "auto" }}
          />
        )}

        {/* 미리보기창 (Preview) */}
        {(viewMode === "preview" || viewMode === "split") && (
          <div className="editor-preview" style={{ flex: viewMode === "split" ? 1 : "none", height: viewMode === "preview" ? "100%" : "auto" }}>
            <ReactMarkdown
              children={contents || "*내용을 입력하면 여기에 미리보기가 표시됩니다.*"}
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
        )}
      </div>

      <div className="action-bar" style={{ justifyContent: "flex-end" }}>
        <button onClick={() => navigate("/board")} className="btn-outline">
          취소
        </button>
        <button onClick={handleSave} className="btn-primary" style={{ width: "auto", padding: "10px 30px" }}>
          등록하기
        </button>
      </div>
    </div>
  );
}

export default BoardWrite;
