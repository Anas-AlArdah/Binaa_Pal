import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './LoginPage.css';

const text = {
    welcomeBack: '\u0645\u0631\u062d\u0628\u0627\u064b \u0628\u0639\u0648\u062f\u062a\u0643',
    createAccount: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628 \u062c\u062f\u064a\u062f',
    adminWelcome: 'دخول الآدمن',
    loginSubtitle: '\u0633\u062c\u0651\u0644 \u062f\u062e\u0648\u0644\u0643 \u0644\u0644\u0648\u0635\u0648\u0644 \u0625\u0644\u0649 \u062d\u0633\u0627\u0628\u0643',
    registerSubtitle: '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0645\u0646\u0635\u0629 \u0628\u0646\u0651\u0627\u0621 \u0628\u0627\u0644 \u0627\u0644\u064a\u0648\u0645',
    adminSubtitle: 'سجّل دخولك لإدارة منصة Binaa Pal',
    login: '\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644',
    register: '\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628',
    admin: 'الآدمن',
    firstname: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0623\u0648\u0644',
    firstnamePlaceholder: '\u0623\u062f\u062e\u0644 \u0627\u0633\u0645\u0643 \u0627\u0644\u0623\u0648\u0644',
    lastname: '\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u062b\u0627\u0646\u064a',
    lastnamePlaceholder: '\u0623\u062f\u062e\u0644 \u0627\u0633\u0645\u0643 \u0627\u0644\u062b\u0627\u0646\u064a',
    email: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a',
    password: '\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',
    phone: '\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641',
    phonePlaceholder: '05X0000000',
    location: '\u0627\u0644\u0645\u0648\u0642\u0639',
    locationPlaceholder: '\u0645\u062b\u0627\u0644: \u0631\u0627\u0645 \u0627\u0644\u0644\u0647',
    iAm: '\u0623\u0646\u0627:',
    client: '\u0639\u0645\u064a\u0644',
    worker: '\u0639\u0627\u0645\u0644',
    noAccount: '\u0644\u064a\u0633 \u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628\u061f',
    hasAccount: '\u0644\u062f\u064a\u0643 \u062d\u0633\u0627\u0628 \u0628\u0627\u0644\u0641\u0639\u0644\u061f',
    loggingIn: '\u062c\u0627\u0631\u064a \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644...',
    registering: '\u062c\u0627\u0631\u064a \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628...',
    adminLoggingIn: 'جاري التحقق من الآدمن...',
    loginSuccess: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644 \u0628\u0646\u062c\u0627\u062d.',
    registerSuccess: '\u062a\u0645 \u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u062d\u0633\u0627\u0628 \u0628\u0646\u062c\u0627\u062d.',
    adminSuccess: 'تم تسجيل دخول الآدمن بنجاح.',
    adminSubmit: 'دخول لوحة الآدمن',
};

