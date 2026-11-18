import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../../components/user/layout/AuthLayout.jsx';
import AuthCard from '../../../components/user/ui/AuthCard.jsx';
import FormField from '../../../components/user/ui/FormField.jsx';
import Input from '../../../components/user/ui/Input.jsx';
import PasswordInput from '../../../components/user/ui/PasswordInput.jsx';
import PasswordStrength from '../../../components/user/ui/PasswordStrength.jsx';
import Checkbox from '../../../components/user/ui/Checkbox.jsx';
import Button from '../../../components/user/ui/Button.jsx';
import Divider from '../../../components/user/ui/Divider.jsx';
import GoogleButton from '../../../components/user/ui/GoogleButton.jsx';
import useAuth from '../../../hooks/user/useAuth.js';
import {
  validateFullName,
  validateEmail,
  validateMobile,
  validateNewPassword,
  validateConfirmPassword,
  validateTermsAccepted,
} from '../../../utils/user/validation.js';
import './AuthForm.css';
import toast from "react-hot-toast";

const initialValues = { fullName: '', email: '', mobile: '', password: '', confirmPassword: '' };

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [values, setValues] = useState(initialValues);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');

  function handleChange(field, value) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  }

  function validate() {
    const nextErrors = {
      fullName: validateFullName(values.fullName),
      email: validateEmail(values.email),
      mobile: validateMobile(values.mobile),
      password: validateNewPassword(values.password),
      confirmPassword: validateConfirmPassword(values.password, values.confirmPassword),
      terms: validateTermsAccepted(termsAccepted),
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }


  async function handleSubmit(e) {
    e.preventDefault();

    if (status === "submitting") return;

    setFormError("");

    if (!validate()) return;

    setStatus("submitting");

    try {
      const response = await register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        mobile: values.mobile.trim(),
        password: values.password,
      });

      toast.success(
        response.message || "Account created successfully!"
      );

      navigate("/login", { replace: true });

    } catch (err) {
      console.error("Registration error:", err.response?.data || err);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";

      toast.error(errorMessage);

    } finally {
      setStatus("idle");
    }
  }


  return (
    <AuthLayout>
      <AuthCard
        eyebrow="Join GenZ Matrimony"
        title="Create your account"
        subtitle="A few details to get your profile started."
        footer={
          <>
            Already have an account?{' '}
            <Link to="/login" className="auth-form__link">
              Log in
            </Link>
          </>
        }
      >
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="auth-form__banner" role="alert">
              {formError}
            </div>
          )}

          <FormField label="Full name" error={errors.fullName} required>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="text"
                autoComplete="name"
                placeholder="Your full name"
                value={values.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
              />
            )}
          </FormField>

          <FormField label="Email" error={errors.email} required>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            )}
          </FormField>

          <FormField label="Mobile number" error={errors.mobile} required>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="98XXXXXXXX"
                value={values.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
              />
            )}
          </FormField>

          <FormField label="Password" error={errors.password} required>
            {(fieldProps) => (
              <>
                <PasswordInput
                  {...fieldProps}
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={values.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
                <PasswordStrength password={values.password} />
              </>
            )}
          </FormField>

          <FormField label="Confirm password" error={errors.confirmPassword} required>
            {(fieldProps) => (
              <PasswordInput
                {...fieldProps}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={values.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
              />
            )}
          </FormField>

          <Checkbox
            className="auth-form__terms"
            label={
              <>
                I agree to the <a href="/terms-and-conditions">Terms of Service</a> and{' '}
                <a href="/privacy-policy">Privacy Policy</a>.
              </>
            }
            checked={termsAccepted}
            onChange={(e) => {
              setTermsAccepted(e.target.checked);
              if (errors.terms) setErrors((prev) => ({ ...prev, terms: null }));
            }}
            error={errors.terms}
          />

          <Button type="submit" isLoading={status === 'submitting'} loadingText="Creating account…">
            Create account
          </Button>
          {/* 
          <Divider />

          <GoogleButton onClick={() => setFormError('Google sign-up will be available once the backend is connected.')}>
            Sign up with Google
          </GoogleButton> */}
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default Register;
