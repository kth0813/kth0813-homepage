import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function User() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("user")
        .select("seq, id, name, cre_date")
        .order("seq", { ascending: true });

      if (!error) setUsers(data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <h2>👥 사용자 관리</h2>
      <table style={tableStyle}>
        <thead>
          <tr style={{ backgroundColor: "#eee" }}>
            <th style={tdStyle}>순번</th>
            <th style={tdStyle}>아이디</th>
            <th style={tdStyle}>이름</th>
            <th style={tdStyle}>가입일</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.seq}>
              <td style={tdStyle}>{u.seq}</td>
              <td style={tdStyle}>{u.id}</td>
              <td style={tdStyle}>{u.name}</td>
              <td style={tdStyle}>
                {new Date(u.cre_date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};
const tdStyle = { border: "1px solid #ccc", padding: "8px", textAlign: "left" };

export default User;
