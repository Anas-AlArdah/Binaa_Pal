import {blue} from "@mui/material/colors";
import Crafts from "../pages/CraftsmanProfile/Crafts";
import { Link } from 'react-router-dom';
function Header() {
    const isLoggedIn = false;
    const isWorker = true; // غيّرها لـ false لتشوف حساب الزبون

    return (
        <header className="header fixed-top container-fluid " dir="">
            <nav
                className="navbar navbar-expand-lg sticky-top"
                style={{
                    background: 'linear-gradient(to right, #005c97, #363795)'
                }}
            >                <div className="container-fluid ">
                <Link className="navbar-brand fw-bold fs-3" to="/home" style={{ color: '#ffffff', textDecoration: 'none' }}>
                    Bina Pall
                </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse " id="navbarSupportedContent">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0  ">
                            <li className="nav-item  ms-5">


                                <Link to="/craftsman" className="nav-link active fw-bold" style={{ textDecoration: 'none', font: '10px' }}>
                                    <button
                                        className="btn border-opacity-25 fw-bold navbar-brand"
                                        style={{ color: "white" }}
                                    >
                                        الصنعات
                                    </button>
                                </Link>
                            </li>


                            {isLoggedIn && isWorker && (
                                <>

                                    <li className="nav-item ">
                                        <a className="nav-link active fw-bold" href="/my-services">
                                            <button className="btn border-opacity-25 fw-bold navbar-brand"  style={{color:"white", textDecoration: 'none'}} >
                                                خدماتي
                                            </button>


                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link  fw-bold" href="/orders">

                                            <button className="btn border-opacity-25 fw-bold navbar-brand"  style={{color:"white", textDecoration: 'none'}} >
                                                الطلبات
                                            </button>
                                        </a>
                                    </li>

                                </>
                            )}
                        </ul>

                        {!isLoggedIn ? (
                            // غير مسجل
                            <a href="/register">
                                <button className="btn  "  style={{
                                    background: 'transparent',
                                    border: '1px solid #ff4d4d',
                                    color: '#ff4d4d',
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}

                                        onClick={() => console.log('logout')}>
                                    تسجيل الدخول
                                </button>
                            </a>

                        ) : isWorker ? (
                            // مسجل كعامل
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-bold" style={{color: 'white'}}>عامل</span>
                                <a to={isWorker ? "/profile" : "/profile"} style={{ color: '#ffffff' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                        <path fillRule="evenodd" d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                    </svg>
                                </a>


                                <button className="btn "  style={{
                                    background: 'transparent',
                                    border: '1px solid #ff4d4d',
                                    color: '#ff4d4d',
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}

                                        onClick={() => console.log('logout')}>
                                    تسجيل الخروج
                                </button>
                            </div>

                        ) : (
                            // مسجل كزبون
                            <div className="d-flex align-items-center gap-3">
                                <span className="text- fw-bold" style={{color:"white"}}>عميل</span>
                                <a href="/profile" className=" fw-bold" >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                         className="bi bi-person-circle"style={{color: '#484b57'}} viewBox="0 0 16 16">
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                        <path fillRule="evenodd"
                                              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                    </svg>

                                </a>

                                <button className="btn  "  style={{
                                    background: 'transparent',
                                    border: '1px solid #ff4d4d',
                                    color: '#ff4d4d',
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}

                                        onClick={() => console.log('logout')}>
                                    تسجيل الخروج
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </nav>
        </header>
    )
}
export default Header;