import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBriefcase,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiPlus,
    FiTool,
    FiTrendingUp,
    FiUser,
} from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './LoginPage.css';

const EXPERIENCE_MAX = 60;
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const text = {
    welcomeBack: 'مرحبا بعودتك',
    createAccount: 'إنشاء حساب جديد',
    loginSubtitle: 'سجل دخولك للوصول إلى حسابك',
    registerSubtitle: 'انضم إلى منصة بنّاء بال اليوم',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    firstname: 'الاسم الأول',
    firstnamePlaceholder: 'أدخل اسمك الأول',
    lastname: 'الاسم الثاني',
    lastnamePlaceholder: 'أدخل اسمك الثاني',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    phone: 'رقم الجوال',
    phonePlaceholder: '0591234567',
    location: 'الموقع',
    locationPlaceholder: 'مثال: رام الله',
    iAm: 'أنا:',
    client: 'عميل',
    worker: 'عامل',
    primaryCraft: 'الصنعة الأساسية',
    primaryCraftPlaceholder: 'اختر الصنعة',
    secondaryCraft: 'صنعة ثانية (اختياري)',
    secondaryCraftPlaceholder: 'بدون صنعة ثانية',
    primaryExperience: 'سنوات الخبرة',
    secondaryExperience: 'سنوات الخبرة',
    experiencePlaceholder: 'مثال: 5',
    craftsLoading: 'جاري تحميل الصنعات...',
    craftsLoadError: 'تعذر تحميل الصنعات.',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    loggingIn: 'جاري تسجيل الدخول...',
    registering: 'جاري إنشاء الحساب...',
    loginSuccess: 'تم تسجيل الدخول بنجاح.',
    registerSuccess: 'تم إنشاء الحساب بنجاح.',
    adminSuccess: 'تم تسجيل دخول الأدمن بنجاح.',
    googleDivider: 'أو عبر Google',
    googleUnavailable: 'فعّل Google Client ID حتى يظهر زر الدخول عبر Google.',
    googleLoading: 'جاري المتابعة عبر Google...',
    phoneInvalid: 'رقم الجوال يجب أن يكون محليا مثل 0591234567 بدون +970.',
    googleRegisterMissing: 'لإنشاء حساب عبر Google أدخل رقم الجوال والموقع أولا.',
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

const toWesternDigits = (value) => String(value || '').replace(/[٠-٩۰-۹]/g, (digit) => {
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicIndex = arabicDigits.indexOf(digit);

    return String(arabicIndex >= 0 ? arabicIndex : persianDigits.indexOf(digit));
});

const normalizePhoneInput = (value) => toWesternDigits(value).replace(/\D/g, '').slice(0, 10);

const isValidLocalPhone = (value) => /^05\d{8}$/.test(value);

function LoginPage() {
    const navigate = useNavigate();
    const googleButtonRef = useRef(null);
    const googleContextRef = useRef(null);
    const [formMode, setFormMode] = useState('login');
    const [userType, setUserType] = useState('client');
    const [showPassword, setShowPassword] = useState(false);
    const [skills, setSkills] = useState([]);
    const [skillsLoading, setSkillsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formValues, setFormValues] = useState(initialFormValues);
    const isLogin = formMode === 'login';
    const isRegister = formMode === 'register';
    const isAdmin = false;
    const isWorkerRegister = isRegister && userType === 'worker';
    const isBusy = loading || googleLoading;
    const googleSignupOnly = isRegister && Boolean(GOOGLE_CLIENT_ID);

    const secondarySkills = useMemo(
        () => skills.filter((skill) => String(skill.id) !== String(formValues.primarySkillId)),
        [skills, formValues.primarySkillId]
    );

    useEffect(() => {
        googleContextRef.current = {
            formMode,
            formValues,
            isRegister,
            userType,
        };
    }, [formMode, formValues, isRegister, userType]);

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
        const normalizedValue = name === 'phone' ? normalizePhoneInput(value) : value;

        setFormValues((currentValues) => {
            const nextValues = {
                ...currentValues,
                [name]: normalizedValue,
            };

            if (name === 'primarySkillId' && !normalizedValue) {
                nextValues.primaryExperienceYears = '';
                nextValues.secondarySkillId = '';
                nextValues.secondaryExperienceYears = '';
            }

            if (name === 'primarySkillId' && currentValues.secondarySkillId === normalizedValue) {
                nextValues.secondarySkillId = '';
                nextValues.secondaryExperienceYears = '';
            }

            if (name === 'secondarySkillId' && !normalizedValue) {
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

    const persistAuth = useCallback((data) => {
        if (data?.token) {
            localStorage.setItem('binaa_auth_token', data.token);
        }

        if (data?.user) {
            localStorage.setItem('binaa_auth_user', JSON.stringify(data.user));
        }
    }, []);

    const persistAdminAuth = useCallback((data) => {
        if (data?.token) {
            localStorage.setItem('binaa_admin_token', data.token);
        }

        if (data?.admin) {
            localStorage.setItem('binaa_admin_user', JSON.stringify(data.admin));
        }
    }, []);

    const buildGooglePayload = useCallback((credential) => {
        const context = googleContextRef.current || {};
        const currentValues = context.formValues || initialFormValues;
        const submittedPhone = normalizePhoneInput(currentValues.phone);
        const payload = {
            credential,
            registerIntent: Boolean(context.isRegister),
        };

        if (context.isRegister) {
            if (!submittedPhone || !currentValues.location.trim()) {
                throw new Error(text.googleRegisterMissing);
            }

            if (!isValidLocalPhone(submittedPhone)) {
                throw new Error(text.phoneInvalid);
            }

            payload.userType = context.userType;
            payload.phone = submittedPhone;
            payload.location = currentValues.location.trim();

            if (!currentValues.password || currentValues.password.length < 6) {
                throw new Error('كلمة المرور مطلوبة ويجب أن تكون 6 أحرف على الأقل.');
            }
            payload.password = currentValues.password;

            if (context.userType === 'worker') {
                if (!currentValues.primarySkillId || currentValues.primaryExperienceYears === '') {
                    throw new Error('الصنعة الأساسية وخبرتها مطلوبة للعامل.');
                }

                payload.primarySkillId = Number(currentValues.primarySkillId);
                payload.primaryExperienceYears = Number(currentValues.primaryExperienceYears);

                if (currentValues.secondarySkillId) {
                    if (currentValues.secondaryExperienceYears === '') {
                        throw new Error('خبرة الصنعة الثانية مطلوبة عند اختيار صنعة ثانية.');
                    }

                    payload.secondarySkillId = Number(currentValues.secondarySkillId);
                    payload.secondaryExperienceYears = Number(currentValues.secondaryExperienceYears);
                }
            }
        }

        return payload;
    }, []);

    const handleGoogleCredential = useCallback(async (response) => {
        const context = googleContextRef.current || {};

        if (context.isAdmin) {
            setError('Google مخصص لحسابات العملاء والعمال فقط.');
            return;
        }

        setError('');
        setSuccess('');

        try {
            if (!response?.credential) {
                throw new Error('تعذر استلام بيانات Google.');
            }

            const payload = buildGooglePayload(response.credential);
            setGoogleLoading(true);

            const data = await fetchJson('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            persistAuth(data);
            setSuccess(context.isRegister ? text.registerSuccess : text.loginSuccess);

            setTimeout(() => {
                navigate('/home');
            }, 600);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setGoogleLoading(false);
        }
    }, [buildGooglePayload, navigate, persistAuth]);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID || isAdmin) {
            setGoogleReady(false);
            return undefined;
        }

        let isMounted = true;

        const renderGoogleButton = () => {
            if (!isMounted || !window.google?.accounts?.id || !googleButtonRef.current) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleCredential,
            });

            googleButtonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                locale: 'ar',
                shape: 'rectangular',
                size: 'large',
                text: isRegister ? 'signup_with' : 'signin_with',
                theme: 'outline',
                width: Math.min(360, googleButtonRef.current.offsetWidth || 360),
            });
            setGoogleReady(true);
        };

        if (window.google?.accounts?.id) {
            renderGoogleButton();
            return () => {
                isMounted = false;
            };
        }

        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');

        if (existingScript) {
            existingScript.addEventListener('load', renderGoogleButton, { once: true });

            return () => {
                isMounted = false;
                existingScript.removeEventListener('load', renderGoogleButton);
            };
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = renderGoogleButton;
        document.head.appendChild(script);

        return () => {
            isMounted = false;
            script.onload = null;
        };
    }, [handleGoogleCredential, isAdmin, isRegister]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const submittedPhone = normalizePhoneInput(formValues.phone);

        if (isRegister && !isValidLocalPhone(submittedPhone)) {
            setError(text.phoneInvalid);
            setLoading(false);
            return;
        }

        const payload = {
            email: formValues.email.trim(),
            password: formValues.password,
        };

        if (isRegister) {
            payload.firstname = formValues.firstname.trim();
            payload.lastname = formValues.lastname.trim();
            payload.phone = submittedPhone;
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
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

            const data = await fetchJson(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (data?.admin) {
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
                        <div className="login-card">
                            <div className="brand-header">
                                <span className="brand-name">Binaa Pal</span>
                            </div>

                            <h2 className="login-title">
                                {isLogin ? text.welcomeBack : text.createAccount}
                            </h2>
                            <p className="login-subtitle">
                                {isLogin ? text.loginSubtitle : text.registerSubtitle}
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
                                                disabled={isBusy}
                                            >
                                                <span className="user-type-icon"><FiUser /></span>
                                                <span>{text.client}</span>
                                            </button>
                                            <button
                                                id="btn-type-worker"
                                                type="button"
                                                className={`user-type-btn ${userType === 'worker' ? 'active' : ''}`}
                                                onClick={() => handleUserTypeChange('worker')}
                                                disabled={isBusy}
                                            >
                                                <span className="user-type-icon"><FiBriefcase /></span>
                                                <span>{text.worker}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {isWorkerRegister && (
                                    <div className="worker-craft-fields">
                                        <div className="craft-pair">
                                            <div className="form-group craft-field">
                                                <label className="form-label-custom" htmlFor="primarySkillId">{text.primaryCraft}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon"><FiTool /></span>
                                                    <select
                                                        id="primarySkillId"
                                                        name="primarySkillId"
                                                        className="form-input-custom"
                                                        value={formValues.primarySkillId}
                                                        onChange={handleInputChange}
                                                        required
                                                        disabled={isBusy || skillsLoading}
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

                                            <div className="form-group experience-field">
                                                <label className="form-label-custom" htmlFor="primaryExperienceYears">{text.primaryExperience}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon"><FiTrendingUp /></span>
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
                                                        disabled={isBusy || !formValues.primarySkillId}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="craft-pair">
                                            <div className="form-group craft-field">
                                                <label className="form-label-custom" htmlFor="secondarySkillId">{text.secondaryCraft}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon"><FiPlus /></span>
                                                    <select
                                                        id="secondarySkillId"
                                                        name="secondarySkillId"
                                                        className="form-input-custom"
                                                        value={formValues.secondarySkillId}
                                                        onChange={handleInputChange}
                                                        disabled={isBusy || skillsLoading || !formValues.primarySkillId}
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

                                            <div className="form-group experience-field">
                                                <label className="form-label-custom" htmlFor="secondaryExperienceYears">{text.secondaryExperience}</label>
                                                <div className="input-wrapper">
                                                    <span className="input-icon"><FiTrendingUp /></span>
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
                                                        disabled={isBusy || !formValues.secondarySkillId}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isRegister && !googleSignupOnly && (
                                    <div className="name-fields-grid">
                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="firstname">{text.firstname}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><FiUser /></span>
                                                <input
                                                    id="firstname"
                                                    name="firstname"
                                                    type="text"
                                                    className="form-input-custom"
                                                    placeholder={text.firstnamePlaceholder}
                                                    value={formValues.firstname}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={isBusy}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="lastname">{text.lastname}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><FiUser /></span>
                                                <input
                                                    id="lastname"
                                                    name="lastname"
                                                    type="text"
                                                    className="form-input-custom"
                                                    placeholder={text.lastnamePlaceholder}
                                                    value={formValues.lastname}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={isBusy}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!googleSignupOnly && (
                                    <div className="form-group">
                                        <label className="form-label-custom" htmlFor="email">{text.email}</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon"><FiMail /></span>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className="form-input-custom"
                                                placeholder="you@example.com"
                                                value={formValues.email}
                                                onChange={handleInputChange}
                                                autoComplete="email"
                                                required
                                                disabled={isBusy}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isRegister && (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="phone">{text.phone}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><FiPhone /></span>
                                                <input
                                                    id="phone"
                                                    name="phone"
                                                    type="tel"
                                                    className="form-input-custom"
                                                    placeholder={text.phonePlaceholder}
                                                    value={formValues.phone}
                                                    onChange={handleInputChange}
                                                    inputMode="numeric"
                                                    maxLength="10"
                                                    pattern="05[0-9]{8}"
                                                    title={text.phoneInvalid}
                                                    required
                                                    disabled={isBusy}
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label-custom" htmlFor="location">{text.location}</label>
                                            <div className="input-wrapper">
                                                <span className="input-icon"><FiMapPin /></span>
                                                <input
                                                    id="location"
                                                    name="location"
                                                    type="text"
                                                    className="form-input-custom"
                                                    placeholder={text.locationPlaceholder}
                                                    value={formValues.location}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={isBusy}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {(!googleSignupOnly || isRegister) && (
                                    <div className="form-group">
                                        <label className="form-label-custom" htmlFor="password">{text.password}</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon"><FiLock /></span>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                className="form-input-custom"
                                                placeholder="••••••••"
                                                value={formValues.password}
                                                onChange={handleInputChange}
                                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                                required
                                                minLength="6"
                                                disabled={isBusy}
                                            />
                                            <button
                                                type="button"
                                                className="toggle-password"
                                                onClick={() => setShowPassword(!showPassword)}
                                                aria-label="Show or hide password"
                                                disabled={isBusy}
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
                                )}

                                {!googleSignupOnly && (
                                    <button
                                        id="btn-submit"
                                        type="submit"
                                        className="submit-btn"
                                        disabled={isBusy}
                                    >
                                        {loading
                                            ? (isLogin ? text.loggingIn : text.registering)
                                            : (isLogin ? text.login : text.register)}
                                    </button>
                                )}

                                <div className="google-auth-block">
                                    <div className="google-divider">
                                        <span>{googleSignupOnly ? 'أكمل التسجيل عبر Google' : text.googleDivider}</span>
                                    </div>

                                    {GOOGLE_CLIENT_ID ? (
                                        <>
                                            <div
                                                ref={googleButtonRef}
                                                className={`google-button-slot ${googleReady ? 'is-ready' : ''}`}
                                                aria-busy={!googleReady || googleLoading}
                                            />
                                            {googleLoading && (
                                                <span className="google-inline-status">{text.googleLoading}</span>
                                            )}
                                        </>
                                    ) : (
                                        <p className="google-config-note">{text.googleUnavailable}</p>
                                    )}
                                </div>
                            </form>

                            <p className="switch-text">
                                {isLogin ? text.noAccount : text.hasAccount}
                                <button
                                    type="button"
                                    className="switch-link"
                                    onClick={() => toggleForm(isLogin ? 'register' : 'login')}
                                    disabled={isBusy}
                                >
                                    {isLogin ? text.register : text.login}
                                </button>
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default LoginPage;

