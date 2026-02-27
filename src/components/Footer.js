import React from "react";
import { Link } from "react-router-dom";
import "../css/App.css";

function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-links">
          <Link to="/privacy" className="footer-link">
            개인정보처리방침
          </Link>
          <span className="footer-divider">|</span>
          <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="footer-link">
            유튜브 이용약관 (YouTube API 제공)
          </a>
        </div>
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} kth0813. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
