import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import DashBoard from "./pages/DashBoard";
import Login from "./pages/Login";
import Join from "./pages/Join";
import UserList from "./pages/UserList";
import BoardList from "./pages/BoardList";
import BoardDetail from "./pages/BoardDetail";
import BoardWrite from "./pages/BoardWrite";
import Main from "./pages/Main";
import MyPage from "./pages/MyPage";
import NotFound from "./pages/NotFound";
import MenuManage from "./pages/MenuManage";
import RouletteManage from "./pages/RouletteManage";
import LuckyDraw from "./pages/LuckyDraw";
import Ladder from "./pages/Ladder";
import Roulette from "./pages/Roulette";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotificationList from "./pages/NotificationList";
import MessageList from "./pages/MessageList";
import "./css/App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/board" element={<BoardList />} />
          <Route path="/board/:seq" element={<BoardDetail />} />
          <Route path="/board/write" element={<BoardWrite />} />
          <Route path="/board/edit/:seq" element={<BoardWrite />} />
          <Route path="/menus" element={<MenuManage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/roulette-manage" element={<RouletteManage />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/luckydraw" element={<LuckyDraw />} />
          <Route path="/ladder" element={<Ladder />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/messages" element={<MessageList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
