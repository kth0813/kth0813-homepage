import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import TopMenu from "./components/TopMenu";
import LeftMenu from "./components/LeftMenu";
import Footer from "./components/Footer";

function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile menu when navigating to a new route
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <div className="app-container">
      <TopMenu onMenuToggle={toggleMobileMenu} />
      <div className="app-body">
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}
        <LeftMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="app-main">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}

export default Layout;
