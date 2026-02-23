import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { showAlert } from "./Alert";

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ id: "", name: "", profile_url: "" }); // pwd 제거
  const [passwords, setPasswords] = useState({ newPwd: "", confirmPwd: "" }); // 새 비번용
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProfileFile, setNewProfileFile] = useState(null);

  const loginUser = JSON.parse(localStorage.getItem("loginUser"));

  useEffect(() => {
    if (!loginUser) {
      showAlert("로그인이 필요한 서비스야.");
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: userData } = await supabase.from("user").select("id, name, profile_url").eq("seq", loginUser.seq).single();
    if (userData) setUserInfo(userData);
    const { data: postsData } = await supabase.from("board").select("seq, title, cre_date, hit").eq("user_seq", loginUser.seq).eq("del_yn", "N").order("seq", { ascending: false });
    if (postsData) setMyPosts(postsData);
    setLoading(false);
  }

  const handleUpdate = async () => {
    if (!userInfo.name) {
      showAlert("이름을 입력해줘.");
      return;
    }
    const updateData = { name: userInfo.name };
    let finalProfileUrl = userInfo.profile_url;

    if (newProfileFile) {
      if (newProfileFile.size > 10 * 1024 * 1024) {
        showAlert("파일 용량은 10MB를 초과할 수 없어.");
        return;
      }

      const fileExt = newProfileFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, newProfileFile);

      if (uploadError) {
        showAlert("이미지 업로드 실패: " + uploadError.message);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      finalProfileUrl = publicUrl;
      updateData.profile_url = finalProfileUrl;
    }

    if (passwords.newPwd || passwords.confirmPwd) {
      if (passwords.newPwd !== passwords.confirmPwd) {
        showAlert("새 비밀번호가 서로 일치하지 않아.");
        return;
      }
      updateData.pwd = passwords.newPwd;
    }

    const { error } = await supabase.from("user").update(updateData).eq("seq", loginUser.seq);

    if (error) {
      showAlert("수정 실패: " + error.message);
    } else {
      const updatedSession = { ...loginUser, name: userInfo.name, profile_url: finalProfileUrl };
      localStorage.setItem("loginUser", JSON.stringify(updatedSession));

      showAlert("정보가 성공적으로 수정됐어!");
      setPasswords({ newPwd: "", confirmPwd: "" });
      window.location.reload();
    }
  };

  if (loading) return <div style={{ padding: "40px", textAlign: "center" }}>로딩 중...</div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "20px" }}>
        <h2 className="page-title">👤 마이페이지</h2>
      </div>

      <div className="mypage-grid">
        <section className="mypage-section">
          <h3 className="section-title">내 정보 수정</h3>

          <div style={{ textAlign: "center", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {userInfo.profile_url ? (
              <img
                src={userInfo.profile_url}
                alt="프로필"
                style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border-color)", padding: "2px" }}
              />
            ) : (
              <div className="profile">👤</div>
            )}
            <div style={{ marginTop: "12px" }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewProfileFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setUserInfo({ ...userInfo, profile_url: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ fontSize: "12px", width: "100%", maxWidth: "200px" }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">아이디</label>
            <input value={userInfo.id} disabled className="input-field" />
          </div>

          <div className="form-group">
            <label className="form-label">이름</label>
            <input value={userInfo.name} onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })} className="input-field" />
          </div>

          <div className="form-group" style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-color)" }}>
            <label className="form-label">비밀번호 변경 (필요할 때만 입력)</label>
            <input
              type="password"
              placeholder="새 비밀번호"
              value={passwords.newPwd}
              onChange={(e) => setPasswords({ ...passwords, newPwd: e.target.value })}
              className="input-field"
              style={{ marginBottom: "12px" }}
            />
            <input type="password" placeholder="새 비밀번호 확인" value={passwords.confirmPwd} onChange={(e) => setPasswords({ ...passwords, confirmPwd: e.target.value })} className="input-field" />
          </div>

          <button onClick={handleUpdate} className="btn-primary" style={{ marginTop: "24px" }}>
            정보 수정하기
          </button>
        </section>

        <section className="mypage-section">
          <h3 className="section-title">내가 작성한 글 ({myPosts.length})</h3>
          <div className="table-wrapper" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="data-table">
              <thead style={{ position: "sticky", top: 0 }}>
                <tr>
                  <th>No</th>
                  <th>제목</th>
                  <th>날짜</th>
                  <th>조회</th>
                </tr>
              </thead>
              <tbody>
                {myPosts.length > 0 ? (
                  myPosts.map((post) => (
                    <tr key={post.seq}>
                      <td>{post.seq}</td>
                      <td>
                        <Link to={`/board/${post.seq}`} className="text-link">
                          {post.title}
                        </Link>
                      </td>
                      <td style={{ color: "var(--text-muted)", fontSize: "14px" }}>{new Date(post.cre_date).toLocaleDateString()}</td>
                      <td style={{ color: "var(--text-muted)" }}>{post.hit || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                      작성한 글이 없어.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MyPage;
