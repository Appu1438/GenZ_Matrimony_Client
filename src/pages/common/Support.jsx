
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/layout/PublicLayout.jsx';
import '../../styles/PublicPages.css';

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL;

const faqs = [
  {
    question: 'How do I create a GenZ Matrimony account?',
    answer:
      'Visit our registration page, enter your name, email address, mobile number and password, and submit the form. You will receive an email verification link. Verify your email before logging in.',
  },
  {
    question: 'I did not receive my verification email. What should I do?',
    answer:
      'First, check your spam or junk folder. If the email is not there, return to the login page, enter your account details and use the Resend verification email option when prompted.',
  },
  {
    question: 'I cannot log in to my account.',
    answer:
      'Make sure your email or mobile number and password are correct. If you have forgotten your password, use the Forgot password option on the login page. Also make sure your email address has been verified.',
  },
  {
    question: 'How can I reset my password?',
    answer:
      'Go to the login page and select Forgot password. Follow the instructions sent to your registered email address to create a new password.',
  },
  {
    question: 'How can I update my personal information?',
    answer:
      'Once logged in, use the available account and profile management options to update information. If you cannot make a particular change, contact our support team.',
  },
  {
    question: 'How can I report a suspicious profile?',
    answer:
      'If you encounter a suspicious profile, misleading information, harassment or potentially fraudulent activity, report it through the available reporting feature or contact our support team with relevant details.',
  },
  {
    question: 'How can I request account deletion?',
    answer:
      'Contact our support team using your registered email address and request account deletion. We may need to verify your identity before processing the request.',
  },
  {
    question: 'How can I ask about my personal data?',
    answer:
      'For questions about the information we collect, store or process, contact our support team. You can also review our Privacy Policy for more details.',
  },
];

function Support() {
  return (
    <PublicLayout>
      <div className="public-page">
        <section className="support-hero">
          <header className="public-page__hero">
            <span className="public-page__eyebrow">
              We're Here to Help
            </span>

            <h1 className="public-page__title">
              How can we help you?
            </h1>

            <p className="public-page__subtitle">
              Whether you're creating an account, verifying
              your email or need help with your experience,
              we're here to guide you.
            </p>
          </header>
        </section>

        <div className="support-content">
          <div className="support-contact-grid">
            <div className="support-contact-card">
              <div className="support-contact-card__icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="14" rx="3" />
                  <path d="m3 7 9 6 9-6" />
                </svg>
              </div>

              <div>
                <h3>Email Support</h3>

                <p>
                  Have a question or need assistance?
                  Reach out to our support team.
                </p>

                {SUPPORT_EMAIL ? (
                  <a href={`mailto:${SUPPORT_EMAIL}`}>
                    {SUPPORT_EMAIL}
                  </a>
                ) : (
                  <span className="support-contact-card__pending">
                    Support email will be available soon.
                  </span>
                )}
              </div>
            </div>

            <div className="support-contact-card">
              <div className="support-contact-card__icon">
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
              </div>

              <div>
                <h3>Account Assistance</h3>

                <p>
                  Having trouble accessing your account
                  or completing verification?
                </p>

                <Link to="/login">
                  Visit login page
                </Link>
              </div>
            </div>
          </div>

          <section>
            <h2 className="support-section-heading">
              Frequently Asked Questions
            </h2>

            <div className="support-faq-list">
              {faqs.map((faq, index) => (
                <details
                  className="support-faq"
                  key={faq.question}
                >
                  <summary>
                    <span>{faq.question}</span>

                    <span className="support-faq__icon">
                      +
                    </span>
                  </summary>

                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="public-page__cta">
            <h2>Still need a helping hand?</h2>

            <p>
              We're here to help make your GenZ Matrimony
              experience smooth and comfortable.
            </p>

            {SUPPORT_EMAIL ? (
              <a href={`mailto:${SUPPORT_EMAIL}`}>
                Contact Support
              </a>
            ) : (
              <Link to="/login">
                Go to your account
              </Link>
            )}
          </section>
        </div>
      </div>
    </PublicLayout>
  );
}

export default Support;
