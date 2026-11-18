
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../../components/user/layout/AuthLayout.jsx';
import AuthCard from '../../../components/user/ui/AuthCard.jsx';
import FormField from '../../../components/user/ui/FormField.jsx';
import PasswordInput from '../../../components/user/ui/PasswordInput.jsx';
import PasswordStrength from '../../../components/user/ui/PasswordStrength.jsx';
import Button from '../../../components/user/ui/Button.jsx';

import authService from '../../../services/user/authService.js';
import {
  validateNewPassword,
  validateConfirmPassword,
} from '../../../utils/user/validation.js';

import './AuthForm.css';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const navigate = useNavigate();

  const [values, setValues] = useState({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');

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

    if (formError) {
      setFormError('');
    }
  }

  function validate() {
    const nextErrors = {
      password: validateNewPassword(values.password),
      confirmPassword: validateConfirmPassword(
        values.password,
        values.confirmPassword
      ),
    };

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (status === 'submitting') return;

    setFormError('');

    // Check reset token
    if (!token) {
      const message =
        'This password reset link is invalid. Please request a new one.';

      setFormError(message);
      toast.error(message);
      return;
    }

    // Validate form
    if (!validate()) return;

    setStatus('submitting');

    try {
      await authService.resetPassword({
        token,
        password: values.password,
      });

      setStatus('success');

      toast.success('Your password has been reset successfully!');

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';

      setStatus('error');
      setFormError(errorMessage);

      toast.error(errorMessage);

    }
  }

  if (status === 'success') {
    return (
      <AuthLayout>
        <AuthCard
          eyebrow="All set"
          title="Password reset"
          subtitle="Your password has been changed successfully. You can now log in using your new password."
        >
          <Button
            onClick={() => navigate('/login', { replace: true })}
          >
            Back to login
          </Button>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        eyebrow="Reset password"
        title="Choose a new password"
        subtitle={
          token
            ? "Make it something you haven't used before."
            : 'Your reset link is missing or invalid. Please request a new one.'
        }
        footer={
          <Link to="/login" className="auth-form__link">
            Back to login
          </Link>
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

          <FormField
            label="New password"
            error={errors.password}
            required
          >
            {(fieldProps) => (
              <>
                <PasswordInput
                  {...fieldProps}
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  value={values.password}
                  onChange={(e) =>
                    handleChange('password', e.target.value)
                  }
                />

                <PasswordStrength password={values.password} />
              </>
            )}
          </FormField>

          <FormField
            label="Confirm new password"
            error={errors.confirmPassword}
            required
          >
            {(fieldProps) => (
              <PasswordInput
                {...fieldProps}
                autoComplete="new-password"
                placeholder="Re-enter your new password"
                value={values.confirmPassword}
                onChange={(e) =>
                  handleChange('confirmPassword', e.target.value)
                }
              />
            )}
          </FormField>

          <Button
            type="submit"
            isLoading={status === 'submitting'}
            loadingText="Resetting..."
            disabled={!token || status === 'submitting'}
          >
            Reset password
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default ResetPassword;
