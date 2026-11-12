
import { Link } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout.jsx';
import '../styles/PublicPages.css';

const sections = [
  ['information', 'Information We Collect'],
  ['usage', 'How We Use Information'],
  ['verification', 'Account and Email Verification'],
  ['sharing', 'Information Sharing'],
  ['security', 'Data Security'],
  ['retention', 'Data Retention'],
  ['rights', 'Your Privacy Rights'],
  ['cookies', 'Cookies and Technology'],
  ['children', 'Children’s Privacy'],
  ['updates', 'Policy Updates'],
  ['contact', 'Contact Us'],
];

function Privacy() {
  return (
    <PublicLayout>
      <div className="public-page">
        <header className="public-page__hero">
          <span className="public-page__eyebrow">
            Your Privacy Matters
          </span>

          <h1 className="public-page__title">
            Privacy Policy
          </h1>

          <p className="public-page__subtitle">
            Your personal information deserves care and
            respect. Learn what information GenZ Matrimony
            collects, how it is used and how it is protected.
          </p>

          <p className="public-page__updated">
            Last updated: 12 November 2026
          </p>
        </header>

        <div className="public-document">
          <aside className="public-document__toc">
            <h3>On this page</h3>

            <div>
              {sections.map(([id, label]) => (
                <a key={id} href={`#${id}`}>
                  {label}
                </a>
              ))}
            </div>
          </aside>

          <article className="public-document__content">
            <section id="information" className="public-document__section">
              <h2>1. Information We Collect</h2>

              <p>
                When you use GenZ Matrimony, we may collect
                information that you provide directly,
                information generated through your use of
                the platform and information needed to
                operate our services.
              </p>

              <p><strong>Registration information</strong></p>

              <ul>
                <li>Full name.</li>
                <li>Email address.</li>
                <li>Mobile number.</li>
                <li>Password, which is stored in hashed form rather than as plain text.</li>
              </ul>

              <p><strong>Profile information</strong></p>

              <p>
                If you create or complete a matrimonial
                profile, we may collect additional details
                that you choose to provide, such as
                photographs, personal preferences,
                educational details, professional
                information and other profile attributes.
              </p>

              <p><strong>Technical information</strong></p>

              <p>
                We may process technical information such
                as IP address, browser details, device
                information, access logs and diagnostic
                information to maintain and secure the
                platform.
              </p>
            </section>

            <section id="usage" className="public-document__section">
              <h2>2. How We Use Your Information</h2>

              <p>
                We use information for legitimate
                operational purposes, including:
              </p>

              <ul>
                <li>Creating and maintaining your account.</li>
                <li>Verifying your email address and account details.</li>
                <li>Providing matrimonial profile and matching services.</li>
                <li>Communicating important account and service updates.</li>
                <li>Responding to support requests.</li>
                <li>Preventing fraud, unauthorized access and misuse.</li>
                <li>Improving platform performance and reliability.</li>
                <li>Meeting applicable legal obligations.</li>
              </ul>
            </section>

            <section id="verification" className="public-document__section">
              <h2>3. Account and Email Verification</h2>

              <p>
                We use your registered email address to
                send account verification messages and
                other necessary account communications.
              </p>

              <p>
                Verification links contain security
                tokens designed to confirm that you
                control the registered email address.
                These tokens are subject to expiration
                and security controls.
              </p>

              <p>
                Your password is processed using a
                password-hashing mechanism to protect
                your login credentials.
              </p>
            </section>

            <section id="sharing" className="public-document__section">
              <h2>4. Information Sharing</h2>

              <p>
                We do not sell your personal information
                as a business practice. We may share or
                disclose information in limited
                circumstances, including:
              </p>

              <ul>
                <li><strong>Service providers:</strong> With providers that help us operate hosting, email delivery, security and other platform infrastructure.</li>
                <li><strong>Other members:</strong> Profile information that you choose to publish may be visible to other members according to the platform's features and privacy settings.</li>
                <li><strong>Legal requirements:</strong> Where disclosure is required by applicable law or a valid legal process.</li>
                <li><strong>Security:</strong> Where reasonably necessary to investigate fraud, abuse or threats to the platform and its members.</li>
              </ul>

              <p>
                Service providers are expected to handle
                information in accordance with their
                applicable obligations and our
                instructions.
              </p>
            </section>

            <section id="security" className="public-document__section">
              <h2>5. Data Security</h2>

              <p>
                We use reasonable technical and
                organizational measures intended to
                protect personal information from
                unauthorized access, misuse, alteration
                and disclosure.
              </p>

              <div className="public-document__callout">
                No online service can guarantee absolute
                security. You should use a strong,
                unique password and never share your
                login credentials with anyone.
              </div>
            </section>

            <section id="retention" className="public-document__section">
              <h2>6. Data Retention</h2>

              <p>
                We retain personal information for as
                long as reasonably necessary to provide
                our services, maintain account security,
                resolve disputes and comply with legal
                obligations.
              </p>

              <p>
                When information is no longer required,
                it may be deleted or anonymized in
                accordance with applicable requirements
                and our retention procedures.
              </p>
            </section>

            <section id="rights" className="public-document__section">
              <h2>7. Your Privacy Rights</h2>

              <p>
                Subject to applicable law, you may have
                rights relating to your personal
                information, including:
              </p>

              <ul>
                <li>Requesting access to your personal information.</li>
                <li>Requesting correction of inaccurate information.</li>
                <li>Requesting deletion of eligible personal information.</li>
                <li>Withdrawing consent where processing is based on consent.</li>
                <li>Raising concerns about how your information is handled.</li>
              </ul>

              <p>
                To make a privacy-related request, visit
                our <Link to="/support" className="auth-form__link">
                  Support page
                </Link>.
              </p>
            </section>

            <section id="cookies" className="public-document__section">
              <h2>8. Cookies and Similar Technologies</h2>

              <p>
                Our website may use cookies or similar
                technologies to support essential
                functionality, authentication, security
                and user experience.
              </p>

              <p>
                The specific cookies and technologies
                used depend on the features and
                infrastructure deployed on the platform.
              </p>
            </section>

            <section id="children" className="public-document__section">
              <h2>9. Children's Privacy</h2>

              <p>
                GenZ Matrimony is intended for adults
                eligible to use matrimonial services.
                We do not knowingly seek to collect
                personal information from children
                through this service.
              </p>

              <p>
                If you believe a child has provided
                personal information, please contact
                us so that we can review the matter.
              </p>
            </section>

            <section id="updates" className="public-document__section">
              <h2>10. Changes to This Privacy Policy</h2>

              <p>
                We may update this policy when our
                services, information practices or
                applicable legal requirements change.
              </p>

              <p>
                The latest version will be published
                on this page with its updated date.
              </p>
            </section>

            <section id="contact" className="public-document__section">
              <h2>11. Contact Us</h2>

              <p>
                For questions, concerns or requests
                regarding your personal information,
                please visit our{' '}
                <Link to="/support" className="auth-form__link">
                  Support page
                </Link>.
              </p>
            </section>
          </article>
        </div>
      </div>
    </PublicLayout>
  );
}

export default Privacy;
