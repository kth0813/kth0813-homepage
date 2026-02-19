import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Board() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const { data, error } = await supabase
      .from("board")
      .select(
        `
        seq, title, cre_date, del_yn,
        user:user_seq ( name )
      `,
      )
      .eq("del_yn", "N")
      .order("seq", { ascending: false });

    if (!error) setPosts(data);
    else console.error("에러:", error.message);
  }

  return (
    <div>
      <h2>📋 자유 게시판</h2>
      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
      >
        <thead>
          <tr style={{ backgroundColor: "#f4f4f4" }}>
            <th style={tdStyle}>No</th>
            <th style={tdStyle}>제목</th>
            <th style={tdStyle}>작성자</th>
            <th style={tdStyle}>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.seq}>
              <td style={tdStyle}>{post.seq}</td>
              <td style={tdStyle}>{post.title}</td>
              <td style={tdStyle}>{post.user?.name || "탈퇴회원"}</td>
              <td style={tdStyle}>
                {new Date(post.cre_date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tdStyle = {
  border: "1px solid #ddd",
  padding: "10px",
  textAlign: "left",
};

export default Board;
