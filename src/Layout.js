import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";

function Layout({ children }) {
  return (
    <div className="app-container">
      <TopMenu />
      <div className="app-body">
        <LeftMenu />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}

export default Layout;
