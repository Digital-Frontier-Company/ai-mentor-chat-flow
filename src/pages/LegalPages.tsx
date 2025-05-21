
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <p className="mb-4">Last Updated: May 21, 2025</p>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
        <p className="mb-3">
          At MakeMentors.io, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our AI mentor creation and interaction platform.
        </p>
        <p>
          By using our service, you agree to the collection and use of information in accordance with this policy.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
        <p className="mb-3">We collect several types of information for various purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Information:</strong> When you register, we collect your email address, name, and password.</li>
          <li><strong>Profile Information:</strong> Information you provide in your user profile.</li>
          <li><strong>Usage Data:</strong> Information on how you use the service.</li>
          <li><strong>Chat Data:</strong> Content of conversations with AI mentors.</li>
          <li><strong>Payment Information:</strong> If you subscribe to a paid plan, we collect payment details through our secure payment processor.</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
        <p className="mb-3">We use the collected information for various purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and maintain our service</li>
          <li>To notify you about changes to our service</li>
          <li>To provide customer support</li>
          <li>To gather analysis or valuable information to improve our service</li>
          <li>To process payments</li>
          <li>To train and improve our AI models</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Data Storage and Protection</h2>
        <p>
          We use industry-standard security measures to protect your personal information. All data is encrypted both in transit and at rest. We regularly review our data collection, storage, and processing practices to prevent unauthorized access.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at privacy@makementors.io.
        </p>
      </section>
    </div>
  );
};

const TermsOfService: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <p className="mb-4">Last Updated: May 21, 2025</p>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
        <p>
          By accessing or using MakeMentors.io, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
        <p>
          MakeMentors.io provides a platform for creating and interacting with AI mentors. The service includes various features based on your subscription plan.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
        <p className="mb-3">
          You must create an account to use our service. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
        </p>
        <p>
          You agree to provide accurate and complete information when creating your account and to update your information to keep it accurate and current.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">4. Subscriptions and Payments</h2>
        <p className="mb-3">
          Some features of the service require a paid subscription. By subscribing, you agree to pay the applicable fees as they become due.
        </p>
        <p className="mb-3">
          Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period.
        </p>
        <p>
          All payments are processed through our third-party payment processor, Stripe.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">5. Acceptable Use Policy</h2>
        <p className="mb-3">You agree not to use the service to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Violate any laws or regulations</li>
          <li>Infringe upon the rights of others</li>
          <li>Send spam or harmful content</li>
          <li>Attempt to access, tamper with, or use non-public areas of the service</li>
          <li>Create mentors that promote harmful or illegal activities</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">6. Termination</h2>
        <p>
          We may terminate or suspend your account at our sole discretion, without prior notice or liability, for any reason, including but not limited to a breach of the Terms.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at terms@makementors.io.
        </p>
      </section>
    </div>
  );
};

const LegalPages: React.FC = () => {
  const { page } = useParams<{ page: string }>();
  
  const renderPage = () => {
    switch(page) {
      case 'privacy':
        return <PrivacyPolicy />;
      case 'terms':
        return <TermsOfService />;
      default:
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
            <p className="mb-6">The legal page you're looking for doesn't exist.</p>
            <Link to="/" className="text-lime-500 hover:underline">
              Return to Homepage
            </Link>
          </div>
        );
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center text-zinc-400 hover:text-white">
          <ArrowLeft size={16} className="mr-2" />
          Back to Home
        </Link>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        {renderPage()}
      </div>
    </div>
  );
};

export default LegalPages;
