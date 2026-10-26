
"use client"
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Save, 
  X, 
  Plus, 
  Trash2,
  Upload,
  Image as ImageIcon,
  Link2,
  FileText,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Eye,
  EyeOff,
  Globe,
  Layers,
  Loader2,
  User
} from 'lucide-react';
import { useBlog } from '../../../../../features/blog/hooks/useBlog';
import { useBlogCategory } from '../../../../../features/blogCategory/hooks/useBlogCategory';
import useAuth from '../../../../../features/auth/hooks/useAuth';
import { useUser } from '../../../../../features/user/hooks/useUser';
import ContentPreview from '@/components/editor/ContentPreview';
import RichTextEditor from '@/components/dashboard/RichTextEditor';
import MediaSeoFields, {
  createMediaSeoDefaults,
  type MediaSeoValue,
} from '@/components/dashboard/MediaSeoFields';

interface FAQ {
  question: string;
  answer: string;
}

interface SocialMediaLink {
  platform: string;
  url: string;
}

interface ResourceLink {
  title: string;
  url: string;
}

export default function AddBlogPage() {
  const router = useRouter();
  const { createBlog } = useBlog();
  const { useGetBlogCategories } = useBlogCategory();
  const { user } = useAuth();
  const { useGetUserById } = useUser();
  
  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = useGetBlogCategories();
  const categories = categoriesData?.data || [];

  // Fetch user data to get the name
  const { data: userData, isLoading: userLoading } = useGetUserById(user?.userId || '', {
    skip: !user?.userId
  });
  const userInfo = userData?.data;

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Paste JSON import editor states
  const [showJsonPasteImport, setShowJsonPasteImport] = useState(false);
  const [jsonPasteInput, setJsonPasteInput] = useState('');
  const [jsonPasteError, setJsonPasteError] = useState('');
  const [jsonPasteSuccess, setJsonPasteSuccess] = useState(false);

  // Create refs for each section
  const basicRef = useRef<HTMLDivElement>(null);
  const seoRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  // Create input refs for scrolling to errors
  const titleInputRef = useRef<HTMLInputElement>(null);
  const slugInputRef = useRef<HTMLInputElement>(null);
  const categorySelectRef = useRef<HTMLSelectElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    category: '', // This will store the category slug
    postedBy: '',
    status: 'draft' as 'draft' | 'published',
    keywords: '',
    content: '',
  });

  const [faqs, setFaqs] = useState<FAQ[]>([
    { question: '', answer: '' }
  ]);

  const [socialMediaLinks, setSocialMediaLinks] = useState<SocialMediaLink[]>([
    { platform: '', url: '' }
  ]);

  const [resourceLinks, setResourceLinks] = useState<ResourceLink[]>([
    { title: '', url: '' }
  ]);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [bannerSeo, setBannerSeo] = useState<MediaSeoValue>(createMediaSeoDefaults());
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [resourceSeo, setResourceSeo] = useState<MediaSeoValue[]>([]);

  // Set postedBy from authenticated user's name
  useEffect(() => {
    if (userInfo?.name) {
      setFormData(prev => ({
        ...prev,
        postedBy: userInfo.name
      }));
    } else if (user?.email) {
      setFormData(prev => ({
        ...prev,
        postedBy: user.email?.split('@')[0] || 'User'
      }));
    }
  }, [userInfo, user]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate slug if title changes and slug hasn't been manually edited
      if (name === 'title' && !isSlugManuallyEdited) {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const sanitizedSlug = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setFormData(prev => ({ ...prev, slug: sanitizedSlug }));
    setIsSlugManuallyEdited(true);
    
    if (validationErrors.slug) {
      setValidationErrors(prev => ({ ...prev, slug: '' }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, category: value }));
    
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: '' }));
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, description: value }));
    
    if (value.length < 10) {
      setValidationErrors(prev => ({ 
        ...prev, 
        description: 'Description must be at least 10 characters' 
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, description: '' }));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBannerFile(file);
    if (file) {
      setBannerSeo(createMediaSeoDefaults());
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setBannerPreview(null);
      setBannerSeo(createMediaSeoDefaults());
    }
  };

  const applyImportedJson = (rawText: string) => {
    const parsed = JSON.parse(rawText);
    const imported = parsed?.data && typeof parsed.data === 'object' ? parsed.data : parsed;

    if (!imported || typeof imported !== 'object' || Array.isArray(imported)) {
      throw new Error('The JSON root must be an object.');
    }

    setFormData(prev => {
      const next = { ...prev };

      if (typeof imported.title === 'string') next.title = imported.title;
      if (typeof imported.description === 'string') next.description = imported.description;
      if (typeof imported.seoTitle === 'string') next.seoTitle = imported.seoTitle;
      if (typeof imported.seoDescription === 'string') next.seoDescription = imported.seoDescription;
      if (typeof imported.content === 'string') next.content = imported.content;

      if (Array.isArray(imported.keywords)) {
        next.keywords = imported.keywords
          .filter((item: unknown): item is string => typeof item === 'string')
          .join(', ');
      } else if (typeof imported.keywords === 'string') {
        next.keywords = imported.keywords;
      } else if (Array.isArray(imported.keyword)) {
        next.keywords = imported.keyword
          .filter((item: unknown): item is string => typeof item === 'string')
          .join(', ');
      } else if (typeof imported.keyword === 'string') {
        next.keywords = imported.keyword;
      }

      if (typeof imported.slug === 'string' && imported.slug.trim()) {
        next.slug = generateSlug(imported.slug);
        setIsSlugManuallyEdited(true);
      } else if (typeof imported.title === 'string') {
        next.slug = generateSlug(imported.title);
        setIsSlugManuallyEdited(false);
      }

      return next;
    });

    const importedFaqs = imported.faqs ?? imported.faq;
    if (Array.isArray(importedFaqs)) {
      const validFaqs = importedFaqs
        .filter((item: unknown): item is FAQ => {
          if (!item || typeof item !== 'object') return false;
          const faq = item as Partial<FAQ>;
          return typeof faq.question === 'string' && typeof faq.answer === 'string';
        })
        .map((faq: FAQ) => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }))
        .filter((faq: FAQ) => faq.question && faq.answer);

      if (validFaqs.length) setFaqs(validFaqs);
    }

    if (Array.isArray(imported.socialMediaLinks)) {
      const validSocialLinks = imported.socialMediaLinks
        .filter((item: unknown): item is SocialMediaLink => {
          if (!item || typeof item !== 'object') return false;
          const link = item as Partial<SocialMediaLink>;
          return typeof link.platform === 'string' && typeof link.url === 'string';
        })
        .map((link: SocialMediaLink) => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
        }))
        .filter((link: SocialMediaLink) => link.platform && link.url);

      if (validSocialLinks.length) setSocialMediaLinks(validSocialLinks);
    }

    if (Array.isArray(imported.resourceLinks)) {
      const validResourceLinks = imported.resourceLinks
        .filter((item: unknown): item is ResourceLink => {
          if (!item || typeof item !== 'object') return false;
          const link = item as Partial<ResourceLink>;
          return typeof link.title === 'string' && typeof link.url === 'string';
        })
        .map((link: ResourceLink) => ({
          title: link.title.trim(),
          url: link.url.trim(),
        }))
        .filter((link: ResourceLink) => link.title && link.url);

      if (validResourceLinks.length) setResourceLinks(validResourceLinks);
    }

    setValidationErrors({});
    setError(null);
    setResponse({
      imported: true,
      message: 'JSON data imported. Autofetched, select, media, and file fields were skipped.',
    });
  };

  const handleJsonImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json') && file.type !== 'application/json') {
      setError('Please upload a valid JSON file.');
      return;
    }

    try {
      applyImportedJson(await file.text());
    } catch (err) {
      setResponse(null);
      setError(err instanceof Error ? `JSON import failed: ${err.message}` : 'JSON import failed.');
    }
  };

  const handlePastedJsonImport = () => {
    setJsonPasteError('');
    setJsonPasteSuccess(false);

    if (!jsonPasteInput.trim()) {
      setJsonPasteError('Paste JSON data before importing.');
      return;
    }

    try {
      applyImportedJson(jsonPasteInput);
      setJsonPasteSuccess(true);

      window.setTimeout(() => {
        setShowJsonPasteImport(false);
        setJsonPasteInput('');
        setJsonPasteError('');
        setJsonPasteSuccess(false);
      }, 1200);
    } catch (err) {
      setJsonPasteError(
        err instanceof SyntaxError
          ? 'Invalid JSON syntax. Check commas, quotes, brackets, and braces.'
          : err instanceof Error
            ? err.message
            : 'JSON import failed.',
      );
    }
  };

  const exampleBlogJson = String.raw`{
  "title": "How Can a Website Improve Its User Experience? A Complete Guide",
  "slug": "how-can-a-website-improve-its-user-experience-a-complete-guide",
  "description": "Improve Website User Experience by optimizing navigation, mobile responsiveness, Core Web Vitals, accessibility, and page performance to increase engagement, conversions, and overall website usability.",
  "seoTitle": "How to Improve Website User Experience: Complete UX Guide",
  "seoDescription": "Learn how to improve website user experience with faster performance, mobile-first design, accessible content, intuitive navigation, better forms, and continuous UX measurement.",
  "keywords": [
    "Improve Website User Experience",
    "website UX",
    "user experience design",
    "Core Web Vitals",
    "mobile-first design",
    "website accessibility",
    "website navigation",
    "form usability",
    "UX audit",
    "page performance"
  ],
  "content": "<p>A website can improve its user experience by focusing on site speed, intuitive navigation, mobile-optimized design, accessible content, and reduced friction in key flows like forms and checkout. These aren't cosmetic fixes. They're foundational changes that affect how quickly people find what they need, whether they stay, and whether they come back.</p>\n<p>UX is often confused with visual design, but it covers far more ground than that. Colors and fonts matter, but UX also includes how fast your pages load, how easy it is to navigate on a phone, whether your forms frustrate people, and whether your content is readable at a glance. Every part of the experience a visitor has, from the first page load to the last click, is UX.</p>\n<p>This guide covers each layer of website UX in practical, specific terms, with tools you can use right now to measure where you stand.</p>\n<h2>What User Experience Actually Means on a Website</h2>\n<p>User experience is the sum of every interaction a visitor has with your site. That covers the obvious things (layout, design, content) and the less obvious ones (load time, keyboard accessibility, error message clarity, on-site search quality).</p>\n<p>A useful way to think about it: good UX means a visitor can arrive, understand what the site offers, find what they came for, and complete their intended action without friction. Bad UX is anything that interrupts that path, whether it's a slow-loading hero image, a navigation menu that doesn't work on mobile, or a form that clears itself on error.</p>\n<h2>Site Speed and Core Web Vitals: The Foundation</h2>\n<p>Nothing kills user experience faster than a slow page. Reported data indicates 53% of users will abandon a mobile site that takes longer than three seconds to load. And speed isn't just a UX issue anymore. Google uses Core Web Vitals as ranking signals, making page performance a direct factor in organic search visibility.</p>\n<p>Core Web Vitals are three specific metrics Google uses to measure real-user experience. As of 2026, Google has tightened its standards, with LCP dropping to a 2.0-second threshold for a \"good\" rating and INP sitting as a primary ranking signal alongside keyword relevance.</p>\n<table><thead><tr><th>Metric</th><th>What It Measures</th><th>2026 \"Good\" Threshold</th><th>How to Improve It</th></tr></thead><tbody><tr><td>Largest Contentful Paint (LCP)</td><td>How fast the main content loads</td><td>Under 2.0 seconds</td><td>Optimize images (WebP/AVIF), use a CDN, reduce server response time</td></tr><tr><td>Interaction to Next Paint (INP)</td><td>How responsive the page feels to user input</td><td>Under 200 milliseconds</td><td>Minimize render-blocking JavaScript, reduce bundle size</td></tr><tr><td>Cumulative Layout Shift (CLS)</td><td>How stable the page layout is visually</td><td>Under 0.1</td><td>Set explicit dimensions on images and embeds, avoid injecting content above the fold</td></tr><tr><td>A page that shifts around while loading, or takes 800ms to respond to a tap, fails the user even if the design is beautiful.</td></tr></tbody></table>\n<h3>5 quick wins for better site speed:</h3>\n<ul><li>Convert images to WebP or AVIF format and use lazy loading for images below the fold.</li><li>Audit and eliminate render-blocking JavaScript (Google Lighthouse flags these automatically).</li><li>Serve static assets through a Content Delivery Network (CDN) so files load from a server geographically close to each user.</li><li>Reduce JavaScript bundle size by removing unused dependencies and code-splitting where possible.</li><li>Run Google PageSpeed Insights or Lighthouse regularly, not just once, to catch regressions as your content grows.</li></ul>\n<h2>Mobile-First Design: No Longer Optional</h2>\n<p>Mobile devices account for the majority of web traffic globally. Despite that, mobile pages consistently underperform desktop versions on Core Web Vitals because of slower processors, limited bandwidth, and variable network conditions.</p>\n<p>Mobile-first design doesn't mean building a stripped-down version of your site for phones. It means designing for the smallest, most constrained viewport first and scaling up from there. Navigation menus need to work with thumbs. Tap targets need to be large enough to hit accurately. Text needs to be readable without pinching and zooming. Forms need to trigger the correct keyboard type (email, numeric, etc.) based on the field.</p>\n<p>If you're only testing your site on a desktop browser, you're testing the wrong experience for most of your visitors.</p>\n<h2>Navigation and Information Architecture</h2>\n<p>Good navigation reduces cognitive load. When people land on a page, they shouldn't have to figure out where they are, where they can go, or how to get back. That clarity comes from consistent menus, clear labels, logical page hierarchy, and breadcrumbs on deeper pages.</p>\n<p>Practical rules that hold across most site types:</p>\n<ul><li>Keep primary navigation to seven items or fewer. More than that and visitors start skipping over it rather than reading it.</li><li>Use descriptive labels. \"Products\" is weaker than \"See All Products.\" \"Help\" is weaker than \"FAQs and Support.\"</li><li>Make the logo a home link. It's a convention visitors rely on without thinking about it.</li><li>Use sticky navigation on long-scroll pages so visitors don't have to scroll back to the top to go somewhere new.</li><li>Test your navigation on mobile by actually tapping through it on a phone, not just resizing your browser window.</li></ul>\n<h2>Accessibility: UX for Every Visitor</h2>\n<p>Accessibility is often treated as a compliance checkbox, but it's worth thinking of it as UX for the full range of people who visit your site. Color contrast that's too low doesn't just affect users with visual impairments. It affects anyone reading on a bright screen outdoors. Small font sizes affect older users and anyone glancing at a phone in a hurry.</p>\n<h3>The principles to apply:</h3>\n<ul><li>Maintain sufficient color contrast between text and background (the WCAG AA standard requires a ratio of at least 4.5:1 for normal-sized text).</li><li>Add descriptive alt text to every meaningful image. Screen readers use it, and search engines use it too.</li><li>Make sure all interactive elements (forms, buttons, navigation) are keyboard navigable.</li><li>Use proper heading structure (H1, H2, H3 in logical order) rather than styling paragraphs to look like headings.</li><li>Keep body font sizes at a readable baseline. 16px is the widely accepted minimum for body text.</li><li>Accessibility improvements almost always improve usability for everyone, not just users who rely on assistive technology.</li></ul>\n<h2>Content Structure and Readability</h2>\n<p>People don't read web pages the way they read books. They scan first, then read the sections that look relevant. Content structure should support that behavior.</p>\n<p>Short paragraphs of two to four sentences, descriptive subheadings, and bullet lists for multi-item information all help visitors find what they came for without reading every word. A wall of text, even well-written text, creates friction.</p>\n<h3>A few structural habits that make a real difference:</h3>\n<ul><li>Front-load the main point in every section. Don't bury the answer in the third paragraph.</li><li>Use H2 and H3 headings that describe what's in the section, so scanners can jump directly to what they need.</li><li>Keep sentences short where the information is dense. Longer sentences work for nuance, not for lists of facts.</li><li>Leave whitespace between elements. Cramped pages feel harder to read even when the content itself is strong.</li></ul>\n<h2>Reducing Friction in Forms and Conversion Flows</h2>\n<p>A form that frustrates visitors doesn't just hurt UX. It directly reduces conversions. The most common friction points are forms with too many required fields, error messages that don't tell you what went wrong, and forms that clear all input when a single field fails validation.</p>\n<h3>Steps to audit and improve any form:</h3>\n<ul><li>Remove every field that isn't strictly necessary. If you can follow up for the information later, don't ask for it now.</li><li>Write clear, specific error messages. \"Invalid input\" tells the user nothing. \"Please enter a valid email address\" tells them exactly what to fix.</li><li>Never clear a form on error. Preserve what the user typed and highlight only the field that needs attention.</li><li>For multi-step forms or checkout flows, add a progress indicator so users know how many steps remain.</li><li>Confirm success clearly. After submission, show a confirmation message on the same page or redirect to a dedicated confirmation page.</li></ul>\n<h2>On-Site Search: Helping Users Self-Serve</h2>\n<p>For content-heavy sites, blogs, product catalogues, and knowledge bases, on-site search is often the fastest path to what a visitor wants. If it doesn't work well, those visitors leave rather than browse.</p>\n<p>On-site search quality depends on three things: relevance (does it surface the right results?), speed (does it return results quickly?), and usability (can visitors filter and refine results without confusion?). The search bar also needs to be easy to find. A search icon buried in a secondary navigation area is a search bar most visitors won't use.</p>\n<p>Regularly review what people are searching for on your site if your analytics supports it. Those queries are a direct signal of what visitors want, and whether your navigation is actually helping them find it.</p>\n<h2>How to Measure and Continuously Improve UX</h2>\n<p>UX is not a one-time redesign project. Visitor behavior shifts as content changes, new devices emerge, and expectations evolve. The sites that get UX right treat it as an ongoing process with regular measurement cycles.</p>\n<h3>Tools to use for ongoing UX measurement (all free or free-tier available):</h3>\n<ul><li>Google Lighthouse runs a full audit of performance, accessibility, SEO, and best practices. Run it in Chrome DevTools or via the command line.</li><li>Google PageSpeed Insights shows real-world Core Web Vitals data from Google's Chrome User Experience Report alongside lab data from a simulated test.</li><li>Google Search Console shows which queries send visitors to your site and flags any pages with Core Web Vitals issues in the \"Experience\" report.</li><li>Google Analytics surfaces bounce rates, session duration, and funnel drop-off points that indicate where users are getting stuck or leaving.</li><li>Beyond automated tools, direct user feedback is irreplaceable. Usability testing with even five to eight real users will surface friction points that no automated audit can catch. User surveys and direct interviews add context that data alone can't give you.</li></ul>\n<h3>A practical UX review schedule:</h3>\n<ul><li>Monthly: run Google Lighthouse or PageSpeed Insights audits (or after any significant code or content change).</li><li>Quarterly: review Google Search Console's Core Web Vitals and experience reports.</li><li>Annually: conduct at least one round of real user testing, even an informal session with a small group.</li><li>Any major redesign or new feature launch should include a UX review before and after release.</li></ul>\n<h2>UX Audit Checklist</h2>\n<p>Use this as a starting point for your own site review:</p>\n<table><thead><tr><th>UX Area</th><th>What to Check</th><th>Quick Fix</th></tr></thead><tbody><tr><td>Navigation</td><td>Are labels descriptive? Does mobile nav work by touch? Is the logo a home link?</td><td>Rename vague labels, test on a real device, verify logo link</td></tr><tr><td>Mobile</td><td>Does the page pass Google PageSpeed Insights on mobile? Are tap targets large enough?</td><td>Compress images, increase interactive button sizes to at least 44x44px</td></tr><tr><td>Accessibility</td><td>Is color contrast sufficient (4.5:1 for normal text)? Do images have alt text? Is the site keyboard navigable?</td><td>Add alt text, run a contrast checker, tab through every interactive element</td></tr><tr><td>Forms</td><td>Are there unnecessary fields? Are error messages specific? Does the form clear on error?</td><td>Remove optional fields, rewrite vague error messages, fix clear-on-error behavior</td></tr><tr><td>Search</td><td>Is on-site search easy to find? Are results relevant? Are zero-result queries reviewed?</td><td>Move search bar to a prominent position, review zero-results queries in analytics</td></tr><tr><td>Content structure</td><td>Are paragraphs short? Are headings descriptive? Is there sufficient whitespace?</td><td>Break up long paragraphs, rewrite vague headings, increase spacing between sections</td></tr><tr><td>Frequently Asked Questions</td></tr><tr><td>Got questions about How Can a Website Improve Its User Experience? A Complete Guide? Find answers to the most common ones below.</td></tr></tbody></table>\n<ul><li>What is user experience (UX) on a website?</li></ul>\n<p>How do I improve my website's Core Web Vitals?</p>\n<p>Why is mobile-first design important for UX?</p>\n<p>What are common UX mistakes websites make?</p>\n<p>How often should a website's UX be reviewed?</p>\n<p>Does better UX actually improve SEO rankings?</p>",
  "faqs": [
    {
      "question": "What is user experience (UX) on a website?",
      "answer": "Website UX is the complete experience a visitor has while using a site, including its layout, content, speed, navigation, accessibility, search, forms, and overall ease of completing an intended action."
    },
    {
      "question": "How do I improve my website's Core Web Vitals?",
      "answer": "Optimize images, use WebP or AVIF, reduce render-blocking JavaScript, serve assets through a CDN, reduce bundle size, reserve space for media, and monitor pages regularly with Lighthouse or PageSpeed Insights."
    },
    {
      "question": "Why is mobile-first design important for UX?",
      "answer": "Mobile-first design prioritizes the smallest and most constrained screens, helping ensure readable text, touch-friendly controls, suitable keyboards, responsive navigation, and good performance for mobile visitors."
    },
    {
      "question": "What are common UX mistakes websites make?",
      "answer": "Common mistakes include slow pages, unclear navigation, poor mobile layouts, low color contrast, missing alt text, long text blocks, unnecessary form fields, vague errors, and forms that erase entered data after validation fails."
    },
    {
      "question": "How often should a website's UX be reviewed?",
      "answer": "Run performance checks monthly or after major changes, review Search Console experience reports quarterly, conduct user testing at least annually, and review UX before and after major redesigns or feature launches."
    },
    {
      "question": "Does better UX actually improve SEO rankings?",
      "answer": "Better UX can support SEO through stronger page performance, accessibility, mobile usability, clearer content structure, and improved Core Web Vitals, while also helping visitors stay engaged and complete desired actions."
    }
  ],
  "socialMediaLinks": [
    {
      "platform": "LinkedIn",
      "url": "https://www.linkedin.com/company/dummy-company"
    },
    {
      "platform": "X",
      "url": "https://x.com/dummyprofile"
    }
  ],
  "resourceLinks": [
    {
      "title": "Google PageSpeed Insights",
      "url": "https://pagespeed.web.dev/"
    },
    {
      "title": "Dummy UX Audit Resource",
      "url": "https://example.com/ux-audit"
    }
  ]
}`;
  const handleResourceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []) as File[];
    const availableSlots = Math.max(0, 10 - resourceFiles.length);
    const acceptedFiles = selectedFiles.slice(0, availableSlots);

    if (acceptedFiles.length < selectedFiles.length) {
      setError('A blog can contain at most 10 uploaded resource files.');
    }

    setResourceFiles(prev => [...prev, ...acceptedFiles]);
    setResourceSeo(prev => [
      ...prev,
      ...acceptedFiles.map(() => createMediaSeoDefaults()),
    ]);
    e.target.value = '';
  };

  const removeResourceFile = (index: number) => {
    setResourceFiles(prev => prev.filter((_, i) => i !== index));
    setResourceSeo(prev => prev.filter((_, i) => i !== index));
  };

  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...faqs];
    updated[index][field] = value;
    setFaqs(updated);
  };

  const addSocialMedia = () => {
    setSocialMediaLinks([...socialMediaLinks, { platform: '', url: '' }]);
  };

  const removeSocialMedia = (index: number) => {
    setSocialMediaLinks(socialMediaLinks.filter((_, i) => i !== index));
  };

  const updateSocialMedia = (index: number, field: keyof SocialMediaLink, value: string) => {
    const updated = [...socialMediaLinks];
    updated[index][field] = value;
    setSocialMediaLinks(updated);
  };

  const addResourceLink = () => {
    setResourceLinks([...resourceLinks, { title: '', url: '' }]);
  };

  const removeResourceLink = (index: number) => {
    setResourceLinks(resourceLinks.filter((_, i) => i !== index));
  };

  const updateResourceLink = (index: number, field: keyof ResourceLink, value: string) => {
    const updated = [...resourceLinks];
    updated[index][field] = value;
    setResourceLinks(updated);
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    
    const refMap: Record<string, React.RefObject<HTMLDivElement | null>> = {
      basic: basicRef,
      seo: seoRef,
      media: mediaRef,
      content: contentRef,
      links: linksRef,
      faq: faqRef,
    };

    const ref = refMap[sectionId];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  const scrollToField = (fieldName: string) => {
    const fieldMap: Record<string, React.RefObject<HTMLElement | null>> = {
      title: titleInputRef,
      slug: slugInputRef,
      category: categorySelectRef,
      description: descriptionTextareaRef,
    };

    const ref = fieldMap[fieldName];
    if (ref && ref.current) {
      ref.current.focus();
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      if (basicRef.current) {
        basicRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.slug.trim()) {
      errors.slug = 'Slug is required';
    } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(formData.slug)) {
      errors.slug = 'Slug must use lowercase letters, numbers, and single hyphens';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!formData.postedBy.trim()) {
      errors.postedBy = 'Posted By is required';
    }
    
    if (!formData.content.trim()) {
      errors.content = 'Content is required';
    } else if (formData.content.trim().length < 10) {
      errors.content = 'Content must be at least 10 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    setValidationErrors(errors);
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    const firstErrorField = Object.keys(errors)[0];

    if (firstErrorField) {
      scrollToField(firstErrorField);
      return;
    }

    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      console.log('🔄 Starting blog creation...');
      
      const formDataToSend = new FormData();

      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('slug', formData.slug.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('seoTitle', formData.seoTitle || '');
      formDataToSend.append('seoDescription', formData.seoDescription || '');
      formDataToSend.append('category', formData.category.trim()); // Sending slug
      formDataToSend.append('postedBy', formData.postedBy.trim());
      formDataToSend.append('status', formData.status);
      formDataToSend.append('content', formData.content);

      const keywords = formData.keywords
        .split(',')
        .map(keyword => keyword.trim())
        .filter(Boolean);

      const validFaqs = faqs
        .map(faq => ({
          question: faq.question.trim(),
          answer: faq.answer.trim(),
        }))
        .filter(faq => faq.question && faq.answer);

      const validSocialMediaLinks = socialMediaLinks
        .map(link => ({
          platform: link.platform.trim(),
          url: link.url.trim(),
        }))
        .filter(link => link.platform && link.url);

      const validResourceLinks = resourceLinks
        .map(link => ({
          title: link.title.trim(),
          url: link.url.trim(),
        }))
        .filter(link => link.title && link.url);

      formDataToSend.append('keyword', JSON.stringify(keywords));
      formDataToSend.append('faq', JSON.stringify(validFaqs));
      formDataToSend.append(
        'socialMediaLinks',
        JSON.stringify(validSocialMediaLinks),
      );
      formDataToSend.append(
        'resourceLinks',
        JSON.stringify(validResourceLinks),
      );

      if (bannerFile) {
        console.log('📸 Adding banner file:', bannerFile.name);
        formDataToSend.append('banner', bannerFile);
        formDataToSend.append('bannerSeo', JSON.stringify(bannerSeo));
      }

      formDataToSend.append('resourceSeo', JSON.stringify(resourceSeo));

      resourceFiles.forEach(file => {
        console.log('📁 Adding resource file:', file.name);
        formDataToSend.append('resources', file);
      });

      console.log('🚀 Sending request to create blog...');
      const result = await createBlog(formDataToSend);
      console.log('✅ Blog created successfully:', result);
      
      setResponse(result);
      
      setTimeout(() => {
        router.push('/dashboard/blog');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Error creating blog:', err);
      
      let errorMessage = err?.data?.message || err?.message || 'Failed to create blog. Please try again.';
      
      if (err?.data?.detail) {
        try {
          const details = JSON.parse(err.data.detail);
          if (Array.isArray(details) && details.length > 0) {
            const validationErrorsMap: Record<string, string> = {};
            details.forEach((detail: any) => {
              const field = detail.path?.join('.') || 'field';
              validationErrorsMap[field] = detail.message;
            });
            setValidationErrors(validationErrorsMap);
            errorMessage = 'Please fix the validation errors below.';
          }
        } catch (parseError) {
          errorMessage = err.data.detail || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'media', label: 'Media', icon: ImageIcon },
    { id: 'content', label: 'Content', icon: Layers },
    { id: 'links', label: 'Links & Social', icon: Link2 },
    { id: 'faq', label: 'FAQs', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/blog"
              className="p-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-blue-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="bg-blue-600 text-white p-2 rounded-xl">
                  <FileText className="w-6 h-6" />
                </span>
                Create New Blog Post
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">Fill in the details to create a new blog post</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={jsonImportInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleJsonImport}
              className="hidden"
            />
            <button id="dashboard-blog-add-import-json-button"
              type="button"
              onClick={() => jsonImportInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <Upload className="w-4 h-4" />
              Import JSON
            </button>
            <button id="dashboard-blog-add-paste-json-button"
              type="button"
              onClick={() => {
                setJsonPasteInput(exampleBlogJson);
                setShowJsonPasteImport(true);
                setJsonPasteError('');
                setJsonPasteSuccess(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              <FileText className="w-4 h-4" />
              Paste JSON
            </button>
            <button id="dashboard-blog-add-toggle-preview-button"
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>
            <button id="dashboard-blog-add-submit-button"
              type="submit"
              form="blog-form"
              disabled={loading || categoriesLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Publish Post
                </>
              )}
            </button>
          </div>
        </div>

        {/* Response/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700">Error</p>
              <p className="text-sm text-red-600 whitespace-pre-wrap">{error}</p>
            </div>
            <button id="dashboard-blog-add-dismiss-error-button"
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {response && !error && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">
                {response?.imported ? 'JSON Imported' : 'Success!'}
              </p>
              <p className="text-sm text-blue-600">
                {response?.imported
                  ? response.message
                  : 'Blog post created successfully. Redirecting...'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sticky top-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Sections</p>
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button id={`dashboard-blog-add-section-${section.id}-button`}
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span>{section.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto text-blue-400" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Section */}
              <div 
                ref={basicRef} 
                id="basic" 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
                    <p className="text-sm text-gray-500">Essential details about your blog post</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={titleInputRef}
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter blog post title"
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                        validationErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.title && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Slug <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={slugInputRef}
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleSlugChange}
                        placeholder="my-blog-post"
                        className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                          validationErrors.slug ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {!isSlugManuallyEdited && formData.title && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-blue-500">
                          Auto
                        </span>
                      )}
                    </div>
                    {validationErrors.slug ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.slug}</p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-1">
                        URL-friendly: lowercase, numbers, hyphens only
                        {!isSlugManuallyEdited && formData.title && (
                          <span className="text-blue-500 ml-1">(auto-generated from title)</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      ref={categorySelectRef}
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white ${
                        validationErrors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      disabled={categoriesLoading}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {validationErrors.category && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.category}</p>
                    )}
                    {categoriesLoading && (
                      <p className="text-xs text-gray-400 mt-1">Loading categories...</p>
                    )}
                    {categories.length === 0 && !categoriesLoading && (
                      <p className="text-xs text-amber-600 mt-1">
                        No categories available. Please create a category first.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Posted By <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="postedBy"
                        value={userLoading ? 'Loading...' : (formData.postedBy || '')}
                        onChange={handleInputChange}
                        placeholder="Author name"
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm ${
                          validationErrors.postedBy ? 'border-red-500' : 'border-gray-300'
                        } ${!userLoading ? 'bg-gray-50' : 'bg-gray-100'}`}
                        required
                        disabled={!userLoading}
                      />
                    </div>
                    {validationErrors.postedBy && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.postedBy}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {userInfo?.name ? `Auto-filled as: ${userInfo.name}` : 'Auto-filled from your account'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
                    >
                      <option value="draft">📝 Draft</option>
                      <option value="published">🚀 Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Keywords
                    </label>
                    <input
                      type="text"
                      name="keywords"
                      value={formData.keywords}
                      onChange={handleInputChange}
                      placeholder="technology, programming, web"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Comma separated</p>
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-400 ml-2">(minimum 10 characters)</span>
                  </label>
                  <textarea
                    ref={descriptionTextareaRef}
                    name="description"
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    rows={3}
                    placeholder="Brief description of your blog post (minimum 10 characters)"
                    className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none ${
                      validationErrors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.description && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>
                  )}
                  {formData.description && formData.description.length > 0 && formData.description.length < 10 && (
                    <p className="text-xs text-amber-500 mt-1">
                      {formData.description.length}/10 characters minimum
                    </p>
                  )}
                  {formData.description && formData.description.length >= 10 && (
                    <p className="text-xs text-blue-500 mt-1">
                      ✓ {formData.description.length} characters
                    </p>
                  )}
                </div>
              </div>

              {/* SEO Section */}
              <div 
                ref={seoRef} 
                id="seo" 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">SEO Settings</h2>
                    <p className="text-sm text-gray-500">Optimize your blog for search engines</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Title</label>
                    <input
                      type="text"
                      name="seoTitle"
                      value={formData.seoTitle}
                      onChange={handleInputChange}
                      placeholder="SEO optimized title"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
                    <textarea
                      name="seoDescription"
                      value={formData.seoDescription}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="SEO optimized description"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div 
                ref={mediaRef} 
                id="media" 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Media</h2>
                    <p className="text-sm text-gray-500">Upload banner and resource files</p>
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Banner Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner Image</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        bannerPreview ? 'border-blue-300 bg-blue-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/30'
                      }`}>
                        {bannerPreview ? (
                          <div className="relative">
                            <img src={bannerPreview} alt="Banner preview" className="max-h-48 mx-auto rounded-lg" />
                            <button id="dashboard-blog-add-banner-file-button"
                              type="button"
                              onClick={() => {
                                setBannerFile(null);
                                setBannerPreview(null);
                                setBannerSeo(createMediaSeoDefaults());
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="w-12 h-12 text-gray-300 mb-3" />
                            <p className="text-sm font-medium text-gray-600">Click to upload banner</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {bannerFile && (
                      <MediaSeoFields
                        value={bannerSeo}
                        onChange={setBannerSeo}
                        accent="blue"
                      />
                    )}
                  </div>

                  {/* Resource Files */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Resource Files</label>
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                        onChange={handleResourceFilesChange}
                        multiple
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                        <div className="flex flex-col items-center">
                          <Upload className="w-10 h-10 text-gray-300 mb-2" />
                          <p className="text-sm font-medium text-gray-600">Upload resources</p>
                          <p className="text-xs text-gray-400 mt-1">Images, videos, PDFs, documents (max 10 files)</p>
                        </div>
                      </div>
                    </div>

                    {resourceFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {resourceFiles.map((file, index) => (
                          <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex-shrink-0 rounded-lg bg-blue-100 p-2">
                                  <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <span className="truncate text-sm font-medium text-gray-700">{file.name}</span>
                                <span className="flex-shrink-0 text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                              <button id={`dashboard-blog-add-remove-resource-file-${index}-button`}
                                type="button"
                                onClick={() => removeResourceFile(index)}
                                className="flex-shrink-0 rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <MediaSeoFields
                              value={resourceSeo[index] ?? createMediaSeoDefaults()}
                              onChange={(next) =>
                                setResourceSeo((previous) =>
                                  previous.map((item, itemIndex) =>
                                    itemIndex === index ? next : item,
                                  ),
                                )
                              }
                              accent="blue"
                              compact
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div 
                ref={contentRef} 
                id="content" 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Layers className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Content</h2>
                    <p className="text-sm text-gray-500">Write your blog post content</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Content <span className="text-red-500">*</span>
                  </label>
                  {showPreview ? (
                    <ContentPreview html={formData.content} className="rounded-xl border border-gray-200 p-5" />
                  ) : (
                    <RichTextEditor
                      value={formData.content}
                      onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                      placeholder="Start writing your blog content..."
                    />
                  )}
                  {validationErrors.content && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.content}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">Use the visual editor, or switch to Source to paste raw HTML. Insert images via upload or URL. Toggle Preview to see the live layout.</p>
                </div>
              </div>

              {/* Links & Social Section */}
              <div 
                ref={linksRef} 
                id="links" 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <Link2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Links & Social</h2>
                    <p className="text-sm text-gray-500">Add social media and resource links</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Social Media Links */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700">Social Media Links</label>
                      <button id="dashboard-blog-add-add-button"
                        type="button"
                        onClick={addSocialMedia}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                    {socialMediaLinks.map((link, index) => (
                      <div key={index} className="flex gap-3 mb-3 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => updateSocialMedia(index, 'platform', e.target.value)}
                            placeholder="Platform (e.g., Twitter)"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                            placeholder="https://..."
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        {socialMediaLinks.length > 1 && (
                          <button id={`dashboard-blog-add-remove-social-media-${index}-button`}
                            type="button"
                            onClick={() => removeSocialMedia(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Resource Links */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="text-sm font-medium text-gray-700">Resource Links</label>
                      <button id="dashboard-blog-add-add-resource-link-button"
                        type="button"
                        onClick={addResourceLink}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    </div>
                    {resourceLinks.map((link, index) => (
                      <div key={index} className="flex gap-3 mb-3 items-start">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={link.title}
                            onChange={(e) => updateResourceLink(index, 'title', e.target.value)}
                            placeholder="Resource Title"
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => updateResourceLink(index, 'url', e.target.value)}
                            placeholder="https://..."
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        {resourceLinks.length > 1 && (
                          <button id={`dashboard-blog-add-remove-resource-link-${index}-button`}
                            type="button"
                            onClick={() => removeResourceLink(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div 
                ref={faqRef} 
                id="faq" 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 scroll-mt-20"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">FAQs</h2>
                    <p className="text-sm text-gray-500">Frequently asked questions about this blog</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                      <div className="flex gap-3">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            placeholder="Question"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                            rows={2}
                            placeholder="Answer"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
                          />
                        </div>
                        {faqs.length > 1 && (
                          <button id={`dashboard-blog-add-remove-faq-${index}-button`}
                            type="button"
                            onClick={() => removeFaq(index)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 h-fit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button id="dashboard-blog-add-add-faq-button"
                    type="button"
                    onClick={addFaq}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/30 transition-all text-sm font-medium text-gray-600 hover:text-blue-600"
                  >
                    + Add FAQ
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4">
                <Link
                  href="/dashboard/blog"
                  className="px-6 py-2.5 border border-gray-300 rounded-xl text-center hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                  Cancel
                </Link>
                <button id="dashboard-blog-add-publish-post-button"
                  type="submit"
                  disabled={loading || categoriesLoading}
                  className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing...
                    </span>
                  ) : (
                    'Publish Blog Post'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Paste JSON Import Modal */}
        {showJsonPasteImport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Import Blog from JSON</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Paste JSON below to autofill supported blog fields.
                  </p>
                </div>
                <button id="dashboard-blog-add-close-json-import-editor-button"
                  type="button"
                  onClick={() => {
                    setShowJsonPasteImport(false);
                    setJsonPasteInput('');
                    setJsonPasteError('');
                    setJsonPasteSuccess(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close JSON import editor"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Paste blog JSON
                  </label>
                  <textarea
                    value={jsonPasteInput}
                    onChange={(e) => {
                      setJsonPasteInput(e.target.value);
                      setJsonPasteError('');
                      setJsonPasteSuccess(false);
                    }}
                    rows={18}
                    spellCheck={false}
                    placeholder={`{
  "title": "Your blog title",
  "description": "Your blog description",
  "content": "<p>Your blog content</p>"
}`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-y"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800 mb-1">Supported fields</p>
                  <p className="text-xs text-blue-700">
                    title, slug, description, seoTitle, seoDescription, keywords, content,
                    faqs, socialMediaLinks, and resourceLinks.
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Category, status, postedBy, media, and file-upload fields are ignored.
                  </p>
                  <button id="dashboard-blog-add-load-example-json-button"
                    type="button"
                    onClick={() => {
                      setJsonPasteInput(exampleBlogJson);
                      setJsonPasteError('');
                      setJsonPasteSuccess(false);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Load example JSON
                  </button>
                </div>

                {jsonPasteError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{jsonPasteError}</p>
                  </div>
                )}

                {jsonPasteSuccess && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">Blog JSON imported successfully.</p>
                  </div>
                )}

                <div className="flex gap-3 justify-end pt-2 border-t border-gray-200">
                  <button id="dashboard-blog-add-cancel-button"
                    type="button"
                    onClick={() => {
                      setShowJsonPasteImport(false);
                      setJsonPasteInput('');
                      setJsonPasteError('');
                      setJsonPasteSuccess(false);
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button id="dashboard-blog-add-import-blog-json-button"
                    type="button"
                    onClick={handlePastedJsonImport}
                    disabled={!jsonPasteInput.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    Import Blog JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
