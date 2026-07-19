import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiBriefcase,
    FiCheckCircle,
    FiArrowRight,
    FiEye,
    FiEyeOff,
    FiLock,
    FiMail,
    FiMapPin,
    FiPhone,
    FiPlus,
    FiRefreshCw,
    FiShield,
    FiTool,
    FiTrendingUp,
    FiUser,
} from 'react-icons/fi';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PALESTINE_CITIES } from '../../data/palestineCities';
import { fetchJson, getApiErrorMessage } from '../../utils/api';
import './LoginPage.css';

const EXPERIENCE_MAX = 60;
const GOOGLE_CLIENT_ID_FALLBACK = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

const text = {
    welcomeBack: 'مرحبا بعودتك',
    createAccount: 'إنشاء حساب جديد',
    loginSubtitle: 'سجل دخولك للوصول إلى حسابك',
    registerSubtitle: 'انضم إلى منصة بنّاء بال اليوم',
    completeWorkerAccount: 'أكمل إنشاء حساب العامل',
    completeWorkerSubtitle: 'حساب Google موثّق، بقيت بيانات العمل فقط.',
    completeClientAccount: 'أكمل إنشاء حساب العميل',
    completeClientSubtitle: 'حساب Google موثّق، بقيت بياناتك الأساسية فقط.',
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
    locationPlaceholder: 'اختر المدينة',
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
    emailDivider: 'أو أكمل بالبريد الإلكتروني',
    googleLoading: 'جاري المتابعة عبر Google...',
    googleVerified: 'تم توثيق حساب Google',
    googleWorkerVerifiedHint: 'أكمل بيانات العامل ثم أنشئ الحساب.',
    googleClientVerifiedHint: 'أكمل بيانات العميل ثم أنشئ الحساب.',
    googlePassword: 'لا تحتاج كلمة مرور مع Google',
    changeGoogleAccount: 'تغيير الحساب',
    verifyEmailTitle: 'تحقق من بريدك الإلكتروني',
    verifyEmailSubtitle: 'أرسلنا رمزاً من 6 أرقام لإكمال إنشاء الحساب.',
    verificationCode: 'رمز التحقق',
    verifyEmail: 'تأكيد البريد وإنشاء الحساب',
    verifyingEmail: 'جاري التحقق...',
    resendCode: 'إرسال رمز جديد',
    backToLogin: 'العودة إلى تسجيل الدخول',
    phoneInvalid: 'رقم الجوال يجب أن يكون محليا مثل 0591234567 بدون +970.',
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
    const [googleClientId, setGoogleClientId] = useState(GOOGLE_CLIENT_ID_FALLBACK);
    const [googleRegistration, setGoogleRegistration] = useState(null);
    const [emailVerification, setEmailVerification] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formValues, setFormValues] = useState(initialFormValues);
    const isLogin = formMode === 'login';
    const isRegister = formMode === 'register';
    const isWorkerRegister = isRegister && userType === 'worker';
    const isGoogleRegistration = isRegister && Boolean(googleRegistration);
    const isVerificationStep = Boolean(emailVerification);
    const isBusy = loading || googleLoading || resendLoading;

    const secondarySkills = useMemo(
        () => skills.filter((skill) => String(skill.id) !== String(formValues.primarySkillId)),
        [skills, formValues.primarySkillId]
    );

    useEffect(() => {
        googleContextRef.current = {
            formValues,
            isRegister,
            userType,
        };
    }, [formValues, isRegister, userType]);

    useEffect(() => {
        let isMounted = true;

        fetchJson('/api/auth/config')
            .then((config) => {
                if (isMounted && config?.googleClientId) {
                    setGoogleClientId(config.googleClientId);
                }
            })
            .catch(() => {
                // The build-time value remains a fallback when the API is temporarily unavailable.
            });

        return () => {
            isMounted = false;
        };
    }, []);

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
        setGoogleRegistration(null);
        setEmailVerification(null);
        setVerificationCode('');
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
        setGoogleRegistration(null);

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
        const payload = {
            credential,
            registerIntent: Boolean(context.isRegister),
            userType: context.userType,
        };

        if (!context.isRegister && currentValues.password) {
            payload.linkPassword = currentValues.password;
        }

        return payload;
    }, []);

    const handleGoogleCredential = useCallback(async (response) => {
        const context = googleContextRef.current || {};

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

            if (data?.onboardingRequired) {
                const googleProfile = data.googleProfile || {};

                setGoogleRegistration({
                    credential: response.credential,
                    email: googleProfile.email || '',
                });
                setFormValues((currentValues) => ({
                    ...currentValues,
                    firstname: googleProfile.firstname || currentValues.firstname,
                    lastname: googleProfile.lastname || currentValues.lastname,
                    email: googleProfile.email || currentValues.email,
                    password: '',
                }));
                setSuccess('');

                window.requestAnimationFrame(() => {
                    const firstFieldId = context.userType === 'worker' ? 'primarySkillId' : 'firstname';

                    document.getElementById(firstFieldId)?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                    });
                });
                return;
            }

            persistAuth(data);
            setSuccess(context.isRegister ? text.registerSuccess : text.loginSuccess);

            const workerProfileId = data?.user?.worker_profile?.id;
            const destination = data?.needsProfileSetup && workerProfileId
                ? `/profile/${workerProfileId}`
                : '/home';

            setTimeout(() => navigate(destination), 600);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setGoogleLoading(false);
        }
    }, [buildGooglePayload, navigate, persistAuth]);

    const clearGoogleRegistration = () => {
        setGoogleRegistration(null);
        setError('');
        setSuccess('');
        setFormValues((currentValues) => ({
            ...currentValues,
            firstname: '',
            lastname: '',
            email: '',
            password: '',
        }));
        window.google?.accounts?.id?.disableAutoSelect?.();
    };

    useEffect(() => {
        if (!googleClientId || isGoogleRegistration || isVerificationStep) {
            setGoogleReady(false);
            return undefined;
        }

        let isMounted = true;

        const renderGoogleButton = () => {
            if (!isMounted || !window.google?.accounts?.id || !googleButtonRef.current) {
                return;
            }

            window.google.accounts.id.initialize({
                client_id: googleClientId,
                callback: handleGoogleCredential,
                auto_select: false,
                ux_mode: 'popup',
            });

            googleButtonRef.current.innerHTML = '';
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                locale: 'ar',
                shape: 'pill',
                size: 'large',
                text: isRegister ? 'signup_with' : 'signin_with',
                theme: 'outline',
                width: Math.min(420, googleButtonRef.current.offsetWidth || 420),
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
    }, [googleClientId, handleGoogleCredential, isGoogleRegistration, isRegister, isVerificationStep]);

    const handleVerificationCodeChange = (event) => {
        setVerificationCode(toWesternDigits(event.target.value).replace(/\D/g, '').slice(0, 6));
    };

    const handleVerifyEmail = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await fetchJson('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailVerification.email,
                    code: verificationCode,
                }),
            });

            persistAuth(data);
            setSuccess(data.message || text.registerSuccess);
            setTimeout(() => navigate('/home'), 600);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await fetchJson('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailVerification.email }),
            });

            setVerificationCode('');
            setSuccess(data.message);
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setResendLoading(false);
        }
    };

    const returnToLogin = () => {
        const email = emailVerification?.email || '';

        setEmailVerification(null);
        setVerificationCode('');
        setError('');
        setSuccess('');
        setFormMode('login');
        setFormValues({ ...initialFormValues, email });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

        const payload = isGoogleRegistration
            ? {
                credential: googleRegistration.credential,
                registerIntent: true,
                completeRegistration: true,
                userType,
            }
            : {
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
            const endpoint = isLogin
                ? '/api/auth/login'
                : (isGoogleRegistration ? '/api/auth/google' : '/api/auth/register');

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

            if (data?.requiresEmailVerification) {
                setEmailVerification({
                    email: payload.email,
                    maskedEmail: data.email || payload.email,
                });
                setVerificationCode('');
                setSuccess(data.message);
                return;
            }

            persistAuth(data);
            setSuccess(isLogin ? text.loginSuccess : text.registerSuccess);

            setTimeout(() => {
                navigate('/home');
            }, 600);
        } catch (err) {
            if (err?.payload?.requiresEmailVerification) {
                setEmailVerification({
                    email: formValues.email.trim(),
                    maskedEmail: err.payload.email || formValues.email.trim(),
                });
                setVerificationCode('');
            }

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
                                {isVerificationStep
                                    ? text.verifyEmailTitle
                                    : isGoogleRegistration
                                    ? (userType === 'worker' ? text.completeWorkerAccount : text.completeClientAccount)
                                    : (isLogin ? text.welcomeBack : text.createAccount)}
                            </h2>
                            <p className="login-subtitle">
                                {isVerificationStep
                                    ? text.verifyEmailSubtitle
                                    : isGoogleRegistration
                                    ? (userType === 'worker' ? text.completeWorkerSubtitle : text.completeClientSubtitle)
                                    : (isLogin ? text.loginSubtitle : text.registerSubtitle)}
                            </p>

                            {!isVerificationStep && <div className="toggle-container">
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
                            </div>}

                            {error && <div className="auth-alert auth-alert-error">{error}</div>}
                            {success && <div className="auth-alert auth-alert-success">{success}</div>}

                            {isGoogleRegistration && (
                                <div className="google-registration-status" role="status">
                                    <span className="google-registration-status__icon">
                                        <FiCheckCircle />
                                    </span>
                                    <span className="google-registration-status__content">
                                        <strong>{text.googleVerified}</strong>
                                        <span>{googleRegistration.email}</span>
                                        <small>
                                            {userType === 'worker'
                                                ? text.googleWorkerVerifiedHint
                                                : text.googleClientVerifiedHint}
                                        </small>
                                    </span>
                                    <button
                                        type="button"
                                        className="google-registration-status__change"
                                        onClick={clearGoogleRegistration}
                                        disabled={isBusy}
                                    >
                                        {text.changeGoogleAccount}
                                    </button>
                                </div>
                            )}

                            {isVerificationStep ? (
                                <form
                                    onSubmit={handleVerifyEmail}
                                    className="login-form verification-form"
                                    autoComplete="off"
                                >
                                    <div className="verification-summary">
                                        <span className="verification-summary__icon"><FiShield /></span>
                                        <span>
                                            أرسلنا الرمز إلى
                                            <strong dir="ltr">{emailVerification.maskedEmail}</strong>
                                        </span>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label-custom" htmlFor="verificationCode">
                                            {text.verificationCode}
                                        </label>
                                        <input
                                            id="verificationCode"
                                            name="verificationCode"
                                            type="text"
                                            className="form-input-custom verification-code-input"
                                            value={verificationCode}
                                            onChange={handleVerificationCodeChange}
                                            placeholder="000000"
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            pattern="[0-9]{6}"
                                            maxLength="6"
                                            required
                                            autoFocus
                                            disabled={isBusy}
                                        />
                                    </div>

                                    <button
                                        id="btn-verify-email"
                                        type="submit"
                                        className="submit-btn"
                                        disabled={isBusy || verificationCode.length !== 6}
                                    >
                                        <FiCheckCircle />
                                        {loading ? text.verifyingEmail : text.verifyEmail}
                                    </button>

                                    <div className="verification-actions">
                                        <button
                                            type="button"
                                            className="verification-action-btn"
                                            onClick={handleResendVerification}
                                            disabled={isBusy}
                                        >
                                            <FiRefreshCw />
                                            {resendLoading ? 'جاري الإرسال...' : text.resendCode}
                                        </button>
                                        <button
                                            type="button"
                                            className="verification-action-btn"
                                            onClick={returnToLogin}
                                            disabled={isBusy}
                                        >
                                            <FiArrowRight />
                                            {text.backToLogin}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                            <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
                                {isRegister && (
                                    <div className="form-group">
                                        <label className="form-label-custom">{text.iAm}</label>
                                        <div className="user-type-toggle">
                                            <button
                                                id="btn-type-client"
                                                type="button"
                                                className={`user-type-btn ${userType === 'client' ? 'active' : ''}`}
                                                onClick={() => handleUserTypeChange('client')}
                                                disabled={isBusy || isGoogleRegistration}
                                            >
                                                <span className="user-type-icon"><FiUser /></span>
                                                <span>{text.client}</span>
                                            </button>
                                            <button
                                                id="btn-type-worker"
                                                type="button"
                                                className={`user-type-btn ${userType === 'worker' ? 'active' : ''}`}
                                                onClick={() => handleUserTypeChange('worker')}
                                                disabled={isBusy || isGoogleRegistration}
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

                                {isRegister && (
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

                                <div className="form-group">
                                        <label className="form-label-custom" htmlFor="email">{text.email}</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon"><FiMail /></span>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                className={`form-input-custom ${isGoogleRegistration ? 'google-verified-input' : ''}`}
                                                placeholder="you@example.com"
                                                value={formValues.email}
                                                onChange={handleInputChange}
                                                autoComplete="email"
                                                required
                                                disabled={isBusy || isGoogleRegistration}
                                            />
                                        </div>
                                </div>

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
                                                <select
                                                    id="location"
                                                    name="location"
                                                    className="form-input-custom"
                                                    value={formValues.location}
                                                    onChange={handleInputChange}
                                                    required
                                                    disabled={isBusy}
                                                >
                                                    <option value="" disabled>{text.locationPlaceholder}</option>
                                                    {PALESTINE_CITIES.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                        <label className="form-label-custom" htmlFor="password">{text.password}</label>
                                        <div className="input-wrapper">
                                            <span className="input-icon"><FiLock /></span>
                                            <input
                                                id="password"
                                                name="password"
                                                type={isGoogleRegistration ? 'text' : (showPassword ? 'text' : 'password')}
                                                className={`form-input-custom ${isGoogleRegistration ? 'google-verified-input' : ''}`}
                                                placeholder={isGoogleRegistration ? text.googlePassword : '••••••••'}
                                                value={isGoogleRegistration ? text.googlePassword : formValues.password}
                                                onChange={handleInputChange}
                                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                                required={!isGoogleRegistration}
                                                minLength="6"
                                                disabled={isBusy || isGoogleRegistration}
                                            />
                                            {!isGoogleRegistration && (
                                                <button
                                                    type="button"
                                                    className="toggle-password"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                                                    disabled={isBusy}
                                                >
                                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                                </button>
                                            )}
                                        </div>
                                </div>

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

                                {googleClientId && !isGoogleRegistration && (
                                    <div className="google-auth-block">
                                        <div className="google-divider">
                                            <span>أو تابع باستخدام Google</span>
                                        </div>
                                        <div
                                            ref={googleButtonRef}
                                            className={`google-button-slot ${googleReady ? 'is-ready' : ''}`}
                                            aria-busy={!googleReady || googleLoading}
                                        />
                                        {googleLoading && (
                                            <span className="google-inline-status">{text.googleLoading}</span>
                                        )}
                                    </div>
                                )}
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
                                </>
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

