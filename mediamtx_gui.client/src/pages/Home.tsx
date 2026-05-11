import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/home.css";

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <section className="privacy-hero">
        <p className="privacy-eyebrow">Welcome</p>
        <h1>
          MediaMTX
          <br />
          Streaming
        </h1>
        <p className="privacy-hero-sub">
          A platform for managing live streams, projects, and recordings.
        </p>
        {isAuthenticated ? (
          <Link className="privacy-cta" to="/dashboard">
            Go to Dashboard
          </Link>
        ) : (
          <a
            className="privacy-cta"
            href="/api/users/login?returnUrl=/dashboard"
          >
            Log in
          </a>
        )}
        <span className="privacy-scroll-hint">Privacy policy below</span>
      </section>

      <div className="privacy-doc">
        <div className="privacy-doc-header">
          <p className="privacy-eyebrow">Legal</p>
          <h2>Privacy Policy</h2>
          <p className="privacy-doc-date">Last updated: May 2026</p>
        </div>

        <div className="privacy-doc-section">
          <h3>1. Who we are</h3>
          <p>
            This system is operated by student members of the University of Agder (UiA) as part of
            the UiA Esports program. The service is self-hosted on
            university-controlled infrastructure. 
          </p>
        </div>

        <div className="privacy-doc-section">
          <h3>2. What data we collect</h3>
          <p>
            Authentication is handled entirely through FEIDE, UiA's federated
            identity provider. We receive and store your name, username and email
            address from FEIDE when you log in. We do not store passwords. When
            you create a stream, we store the stream name, path, and a hashed
            stream key.
          </p>
        </div>

        <div className="privacy-doc-section">
          <h3>3. Why we collect it</h3>
          <p>
            Your data is used solely to operate the service: authenticating your
            identity, managing your projects and streams, and storing recordings
            you choose to create. This processing is carried out in accordance
            with GDPR Articles 5 and 6. The principles governing how personal
            data must be handled, and the legal basis for collecting it. We do
            not sell, share, or transfer your data to third parties, and no data
            leaves UiA's infrastructure.
          </p>
        </div>

        <div className="privacy-doc-section">
          <h3>4. Recordings</h3>
          <p>
            Recordings are stored on the university server and are only
            accessible to members of the project the stream belongs to.
            Recordings are automatically deleted after 5 days. You can also
            delete your own recordings at any time from the Recordings page.
            Project owners can delete any recording within their project, and
            administrators can delete any recording in the system.
          </p>
        </div>

        <div className="privacy-doc-section">
          <h3>5. Data retention</h3>
          <p>
            Your account data (name, username and email) is retained for as long as
            your account is active in the system. Recordings are automatically
            deleted after 5 days. If you need your account or data removed,
            contact the system administrator.
          </p>
        </div>

        <div className="privacy-doc-section">
          <h3>6. Your rights</h3>
          <p>
            Under GDPR, you have the right to access, correct, or request
            deletion of your personal data. You also have the right to lodge a
            complaint with a supervisory authority. In Norway, this is
            Datatilsynet (
            <a
              href="https://www.datatilsynet.no"
              target="_blank"
              rel="noreferrer"
            >
              www.datatilsynet.no
            </a>
            ).
          </p>
        </div>

        <div className="privacy-doc-section">
          <h3>7. Contact</h3>
          <p>
            For questions about this privacy policy or requests regarding your
            personal data, contact admin at{" "}
            <a href="jorgennk@uia.no" target="_blank" rel="noreferrer">
              jorgennk@uia.no
            </a>
            .
          </p>
        </div>
      </div>
    </>
  );
}

export default Home;
