                  import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import PageProfile from "./pages/profile/PageProfile";
import Crafts from "./pages/CraftsmanProfile/Crafts";
import CraftDetails from "./pages/CraftsmanProfile/CraftDetails";
// استيراد صفحة الهوم بيج
import Homepage from "./pages/Home/Homepage";

function App() {
    return (
        <Router>
            <Routes>
                {/* صفحة التنقل الرئيسية (Navigation) */}
                <Route
                    path="/"
                    element={
                        <div
                            style={{
                                padding: "40px",
                                fontFamily: "'Inter', 'Cairo', sans-serif",
                                textAlign: "center",
                            }}
                        >
                            <h1 style={{ color: "#5a6b35", marginBottom: "20px" }}>
                                Binaa Pal - Navigation
                            </h1>

                            <p style={{ color: "#777", marginBottom: "30px" }}>
                                Select a page to view:
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: "20px",
                                    justifyContent: "center",
                                    flexWrap: "wrap"
                                }}
                            >
                                {/* الزر الجديد لصفحة الـ Homepage */}
                                <Link
                                    to="/home"
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#2c3e50", // لون مميز للهوم بيج
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Homepage
                                </Link>

                                <Link
                                    to="/profile"
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#5a6b35",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Worker Profile Page
                                </Link>

                                <Link
                                    to="/craftsman"
                                    style={{
                                        padding: "12px 24px",
                                        backgroundColor: "#4a5a2b",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                    }}
                                >
                                    Craftsman Profile Page
                                </Link>
                            </div>
                        </div>
                    }
                />

                {/* تعريف المسارات الفعلية للصفحات */}
                <Route path="/home" element={<Homepage />} />
                <Route path="/profile" element={<PageProfile />} />
                <Route path="/craftsman" element={<Crafts />} />
                <Route path="/craftsman/:slug" element={<CraftDetails />} />
            </Routes>
        </Router>
    );
}

export default App;