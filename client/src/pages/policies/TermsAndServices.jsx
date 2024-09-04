import React from "react";
import Topbar from "../../components/Topbar";

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.6",
    margin: "0",
    padding: "80px 50px",
  },
  topbar: {
    position: "fixed",
    top: "0",
    width: "100%",
    zIndex: "1000", // Ensure it stays on top
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  subHeading: {
    fontSize: "1.5rem",
    marginBottom: "10px",
  },
  text: {
    fontSize: "1rem",
    marginBottom: "10px",
  },
  address: {
    fontSize: "1rem",
    lineHeight: "1.6",
  },
};

const TermsAndConditions = () => {
  return (
    <>
      <div style={styles.topbar}>
        <Topbar />
      </div>
      <div style={styles.container}>
        <h1 style={styles.heading}>Terms and Conditions</h1>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>1. Introduction</h2>
          <p style={styles.text}>
            Welcome to Namekart Private Limited ("Company", "we", "our", "us").
            These Terms and Conditions ("Terms") govern your use of our website
            located at app.namekart.com/crm (the "Website") and any related
            services provided by us (collectively, the "Services"). By accessing
            or using the Services, you agree to be bound by these Terms. If you
            do not agree with these Terms, you should not use our Services.
          </p>
          <p style={styles.text}>
            These Terms apply to all users of the Services, including without
            limitation users who are browsers, vendors, customers, merchants,
            and contributors of content. Please read these Terms carefully
            before accessing or using our Services.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>2. Changes to Terms</h2>
          <p style={styles.text}>
            We reserve the right to modify these Terms at any time. Any changes
            will be effective immediately upon posting on the Website. Your
            continued use of the Services after any such changes constitutes
            your acceptance of the new Terms. We encourage you to review these
            Terms periodically for any updates.
          </p>
          <p style={styles.text}>
            We will notify you of any significant changes to these Terms by
            email or through a prominent notice on our Website. If you do not
            agree to the modified Terms, you must stop using the Services.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>3. Use of the Services</h2>
          <p style={styles.text}>
            You agree to use the Services only for lawful purposes and in
            accordance with these Terms. You must not:
          </p>
          <ul style={styles.list}>
            <li>Engage in any unlawful or fraudulent activity.</li>
            <li>
              Interfere with or disrupt the Services or servers or networks
              connected to the Services.
            </li>
            <li>
              Attempt to gain unauthorized access to any part of the Services.
            </li>
            <li>Transmit any viruses or harmful code through the Services.</li>
          </ul>
          <p style={styles.text}>
            You are responsible for all activities that occur under your account
            and for maintaining the confidentiality of your account information,
            including your password. You must notify us immediately of any
            unauthorized use of your account or any other security breach.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>4. User Account</h2>
          <p style={styles.text}>
            To use certain features of the Services, you may need to create an
            account. You are responsible for maintaining the confidentiality of
            your account credentials and for all activities that occur under
            your account. You agree to notify us immediately of any unauthorized
            use of your account.
          </p>
          <p style={styles.text}>
            When you create an account, you agree to provide accurate, current,
            and complete information. You must update your account information
            promptly if it changes. We reserve the right to suspend or terminate
            your account if any information provided during the registration
            process or thereafter proves to be inaccurate, false, or misleading.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>5. Intellectual Property</h2>
          <p style={styles.text}>
            All content and materials provided through the Services, including
            but not limited to text, graphics, logos, and software, are the
            property of Namekart Private Limited or its licensors and are
            protected by intellectual property laws. You may not use, reproduce,
            or distribute any content or materials without our express written
            consent.
          </p>
          <p style={styles.text}>
            You are granted a limited, non-exclusive, non-transferable, and
            revocable license to access and use the Services for personal and
            non-commercial purposes only. This license does not allow you to
            modify, distribute, or create derivative works based on any content
            or materials provided through the Services.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>6. Limitation of Liability</h2>
          <p style={styles.text}>
            To the maximum extent permitted by law, Namekart Private Limited
            shall not be liable for any indirect, incidental, special, or
            consequential damages, or any loss of profits or data, arising out
            of or in connection with your use of the Services, even if we have
            been advised of the possibility of such damages.
          </p>
          <p style={styles.text}>
            Our total liability to you for all claims arising out of or in
            connection with the Services will not exceed the amount you have
            paid us in the past twelve months, or one hundred dollars ($100),
            whichever is greater.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>7. Termination</h2>
          <p style={styles.text}>
            We may terminate or suspend your access to the Services immediately,
            without prior notice or liability, if we believe you have violated
            these Terms. Upon termination, your right to use the Services will
            immediately cease, and we may delete your account and any associated
            data.
          </p>
          <p style={styles.text}>
            You may terminate your account at any time by contacting us. Upon
            termination, you must cease all use of the Services and delete any
            copies of content or materials obtained through the Services.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>8. Governing Law</h2>
          <p style={styles.text}>
            These Terms shall be governed by and construed in accordance with
            the laws of the state or country in which Namekart Private Limited
            is headquartered, without regard to its conflict of law principles.
            Any disputes arising under or in connection with these Terms shall
            be subject to the exclusive jurisdiction of the courts located in
            that state or country.
          </p>
          <p style={styles.text}>
            If any provision of these Terms is found to be invalid or
            unenforceable, the remaining provisions will continue to be valid
            and enforceable to the fullest extent permitted by law.
          </p>
        </section>

        <section style={styles.section}>
          <h2 style={styles.subHeading}>9. Privacy Policy</h2>
          <p style={styles.text}>
            Your use of the Services is also governed by our Privacy Policy,
            which is incorporated by reference into these Terms. Please review
            our Privacy Policy to understand our practices regarding the
            collection, use, and disclosure of your personal information.
          </p>
          <p style={styles.text}>
            By using the Services, you consent to the collection, use, and
            disclosure of your personal information as described in our Privacy
            Policy.
          </p>
        </section>
        <section style={styles.section}>
          <h2 style={styles.subHeading}>10. Contact Information</h2>
          <p style={styles.text}>
            If you have any questions about these Terms, please contact us at:
          </p>
          <address style={styles.address}>
            Namekart Private Limited
            <br />
            tech@namekart.com
            <br />
            sector-50, Noida, UP
          </address>
        </section>
      </div>
    </>
  );
};

export default TermsAndConditions;
