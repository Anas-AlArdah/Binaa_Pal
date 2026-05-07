import React, { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './LoginPage.css';

function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('client');
    const [showPassword, setShowPassword] = useState(false);

    const toggleForm = (mode) => {
        setIsLogin(mode === 'login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(isLogin ? 'Logging in...' : 'Registering...', userType);
    };

    return (
        <div className="login-page-container">
            <Header />

            {/* Animated background blobs */}
            <div className="login-bg-blob blob-1"></div>
            <div className="login-bg-blob blob-2"></div>
            <div className="login-bg-blob blob-3"></div>

            <div className="login-form-wrapper" dir="rtl">
                <div className="login-card">

                    {/* Logo / Brand */}
                    <div className="brand-header">
                        <span className="brand-name">Binaa Pal</span>
                    </div>

                    <h2 className="login-title">
                        {isLogin ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
                    </h2>
                    <p className="login-subtitle">
                        {isLogin
                            ? 'سجّل دخولك للوصول إلى حسابك'
                            : 'انضم إلى منصة بنّاء بال اليوم'}
                    </p>

                    {/* Toggle Sign In / Sign Up */}
                    <div className="toggle-container mb-4">
                        <button
                            id="btn-toggle-login"
                            className={`toggle-btn ${isLogin ? 'active' : ''}`}
                            onClick={() => toggleForm('login')}
                        >
                            تسجيل الدخول
                        </button>
                        <button
                            id="btn-toggle-register"
                            className={`toggle-btn ${!isLogin ? 'active' : ''}`}
                            onClick={() => toggleForm('register')}
                        >
                            إنشاء حساب
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="login-form">
                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label-custom">الاسم الكامل</label>
                                <div className="input-wrapper">
                                    <span className="input-icon">👤</span>
                                    <input
                                        id="full-name"
                                        type="text"
                                        className="form-input-custom"
                                        placeholder="أدخل اسمك الكامل"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label-custom">البريد الإلكتروني</label>
                            <div className="input-wrapper">
                                <span className="input-icon">✉️</span>
                                <input
                                    id="email"
                                    type="email"
                                    className="form-input-custom"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label-custom">كلمة المرور</label>
                            <div className="input-wrapper">
                                <span className="input-icon">🔒</span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input-custom"
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="إظهار / إخفاء كلمة المرور"
                                >
                                    {showPassword ? (
                                        /* Eye — password visible, click to hide */
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    ) : (
                                        /* Eye with slash — password hidden, click to show */
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                            <circle cx="12" cy="12" r="3"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>



                        {!isLogin && (
                            <div className="form-group">
                                <label className="form-label-custom">أنا:</label>
                                <div className="user-type-toggle">
                                    <button
                                        id="btn-type-client"
                                        type="button"
                                        className={`user-type-btn ${userType === 'client' ? 'active' : ''}`}
                                        onClick={() => setUserType('client')}
                                    >
                                        <span className="user-type-icon">👤</span>
                                        <span>عميل</span>
                                    </button>
                                    <button
                                        id="btn-type-worker"
                                        type="button"
                                        className={`user-type-btn ${userType === 'worker' ? 'active' : ''}`}
                                        onClick={() => setUserType('worker')}
                                    >
                                        <span className="user-type-icon">🛠️</span>
                                        <span>عامل</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            id="btn-submit"
                            type="submit"
                            className="submit-btn"
                        >
                            {isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
                        </button>
                    </form>


                    {/* Bottom switch */}
                    <p className="switch-text">
                        {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
                        <button
                            className="switch-link"
                            onClick={() => toggleForm(isLogin ? 'register' : 'login')}
                        >
                            {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
                        </button>
                    </p>

                </div>
            </div>

            <Footer />
        </div>
    );
}

export default LoginPage;
