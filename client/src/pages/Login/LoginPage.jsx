import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './LoginPage.css';

const EXPERIENCE_MAX = 60;

const text = {
    welcomeBack: 'مرحباً بعودتك',
    createAccount: 'إنشاء حساب جديد',
    adminWelcome: 'دخول الأدمن',
    loginSubtitle: 'سجّل دخولك للوصول إلى حسابك',
    registerSubtitle: 'انضم إلى منصة بنّاء بال اليوم',
    adminSubtitle: 'سجّل دخولك لإدارة منصة Binaa Pal',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    admin: 'الأدمن',
    firstname: 'الاسم الأول',
    firstnamePlaceholder: 'أدخل اسمك الأول',
    lastname: 'الاسم الثاني',
    lastnamePlaceholder: 'أدخل اسمك الثاني',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    phone: 'رقم الهاتف',
    phonePlaceholder: '05X0000000',
    location: 'الموقع',
    locationPlaceholder: 'مثال: رام الله',
    iAm: 'أنا:',
    client: 'عميل',
    worker: 'عامل',
    primaryCraft: 'الصنعة الأساسية',
    primaryCraftPlaceholder: 'اختر الصنعة',
    secondaryCraft: 'صنعة ثانية (اختياري)',
    secondaryCraftPlaceholder: 'بدون صنعة ثانية',
    primaryExperience: 'سنوات الخبرة في الصنعة الأساسية',
    secondaryExperience: 'سنوات الخبرة في الصنعة الثانية',
    experiencePlaceholder: 'مثال: 5',
    craftsLoading: 'جاري تحميل الصنعات...',
    craftsLoadError: 'تعذر تحميل الصنعات.',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    loggingIn: 'جاري تسجيل الدخول...',
    registering: 'جاري إنشاء الحساب...',
    adminLoggingIn: 'جاري التحقق من الأدمن...',
    loginSuccess: 'تم تسجيل الدخول بنجاح.',
    registerSuccess: 'تم إنشاء الحساب بنجاح.',
    adminSuccess: 'تم تسجيل دخول الأدمن بنجاح.',
    adminSubmit: 'دخول لوحة الأدمن',
};

const initialFormValues = {
    email: '',
    password: '',
    firstname: '',
    lastname: '',
    phone: '',
    location: '',
    primarySkillId: '',
    primaryExperienceYears: '',
    secondarySkillId: '',
    secondaryExperienceYears: '',
};

