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

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPwd, salt);

    const { error } = await supabase.from("user").insert([
      {
        id: userId,
        name: userName,
        pwd: hashedPassword,
        pwd_version: 1
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

          <button className="btn-primary" style={{ marginTop: "20px" }} onClick={handleJoin}>
            가입하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Join;
