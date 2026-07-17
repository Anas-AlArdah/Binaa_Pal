import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const adminUser = JSON.parse(localStorage.getItem("binaa_admin_user") || "null");
  const user = JSON.parse(localStorage.getItem("binaa_auth_user") || "null");
  const isAdminLoggedIn = !!adminUser;
  const isLoggedIn = !!user || isAdminLoggedIn;
  const isWorker = String(user?.role?.type || "").toLowerCase() === "worker";

  const closeMenu = () => setMenuOpen(false);

  // Reusable function to handle navigation clicks
  // Closes the mobile menu and scrolls to the top of the page smoothly
  const handleNavClick = () => {
    closeMenu();
    window.setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }, 0);
  };

  const handleLogout = () => {
    localStorage.removeItem("binaa_auth_user");
    localStorage.removeItem("binaa_auth_token");
    localStorage.removeItem("binaa_admin_user");
    localStorage.removeItem("binaa_admin_token");
    window.location.href = "/login";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nh-header" dir="rtl">
      <div className="nh-inner">

        {/* Logo */}
        <Link className="nh-logo" to="/home" onClick={handleNavClick}>
          Binaa Pal
        </Link>

        {/* Desktop Nav */}
        <nav className="nh-nav">
          <Link
            to="/home"
            className={`nh-link ${isActive("/home") ? "nh-link--active" : ""}`}
            onClick={handleNavClick}
          >
            الرئيسية
          </Link>
          <Link
            to="/craftsman"
            className={`nh-link ${isActive("/craftsman") ? "nh-link--active" : ""}`}
            onClick={handleNavClick}
          >
            الصنعات
          </Link>
          {isAdminLoggedIn && (
            <Link
              to="/admin"
              className={`nh-link ${isActive("/admin") ? "nh-link--active" : ""}`}
              onClick={handleNavClick}
            >
              لوحة الآدمن
            </Link>
          )}
          {isLoggedIn && !isAdminLoggedIn && (
            <Link
              to="/my-services"
              className={`nh-link ${isActive("/my-services") ? "nh-link--active" : ""}`}
              onClick={handleNavClick}
            >
              خدماتي
            </Link>
          )}
          {isLoggedIn && isWorker && !isAdminLoggedIn && (
            <Link
              to="/orders"
              className={`nh-link ${isActive("/orders") ? "nh-link--active" : ""}`}
              onClick={handleNavClick}
            >
              الطلبات
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="nh-actions">
          <button 
            className="nh-theme-toggle" 
            onClick={toggleTheme} 
            aria-label="تغيير المظهر"
            title={theme === "light" ? "المظهر الداكن" : "المظهر الفاتح"}
          >
            {theme === "light" ? <FiMoon /> : <FiSun />}
          </button>
          {!isLoggedIn ? (
            <Link to="/login" className="nh-btn-login" onClick={handleNavClick}>
              تسجيل الدخول
            </Link>
          ) : (
            <>
              {isAdminLoggedIn ? (
                <span className="nh-username" style={{ fontWeight: 'bold', color: 'var(--hp-accent, #F59E0B)' }}>
                  الآدمن
                </span>
              ) : (
                <>
                  {isWorker && (
                    <Link
                      to={`/profile/${user?.worker_profile?.id}`}
                      className="nh-avatar"
                      onClick={handleNavClick}
                      title="الملف الشخصي"
                    >
                      {(user?.firstname || "م").charAt(0)}
                    </Link>
                  )}
                  <span className="nh-username">
                    {user?.firstname} {user?.lastname}
                  </span>
                </>
              )}
              <button className="nh-btn-logout" onClick={handleLogout}>
                تسجيل الخروج
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="nh-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="القائمة"
        >
          <span className={`nh-toggle__bar ${menuOpen ? "nh-toggle__bar--open" : ""}`} />
          <span className={`nh-toggle__bar ${menuOpen ? "nh-toggle__bar--open" : ""}`} />
          <span className={`nh-toggle__bar ${menuOpen ? "nh-toggle__bar--open" : ""}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="nh-mobile-menu" dir="rtl">
          <Link to="/home"      className="nh-mobile-link" onClick={handleNavClick}>الرئيسية</Link>
          <Link to="/craftsman" className="nh-mobile-link" onClick={handleNavClick}>الصنعات</Link>
          {isAdminLoggedIn && (
            <Link to="/admin" className="nh-mobile-link" onClick={handleNavClick}>لوحة الآدمن</Link>
          )}
          <button className="nh-mobile-link nh-mobile-theme-btn" onClick={() => { toggleTheme(); closeMenu(); }}>
            {theme === "light" ? "المظهر الداكن 🌙" : "المظهر الفاتح ☀️"}
          </button>
          {isLoggedIn && !isAdminLoggedIn && (
            <Link to="/my-services" className="nh-mobile-link" onClick={handleNavClick}>خدماتي</Link>
          )}
          {isLoggedIn && isWorker && !isAdminLoggedIn && (
            <Link to="/orders"      className="nh-mobile-link" onClick={handleNavClick}>الطلبات</Link>
          )}
          {!isLoggedIn ? (
            <Link to="/login" className="nh-mobile-link nh-mobile-link--cta" onClick={handleNavClick}>
              تسجيل الدخول
            </Link>
          ) : (
            <button className="nh-mobile-link nh-mobile-link--logout" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          )}
        </div>
      )}
    </header>
  );
}
