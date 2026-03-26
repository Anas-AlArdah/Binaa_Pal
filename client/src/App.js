import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PageProfile from './pages/profile/PageProfile';
import Crafts from "./pages/CraftsmanProfile/Crafts";

function App() {
  return (
    <Router>
      <Routes>

        {/* Navigation Home Page */}

        <Route path="/" element={
          <div style={{ padding: '40px', fontFamily: "'Inter', 'Cairo', sans-serif", textAlign: 'center' }}>
            <h1 style={{ color: '#5a6b35', marginBottom: '20px' }}>Binaa Pal - Navigation</h1>
            <p style={{ color: '#777', marginBottom: '30px' }}>Select a page to view:</p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <Link 
                to="/profile" 
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#5a6b35',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600'
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
                  fontWeight: '600'
                }}
              >
                Craftsman Profile Page
              </Link>
            </div>
          </div>
        } />
        
        <Route path="/profile" element={<PageProfile />}/>
        <Route path="/craftsman" element={<Crafts />}/>
      </Routes>
    </Router>
  );
}

export default App;
