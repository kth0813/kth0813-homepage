import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop Component
 * 
 * Listens for location.pathname changes and instantly resets the scroll
 * position of window, document, and container elements to top (0, 0).
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset main window scroll
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // 2. Reset document elements
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Reset scroll on app layout containers if overflow is set on them
    const appMain = document.querySelector(".app-main");
    if (appMain) {
      appMain.scrollTop = 0;
    }

    const appBody = document.querySelector(".app-body");
    if (appBody) {
      appBody.scrollTop = 0;
    }
  }, [pathname]);

  return null;
}

export default ScrollToTop;
