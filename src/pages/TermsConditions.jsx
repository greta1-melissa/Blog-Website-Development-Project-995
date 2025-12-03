import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiFileText } = FiIcons;

const TermsConditions = () => {
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
            <SafeIcon icon={FiFileText} className="text-3xl text-purple-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 font-serif">Terms and Conditions</h1>
          <p className="text-sm text-gray-500">Last updated: 3 December 2025</p>
        </div>

        <div className="prose prose-purple max-w-none text-gray-700 space-y-6">
          <p className="lead">
            Welcome to BangtanMom.com. These Terms govern your use of this website. By using the site, you agree to these Terms; if not, you should stop using the site immediately.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. About This Site</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>BangtanMom.com is a personal blog sharing stories and reflections about motherhood, work-from-home life, BTS, K-dramas, mental health, and related topics.</li>
              <li>Content is for informational and personal expression only and is not professional, medical, legal, or financial advice.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Use of the Site</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Users agree to use the site only for lawful purposes.</li>
              <li>They must not attempt to damage, hack, or disrupt the website.</li>
              <li>They agree to respect the site owner and other visitors at all times.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Comments and User-Generated Content</h2>
            <p className="mb-2">
              Visitors may post comments or other User Content where allowed. They are responsible for what they share and must always consider mutual respect and kindness.
            </p>
            <h4 className="font-bold text-red-800 mb-2">Not Allowed:</h4>
            <ul className="list-disc pl-5 space-y-2 mb-4">
              <li>Bullying, shaming, harassment</li>
              <li>Hate speech or discrimination</li>
              <li>Threats or abusive language</li>
              <li>Harmful or malicious content</li>
              <li>Spam, misleading promotions, or disruptive behavior</li>
            </ul>
            <p className="mb-2"><strong>Moderation Policy:</strong> This site is meant to be a safe space. Disagreements are okay; disrespect and harm are not.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>As the site owner, I reserve the right, at my sole discretion, to edit, hide, or delete any comment or post that I personally deem inappropriate, harmful, or not aligned with this community.</li>
              <li>I may block or restrict users who repeatedly violate these guidelines.</li>
              <li>I am not obligated to explain moderation decisions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Intellectual Property</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Unless otherwise stated, content (text, images created by the site owner, design) is owned by the site owner or used with permission.</li>
              <li>Visitors may share links or short quotes with proper credit and a link back.</li>
              <li>They may not copy entire posts, claim content as their own, or use it commercially without written consent.</li>
            </ul>
            <p className="mt-2 text-sm text-gray-500">Copyright concerns can be emailed to <a href="mailto:contact@bangtanmom.com" className="text-purple-600 hover:underline">contact@bangtanmom.com</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. External Links</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>The site may contain links to external websites.</li>
              <li>BangtanMom.com is not responsible for the content, policies, or practices of any third-party site.</li>
              <li>Use of external sites is at the visitor’s own risk.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Disclaimer</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>All content is provided “as is” and reflects personal opinions at the time of writing.</li>
              <li>No guarantees are made that information is complete, current, or error-free.</li>
              <li>We do not guarantee that the site will always be available without interruption.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, BangtanMom.com and the site owner are not liable for any direct, indirect, incidental, or consequential damages resulting from use of the site, reliance on content, or interactions with other users or third-party sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to These Terms</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We may update these Terms from time to time.</li>
              <li>Changes will be posted on this page with an updated date.</li>
              <li>Continued use of the site after changes means acceptance of the revised Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
            <p>
              If you have questions about these Terms and Conditions or our community guidelines, please email <a href="mailto:contact@bangtanmom.com" className="text-purple-600 hover:underline">contact@bangtanmom.com</a>.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default TermsConditions;