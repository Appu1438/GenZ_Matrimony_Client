
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../../../components/admin/layout/AuthLayout.jsx";
import AuthCard from "../../../components/admin/ui/AuthCard.jsx";
import FormField from "../../../components/admin/ui/FormField.jsx";
import Input from "../../../components/admin/ui/Input.jsx";
import PasswordInput from "../../../components/admin/ui/PasswordInput.jsx";
import Checkbox from "../../../components/admin/ui/Checkbox.jsx";
import Button from "../../../components/admin/ui/Button.jsx";
import {
  validateIdentifier,
  validateLoginPassword,
} from "../../../utils/admin/validation.js";
import "./Login.css";
import { useAdminAuth } from "../../../hooks/admin/useAdminAuth.js";

export default function AdminLogin() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({
    identifier: "",
    password: "",
  });

  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [formError, setFormError] = useState("");

  function handleChange(field, value) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setFormError("");
  }

  function validate() {
    const nextErrors = {
      identifier: validateIdentifier(values.identifier),
      password: validateLoginPassword(values.password),
    };

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  }


  const handleSubmit = async (event) => {
    event.preventDefault();

    if (status === "submitting") return;

    setFormError("");

    if (!validate()) return;

    setStatus("submitting");

    try {
      await login({
        identifier: values.identifier.trim(),
        password: values.password,
        remember,
      });

      navigate("/admin/dashboard", { replace: true });
    } catch {
      // Error toast is already displayed by AdminAuthContext.
    } finally {
      setStatus("idle");

    }
  };


  return (
    <AuthLayout>
      <AuthCard
        eyebrow="ADMINISTRATOR ACCESS"
        title="Welcome back"
        subtitle="Sign in to Manage GenZ Matrimony."
        footer={
          <span className="admin-login__footer">
            Restricted access. Authorized administrators only.
          </span>
        }
      >
        <form
          className="auth-form admin-login-form"
          onSubmit={handleSubmit}
          noValidate
        >
          {formError && (
            <div className="auth-form__banner" role="alert">
              {formError}
            </div>
          )}

          <FormField
            label="Admin Email"
            error={errors.identifier}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="text"
                autoComplete="username"
                placeholder="Enter your admin email"
                value={values.identifier}
                onChange={(event) =>
                  handleChange("identifier", event.target.value)
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
                onChange={(event) =>
                  handleChange("password", event.target.value)
                }
              />
            )}
          </FormField>

          <div className="auth-form__row admin-login__options">
            <Checkbox
              label="Remember me"
              checked={remember}
              onChange={(event) =>
                setRemember(event.target.checked)
              }
            />
          </div>

          <Button
            type="submit"
            isLoading={status === "submitting"}
            loadingText="Signing in..."
          >
            Sign in to Admin
          </Button>

          <p className="auth-form__legal">
            This portal is intended only for authorized GenZ Matrimony
            administrators. All access may be monitored and logged.
          </p>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}