function LoginPage() {
    const navigate = useNavigate();
    const [formMode, setFormMode] = useState('login');
    const [userType, setUserType] = useState('client');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const isLogin = formMode === 'login';
    const isRegister = formMode === 'register';
    const isAdmin = formMode === 'admin';

    const toggleForm = (mode) => {
        setFormMode(mode);
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const persistAuth = (data) => {
        if (data?.token) {
            localStorage.setItem('binaa_auth_token', data.token);
        }

        if (data?.user) {
            localStorage.setItem('binaa_auth_user', JSON.stringify(data.user));
        }
    };

    const persistAdminAuth = (data) => {
        if (data?.token) {
            localStorage.setItem('binaa_admin_token', data.token);
        }

        if (data?.admin) {
            localStorage.setItem('binaa_admin_user', JSON.stringify(data.admin));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);
        const payload = {
            email: String(formData.get('email') || '').trim(),
            password: String(formData.get('password') || ''),
        };

        if (isRegister) {
            payload.firstname = String(formData.get('firstname') || '').trim();
            payload.lastname = String(formData.get('lastname') || '').trim();
            payload.phone = String(formData.get('phone') || '').trim();
            payload.location = String(formData.get('location') || '').trim();
            payload.userType = userType;
        }

        try {
            const endpoint = isAdmin
                ? '/api/auth/admin-login'
                : isLogin
                    ? '/api/auth/login'
                    : '/api/auth/register';

            const data = await fetchJson(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (isAdmin) {
                persistAdminAuth(data);
                setSuccess(text.adminSuccess);

                setTimeout(() => {
                    navigate('/admin');
                }, 600);

                return;
            }

            persistAuth(data);
            setSuccess(isLogin ? text.loginSuccess : text.registerSuccess);

            setTimeout(() => {
                navigate('/home');
            }, 600);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-container">
            <Header />

            <div className="login-bg-blob blob-1"></div>
            <div className="login-bg-blob blob-2"></div>
            <div className="login-bg-blob blob-3"></div>

            <div className="login-form-wrapper" dir="rtl">
                <div className="login-card">
                    <div className="brand-header">
                        <span className="brand-name">Binaa Pal</span>
                    </div>

                    <h2 className="login-title">
                        {isAdmin ? text.adminWelcome : isLogin ? text.welcomeBack : text.createAccount}
                    </h2>
                    <p className="login-subtitle">
                        {isAdmin ? text.adminSubtitle : isLogin ? text.loginSubtitle : text.registerSubtitle}
                    </p>

                    <div className="toggle-container mb-4">
                        <button
                            id="btn-toggle-login"
                            type="button"
                            className={`toggle-btn ${isLogin ? 'active' : ''}`}
                            onClick={() => toggleForm('login')}
                        >
                            {text.login}
                        </button>
                        <button
                            id="btn-toggle-register"
                            type="button"
                            className={`toggle-btn ${isRegister ? 'active' : ''}`}
                            onClick={() => toggleForm('register')}
                        >
                            {text.register}
                        </button>
                        <button
                            id="btn-toggle-admin"
                            type="button"
                            className={`toggle-btn ${isAdmin ? 'active' : ''}`}
                            onClick={() => toggleForm('admin')}
                        >
                            {text.admin}
                        </button>
                    </div>

                    {error && <div className="auth-alert auth-alert-error">{error}</div>}
                    {success && <div className="auth-alert auth-alert-success">{success}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        {isRegister && (
                            <div className="name-fields-grid">
                                <div className="form-group">
                                    <label className="form-label-custom" htmlFor="firstname">{text.firstname}</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">{'\uD83D\uDC64'}</span>
                                        <input
                                            id="firstname"
                                            name="firstname"
                                            type="text"
                                            className="form-input-custom"
                                            placeholder={text.firstnamePlaceholder}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label-custom" htmlFor="lastname">{text.lastname}</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">{'\uD83D\uDC64'}</span>
                                        <input
                                            id="lastname"
                                            name="lastname"
                                            type="text"
                                            className="form-input-custom"
                                            placeholder={text.lastnamePlaceholder}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label-custom" htmlFor="email">{text.email}</label>
                            <div className="input-wrapper">
                                <span className="input-icon">{'\u2709\uFE0F'}</span>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    className="form-input-custom"
                                    placeholder="you@example.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {isRegister && (
                            <>
                                <div className="form-group">
                                    <label className="form-label-custom" htmlFor="phone">{text.phone}</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">{'\uD83D\uDCDE'}</span>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            className="form-input-custom"
                                            placeholder={text.phonePlaceholder}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label-custom" htmlFor="location">{text.location}</label>
                                    <div className="input-wrapper">
                                        <span className="input-icon">{'\uD83D\uDCCD'}</span>
                                        <input
                                            id="location"
                                            name="location"
                                            type="text"
                                            className="form-input-custom"
                                            placeholder={text.locationPlaceholder}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-group">
                            <label className="form-label-custom" htmlFor="password">{text.password}</label>
                            <div className="input-wrapper">
                                <span className="input-icon">{'\uD83D\uDD12'}</span>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input-custom"
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label="Show or hide password"
                                    disabled={loading}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <circle cx="12" cy="12" r="3" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {isRegister && (
                            <div className="form-group">
                                <label className="form-label-custom">{text.iAm}</label>
                                <div className="user-type-toggle">
                                    <button
                                        id="btn-type-client"
                                        type="button"
                                        className={`user-type-btn ${userType === 'client' ? 'active' : ''}`}
                                        onClick={() => setUserType('client')}
                                        disabled={loading}
                                    >
                                        <span className="user-type-icon">{'\uD83D\uDC64'}</span>
                                        <span>{text.client}</span>
                                    </button>
                                    <button
                                        id="btn-type-worker"
                                        type="button"
                                        className={`user-type-btn ${userType === 'worker' ? 'active' : ''}`}
                                        onClick={() => setUserType('worker')}
                                        disabled={loading}
                                    >
                                        <span className="user-type-icon">{'\uD83D\uDEE0\uFE0F'}</span>
                                        <span>{text.worker}</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <button
                            id="btn-submit"
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading
                                ? (isAdmin ? text.adminLoggingIn : isLogin ? text.loggingIn : text.registering)
                                : (isAdmin ? text.adminSubmit : isLogin ? text.login : text.register)}
                        </button>
                    </form>

                    {!isAdmin && <p className="switch-text">
                        {isLogin ? text.noAccount : text.hasAccount}
                        <button
                            type="button"
                            className="switch-link"
                            onClick={() => toggleForm(isLogin ? 'register' : 'login')}
                            disabled={loading}
                        >
                            {isLogin ? text.register : text.login}
                        </button>
                    </p>}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default LoginPage;
