import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import ScrollToTop from "./components/ScrollToTop";
import CategoryManage from "./pages/CategoryManage";
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
import Dice from "./pages/Dice";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotificationList from "./pages/NotificationList";
import MessageList from "./pages/MessageList";
import Schedule from "./pages/Schedule";
import AboutMe from "./pages/AboutMe";
import Projects from "./pages/Projects";
import "./css/App.css";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/about" element={<AboutMe />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/login" element={<Login />} />
          <Route path="/join" element={<Join />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/board" element={<BoardList />} />
          <Route path="/board/:seq" element={<BoardDetail />} />
          <Route path="/board/write" element={<BoardWrite />} />
          <Route path="/board/edit/:seq" element={<BoardWrite />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/category-manage" element={<CategoryManage />} />
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/roulette-manage" element={<RouletteManage />} />
          <Route path="/luckydraw" element={<LuckyDraw />} />
          <Route path="/dice" element={<Dice />} />
          <Route path="/ladder" element={<Ladder />} />
          <Route path="/roulette" element={<Roulette />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/notifications" element={<NotificationList />} />
          <Route path="/messages" element={<MessageList />} />
          <Route path="/admin" element={<DashBoard />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/menus" element={<MenuManage />} />
          <Route path="/roulette/manage" element={<RouletteManage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
