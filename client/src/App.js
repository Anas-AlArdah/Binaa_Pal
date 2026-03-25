import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import PageProfile from './pages/profile/PageProfile';
import Crafts from './pages/CraftsmanProfile/Crafts';

function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="home-nav">
              <div className="home-nav__panel">
                <span className="home-nav__eyebrow">Binaa Pal</span>
                <h1>واجهات تجريبية للمشروع</h1>
                <p>اختر الصفحة التي تريد معاينتها. الصفحات الداخلية أصبحت تعمل داخل Layout موحّد مع الهيدر.</p>
                <div className="home-nav__actions">
                  <Link to="/profile" className="home-nav__link">
                    صفحة البروفايل
                  </Link>
                  <Link to="/craftsman" className="home-nav__link home-nav__link--alt">
                    صفحة الحرفي
                  </Link>
                </div>
              </div>
            </div>
          }
        />

        <Route element={<AppLayout />}>
          <Route path="/profile" element={<PageProfile />} />
          <Route path="/craftsman" element={<Crafts />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
