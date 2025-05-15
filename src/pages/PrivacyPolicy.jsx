import React, {useEffect} from "react";

const PrivacyPolicy = () => {
      useEffect(()=>{
        document.title = 'Privacy Policy - Praco';
      }, [])
    
  return (
    <div className="centered-layout padding-m column-content gap-m">
      <h2 className="dark">Privacy Policy</h2>

      <div className="column-content gap-m">
        <p className="b2 clr-text">
          This Privacy Policy describes how{" "}
          <a href="https://praco.co.uk/" className="b2 clr-primary">https://praco.co.uk/</a>{" "}
          (the “Site” or “we”) collects, uses, and discloses your Personal Information when you visit or make a purchase from the Site.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Collecting Personal Information</h5>
        <p className="b2 clr-text">
          When you visit the Site, we collect certain information about your device, your interaction with the Site, and information necessary to process your purchases. We may also collect additional information if you contact us for customer support. In this Privacy Policy, we refer to any information that can uniquely identify an individual (including the information below) as “Personal Information”. See the list below for more information about what Personal Information we collect and why.
        </p>

        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>Device information</strong>
          </p>
          <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
            <li className="b2 clr-text">
              <strong>Examples of Personal Information collected:</strong> version of web browser, IP address, time zone, cookie information, what sites or products you view, search terms, and how you interact with the Site.
            </li>
            <li className="b2 clr-text">
              <strong>Purpose of collection:</strong> to load the Site accurately for you, and to perform analytics on Site usage to optimize our Site.
            </li>
            <li className="b2 clr-text">
              <strong>Source of collection:</strong> Collected automatically when you access our Site using cookies, log files, web beacons, tags, or pixels {/* [ADD OR SUBTRACT ANY OTHER TRACKING TECHNOLOGIES USED] */}.
            </li>
            <li className="b2 clr-text">
              <strong>Disclosure for a business purpose:</strong> shared with our processor Shopify {/* [ADD ANY OTHER VENDORS WITH WHOM YOU SHARE THIS INFORMATION] */}.
            </li>
          </ul>
        </div>

        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>Order information</strong>
          </p>
          <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
            <li className="b2 clr-text">
              <strong>Examples of Personal Information collected:</strong> name, billing address, shipping address, payment information (including credit card numbers {/* [INSERT ANY OTHER PAYMENT TYPES ACCEPTED] */}), email address, and phone number.
            </li>
            <li className="b2 clr-text">
              <strong>Purpose of collection:</strong> to provide products or services to you to fulfill our contract, to process your payment information, arrange for shipping, and provide you with invoices and/or order confirmations, communicate with you, screen our orders for potential risk or fraud, and when in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.
            </li>
            <li className="b2 clr-text">
              <strong>Source of collection:</strong> collected from you.
            </li>
            <li className="b2 clr-text">
              <strong>Disclosure for a business purpose:</strong> shared with our processor Shopify {/* [ADD ANY OTHER VENDORS WITH WHOM YOU SHARE THIS INFORMATION. FOR EXAMPLE, SALES CHANNELS, PAYMENT GATEWAYS, SHIPPING AND FULFILLMENT APPS] */}.
            </li>
          </ul>
        </div>

        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>Customer support information</strong>
          </p>
          <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
            <li className="b2 clr-text">
              <strong>Examples of Personal Information collected:</strong> {/* [MODIFICATIONS TO THE INFORMATION LISTED ABOVE OR ADDITIONAL INFORMATION AS NEEDED] */} name, email address, phone number, and order details.
            </li>
            <li className="b2 clr-text">
              <strong>Purpose of collection:</strong> to provide customer support.
            </li>
            <li className="b2 clr-text">
              <strong>Source of collection:</strong> collected from you.
            </li>
            <li className="b2 clr-text">
              <strong>Disclosure for a business purpose:</strong> {/* [ADD ANY VENDORS USED TO PROVIDE CUSTOMER SUPPORT] */} none.
            </li>
          </ul>
        </div>

        {/* [INSERT ANY OTHER INFORMATION YOU COLLECT: OFFLINE DATA, PURCHASED MARKETING DATA/LISTS] */}
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Minors</h5>
        <p className="b2 clr-text">
          The Site is not intended for individuals under the age of 16. We do not intentionally collect Personal Information from children. If you are the parent or guardian and believe your child has provided us with Personal Information, please contact us at the address below to request deletion.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Sharing Personal Information</h5>
        <p className="b2 clr-text">
          We share your Personal Information with service providers to help us provide our services and fulfill our contracts with you, as described above. For example:
        </p>
        <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
          <li className="b2 clr-text">
            We use Shopify to power our online store. You can read more about how Shopify uses your Personal Information here:{" "}
            <a href="https://www.shopify.com/legal/privacy" className="b2 clr-primary">https://www.shopify.com/legal/privacy</a>.
          </li>
          <li className="b2 clr-text">
            We may share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
          </li>
          {/* [INSERT INFORMATION ABOUT OTHER SERVICE PROVIDERS] */}
        </ul>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Behavioural Advertising</h5>
        <p className="b2 clr-text">
          As described above, we use your Personal Information to provide you with targeted advertisements or marketing communications we believe may be of interest to you. For example:
        </p>
        <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
          {/* [INSERT IF APPLICABLE] We use Google Analytics to help us understand how our customers use the Site. You can read more about how Google uses your Personal Information here: https://policies.google.com/privacy?hl=en. You can also opt-out of Google Analytics here: https://tools.google.com/dlpage/gaoptout. */}
          {/* [INSERT IF YOU USE A THIRD PARTY MARKETING APP THAT COLLECTS INFORMATION ABOUT BUYER ACTIVITY ON YOUR SITE] We share information about your use of the Site, your purchases, and your interaction with our ads on other websites with our advertising partners. We collect and share some of this information directly with our advertising partners, and in some cases through the use of cookies or other similar technologies (which you may consent to, depending on your location). */}
          {/* [INSERT OTHER ADVERTISING SERVICES USED] */}
          <li className="b2 clr-text">
            No additional advertising services are currently used.
          </li>
        </ul>
        <p className="b2 clr-text">
          For more information about how targeted advertising works, you can visit the Network Advertising Initiative’s (“NAI”) educational page at{" "}
          <a href="http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work" className="b2 clr-primary">http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work</a>.
        </p>
        <p className="b2 clr-text">
          You can opt out of targeted advertising by visiting the Digital Advertising Alliance’s opt-out portal at:{" "}
          <a href="http://optout.aboutads.info/" className="b2 clr-primary">http://optout.aboutads.info/</a>.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Using Personal Information</h5>
        <p className="b2 clr-text">
          We use your Personal Information to provide our services to you, which includes: offering products for sale, processing payments, shipping and fulfillment of your order, and keeping you up to date on new products, services, and offers.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Lawful Basis</h5>
        <p className="b2 clr-text">
          Pursuant to the General Data Protection Regulation (“GDPR”), if you are a resident of the European Economic Area (“EEA”), we process your personal information under the following lawful bases:
        </p>
        <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
          <li className="b2 clr-text">Your consent;</li>
          <li className="b2 clr-text">The performance of the contract between you and the Site;</li>
          <li className="b2 clr-text">Compliance with our legal obligations;</li>
          <li className="b2 clr-text">To protect your vital interests;</li>
          <li className="b2 clr-text">To perform a task carried out in the public interest;</li>
          <li className="b2 clr-text">For our legitimate interests, which do not override your fundamental rights and freedoms.</li>
        </ul>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Retention</h5>
        <p className="b2 clr-text">
          When you place an order through the Site, we will retain your Personal Information for our records unless and until you ask us to erase this information. For more information on your right of erasure, please see the ‘Your Rights’ section below.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Automatic Decision-Making</h5>
        <p className="b2 clr-text">
          If you are a resident of the EEA, you have the right to object to processing based solely on automated decision-making (which includes profiling), when that decision-making has a legal effect on you or otherwise significantly affects you.
        </p>
        <p className="b2 clr-text">
          We do not engage in fully automated decision-making that has a legal or otherwise significant effect using customer data.
        </p>
        <p className="b2 clr-text">
          Our processor Shopify uses limited automated decision-making to prevent fraud that does not have a legal or otherwise significant effect on you.
        </p>
        <p className="b2 clr-text">
          Services that include elements of automated decision-making include:
        </p>
        <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
          <li className="b2 clr-text">Temporary denylist of IP addresses associated with repeated failed transactions. This denylist persists for a small number of hours.</li>
          <li className="b2 clr-text">Temporary denylist of credit cards associated with denylisted IP addresses. This denylist persists for a small number of days.</li>
        </ul>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Your Rights</h5>
        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>GDPR</strong>
          </p>
          <p className="b2 clr-text">
            If you are a resident of the EEA, you have the right to access the Personal Information we hold about you, to port it to a new service, and to ask that your Personal Information be corrected, updated, or erased. If you would like to exercise these rights, please contact us through the contact information below.
          </p>
          <p className="b2 clr-text">
            Your Personal Information will be initially processed in Ireland and then will be transferred outside of Europe for storage and further processing, including to Canada and the United States. For more information on how data transfers comply with the GDPR, see Shopify’s GDPR Whitepaper:{" "}
            <a href="https://help.shopify.com/en/manual/your-account/privacy/GDPR" className="b2 clr-primary">https://help.shopify.com/en/manual/your-account/privacy/GDPR</a>.
          </p>
        </div>

        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>CCPA</strong>
          </p>
          <p className="b2 clr-text">
            If you are a resident of California, you have the right to access the Personal Information we hold about you (also known as the ‘Right to Know’), to port it to a new service, and to ask that your Personal Information be corrected, updated, or erased. If you would like to exercise these rights, please contact us through the contact information below.
          </p>
          <p className="b2 clr-text">
            If you would like to designate an authorized agent to submit these requests on your behalf, please contact us at the address below.
          </p>
        </div>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Cookies</h5>
        <p className="b2 clr-text">
          A cookie is a small amount of information that’s downloaded to your computer or device when you visit our Site. We use a number of different cookies, including functional, performance, advertising, and social media or content cookies. Cookies make your browsing experience better by allowing the website to remember your actions and preferences (such as login and region selection). This means you don’t have to re-enter this information each time you return to the site or browse from one page to another. Cookies also provide information on how people use the website, for instance whether it’s their first time visiting or if they are a frequent visitor.
        </p>
        <p className="b2 clr-text">
          We use the following cookies to optimize your experience on our Site and to provide our services.
        </p>

        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>Cookies Necessary for the Functioning of the Store</strong>
          </p>
          <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
            <li className="b2 clr-text"><strong>_ab:</strong> Used in connection with access to admin.</li>
            <li className="b2 clr-text"><strong>_secure_session_id:</strong> Used in connection with navigation through a storefront.</li>
            <li className="b2 clr-text"><strong>cart:</strong> Used in connection with shopping cart.</li>
            <li className="b2 clr-text"><strong>cart_sig:</strong> Used in connection with checkout.</li>
            <li className="b2 clr-text"><strong>cart_ts:</strong> Used in connection with checkout.</li>
            <li className="b2 clr-text"><strong>checkout_token:</strong> Used in connection with checkout.</li>
            <li className="b2 clr-text"><strong>secret:</strong> Used in connection with checkout.</li>
            <li className="b2 clr-text"><strong>secure_customer_sig:</strong> Used in connection with customer login.</li>
            <li className="b2 clr-text"><strong>storefront_digest:</strong> Used in connection with customer login.</li>
            <li className="b2 clr-text"><strong>_shopify_u:</strong> Used to facilitate updating customer account information.</li>
          </ul>
        </div>

        <div className="column-content gap-s">
          <p className="b3 clr-text">
            <strong>Reporting and Analytics</strong>
          </p>
          <ul className="column-content gap-xs" style={{ paddingLeft: "var(--padding-s)" }}>
            <li className="b2 clr-text"><strong>_tracking_consent:</strong> Tracking preferences.</li>
            <li className="b2 clr-text"><strong>_landing_page:</strong> Track landing pages.</li>
            <li className="b2 clr-text"><strong>_orig_referrer:</strong> Track landing pages.</li>
            <li className="b2 clr-text"><strong>_s:</strong> Shopify analytics.</li>
            <li className="b2 clr-text"><strong>_shopify_fs:</strong> Shopify analytics.</li>
            <li className="b2 clr-text"><strong>_shopify_s:</strong> Shopify analytics.</li>
            <li className="b2 clr-text"><strong>_shopify_sa_p:</strong> Shopify analytics relating to marketing & referrals.</li>
            <li className="b2 clr-text"><strong>_shopify_sa_t:</strong> Shopify analytics relating to marketing & referrals.</li>
            <li className="b2 clr-text"><strong>_shopify_y:</strong> Shopify analytics.</li>
            <li className="b2 clr-text"><strong>_y:</strong> Shopify analytics.</li>
            {/* [INSERT OTHER COOKIES OR TRACKING TECHNOLOGIES THAT YOU USE] */}
          </ul>
        </div>

        <p className="b2 clr-text">
          The length of time that a cookie remains on your computer or mobile device depends on whether it is a “persistent” or “session” cookie. Session cookies last until you stop browsing and persistent cookies last until they expire or are deleted. Most of the cookies we use are persistent and will expire between 30 minutes and two years from the date they are downloaded to your device.
        </p>
        <p className="b2 clr-text">
          You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies can negatively impact your user experience and parts of our website may no longer be fully accessible.
        </p>
        <p className="b2 clr-text">
          Most browsers automatically accept cookies, but you can choose whether or not to accept cookies through your browser controls, often found in your browser’s “Tools” or “Preferences” menu. For more information on how to modify your browser settings or how to block, manage or filter cookies can be found in your browser’s help file or through such sites as{" "}
          <a href="http://www.allaboutcookies.org" className="b2 clr-primary">www.allaboutcookies.org</a>.
        </p>
        <p className="b2 clr-text">
          Additionally, please note that blocking cookies may not completely prevent how we share information with third parties such as our advertising partners. To exercise your rights or opt-out of certain uses of your information by these parties, please follow the instructions in the “Behavioural Advertising” section above.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Do Not Track</h5>
        <p className="b2 clr-text">
          Please note that because there is no consistent industry understanding of how to respond to “Do Not Track” signals, we do not alter our data collection and usage practices when we detect such a signal from your browser.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Changes</h5>
        <p className="b2 clr-text">
          We may update this Privacy Policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal, or regulatory reasons.
        </p>
      </div>

      <div className="column-content gap-m">
        <h5 className="dark">Contact</h5>
        <p className="b2 clr-text">
          For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail at{" "}
          <a href="mailto:info@repark.co.uk" className="b2 clr-primary">info@repark.co.uk</a>{" "}
          or by mail using the details provided below:
        </p>
        <p className="b2 clr-text">
          Repark Ltd, 15 Parker Drive, Leicester, LE4 0JP
        </p>
        <p className="b2 clr-text">
          Last updated: {/* [DATE] */} Not specified
        </p>
        <p className="b2 clr-text">
          If you are not satisfied with our response to your complaint, you have the right to lodge your complaint with the relevant data protection authority. You can contact our supervisory authority here:{" "}
          <a href="https://ico.org.uk/make-a-complaint/" className="b2 clr-primary">https://ico.org.uk/make-a-complaint/</a>.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;