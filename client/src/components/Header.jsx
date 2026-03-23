function Header() {
    const isLoggedIn = true;
    const isWorker = true; // غيّرها لـ false لتشوف حساب الزبون

    return (
        <header className="header fixed-top " dir="">
            <nav className="navbar navbar-expand-lg sticky-top" style={{backgroundColor: '#eef8f8'}}>
                <div className="container-fluid">
                    <a className="navbar-brand fw-bold" href="/" style={{color: '#556B2F'}}>Bina Pall</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                            data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <a className="nav-link active fw-bold" href="/">
                                    <button className="btn btn-request-olive">
                                        الصنعات
                                    </button>
                                </a>
                            </li>

                            {/* روابط إضافية للعامل */}
                            {isLoggedIn && isWorker && (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link active fw-bold" href="/my-services">
                                            <button className="btn btn-request-olive">
                                                خدماتي
                                            </button>


                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link  fw-bold" href="/orders">

                                            <button className="btn btn-request-olive">
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
                                <button className="btn btn-danger "
                                        onClick={() => console.log('logout')}>
                                    تسجيل الدخول
                                </button>
                            </a>

                        ) : isWorker ? (
                            // مسجل كعامل
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-bold" style={{color: '#0d0e15'}}>عامل</span>
                                <a href="/worker-profile" className="text-success fw-bold">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                         className="bi bi-person-circle"style={{color: '#484b57'}} viewBox="0 0 16 16">
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                        <path fillRule="evenodd"
                                              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                    </svg>
                                </a>

                                <button className="btn btn-outline-danger"
                                        onClick={() => console.log('logout')}>
                                    تسجيل الخروج
                                </button>
                            </div>

                        ) : (
                            // مسجل كزبون
                            <div className="d-flex align-items-center gap-3">
                                <span className="text- fw-bold">عميل</span>
                                <a href="/profile" className=" fw-bold" >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor"
                                         className="bi bi-person-circle"style={{color: '#484b57'}} viewBox="0 0 16 16">
                                        <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                                        <path fillRule="evenodd"
                                              d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"/>
                                    </svg>

                                </a>

                                <button className="btn btn-outline-danger"
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