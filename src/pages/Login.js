import { useState, useRef } from "react";
import { dbService } from "../services/DbService";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/Alert";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userPwd, setUserPwd] = useState("");

  const handleLogin = async () => {
    try {
      const { data: user, error } = await dbService.getUserById(userId);

      if (error || !user) {
        if (error) showAlert(JSON.stringify(error));
        else showAlert("아이디를 확인해주세요.");
        return;
      }

      if (!user.pwd) {
        showAlert("DB에 비밀번호 정보가 없습니다.");
        return;
      }

      const isMatch = await bcrypt.compare(userPwd, user.pwd);

      if (isMatch) {
        const loginUser = {
          seq: user.seq,
          id: user.id,
          name: user.name,
          profile_url: user.profile_url,
          admin_yn: user.admin_yn
        };

        localStorage.setItem("loginUser", JSON.stringify(loginUser));
        navigate("/");
        window.location.reload();
      } else {
        showAlert("비밀번호가 틀렸습니다.");
      }
    } catch (err) {
      console.error("로그인 로직 에러:", err);
      showAlert("로그인 중 알 수 없는 에러가 발생했습니다.");
    }
  };

  const pwdInputRef = useRef(null);

  const handleIdKeyDown = (e) => {
    if (e.key === "Enter") {
      pwdInputRef.current?.focus();
    }
  };

  const handlePwdKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>로그인</h2>
        <div className="auth-form">
          <input className="input-field" placeholder="아이디" onChange={(e) => setUserId(e.target.value)} onKeyDown={handleIdKeyDown} />
          <input className="input-field" type="password" placeholder="비밀번호" onChange={(e) => setUserPwd(e.target.value)} onKeyDown={handlePwdKeyDown} ref={pwdInputRef} />
          <button className="btn-primary" onClick={handleLogin}>
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
