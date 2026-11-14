
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import AuthLayout from '../../components/layout/AuthLayout.jsx';
import AuthCard from '../../components/ui/AuthCard.jsx';
import FormField from '../../components/ui/FormField.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';

import authService from '../../services/authService.js';
import { validateIdentifier } from '../../utils/validation.js';

import './AuthForm.css';

export function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    if (status === 'submitting') return;

    setFormError('');

    const validationError = validateIdentifier(identifier);

    setError(validationError);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    setStatus('submitting');

    try {
      const response = await authService.forgotPassword(
        identifier.trim()
      );

      setStatus('sent');

      toast.success(
        response.message || 'Password reset email sent successfully!'
      );

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

  if (status === 'sent') {
    return (
      <AuthLayout>
        <AuthCard
          eyebrow="Check your inbox"
          title="Reset link sent"
          subtitle={`We've sent password reset instructions to the registered email associated with "${identifier}". Please check your inbox.`}
          footer={
            <Link to="/login" className="auth-form__link">
              Back to login
            </Link>
          }
        >
          <Button
            variant="secondary"
            onClick={() => {
              setIdentifier('');
              setStatus('idle');
              setError('');
              setFormError('');
            }}
          >
            Use a different email or number
          </Button>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        eyebrow="Forgot password"
        title="Reset your password"
        subtitle="Enter the email or mobile number registered with your account and we'll send you a reset link."
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
            label="Email or mobile number"
            error={error}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="text"
                inputMode="text"
                autoComplete="username"
                placeholder="you@example.com or 98XXXXXXXX"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);

                  if (error) setError('');
                  if (formError) setFormError('');
                }}
              />
            )}
          </FormField>

          <Button
            type="submit"
            isLoading={status === 'submitting'}
            loadingText="Sending link..."
          >
            Send reset link
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}

export default ForgotPassword;
