import { useState, useEffect, useRef } from "react";
import { dbService } from "../services/DbService";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";

function BoardWrite() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [deletedFileSeqs, setDeletedFileSeqs] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const { seq } = useParams();
  const editorRef = useRef(null);
  const [searchParams] = useSearchParams();
  const category_seq = searchParams.get("category");

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category_seq ? Number(category_seq) : 1);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await dbService.getCategoriesForWrite(loginUser?.admin_yn === "Y");
      if (data) {
        setCategories(data);
        if (!selectedCategory && data.length > 0) {
          setSelectedCategory(data[0].seq);
        }
      }
    };
    fetchCategories();
  }, [loginUser?.admin_yn, selectedCategory]);

  useEffect(() => {
    if (seq) {
      const fetchPost = async () => {
        const { data, error } = await dbService.getPostBySeq(seq);
        if (data && !error) {
          setTitle(data.title);
          setContents(data.contents);
          if (editorRef.current) {
            editorRef.current.getInstance().setMarkdown(data.contents);
          }
          if (data.category_seq) setSelectedCategory(data.category_seq);

          const { data: filesData } = await dbService.getBoardFiles(seq);
          if (filesData) setExistingFiles(filesData);
        } else {
          showAlert("게시글 정보를 불러올 수 없습니다.");
          navigate(-1);
        }
      };
      fetchPost();
    }
  }, [seq, navigate]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let newUploads = [];

    try {
      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          showAlert(`"${file.name}" 파일은 10MB를 초과하여 업로드할 수 없습니다.`);
          continue;
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `files/${fileName}`;

        const { error: uploadError } = await dbService.uploadFile("attachfile", filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicData } = dbService.getPublicUrl("attachfile", filePath);

        if (publicData) {
          newUploads.push({
            file_name: file.name,
            file_url: publicData.publicUrl,
            file_type: file.type || "application/octet-stream",
            file_size: file.size
          });
        }
      }

      setUploadedFiles((prev) => [...prev, ...newUploads]);
    } catch (error) {
      showAlert("파일 업로드에 실패했습니다: " + error.message);
    } finally {
      setIsUploading(false);
      e.target.value = null; // 입력창 초기화
    }
  };

  const handleRemoveUpload = (indexToRemove) => {
    setUploadedFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !contents.trim()) {
      showAlert("제목과 내용을 입력해주세요.");
      return;
    }

    if (seq) {
      const { error } = await dbService.updatePost(
        seq,
        {
          title,
          contents,
          category_seq: selectedCategory
        },
        loginUser.seq,
        loginUser.admin_yn === "Y"
      );

      if (!error) {
        if (deletedFileSeqs.length > 0) {
          await dbService.deleteBoardFiles(deletedFileSeqs);
        }
        if (uploadedFiles.length > 0) {
          const fileInserts = uploadedFiles.map((f) => ({ ...f, board_seq: seq }));
          await dbService.insertBoardFiles(fileInserts);
        }
        showAlert("수정 완료!");
        navigate(`/board/${seq}`);
      } else {
        showAlert("수정 실패: " + error.message);
      }
    } else {
      const insertData = { title, contents, user_seq: loginUser.seq, del_yn: "N", category_seq: selectedCategory };

      const { data, error } = await dbService.insertPost(insertData);

      if (!error && data && data.length > 0) {
        const newSeq = data[0].seq;
        if (uploadedFiles.length > 0) {
          const fileInserts = uploadedFiles.map((f) => ({ ...f, board_seq: newSeq }));
          await dbService.insertBoardFiles(fileInserts);
        }
        showAlert("등록 완료!");
        navigate(selectedCategory ? `/board?category=${selectedCategory}` : "/board");
      } else {
        showAlert("등록 실패: " + (error ? error.message : "알 수 없는 오류"));
      }
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "1200px" }}>
      <div className="editor-top-bar">
        <h2 className="page-title">{seq ? "📝 게시글 수정" : "📝 새 글 작성"}</h2>
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {loginUser?.admin_yn === "Y" && (
          <select className="select-field" value={selectedCategory} onChange={(e) => setSelectedCategory(Number(e.target.value))} style={{ width: "200px" }}>
            {categories.map((cat) => (
              <option key={cat.seq} value={cat.seq}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
        <input type="text" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" style={{ fontSize: "20px", padding: "16px", flex: 1 }} />
      </div>

      <div className="editor-container" style={{ display: "block", background: "white", padding: 0, border: "none" }}>
        <Editor
          ref={editorRef}
          initialValue={contents || " "}
          previewStyle="vertical"
          height="600px"
          initialEditType="markdown"
          useCommandShortcut={true}
          hooks={{
            addImageBlobHook: async (blob, callback) => {
              // 10MB restriction
              const maxSize = 10 * 1024 * 1024;
              if (blob.size > maxSize) {
                showAlert("파일 용량은 10MB를 초과할 수 없습니다.");
                return false;
              }

              setIsUploading(true);
              try {
                const fileExt = blob.name.split(".").pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
                const filePath = `images/${fileName}`;

                const { error: uploadError } = await dbService.uploadFile("attachfile", filePath, blob);

                if (uploadError) {
                  throw uploadError;
                }

                const { data: publicData } = dbService.getPublicUrl("attachfile", filePath);

                if (publicData) {
                  setUploadedFiles((prev) => [
                    ...prev,
                    {
                      file_name: blob.name || "image.png",
                      file_url: publicData.publicUrl,
                      file_type: blob.type || "image/png",
                      file_size: blob.size
                    }
                  ]);
                  callback(publicData.publicUrl, blob.name || "image");
                }
              } catch (error) {
                showAlert("이미지 업로드에 실패했습니다: " + error.message);
              } finally {
                setIsUploading(false);
              }
            }
          }}
          onChange={() => {
            if (editorRef.current) {
              setContents(editorRef.current.getInstance().getMarkdown());
            }
          }}
        />
      </div>

      <div style={{ marginTop: "16px", padding: "16px", background: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
        <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--text-main)" }}>📎 새 문서/첨부파일 추가</h4>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          disabled={isUploading}
          style={{ marginBottom: "12px", fontSize: "14px", color: "var(--text-main)", cursor: isUploading ? "not-allowed" : "pointer" }}
        />
        {uploadedFiles.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {uploadedFiles.map((file, idx) => (
              <li key={`new-${idx}`} style={{ fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <span>💾 {file.file_name}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>({(file.file_size / 1024 / 1024).toFixed(2)} MB)</span>
                </span>
                <button type="button" onClick={() => handleRemoveUpload(idx)} className="btn-danger" style={{ padding: "4px 8px", fontSize: "12px" }}>
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {existingFiles.length > 0 && (
        <div style={{ marginTop: "16px", padding: "16px", background: "var(--bg-color)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "var(--text-main)" }}>📁 기존 첨부파일 관리</h4>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            {existingFiles.map((file) => (
              <li key={file.seq} style={{ fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <a
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                  style={deletedFileSeqs.includes(file.seq) ? { textDecoration: "line-through", color: "var(--text-muted)" } : { display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <span>💾 {file.file_name}</span>
                  {!deletedFileSeqs.includes(file.seq) && <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>({(file.file_size / 1024 / 1024).toFixed(2)} MB)</span>}
                </a>
                <button
                  onClick={() => {
                    setDeletedFileSeqs((prev) => (prev.includes(file.seq) ? prev.filter((id) => id !== file.seq) : [...prev, file.seq]));
                  }}
                  className={deletedFileSeqs.includes(file.seq) ? "btn-secondary" : "btn-danger"}
                  style={{ padding: "4px 8px", fontSize: "12px" }}
                >
                  {deletedFileSeqs.includes(file.seq) ? "삭제 취소" : "삭제"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-bar" style={{ justifyContent: "flex-end", marginTop: "24px" }}>
        <button onClick={() => navigate(seq ? `/board/${seq}` : category_seq ? `/board?category=${category_seq}` : "/board")} className="btn-outline">
          취소
        </button>
        <button onClick={handleSave} className="btn-primary" style={{ width: "auto", padding: "10px 30px" }} disabled={isUploading}>
          {isUploading ? "업로드 중..." : seq ? "수정하기" : "등록하기"}
        </button>
      </div>
    </div>
  );
}

export default BoardWrite;