function LoginPage() {
    const navigate = useNavigate();
    const [formMode, setFormMode] = useState('login');
    const [userType, setUserType] = useState('client');
    const [showPassword, setShowPassword] = useState(false);
    const [skills, setSkills] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formValues, setFormValues] = useState(initialFormValues);
    const isLogin = formMode === 'login';
    const isRegister = formMode === 'register';
    const isAdmin = formMode === 'admin';
    const isWorkerRegister = isRegister && userType === 'worker';

    const secondarySkills = useMemo(
        () => skills.filter((skill) => String(skill.id) !== String(formValues.primarySkillId)),
        [skills, formValues.primarySkillId]
    );

    useEffect(() => {
        if (!isWorkerRegister || skills.length > 0) {
            return undefined;
        }

        let isMounted = true;
        setSkillsLoading(true);

        fetchJson('/api/skills')
            .then((data) => {
                if (isMounted) {
                    setSkills(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(getApiErrorMessage(err, text.craftsLoadError));
                }
            })
            .finally(() => {
                if (isMounted) {
                    setSkillsLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [isWorkerRegister, skills.length]);

    const resetFormValues = () => {
        setFormValues(initialFormValues);
        setShowPassword(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormValues((currentValues) => {
            const nextValues = {
                ...currentValues,
                [name]: value,
            };

            if (name === 'primarySkillId' && !value) {
                nextValues.primaryExperienceYears = '';
                nextValues.secondarySkillId = '';
                nextValues.secondaryExperienceYears = '';
            }

            if (name === 'primarySkillId' && currentValues.secondarySkillId === value) {
                nextValues.secondarySkillId = '';
                nextValues.secondaryExperienceYears = '';
            }

            if (name === 'secondarySkillId' && !value) {
                nextValues.secondaryExperienceYears = '';
            }

            return nextValues;
        });
    };

    const handleUserTypeChange = (type) => {
        setUserType(type);

        if (type !== 'worker') {
            setFormValues((currentValues) => ({
                ...currentValues,
                primarySkillId: '',
                primaryExperienceYears: '',
                secondarySkillId: '',
                secondaryExperienceYears: '',
            }));
        }
    };

    const toggleForm = (mode) => {
        setFormMode(mode);
        setError('');
        setSuccess('');
        resetFormValues();
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

        const payload = {
            email: formValues.email.trim(),
            password: formValues.password,
        };

        if (isRegister) {
            payload.firstname = formValues.firstname.trim();
            payload.lastname = formValues.lastname.trim();
            payload.phone = formValues.phone.trim();
            payload.location = formValues.location.trim();
            payload.userType = userType;

            if (userType === 'worker') {
                payload.primarySkillId = Number(formValues.primarySkillId);
                payload.primaryExperienceYears = Number(formValues.primaryExperienceYears);

                if (formValues.secondarySkillId) {
                    payload.secondarySkillId = Number(formValues.secondarySkillId);
                    payload.secondaryExperienceYears = Number(formValues.secondaryExperienceYears);
                }
            }
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

            <main className="login-auth-area" dir="rtl">
                <section className="login-shell">
                    <aside className="login-visual-panel">
                        <div className="login-visual-mark">
                            <span>Binaa Pal</span>
                            <strong>بنّاء بال</strong>
                        </div>
                    </aside>

                    <div className="login-form-wrapper">
                        <div className={`login-card ${isAdmin ? 'login-card--admin' : ''}`}>
                            <div className="brand-header">
                                <span className="brand-name">Binaa Pal</span>
                            </div>

                            <h2 className="login-title">
                                {isAdmin ? text.adminWelcome : isLogin ? text.welcomeBack : text.createAccount}
                            </h2>
                            <p className="login-subtitle">
                                {isAdmin ? text.adminSubtitle : isLogin ? text.loginSubtitle : text.registerSubtitle}
                            </p>

                            <div className="toggle-container">
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

                            <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
                                {isRegister && (
                                    <div className="form-group">
                                        <label className="form-label-custom">{text.iAm}</label>
                                        <div className="user-type-toggle">
                                            <button
                                                id="btn-type-client"
                                                type="button"
                                                className={`user-type-btn ${userType === 'client' ? 'active' : ''}`}
                                                onClick={() => handleUserTypeChange('client')}
                                                disabled={loading}
                                            >
                                                <span className="user-type-icon">👤</span>
                                                <span>{text.client}</span>
                                            </button>
                                            <button
                                                id="btn-type-worker"
                                                type="button"
                                                className={`user-type-btn ${userType === 'worker' ? 'active' : ''}`}
                                                onClick={() => handleUserTypeChange('worker')}
                                                disabled={loading}
                                            >
                                                <span className="user-type-icon">🛠️</span>
                                                <span>{text.worker}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isWorkerRegister && (
                                    <div className="worker-craft-fields">
                                        <div className="craft-pair">
                                            <div className="form-group">
                                                <label className="form-label-custom" htmlFor="primarySkillId">{text.primaryCraft}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon">🛠️</span>
                                                    <select
                                                        id="primarySkillId"
                                                        name="primarySkillId"
                                                        className="form-input-custom"
                                                        value={formValues.primarySkillId}
                                                        onChange={handleInputChange}
                                                        required
                                                        disabled={loading || skillsLoading}
                                                    >
                                                        <option value="">
                                                            {skillsLoading ? text.craftsLoading : text.primaryCraftPlaceholder}
                                                        </option>
                                                        {skills.map((skill) => (
                                                            <option key={skill.id} value={skill.id}>
                                                                {skill.skill_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label-custom" htmlFor="primaryExperienceYears">{text.primaryExperience}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon">↗</span>
                                                    <input
                                                        id="primaryExperienceYears"
                                                        name="primaryExperienceYears"
                                                        type="number"
                                                        className="form-input-custom"
                                                        placeholder={text.experiencePlaceholder}
                                                        value={formValues.primaryExperienceYears}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        max={EXPERIENCE_MAX}
                                                        inputMode="numeric"
                                                        required={Boolean(formValues.primarySkillId)}
                                                        disabled={loading || !formValues.primarySkillId}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="craft-pair">
                                            <div className="form-group">
                                                <label className="form-label-custom" htmlFor="secondarySkillId">{text.secondaryCraft}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon">+</span>
                                                    <select
                                                        id="secondarySkillId"
                                                        name="secondarySkillId"
                                                        className="form-input-custom"
                                                        value={formValues.secondarySkillId}
                                                        onChange={handleInputChange}
                                                        disabled={loading || skillsLoading || !formValues.primarySkillId}
                                                    >
                                                        <option value="">{text.secondaryCraftPlaceholder}</option>
                                                        {secondarySkills.map((skill) => (
                                                            <option key={skill.id} value={skill.id}>
                                                                {skill.skill_name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <label className="form-label-custom" htmlFor="secondaryExperienceYears">{text.secondaryExperience}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon">↗</span>
                                                    <input
                                                        id="secondaryExperienceYears"
                                                        name="secondaryExperienceYears"
                                                        type="number"
                                                        className="form-input-custom"
                                                        placeholder={text.experiencePlaceholder}
                                                        value={formValues.secondaryExperienceYears}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        max={EXPERIENCE_MAX}
                                                        inputMode="numeric"
                                                        required={Boolean(formValues.secondarySkillId)}
                                                        disabled={loading || !formValues.secondarySkillId}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isRegister && (
                                    <div className="name-fields-grid">
                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="firstname">{text.firstname}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon">👤</span>
                                                <input
                                                    id="firstname"
                                                    name="firstname"
                                                    type="text"
                                                    className="form-input-custom"
                                                    placeholder={text.firstnamePlaceholder}
                                                    value={formValues.firstname}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="lastname">{text.lastname}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon">👤</span>
                                                <input
                                                    id="lastname"
                                                    name="lastname"
                                                    type="text"
                                                    className="form-input-custom"
                                                    placeholder={text.lastnamePlaceholder}
                                                    value={formValues.lastname}
                                                    onChange={handleInputChange}
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
                                        <span className="input-icon">✉️</span>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            className="form-input-custom"
                                            placeholder={isAdmin ? 'admin@example.com' : 'you@example.com'}
                                            value={formValues.email}
                                            onChange={handleInputChange}
                                            autoComplete="email"
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
                                                <span className="input-icon">☎</span>
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    className="form-input-custom"
                                                    placeholder={text.phonePlaceholder}
                                                    value={formValues.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="location">{text.location}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon">📍</span>
                                                <input
                                                    id="location"
                                                    name="location"
                                                    type="text"
                                                    className="form-input-custom"
                                                    placeholder={text.locationPlaceholder}
                                                    value={formValues.location}
                                                    onChange={handleInputChange}
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
                                        <span className="input-icon">🔒</span>
                                        <input
                                            id="password"
                                            name="password"
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-input-custom"
                                            placeholder="••••••••"
                                            value={formValues.password}
                                            onChange={handleInputChange}
                                            autoComplete={isLogin || isAdmin ? 'current-password' : 'new-password'}
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

                            {!isAdmin && (
                                <p className="switch-text">
                                    {isLogin ? text.noAccount : text.hasAccount}
                                    <button
                                        type="button"
                                        className="switch-link"
                                        onClick={() => toggleForm(isLogin ? 'register' : 'login')}
                                        disabled={loading}
                                    >
                                        {isLogin ? text.register : text.login}
                                    </button>
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default LoginPage;
