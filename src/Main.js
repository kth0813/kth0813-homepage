import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function Main() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("user")
      .select("seq, id, name, cre_date")
      .order("seq", { ascending: true });

    if (error) {
      console.error("데이터 호출 에러:", error.message);
    } else {
      setUsers(data);
    }
    setLoading(false);
  }

  return (
    <div>
      <h2 style={{ marginBottom: "20px" }}>🏠 메인 대시보드</h2>
      <p>홈페이지에 오신 걸 환영해! 현재 등록된 사용자 목록이야.</p>

      {loading ? (
        <p>데이터를 불러오는 중...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
            backgroundColor: "#fff",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "2px solid #dee2e6",
              }}
            >
              <th style={tableHeaderStyle}>No</th>
              <th style={tableHeaderStyle}>아이디</th>
              <th style={tableHeaderStyle}>이름</th>
              <th style={tableHeaderStyle}>생성일</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.seq} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tableCellStyle}>{user.seq}</td>
                  <td style={tableCellStyle}>{user.id}</td>
                  <td style={tableCellStyle}>{user.name}</td>
                  <td style={tableCellStyle}>
                    {new Date(user.cre_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  등록된 사용자가 없어.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeaderStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

const tableCellStyle = {
  padding: "12px",
  borderBottom: "1px solid #ddd",
};

export default Main;
