import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';

const PageProfile = lazy(() => import('./pages/profile/PageProfile'));
const PageProfileIndex = lazy(() => import('./pages/profile/PageProfileIndex'));
const Crafts = lazy(() => import('./pages/CraftsmanProfile/Crafts'));
const CraftDetails = lazy(() => import('./pages/CraftsmanProfile/CraftDetails'));
const Homepage = lazy(() => import('./pages/Home/Homepage'));
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const OrdersPage = lazy(() => import('./pages/Orders/OrdersPage'));
const MyServicesPage = lazy(() => import('./pages/MyServices/MyServicesPage'));

function PageLoader() {
  return <div className="app-page-loader" role="status" aria-label="Loading page" />;
}

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
      <Suspense fallback={<PageLoader />}>
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
            <Route path="/my-services" element={<MyServicesPage />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;




















