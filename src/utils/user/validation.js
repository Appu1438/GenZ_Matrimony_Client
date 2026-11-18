const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/; // 10-digit Indian mobile format

export function isEmail(value) {
  return EMAIL_RE.test(value.trim());
}

export function isMobile(value) {
  return MOBILE_RE.test(value.trim());
}

/** Accepts either a valid email or a valid mobile number. */
export function validateIdentifier(value) {
  if (!value?.trim()) return 'Enter your email or mobile number.';
  if (isEmail(value) || isMobile(value)) return null;
  return 'Enter a valid email address or 10-digit mobile number.';
}

export function validateEmail(value) {
  if (!value?.trim()) return 'Enter your email address.';
  if (!isEmail(value)) return 'Enter a valid email address.';
  return null;
}

export function validateMobile(value) {
  if (!value?.trim()) return 'Enter your mobile number.';
  if (!isMobile(value)) return 'Enter a valid 10-digit mobile number.';
  return null;
}

export function validateFullName(value) {
  if (!value?.trim()) return 'Enter your full name.';
  if (value.trim().length < 2) return 'Name looks too short.';
  return null;
}

export function validateLoginPassword(value) {
  if (!value) return 'Enter your password.';
  return null;
}

/** Returns { score: 0-4, label } used by the password strength indicator. */
export function getPasswordStrength(value = '') {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const labels = ['Too weak', 'Weak', 'Okay', 'Strong', 'Excellent'];
  return { score, label: labels[score] };
}

export function validateNewPassword(value) {
  if (!value) return 'Create a password.';
  if (value.length < 8) return 'Use at least 8 characters.';
  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
    return 'Mix letters and numbers for a stronger password.';
  }
  return null;
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Confirm your password.';
  if (password !== confirm) return 'Passwords don\u2019t match.';
  return null;
}

export function validateTermsAccepted(checked) {
  if (!checked) return 'Accept the Terms and Privacy Policy to continue.';
  return null;
}
