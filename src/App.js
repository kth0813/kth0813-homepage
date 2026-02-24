import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DashBoard from "./pages/DashBoard";
import Login from "./pages/Login";
import Join from "./pages/Join";
import UserList from "./pages/UserList";
import BoardList from "./pages/BoardList";
import BoardDetail from "./pages/BoardDetail";
import BoardWrite from "./pages/BoardWrite";
import MyPage from "./pages/MyPage";
import "./css/App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashBoard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/board" element={<BoardList />} />
          <Route path="/board/:seq" element={<BoardDetail />} />
          <Route path="/board/write" element={<BoardWrite />} />
          <Route path="/board/edit/:seq" element={<BoardWrite />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
