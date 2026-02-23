import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Main from "./Main";
import Login from "./Login";
import SignIn from "./SignIn";
import UserList from "./UserList";
import BoardList from "./BoardList";
import BoardDetail from "./BoardDetail";
import BoardWrite from "./BoardWrite";
import MyPage from "./MyPage";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
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
