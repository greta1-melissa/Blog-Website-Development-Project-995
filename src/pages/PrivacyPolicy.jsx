import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiLock } = FiIcons;

const PrivacyPolicy = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-purple-50 p-8 md:p-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiLock} className="text-3xl text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-serif">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: 3 December 2025</p>
        </div>

        <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
          <p className="lead">
            BangtanMom.com (“we”, “us”, or “our”) is a personal blog. This Privacy Policy explains how we collect, use, and protect your information when you visit this website. By using the site, you agree to this policy.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Information you provide directly:</strong> Name or display name, email address, comment content, contact form messages, newsletter sign-ups if any.</li>
              <li><strong>Information collected automatically:</strong> IP address, browser type, device type, pages visited, time spent, referring site.</li>
              <li><strong>Cookies and similar technologies:</strong> Used to help the site function, remember preferences, and understand usage. You can control cookies in your browser settings, but some features may not work without them.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To operate and maintain the website</li>
              <li>To respond to inquiries and messages</li>
              <li>To display comments and interactions</li>
              <li>To monitor and improve the site and content</li>
              <li>To protect the site against spam, abuse, or malicious activity</li>
            </ul>
            <p className="mt-2 font-medium text-purple-800">We do not sell or rent your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Third-Party Services</h2>
            <p>
              The site may use analytics tools, spam filters, and embedded content (e.g., YouTube, social media). These services may collect data under their own privacy policies, and once visitors interact with them, their terms apply.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Comments and Public Content</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Comments may display name, comment text, and date/time publicly.</li>
              <li>Please do not share sensitive personal information in comments.</li>
              <li>We may moderate or delete comments that violate community guidelines.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Personal information is retained only as long as necessary for the purposes in this policy or as required by law.</li>
              <li>Comments and messages may be kept for record-keeping, moderation, and security.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Children’s Privacy</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>The blog is not specifically directed at children under 13.</li>
              <li>We do not knowingly collect personal information from children under 13.</li>
              <li>If someone believes a child’s information was provided, they can contact us to remove it.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your Choices and Rights</h2>
            <p>
              Depending on location, visitors may request access, correction, or deletion of their personal data, or object to certain processing.
              <br />
              Please contact us at <a href="mailto:contact@bangtanmom.com" className="text-purple-600 hover:underline">contact@bangtanmom.com</a> for requests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Security</h2>
            <p>
              We use reasonable measures to protect personal data, but no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this policy from time to time, and changes will be posted on this page with an updated date. Continued use of the site means acceptance of the changes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>
              If you have questions about this Privacy Policy, please email us at <a href="mailto:contact@bangtanmom.com" className="text-purple-600 hover:underline">contact@bangtanmom.com</a>.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;