import { useState } from "react";
import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [userPwd, setUserPwd] = useState("");

  const handleLogin = async () => {
    try {
      const { data: user, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", userId)
        .single();

      if (error || !user) {
        alert("아이디를 확인해줘.");
        return;
      }

      if (!user.pwd) {
        alert("DB에 비밀번호 정보가 없어.");
        return;
      }

      const isMatch = await bcrypt.compare(userPwd, user.pwd);

      if (isMatch) {
        const loginUser = {
          seq: user.seq,
          id: user.id,
          name: user.name,
        };

        localStorage.setItem("loginUser", JSON.stringify(loginUser));
        alert(user.name + "님 반가워!");
        navigate("/");
        window.location.reload();
      } else {
        alert("비밀번호가 틀렸어.");
      }
    } catch (err) {
      console.error("로그인 로직 에러:", err);
      alert("로그인 중 알 수 없는 에러가 발생했어.");
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <input placeholder="아이디" onChange={(e) => setUserId(e.target.value)} />
      <br />
      <input
        type="password"
        placeholder="비밀번호"
        onChange={(e) => setUserPwd(e.target.value)}
      />
      <br />
      <button onClick={handleLogin}>로그인</button>
    </div>
  );
}

export default Login;
