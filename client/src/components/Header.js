import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Header.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const user     = JSON.parse(localStorage.getItem("binaa_auth_user") || "null");
  const isLoggedIn = !!user;
  const isWorker   = String(user?.role?.type || "").toLowerCase() === "worker";

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("binaa_auth_user");
    localStorage.removeItem("binaa_auth_token");
    window.location.href = "/login";
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="nh-header" dir="rtl">
      <div className="nh-inner">

        {/* Logo */}
        <Link className="nh-logo" to="/home" onClick={closeMenu}>
          Binaa Pal
        </Link>

        {/* Desktop Nav */}
        <nav className="nh-nav">
          <Link
            to="/home"
            className={`nh-link ${isActive("/home") ? "nh-link--active" : ""}`}
          >
            الرئيسية
          </Link>
          <Link
            to="/craftsman"
            className={`nh-link ${isActive("/craftsman") ? "nh-link--active" : ""}`}
          >
            الصنعات
          </Link>
          {isLoggedIn && isWorker && (
            <>
              <Link
                to="/"
                className={`nh-link ${isActive("/") ? "nh-link--active" : ""}`}
              >
                خدماتي
              </Link>
              <Link
                to="/orders"
                className={`nh-link ${isActive("/orders") ? "nh-link--active" : ""}`}
              >
                الطلبات
              </Link>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="nh-actions">
          {!isLoggedIn ? (
            <Link to="/login" className="nh-btn-login">
              تسجيل الدخول
            </Link>
          ) : (
            <>
              {isWorker && (
                <Link
                  to={`/profile/${user?.worker_profile?.id}`}
                  className="nh-avatar"
                  onClick={closeMenu}
                  title="الملف الشخصي"
                >
                  {(user?.firstname || "م").charAt(0)}
                </Link>
              )}
              <span className="nh-username">
                {user?.firstname} {user?.lastname}
              </span>
              <button className="nh-btn-logout" onClick={handleLogout}>
                Logout
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
          <Link to="/home"      className="nh-mobile-link" onClick={closeMenu}>الرئيسية</Link>
          <Link to="/craftsman" className="nh-mobile-link" onClick={closeMenu}>الصنعات</Link>
          {isLoggedIn && isWorker && (
            <>
              <Link to="/"       className="nh-mobile-link" onClick={closeMenu}>خدماتي</Link>
              <Link to="/orders" className="nh-mobile-link" onClick={closeMenu}>الطلبات</Link>
            </>
          )}
          {!isLoggedIn ? (
            <Link to="/login" className="nh-mobile-link nh-mobile-link--cta" onClick={closeMenu}>
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
