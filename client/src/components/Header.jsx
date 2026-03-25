import { Link, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'الرئيسية' },
  { to: '/craftsman', label: 'الحرفيون' },
  { to: '/profile', label: 'البروفايل' },
];

function Header() {
  const isLoggedIn = true;
  const isWorker = true;
  const accountLabel = isWorker ? 'حساب عامل' : 'حساب عميل';
  const profileRoute = isWorker ? '/craftsman' : '/profile';

  return (
    <header className="site-header" dir="rtl">
      <nav className="site-header__nav" aria-label="Main navigation">
        <Link to="/" className="site-header__brand">
          <span className="site-header__title">Binaa Pal</span>
          <span className="site-header__subtitle">منصة خدمات بواجهة أوضح وأكثر أناقة</span>
        </Link>

        <div className="site-header__links">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `site-header__link${isActive ? ' site-header__link--active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="site-header__actions">
          <span className="site-header__badge">{accountLabel}</span>

          {isLoggedIn ? (
            <>
              <Link to={profileRoute} className="site-header__profile" aria-label="الملف الشخصي">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                  <path
                    fillRule="evenodd"
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
                  />
                </svg>
              </Link>

              <button type="button" className="site-header__logout" onClick={() => console.log('logout')}>
                تسجيل الخروج
              </button>
            </>
          ) : (
            <Link to="/register" className="site-header__link site-header__link--active">
              تسجيل الدخول
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
