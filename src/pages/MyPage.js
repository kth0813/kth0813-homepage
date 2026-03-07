import { useCallback, useEffect, useState, useMemo } from "react";
import { dbService } from "../services/DbService";
import { useNavigate, Link } from "react-router-dom";
import { showAlert } from "../utils/Alert";
import dayjs from "dayjs";
import { SkeletonLine, SkeletonCircle, SkeletonRect } from "../components/Skeleton";

function MyPage() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({ id: "", name: "", profile_url: "" });
  const [passwords, setPasswords] = useState({ newPwd: "", confirmPwd: "" });
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProfileFile, setNewProfileFile] = useState(null);

  const loginUser = useMemo(() => JSON.parse(localStorage.getItem("loginUser")), []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await dbService.getUserBySeq(loginUser.seq);
    if (userData) setUserInfo(userData);
    const { data: postsData } = await dbService.getRecentPostsByUserId(loginUser.seq, 100);
    if (postsData) setMyPosts(postsData);
    setLoading(false);
  }, [loginUser?.seq]);

  useEffect(() => {
    if (!loginUser) {
      showAlert("로그인이 필요한 서비스입니다.");
      navigate("/login");
      return;
    }
    fetchData();
  }, [loginUser, navigate, fetchData]);

  const handleUpdate = async () => {
    if (!userInfo.name) {
      showAlert("이름을 입력해주세요.");
      return;
    }
    const updateData = { name: userInfo.name };
    let finalProfileUrl = userInfo.profile_url;

    if (newProfileFile) {
      if (newProfileFile.size > 10 * 1024 * 1024) {
        showAlert("파일 용량은 10MB를 초과할 수 없습니다.");
        return;
      }

      const fileExt = newProfileFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await dbService.uploadFile("profiles", filePath, newProfileFile);

      if (uploadError) {
        showAlert("이미지 업로드 실패: " + uploadError.message);
        return;
      }

      const {
        data: { publicUrl }
      } = dbService.getPublicUrl("profiles", filePath);

      finalProfileUrl = publicUrl;
      updateData.profile_url = finalProfileUrl;
    }

    if (passwords.newPwd || passwords.confirmPwd) {
      if (passwords.newPwd !== passwords.confirmPwd) {
        showAlert("새 비밀번호가 서로 일치하지 않습니다.");
        return;
      }
      updateData.pwd = passwords.newPwd;
    }

    const { error } = await dbService.updateUser(loginUser.seq, updateData);

    if (error) {
      showAlert("수정 실패: " + error.message);
    } else {
      const updatedSession = { ...loginUser, name: userInfo.name, profile_url: finalProfileUrl };
      localStorage.setItem("loginUser", JSON.stringify(updatedSession));

      showAlert("정보가 성공적으로 수정되었습니다!");
      setPasswords({ newPwd: "", confirmPwd: "" });
      window.location.reload();
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-header border-b pb20 mb32">
          <SkeletonLine width="200px" height="32px" />
        </div>
        <div className="mypage-grid">
          <section className="mypage-section">
            <SkeletonLine width="150px" height="24px" className="mb24" />
            <div className="flex flex-col items-center mb24">
              <SkeletonCircle size="100px" className="mb12" />
              <SkeletonLine width="200px" height="24px" />
            </div>
            <SkeletonRect width="100%" height="48px" className="mb20" />
            <SkeletonRect width="100%" height="48px" className="mb20" />
            <SkeletonRect width="100%" height="48px" className="mb24" />
            <SkeletonRect width="100%" height="48px" />
          </section>
          <section className="mypage-section">
            <SkeletonLine width="200px" height="24px" className="mb24" />
            <SkeletonRect width="100%" height="400px" />
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header border-b pb20">
        <h2 className="page-title">👤 마이페이지</h2>
      </div>

      <div className="mypage-grid">
        <section className="mypage-section">
          <h3 className="section-title">내 정보 수정</h3>

          <div className="mypage-profile-container">
            {userInfo.profile_url ? <img src={userInfo.profile_url} alt="프로필" className="mypage-profile-img" /> : <div className="profile">👤</div>}
            <div className="mt12">
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
                className="mypage-file-input"
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

          <div className="form-group mt32 pt24 border-b" style={{ borderBottom: "none", borderTop: "1px solid var(--border-color)" }}>
            <label className="form-label">비밀번호 변경 (필요할 때만 입력)</label>
            <input type="password" placeholder="새 비밀번호" value={passwords.newPwd} onChange={(e) => setPasswords({ ...passwords, newPwd: e.target.value })} className="input-field mb12" />
            <input type="password" placeholder="새 비밀번호 확인" value={passwords.confirmPwd} onChange={(e) => setPasswords({ ...passwords, confirmPwd: e.target.value })} className="input-field" />
          </div>

          <button onClick={handleUpdate} className="btn-primary mt24">
            정보 수정하기
          </button>
        </section>

        <section className="mypage-section">
          <h3 className="section-title">내가 작성한 글 ({myPosts.length})</h3>
          <div className="table-wrapper overflow-y-auto" style={{ maxHeight: "500px" }}>
            <table className="data-table">
              <thead className="sticky top-0 bg-card">
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
                      <td className="text-muted text14">{dayjs(post.cre_date).format("YY.MM.DD")}</td>
                      <td className="text-muted">{post.hit || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted p24">
                      작성한 글이 없습니다.
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
