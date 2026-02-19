import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout";
import Main from "./Main";
import Login from "./Login";
import SignIn from "./SignIn";
import User from "./User";
import Board from "./Board";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/users" element={<User />} />
          <Route path="/board" element={<Board />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
