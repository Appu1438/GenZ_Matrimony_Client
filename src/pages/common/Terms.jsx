
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/user/layout/PublicLayout.jsx';
import '../../styles/user/PublicPages.css';

const sections = [
  ['acceptance', 'Acceptance of Terms'],
  ['eligibility', 'Eligibility'],
  ['account', 'Your Account'],
  ['profiles', 'Profiles and Information'],
  ['conduct', 'User Responsibilities'],
  ['safety', 'Safety and Interactions'],
  ['content', 'User Content'],
  ['services', 'Platform Services'],
  ['termination', 'Suspension and Termination'],
  ['disclaimer', 'Disclaimer and Liability'],
  ['changes', 'Changes to Terms'],
  ['contact', 'Contact Us'],
];

function Terms() {
  return (
    <PublicLayout>
      <div className="public-page">
        <header className="public-page__hero">
          <span className="public-page__eyebrow">
            Legal Information
          </span>

          <h1 className="public-page__title">
            Terms & Conditions
          </h1>

          <p className="public-page__subtitle">
            Good connections begin with mutual respect and
            transparency. Here are the terms that guide your
            experience with GenZ Matrimony.
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
            <section
              id="acceptance"
              className="public-document__section"
            >
              <h2>1. Acceptance of Terms</h2>

              <p>
                Welcome to GenZ Matrimony. These Terms &
                Conditions govern your access to and use of
                the GenZ Matrimony website, applications and
                related services.
              </p>

              <p>
                By creating an account, accessing or using
                our platform, you agree to these terms and
                our Privacy Policy. If you do not agree,
                please discontinue using the service.
              </p>
            </section>

            <section id="eligibility" className="public-document__section">
              <h2>2. Eligibility</h2>

              <p>
                GenZ Matrimony is intended for adults who
                are legally eligible to use matrimonial
                services under applicable laws.
              </p>

              <ul>
                <li>You must provide accurate information about yourself.</li>
                <li>You must have the legal capacity to agree to these terms.</li>
                <li>You must not use the platform if prohibited by applicable law.</li>
                <li>You must not create an account by impersonating another person.</li>
              </ul>
            </section>

            <section id="account" className="public-document__section">
              <h2>3. Your Account</h2>

              <p>
                You are responsible for maintaining the
                confidentiality of your login credentials
                and for activities carried out through
                your account.
              </p>

              <p>
                You agree to provide a valid email address
                and mobile number during registration and
                complete email verification when requested.
              </p>

              <p>
                Please notify us promptly if you believe
                your account has been accessed without
                your permission.
              </p>
            </section>

            <section id="profiles" className="public-document__section">
              <h2>4. Profiles and Information</h2>

              <p>
                The quality of a matrimonial platform
                depends on the accuracy and authenticity
                of its profiles. You agree to provide
                truthful, current and relevant information.
              </p>

              <ul>
                <li>Do not create fake or misleading profiles.</li>
                <li>Do not provide another person's personal information without appropriate permission.</li>
                <li>Do not misrepresent your identity, marital status or intentions.</li>
                <li>Update your profile when important information changes.</li>
              </ul>

              <p>
                We may review, restrict or remove profiles
                that violate our policies or applicable laws.
              </p>
            </section>

            <section id="conduct" className="public-document__section">
              <h2>5. User Responsibilities</h2>

              <p>
                All members are expected to interact
                respectfully and responsibly.
              </p>

              <p>You must not:</p>

              <ul>
                <li>Harass, threaten, abuse or discriminate against other members.</li>
                <li>Use the platform for scams, fraud, spam or commercial solicitation without authorization.</li>
                <li>Attempt to access another member's account or private information.</li>
                <li>Upload harmful code or attempt to disrupt the platform.</li>
                <li>Use information obtained through the platform for unlawful purposes.</li>
              </ul>
            </section>

            <section id="safety" className="public-document__section">
              <h2>6. Safety and Interactions</h2>

              <p>
                GenZ Matrimony helps people discover
                potential matrimonial connections.
                However, we cannot guarantee the identity,
                intentions, background or conduct of every
                member.
              </p>

              <div className="public-document__callout">
                Always exercise your own judgment when
                communicating with other members. Avoid
                sharing passwords, financial information
                or sensitive personal details. Never
                transfer money to someone you have met
                through the platform without independently
                verifying the circumstances.
              </div>

              <p>
                Report suspicious accounts, inappropriate
                behaviour or potential fraud through our
                support channel.
              </p>
            </section>

            <section id="content" className="public-document__section">
              <h2>7. User Content</h2>

              <p>
                You retain responsibility for the
                information, photographs and other content
                you submit to your profile.
              </p>

              <p>
                By submitting content, you grant GenZ
                Matrimony permission to host, store,
                display and process that content as
                reasonably necessary to operate and
                provide the service, subject to our
                Privacy Policy.
              </p>

              <p>
                You must have the rights and permissions
                necessary to upload and share any content
                you submit.
              </p>
            </section>

            <section id="services" className="public-document__section">
              <h2>8. Platform Services</h2>

              <p>
                We aim to provide a reliable and useful
                matrimonial platform. However, features,
                availability and functionality may change
                as the service develops.
              </p>

              <p>
                We do not guarantee that you will receive
                matches, find a suitable partner, enter
                into a relationship or achieve a particular
                matrimonial outcome.
              </p>
            </section>

            <section id="termination" className="public-document__section">
              <h2>9. Suspension and Termination</h2>

              <p>
                We may restrict, suspend or terminate
                access to an account where there is
                reasonable grounds to believe that these
                terms have been violated, the platform
                has been misused, or applicable law
                requires us to take action.
              </p>

              <p>
                You may stop using the service and request
                account deletion through the available
                account controls or by contacting support.
              </p>
            </section>

            <section id="disclaimer" className="public-document__section">
              <h2>10. Disclaimer and Liability</h2>

              <p>
                The platform is provided on an
                availability basis, subject to applicable
                law. We do not warrant uninterrupted,
                error-free operation or the accuracy of
                information submitted by other members.
              </p>

              <p>
                To the extent permitted by applicable law,
                GenZ Matrimony will not be responsible
                for indirect or consequential losses
                arising from member interactions or
                misuse of the platform.
              </p>

              <p>
                Nothing in these terms excludes or limits
                any liability that cannot legally be
                excluded or limited.
              </p>
            </section>

            <section id="changes" className="public-document__section">
              <h2>11. Changes to These Terms</h2>

              <p>
                We may update these terms to reflect
                changes in our services, operations or
                applicable legal requirements.
              </p>

              <p>
                Updated terms will be published on this
                page with a revised date. Continued use
                of the platform after changes take effect
                will be subject to the updated terms,
                to the extent permitted by law.
              </p>
            </section>

            <section id="contact" className="public-document__section">
              <h2>12. Contact Us</h2>

              <p>
                If you have questions about these Terms
                & Conditions, please visit our{' '}
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

export default Terms;
