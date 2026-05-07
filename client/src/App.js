import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import PageProfile from './pages/profile/PageProfile';
import PageProfileIndex from './pages/profile/PageProfileIndex';
import Crafts from './pages/CraftsmanProfile/Crafts';
import CraftDetails from './pages/CraftsmanProfile/CraftDetails';
import Homepage from './pages/Home/Homepage';
import LoginPage from './pages/Login/LoginPage';

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
            <div
              style={{
                padding: '40px',
                fontFamily: "'Inter', 'Cairo', sans-serif",
                textAlign: 'center',
              }}
            >
              <h1 style={{ color: '#5a6b35', marginBottom: '20px' }}>Binaa Pal - Navigation</h1>

              <p style={{ color: '#777', marginBottom: '30px' }}>اختر الصفحة التي تريد معاينتها:</p>

              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Link
                  to="/home"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#2c3e50',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  Homepage
                </Link>

                <Link
                  to="/profile"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#5a6b35',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  Worker Profile Page
                </Link>

                <Link
                  to="/craftsman"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#4a5a2b',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  Craftsman List Page
                </Link>

                <Link
                  to="/login"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#363795',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                  }}
                >
                  Login Page
                </Link>
              </div>
            </div>
          }
        />

        {/* Standalone pages with their own Header/Footer */}
        <Route path="/login" element={<LoginPage />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/profile" element={<PageProfileIndex />} />
          <Route path="/profile/:id" element={<PageProfile />} />
          <Route path="/craftsman" element={<Crafts />} />
          <Route path="/craftsman/:slug" element={<CraftDetails />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
