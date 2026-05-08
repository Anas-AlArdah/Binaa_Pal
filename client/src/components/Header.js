import "../header.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Header() {
    const [isOpen, setIsOpen] = useState(false);

    // 👇 جلب المستخدم من localStorage
    const user = JSON.parse(localStorage.getItem("binaa_auth_user"));
console.log("data from local",user);
    const isLoggedIn = !!user;
    const isWorker = user?.role?.type === "worker";

    const closeMenu = () => setIsOpen(false);

    const handleLogout = () => {
        localStorage.removeItem("binaa_auth_user");
        localStorage.removeItem("binaa_auth_token");
        window.location.href = "/login";
    };

    return (
        <header className="header fixed-top">
            <nav
                className="navbar navbar-expand-lg"
                style={{
                    background: "linear-gradient(to right, #005c97, #363795)"
                }}
            >
                <div className="container-fluid">

                    {/* Logo */}
                    <Link className="navbar-brand fw-bold fs-3 text-white" to="/home">
                        Binaa Pal
                    </Link>

                    {/* Toggle */}
                    <button
                        className="navbar-toggler"
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Menu */}
                    <div className={`collapse navbar-collapse   ${isOpen ? "show" : ""} ms-md-5`}>

                        <ul className="navbar-nav mx-auto gap-3 gap-md-5 ">

                            <li className="nav-item ms-md-5">
                                <Link to="/craftsman" className="nav-link text-white fw-bold fs-4" onClick={closeMenu}>
                                    الصنعات
                                </Link>
                            </li>

                            {isLoggedIn && isWorker && (
                                <>
                                    <li className="nav-item ms-md-5">
                                        <Link to="/" className="nav-link text-white fw-bold fs-4" onClick={closeMenu}>
                                            خدماتي
                                        </Link>
                                    </li>

                                    <li className="nav-item ms-md-5">
                                        <Link to="/orders" className="nav-link text-white fw-bold fs-4" onClick={closeMenu}>
                                            الطلبات
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>

                        {/* Right side */}
                        <div className="d-flex align-items-center gap-4">

                            {!isLoggedIn ? (
                                <Link to="/login" className="btn btn-outline-danger fs-5">
                                    تسجيل الدخول
                                </Link>
                            ) : (
                                <>
                                    <span className="text-white fw-bold fs-4">
                                       {user?.firstname} {user?.lastname}
                                    </span>

                                    {/* 👇 رابط البروفايل الحقيقي */}
                                    <Link to={isWorker ? `/profile/${user.worker_profile?.id}` : `/profile/${user.id}`} onClick={closeMenu}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none">
                                            <defs>
                                                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
                                                    <stop offset="100%" stopColor="#a8d8ea" stopOpacity="1"/>
                                                </linearGradient>
                                            </defs>
                                            <circle cx="12" cy="12" r="11" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
                                            <circle cx="12" cy="9" r="3.5" fill="url(#grad)"/>
                                            <path d="M5.5 19.5c0-3.5 3-6 6.5-6s6.5 2.5 6.5 6" stroke="url(#grad)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                        </svg>
                                    </Link>

                                    <button
                                        className="btn btn-outline-danger fs-5"
                                        onClick={handleLogout}
                                    >
                                        تسجيل الخروج
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;