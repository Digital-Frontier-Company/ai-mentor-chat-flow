
import { Helmet } from "react-helmet-async";

interface MetaTagsProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  keywords?: string;
  noIndex?: boolean;
}

const MetaTags = ({
  title = "MakeMentors.io - Create Your AI Mentor",
  description = "Design your own AI mentors for personalized learning experiences. Get guidance tailored to your needs and goals.",
  canonicalUrl,
  ogImage = "/lovable-uploads/bd0c9938-869e-417d-8441-834fe7445b8b.png",
  ogType = "website",
  keywords = "AI mentor, personalized learning, artificial intelligence, mentorship, education technology",
  noIndex = false
}: MetaTagsProps) => {
  const siteUrl = window.location.origin;
  const canonical = canonicalUrl ? `${siteUrl}${canonicalUrl}` : window.location.href;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Canonical Link */}
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* No index if specified */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default MetaTags;
