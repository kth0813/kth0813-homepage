import { useState } from "react";
import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";

function SignIn() {
  const [userId, setUserId] = useState("");
  const [userPwd, setUserPwd] = useState("");
  const [userName, setUserName] = useState("");

  const handleSignIn = async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPwd, salt);

    const { error } = await supabase.from("user").insert([
      {
        id: userId,
        name: userName,
        pwd: hashedPassword,
        pwd_version: 1,
      },
    ]);

    if (error) alert("실패: " + error.message);
    else alert("회원가입 성공!");
  };

  return (
    <div>
      <h2>회원가입</h2>
      <input placeholder="아이디" onChange={(e) => setUserId(e.target.value)} />
      <br />
      <input placeholder="이름" onChange={(e) => setUserName(e.target.value)} />
      <br />
      <input
        type="password"
        placeholder="비밀번호"
        onChange={(e) => setUserPwd(e.target.value)}
      />
      <br />
      <button onClick={handleSignIn}>가입하기</button>
    </div>
  );
}

export default SignIn;
