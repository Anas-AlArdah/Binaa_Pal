import "../header.css";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isLoggedIn = true;
    const isWorker = true;

    const closeMenu = () => setIsOpen(false);

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
                    <div className={`collapse navbar-collapse ${isOpen ? "show" : ""} ms-md-5`}>

                        {/* Center links */}
                        <ul className="navbar-nav mx-auto gap-4 ">

                            <li className="nav-item">
                                <Link
                                    to="/craftsman"
                                    className="nav-link text-white fw-bold fs-4 ms-md-5 me-md-3"
                                    onClick={closeMenu}
                                >
                                    الصنعات
                                </Link>
                            </li>

                            {isLoggedIn && isWorker && (
                                <>
                                    <li className="nav-item">
                                        <Link
                                            to="/"
                                            className="nav-link text-white fw-bold fs-4 ms-md-5 me-md-4"
                                            onClick={closeMenu}
                                        >
                                            خدماتي
                                        </Link>
                                    </li>

                                    <li className="nav-item">
                                        <Link
                                            to="/orders"
                                            className="nav-link text-white fw-bold fs-4 ms-md-5 me-md-4"
                                            onClick={closeMenu}
                                        >
                                            الطلبات
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>

                        {/* Right side */}
                        <div className="d-flex align-items-center gap-3">

                            {!isLoggedIn ? (
                                <Link to="/register" className="btn btn-outline-danger fs-5">
                                    تسجيل الدخول
                                </Link>

                            ) : (
                                <>
                                    <span className="text-white fw-bold fs-4">
                                        {isWorker ? "عامل" : "عميل"}
                                    </span>

                                    <Link to="/profile" onClick={closeMenu}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="30"
                                            height="30"
                                            fill="white"
                                            viewBox="0 0 16 16"
                                        >
                                            <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                            <path
                                                fillRule="evenodd"
                                                d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8"
                                            />
                                        </svg>
                                    </Link>

                                    <button className="btn btn-outline-danger fs-5">
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