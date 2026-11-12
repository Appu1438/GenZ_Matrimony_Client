
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layout/AuthLayout.jsx';
import AuthCard from '../components/ui/AuthCard.jsx';
import FormField from '../components/ui/FormField.jsx';
import Input from '../components/ui/Input.jsx';
import PasswordInput from '../components/ui/PasswordInput.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import Button from '../components/ui/Button.jsx';
import useAuth from '../hooks/useAuth.js';
import {
  validateIdentifier,
  validateLoginPassword,
} from '../utils/validation.js';
import './AuthForm.css';
import toast from 'react-hot-toast';
import { resendVerificationEmail } from '../services/authService';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    identifier: '',
    password: '',
  });

  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');

  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (location.state?.emailVerified) {
      toast.success('Email verified successfully! You can now log in.');
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  function handleChange(field, value) {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }

    if (field === 'identifier') {
      setUnverifiedEmail('');
      setFormError('');
    }
  }

  function validate() {
    const nextErrors = {
      identifier: validateIdentifier(values.identifier),
      password: validateLoginPassword(values.password),
    };

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (status === 'submitting') return;

    setFormError('');
    setUnverifiedEmail('');

    if (!validate()) return;

    setStatus('submitting');

    try {
      await login({
        identifier: values.identifier.trim(),
        password: values.password,
        remember,
      });

      const redirectTo = location.state?.from || '/app';

      navigate(redirectTo, {
        replace: true,
      });

    } catch (err) {
      const responseData = err.response?.data;

      if (responseData?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(
          responseData.data?.email || values.identifier.trim()
        );
        setFormError(
          "Your email is not verified. Please verify your email to continue."
        );
      } else {
        setFormError(
          responseData?.message ||
          err.message ||
          'Something went wrong. Please try again.'
        );
      }

    } finally {
      setStatus('idle');
    }
  }

  async function handleResendVerification() {
    if (!unverifiedEmail || resending) return;

    setResending(true);

    try {
      const response = await resendVerificationEmail(unverifiedEmail);

      toast.success(
        response.message || 'Verification email sent successfully!'
      );

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        'Unable to send verification email. Please try again.'
      );

    } finally {
      setResending(false);
      setUnverifiedEmail(
        null
      );
      setFormError(
        ""
      );
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        eyebrow="Welcome back"
        title="Log in to your account"
        subtitle="Pick up right where you left off."
        footer={
          <>
            New to GenZ Matrimony?{' '}
            <Link to="/register" className="auth-form__link">
              Create an account
            </Link>
          </>
        }
      >
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError && (
            <div className="auth-form__banner" role="alert">
              {formError}
            </div>
          )}


          {/* Email Verification Notice */}
          {unverifiedEmail && (
            <section
              className="auth-verification"
              aria-live="polite"
              aria-label="Email verification required"
            >
              <div className="auth-verification__header">
                <div className="auth-verification__icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                    />
                    <path d="m3 7 9 6 9-6" />
                    <path d="m16 16 2 2 4-4" />
                  </svg>
                </div>

                <div className="auth-verification__heading">
                  <h3>Verify your email address</h3>
                  <span>One more step to access your account</span>
                </div>
              </div>

              <p className="auth-verification__description">
                Your email address hasn't been verified yet.
                Please verify your email to continue using
                GenZ Matrimony.
              </p>

              <div className="auth-verification__email">
                <div className="auth-verification__email-label">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="3"
                    />
                    <path d="m3 7 9 6 9-6" />
                  </svg>

                  <span>Registered email address</span>
                </div>

                <strong>{unverifiedEmail}</strong>
              </div>

              <button
                type="button"
                className="auth-verification__button"
                onClick={handleResendVerification}
                disabled={resending}
              >
                {resending ? (
                  <>
                    <span className="auth-verification__spinner" />
                    Sending verification link...
                  </>
                ) : (
                  <>
                    Resend verification email

                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M7 17 17 7" />
                      <path d="M7 7h10v10" />
                    </svg>
                  </>
                )}
              </button>

              <p className="auth-verification__hint">
                Didn't receive the email? Check your spam
                or junk folder as well.
              </p>
            </section>
          )}

          <FormField
            label="Email or mobile number"
            error={errors.identifier}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="you@example.com or 98XXXXXXXX"
                value={values.identifier}
                onChange={(e) =>
                  handleChange('identifier', e.target.value)
                }
              />
            )}
          </FormField>

          <FormField
            label="Password"
            error={errors.password}
            required
          >
            {(fieldProps) => (
              <PasswordInput
                {...fieldProps}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={values.password}
                onChange={(e) =>
                  handleChange('password', e.target.value)
                }
              />
            )}
          </FormField>

          <div className="auth-form__row">
            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />

            <Link
              to="/forgot-password"
              className="auth-form__link auth-form__link--muted"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            isLoading={status === 'submitting'}
            loadingText="Logging in…"
          >
            Log in
          </Button>

          <p className="auth-form__legal">
            By continuing, you agree to GenZ Matrimony&rsquo;s{' '}
            <a href="/terms-and-conditions">Terms of Service</a> and{' '}
            <a href="/privacy-policy">Privacy Policy</a>.
          </p>
        </form>

      </AuthCard>
    </AuthLayout>
  );
}

export default Login;
