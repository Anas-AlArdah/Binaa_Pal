import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import PageProfile from './pages/profile/PageProfile';
import PageProfileIndex from './pages/profile/PageProfileIndex';
import Crafts from './pages/CraftsmanProfile/Crafts';
import CraftDetails from './pages/CraftsmanProfile/CraftDetails';
import Homepage from './pages/Home/Homepage';
import LoginPage from './pages/Login/LoginPage';
import AdminPage from './pages/Admin/AdminPage';
import OrdersPage from './pages/Orders/OrdersPage';
import ScrollToTop from './components/ScrollToTop';

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
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Standalone pages with their own Header/Footer */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />

        <Route element={<AppLayout />}>
          <Route path="/home" element={<Homepage />} />
          <Route path="/profile" element={<PageProfileIndex />} />
          <Route path="/profile/:id" element={<PageProfile />} />
          <Route path="/craftsman" element={<Crafts />} />
          <Route path="/craftsman/:slug" element={<CraftDetails />} />
          <Route path="/orders" element={<OrdersPage />} />


        </Route>
      </Routes>
    </Router>
  );
}

export default App;




















