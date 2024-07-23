import React from 'react';
import Topbar from './Topbar';

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
    lineHeight: '1.6',
    margin: '0',
    padding: '80px 50px',
  },
  topbar: {
    position: 'fixed',
    top: '0',
    width: '100%',
    zIndex: '1000', // Ensure it stays on top
  },
  h1: {
    color: '#333',
    fontSize: '2.5em',
  },
  h2: {
    color: '#333',
    fontSize: '2em',
    marginTop: '40px',
  },
  h3: {
    color: '#333',
    fontSize: '1.5em',
    marginTop: '30px',
  },
  p: {
    marginBottom: '20px',
  },
  ul: {
    listStyleType: 'disc',
    marginLeft: '40px',
    marginBottom: '20px',
  },
  ol: {
    marginLeft: '40px',
  },
  a: {
    color: '#1a73e8',
    textDecoration: 'none',
  },
  aHover: {
    textDecoration: 'underline',
  }
};

const PrivacyPolicy = () => (
  <>
    <div style={styles.topbar}>
      <Topbar />
    </div>
    <div style={styles.body}>
      <h1 style={styles.h1}>Privacy Policy</h1>

      <p><strong>Effective Date:</strong> July 19, 2024</p>

      <p>
        Namekart Private Limited ("we," "our," or "us") is committed to protecting the privacy of our employees who use our Customer Relationship Management (CRM) website ("Service"). This Privacy Policy explains how we collect, use, and safeguard your information when you use our Service, including the sensitive use of Google Mail services for email campaigns.
      </p>

      <h2 style={styles.h2}>Table of Contents</h2>
      <ol style={styles.ol}>
        <li><a href="#statement" style={styles.a}>What This Statement Covers</a></li>
        <li><a href="#personal-information" style={styles.a}>Personal Information We Collect</a></li>
        <li><a href="#content" style={styles.a}>Content or Information You Provide in the Services</a></li>
        <li><a href="#use" style={styles.a}>How We Use Personal Information We Collect</a></li>
        <li><a href="#share" style={styles.a}>How We Share Personal Information</a></li>
        <li><a href="#choices" style={styles.a}>Your Choices - Opting Out, Correcting, or Accessing Your Information</a></li>
        <li><a href="#security" style={styles.a}>Data Security and Data Transfers</a></li>
        <li><a href="#dispute" style={styles.a}>Dispute Resolution</a></li>
        <li><a href="#changes" style={styles.a}>Notice of Changes</a></li>
        <li><a href="#contact" style={styles.a}>Contacting Namekart</a></li>
      </ol>

      <h3 id="statement" style={styles.h3}>1. What This Statement Covers</h3>
      <p style={styles.p}>
        This Privacy Policy describes the types of information we may collect from you or that you may provide on the app.namekart.com/crm website ("Website" or "Service") and its related products and services (collectively, "Services"). It details our practices for collecting, using, maintaining, protecting, and disclosing your Personal Information, and your choices regarding this information.
      </p>

      <p style={styles.p}>
        Our Services are intended for internal use by Namekart Private Limited employees for bulk mailing to customers and are not directed at children under the age of 16. We do not knowingly collect information from individuals under this age. If you are under 16, please do not use the Services or provide any information to us. It is our firm commitment to protect the privacy of children and comply with relevant regulations such as the Children's Online Privacy Protection Act (COPPA).
      </p>

      <p style={styles.p}>
        We may update this Privacy Policy periodically. Updates will be posted on this page with the date of the most recent revision. Significant changes will be communicated through the Service, via pop-ups, emails, or other reasonable methods. This ensures that you are always aware of what information we collect, how we use it, and under what circumstances we disclose it.
      </p>

      <p style={styles.p}>
        By using our Services, you agree to the collection and use of your information in accordance with this Privacy Policy. If you do not agree with the terms set forth in this Privacy Policy, please do not use our Services. Your continued use of the Services following the posting of changes to this Privacy Policy will mean that you accept those changes.
      </p>

      <h3 id="personal-information" style={styles.h3}>2. Personal Information We Collect</h3>
      <p style={styles.p}>We may collect and process the following types of information:</p>

      <p style={styles.p}>
        <strong>Personal Information:</strong> When you register and log in to the Service, we collect your email address and password. This information is necessary to create and manage your account, ensure secure access, and provide personalized services. Additionally, we may collect your name, job title, and other profile information that you choose to provide. This helps us customize your experience and provide better support and services. Personal information also includes any communications you have with us, such as emails or phone calls, which we use to ensure quality service and resolve any issues you may encounter.
      </p>

      <p style={styles.p}>
        <strong>Email Campaign Data:</strong> To facilitate bulk mailing, you may register additional email IDs. We collect and store the associated access tokens and refresh tokens necessary for Gmail service integration. This allows us to send emails on your behalf through the Gmail service. The collection of these tokens is essential for maintaining the functionality and security of our email campaigns. By integrating with Gmail, we can ensure that your emails are sent reliably and securely, leveraging the advanced features and infrastructure provided by Google Mail services.
      </p>

      <p style={styles.p}>
        <strong>Usage Data:</strong> We may collect information about how you use the Service, including the frequency and duration of your activities. This data helps us understand how the Service is used and identify areas for improvement. Usage data can include information about your interactions with the Service, such as pages visited, features used, and links clicked. This helps us optimize the Service and enhance your user experience. By analyzing usage patterns, we can identify which features are most popular and which may need enhancement, ensuring that we continue to meet your needs effectively.
      </p>

      <p style={styles.p}>
        <strong>Information You Provide Through Support Channels or Communities:</strong> You may provide information or content to us through customer support, including interactions with our support team or community forums. This can include details about your inquiries, feedback, and any issues you encounter. This information is used to resolve your concerns and improve our Services. By gathering feedback and understanding the challenges you face, we can make necessary adjustments and improvements to the Service, ensuring that it remains user-friendly and effective.
      </p>

      <h3 id="content" style={styles.h3}>3. Content or Information You Provide in the Services</h3>
      <p style={styles.p}>When you create an account or use our Service, you may provide various types of content or information, including:</p>

      <ul style={styles.ul}>
        <li>
          <strong>Registration Information:</strong> When you register for an account, you provide us with your email address and password. This information is essential for account creation, authentication, and security. Ensuring that your account is secure is our top priority, and collecting this information allows us to protect your data and provide you with a safe experience.
        </li>
        <li>
          <strong>Profile Information:</strong> Information you add to your user profile, such as your name, job title, and contact details. This helps us personalize your experience and provide relevant content and services. By knowing more about you, we can tailor our Services to better meet your needs and preferences.
        </li>
        <li>
          <strong>Campaign Data:</strong> Information related to your email campaigns, including email addresses, content, and schedules. This data is crucial for managing and executing your email campaigns effectively. By understanding the specifics of your campaigns, we can help you achieve better results and streamline your email marketing efforts.
        </li>
      </ul>

      <p style={styles.p}>
        Providing accurate and up-to-date information is important for the functionality of the Service. Please ensure that the information you provide is accurate and kept up to date. You can update your profile information at any time through the Service interface or by contacting us directly. Keeping your information current helps us provide you with the best possible service and ensures that you receive important updates and notifications.
      </p>

      <h3 id="use" style={styles.h3}>4. How We Use Personal Information We Collect</h3>
      <p style={styles.p}>We use the information we collect for various purposes, including:</p>

      <ul style={styles.ul}>
        <li>
          <strong>To Provide and Support the Services:</strong> We use your personal information to provide, operate, and maintain our Service, including account management and email campaign facilitation. This ensures that you have access to the features and functionalities of the Service. By leveraging your personal information, we can deliver a seamless and efficient experience, helping you achieve your goals with minimal effort.
        </li>
        <li>
          <strong>To Improve Our Services:</strong> We analyze usage data to understand how our Service is used and to make improvements. This helps us optimize the user experience and introduce new features that enhance the Service. By continuously refining and enhancing our Service, we can provide you with a better experience and ensure that we meet your evolving needs.
        </li>
        <li>
          <strong>To Communicate With You:</strong> We use your contact information to send you important updates, respond to your inquiries, and provide customer support. Keeping you informed about changes to our Service or responding to your questions is essential for maintaining a positive relationship. Effective communication allows us to address your concerns promptly and keep you informed about important developments.
        </li>
        <li>
          <strong>To Enforce Our Policies and Comply With Legal Obligations:</strong> We may use your information to enforce our terms of service, protect our rights, and comply with legal obligations. Ensuring that our Service is used in accordance with our policies and legal requirements is crucial for maintaining a safe and secure environment. By enforcing our policies, we can protect both your interests and ours, ensuring a fair and transparent service.
        </li>
      </ul>

      <h3 id="share" style={styles.h3}>5. How We Share Personal Information</h3>
      <p style={styles.p}>We do not sell your personal information to third parties. We may share your information in the following circumstances:</p>

      <ul style={styles.ul}>
        <li>
          <strong>With Service Providers:</strong> We may share your information with third-party service providers who perform services on our behalf, such as email delivery and data storage. These providers are contractually obligated to protect your information and use it only for the purposes specified by us. By working with trusted service providers, we can enhance the quality and reliability of our Service while ensuring that your information remains secure.
        </li>
        <li>
          <strong>For Legal Reasons:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities, such as a court or government agency. Compliance with legal obligations is essential for maintaining the integrity of our Service and protecting our users' rights. By adhering to legal requirements, we can ensure that our operations remain lawful and transparent.
        </li>
        <li>
          <strong>With Your Consent:</strong> We may share your information with third parties if you give us your consent to do so. Your explicit consent ensures that you have control over how your information is shared and used. By seeking your consent, we respect your preferences and ensure that your information is handled in accordance with your wishes.
        </li>
      </ul>

      <h3 id="choices" style={styles.h3}>6. Your Choices - Opting Out, Correcting, or Accessing Your Information</h3>
      <p style={styles.p}>You have the right to:</p>

      <ul style={styles.ul}>
        <li>
          <strong>Opt-Out:</strong> You can opt out of receiving promotional emails from us by following the unsubscribe instructions in those emails. Opting out of promotional communications does not affect your receipt of transactional communications related to your account or use of our Service. By allowing you to opt out, we respect your preferences while ensuring that you continue to receive essential information about your account.
        </li>
        <li>
          <strong>Access, Update, or Correct Information:</strong> You can access, update, or correct your personal information by logging into your account or contacting us directly. Keeping your information accurate and up to date is important for maintaining the quality and effectiveness of our Service. By providing you with the ability to update your information, we ensure that you have control over your personal data and can make necessary adjustments as needed.
        </li>
        <li>
          <strong>Delete Information:</strong> You can request that we delete your personal information. Please note that some information may be retained for legal, operational, or security reasons. By allowing you to request the deletion of your information, we respect your right to privacy while ensuring that we comply with legal and operational requirements.
        </li>
      </ul>

      <p style={styles.p}>
        If you have any questions or need assistance with these rights, please contact us using the contact information provided below. We are committed to helping you exercise your rights and ensuring that your information is handled in accordance with your preferences.
      </p>

      <h3 id="security" style={styles.h3}>7. Data Security and Data Transfers</h3>
      <p style={styles.p}>We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

      <ul style={styles.ul}>
        <li>
          <strong>Security Measures:</strong> We use encryption, access controls, and secure servers to safeguard your information. These measures are designed to protect your data from unauthorized access and ensure that it is stored securely. By implementing robust security measures, we can minimize the risk of data breaches and protect your personal information effectively.
        </li>
        <li>
          <strong>Data Transfers:</strong> Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws, but we take appropriate steps to ensure that your information receives the same level of protection as it would in your home country. By complying with international data protection standards, we can ensure that your information remains secure regardless of where it is processed.
        </li>
      </ul>

      <h3 id="dispute" style={styles.h3}>8. Dispute Resolution</h3>
      <p style={styles.p}>If you have any complaints regarding our privacy practices, please contact us. We will work with you to resolve your concerns.</p>

      <h3 id="changes" style={styles.h3}>9. Notice of Changes</h3>
      <p style={styles.p}>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on our Website and updating the "Effective Date" above. Your continued use of our Services after any changes indicates your acceptance of the updated Privacy Policy.</p>

      <h3 id="contact" style={styles.h3}>10. Contacting Namekart</h3>
      <p style={styles.p}>If you have any questions about this Privacy Policy or our privacy practices, please contact us at:</p>
      <p style={styles.p}><strong>Email:</strong> tech@namekart.com</p>
      <p style={styles.p}><strong>Address:</strong> Namekart Private Limited, 123 Main Street, Anytown, USA</p>

      <p style={styles.p}>Thank you for using Namekart CRM. We are committed to protecting your privacy and providing you with a safe and secure experience.</p>
    </div>
  </>
);

export default PrivacyPolicy;
