
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
}

export const OrganizationSchema: React.FC<OrganizationSchemaProps> = ({
  name,
  url,
  logo,
  description
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "url": url,
    "logo": logo,
    "description": description,
    "sameAs": [
      "https://twitter.com/makementors",
      // Add other social profile URLs as needed
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

interface WebsiteSchemaProps {
  name: string;
  url: string;
}

export const WebsiteSchema: React.FC<WebsiteSchemaProps> = ({
  name,
  url
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": name,
    "url": url,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

interface FAQPageSchemaProps {
  faqs: {
    question: string;
    answer: string;
  }[];
}

export const FAQPageSchema: React.FC<FAQPageSchemaProps> = ({ faqs }) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default {
  OrganizationSchema,
  WebsiteSchema,
  FAQPageSchema
};
