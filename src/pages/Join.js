import { useState } from "react";
import { supabase } from "../supabaseClient";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alert";

function Join() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userPwd, setUserPwd] = useState("");
  const [userName, setUserName] = useState("");
  const [profileFile, setProfileFile] = useState(null);

  const handleJoin = async () => {
    if (!userId || !userPwd || !userName) {
      showAlert("모든 정보를 입력해줘.");
      return;
    }

    const hasEnglish = /[a-zA-Z]/.test(userId);
    const isOnlyEngNum = /^[a-zA-Z0-9]+$/.test(userId);

    if (!hasEnglish || !isOnlyEngNum) {
      showAlert("아이디는 영문이 포함되어야 하고 숫자만 함께 쓸 수 있어. (한글, 특수문자 불가)");
      return;
    }

    let profileUrl = "";

    if (profileFile) {
      if (profileFile.size > 10 * 1024 * 1024) {
        showAlert("파일 용량은 10MB를 초과할 수 없어.");
        return;
      }

      const fileExt = profileFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage.from("profiles").upload(filePath, profileFile);

      if (uploadError) {
        showAlert("이미지 업로드 실패: " + uploadError.message);
        return;
      }

      const {
        data: { publicUrl }
      } = supabase.storage.from("profiles").getPublicUrl(filePath);

      profileUrl = publicUrl;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPwd, salt);

    const { error } = await supabase.from("user").insert([
      {
        id: userId,
        name: userName,
        pwd: hashedPassword,
        pwd_version: 1,
        profile_url: profileUrl
      }
    ]);

    if (error) {
      showAlert("가입 실패: " + error.message);
    } else {
      showAlert("회원가입 성공!");
      navigate("/login");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>회원가입</h2>
        <div className="auth-form">
          <input className="input-field" placeholder="아이디" onChange={(e) => setUserId(e.target.value)} />
          <input className="input-field" placeholder="이름" onChange={(e) => setUserName(e.target.value)} />
          <input className="input-field" type="password" placeholder="비밀번호" onChange={(e) => setUserPwd(e.target.value)} />

          <div style={{ textAlign: "left", marginTop: "10px" }}>
            <label style={{ fontSize: "13px", color: "#666" }}>프로필 사진 (이미지, 10MB 이하)</label>
            <input type="file" accept="image/*" onChange={(e) => setProfileFile(e.target.files[0])} style={{ marginTop: "5px", fontSize: "12px" }} />
          </div>

          <button className="btn-primary" style={{ marginTop: "20px" }} onClick={handleJoin}>
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Join;
