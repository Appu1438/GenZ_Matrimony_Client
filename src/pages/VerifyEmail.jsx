
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import AuthLayout from '../components/layout/AuthLayout.jsx';
import AuthCard from '../components/ui/AuthCard.jsx';
import Button from '../components/ui/Button.jsx';

import { verifyEmail } from '../services/authService';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState(
        'Please wait while we verify your email address.'
    );

    const verifiedToken = useRef(null);
    const verificationRequest = useRef(null);


    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage(
                'Your verification link is missing its security token. Please check the link in your email.'
            );
            return;
        }

        setStatus('loading');

        // Reuse the same request during React Strict Mode.
        if (
            !verificationRequest.current ||
            verificationRequest.current.token !== token
        ) {
            verificationRequest.current = {
                token,
                promise: Promise.resolve().then(() => verifyEmail(token)),
            };
        }

        let active = true;
        let redirectTimer;

        verificationRequest.current.promise
            .then((response) => {
                if (!active) return;

                setStatus('success');
                setMessage(
                    response.message ||
                    'Your email address has been successfully verified.'
                );

                redirectTimer = setTimeout(() => {
                    if (active) {
                        navigate('/login', {
                            replace: true,
                            state: { emailVerified: true },
                        });
                    }
                }, 3000);
            })
            .catch((error) => {
                if (!active) return;

                setStatus('error');
                setMessage(
                    error.response?.data?.message ||
                    error.message ||
                    'Your verification link may have expired or is no longer valid.'
                );
            });

        return () => {
            active = false;
            clearTimeout(redirectTimer);
        };
    }, [token, navigate]);


    function handleContinue() {
        navigate('/login', {
            replace: true,
            state: status === 'success'
                ? { emailVerified: true }
                : undefined,
        });
    }

    const content = {
        loading: {
            eyebrow: 'EMAIL VERIFICATION',
            title: 'Verifying your email',
            subtitle: 'Just a moment. We are confirming your email address.',
        },
        success: {
            eyebrow: 'VERIFICATION COMPLETE',
            title: 'Email verified!',
            subtitle: 'Your email address has been successfully verified.',
        },
        error: {
            eyebrow: 'VERIFICATION ISSUE',
            title: 'Verification unsuccessful',
            subtitle: 'We could not complete your email verification.',
        },
    };

    return (
        <AuthLayout>
            <AuthCard
                eyebrow={content[status].eyebrow}
                title={content[status].title}
                subtitle={content[status].subtitle}
                footer={
                    <>
                        Need help accessing your account?{' '}
                        <Link to="/login" className="auth-form__link">
                            Back to login
                        </Link>
                    </>
                }
            >
                <div
                    className={`verify-status verify-status--${status}`}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {/* Status Icon */}
                    <div className="verify-status__icon">
                        {status === 'loading' && (
                            <span className="verify-status__spinner" />
                        )}

                        {status === 'success' && (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m5 12 4 4L19 6" />
                            </svg>
                        )}

                        {status === 'error' && (
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="M12 9v4" />
                                <path d="M12 17h.01" />
                                <circle cx="12" cy="12" r="9" />
                            </svg>
                        )}
                    </div>

                    {/* Status Message */}
                    <p className="verify-status__message">
                        {message}
                    </p>

                    {/* Loading State */}
                    {status === 'loading' && (
                        <div className="verify-status__info">
                            <span className="verify-status__loading-dot" />
                            <span>Checking your verification link...</span>
                        </div>
                    )}

                    {/* Success State */}
                    {status === 'success' && (
                        <>
                            <div className="verify-status__success-note">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>

                                <span>
                                    Your account is now ready for login.
                                </span>
                            </div>

                            <div className="verify-status__redirect">
                                Redirecting you to login in a few seconds...
                            </div>

                            <Button
                                type="button"
                                onClick={handleContinue}
                            >
                                Continue to login
                            </Button>
                        </>
                    )}

                    {/* Error State */}
                    {status === 'error' && (
                        <>
                            <div className="verify-status__error-note">
                                <svg
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M12 9v4" />
                                    <path d="M12 17h.01" />
                                    <circle cx="12" cy="12" r="9" />
                                </svg>

                                <span>
                                    If your link has expired, please contact support
                                    or request a new verification email.
                                </span>
                            </div>

                            <Button
                                type="button"
                                onClick={handleContinue}
                            >
                                Back to login
                            </Button>
                        </>
                    )}
                </div>
            </AuthCard>
        </AuthLayout>
    );
};

export default VerifyEmail;
