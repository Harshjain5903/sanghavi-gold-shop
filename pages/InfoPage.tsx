import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { SHOP_INFO } from '../constants';
import { useRates } from '../context/RatesContext';
import { formatRateByUnit, hasAnyRate } from '../lib/pricing';
import { usePageTitle } from '../lib/usePageTitle';
import NotFoundPage from './NotFoundPage';

// NOTE FOR THE SHOP OWNER: these texts describe how the shop works today
// (browse online, buy in store or confirm on WhatsApp). Review them, and have
// them checked before enabling online payments.
const LAST_UPDATED = '17 October 2026';

interface Section {
  heading?: string;
  body: React.ReactNode;
}

interface InfoContent {
  title: string;
  sections: Section[];
}

const contactLine = (
  <>
    {SHOP_INFO.name}, {SHOP_INFO.address}. Phone / WhatsApp: {SHOP_INFO.phone}. Email: {SHOP_INFO.email}.
  </>
);

const PAGES: Record<string, InfoContent> = {
  privacy: {
    title: 'Privacy Policy',
    sections: [
      {
        body: `This policy explains what personal information ${SHOP_INFO.name} collects through this website, why, and the choices you have.`,
      },
      {
        heading: 'What we collect',
        body: (
          <ul className="list-disc pl-5 space-y-1">
            <li>When you create an account: your name, email address and, if you give it, your mobile number.</li>
            <li>Your bag and wishlist, stored in your own browser on this device.</li>
            <li>Messages you choose to send us on WhatsApp, phone or email.</li>
          </ul>
        ),
      },
      {
        heading: 'How we use it',
        body: 'To manage your account, answer your enquiries, arrange video calls, and process purchases you ask us for. We do not sell your personal information.',
      },
      {
        heading: 'Who processes it for us',
        body: 'Sign-in is provided by Google Firebase. Our website and its data are hosted by Vercel, Render, Neon and Cloudinary. These providers process data only to run the website for us.',
      },
      {
        heading: 'Your choices',
        body: (
          <>
            You can update your name and mobile number on the My Account page. To get a copy of your data or to have your account
            deleted, contact us using the details below and we will act on it within 30 days.
          </>
        ),
      },
      { heading: 'Contact', body: contactLine },
    ],
  },
  terms: {
    title: 'Terms of Use',
    sections: [
      {
        body: `By using this website you agree to these terms. The website shows the jewellery available at ${SHOP_INFO.name} and lets you send enquiries.`,
      },
      {
        heading: 'Prices',
        body: 'Prices shown are calculated from that day’s metal rate, the item’s weight, making charges and 3% GST, and change when the metal rate changes. The final price is the one confirmed at the time of purchase. Items marked "Price on Request" are priced individually.',
      },
      {
        heading: 'Product details',
        body: 'We describe weight, purity and stones as accurately as we can. Photos may differ slightly from the actual piece in colour or size. Hallmark and certificate details are confirmed at purchase.',
      },
      {
        heading: 'Orders',
        body: 'Purchases are currently completed in our store or confirmed with us directly on WhatsApp or phone. Adding an item to your bag does not reserve it.',
      },
      { heading: 'Contact', body: contactLine },
    ],
  },
  returns: {
    title: 'Returns & Exchange',
    sections: [
      {
        body: 'Return, exchange and buyback terms depend on the item (gold, silver, diamond or custom-made) and are explained to you and written on your invoice at the time of purchase.',
      },
      {
        heading: 'How to ask for a return or exchange',
        body: 'Bring the item with its invoice and certificate to our store, or message us on WhatsApp with your invoice number. We will tell you the options for your item.',
      },
      { heading: 'Contact', body: contactLine },
    ],
  },
  shipping: {
    title: 'Delivery',
    sections: [
      {
        body: 'Most customers collect their jewellery from our store. If you need delivery, send us your pincode on WhatsApp from the product page and we will confirm whether we can deliver, how, and the expected timing before you pay.',
      },
      { heading: 'Contact', body: contactLine },
    ],
  },
  contact: {
    title: 'Contact Us',
    sections: [
      { heading: 'Visit the store', body: SHOP_INFO.address },
      { heading: 'Phone / WhatsApp', body: SHOP_INFO.phone },
      { heading: 'Email', body: SHOP_INFO.email },
    ],
  },
};

const RatesContent: React.FC = () => {
  const { rates, loading } = useRates();
  if (loading) return <p className="text-gray-500">Loading today’s rates…</p>;
  if (!hasAnyRate(rates)) return <p className="text-gray-600">Today’s rates haven’t been published yet. Message us on WhatsApp for the current rate.</p>;
  const rows: [string, number, '1g' | '10g' | '100g' | '1kg'][] = [
    ['Gold 24K (999)', rates.gold24k, rates.goldDisplayUnit || '10g'],
    ['Gold 22K (916)', rates.gold22k, rates.goldDisplayUnit || '10g'],
    ['Gold 18K (750)', rates.gold18k, rates.goldDisplayUnit || '10g'],
    ['Silver', rates.silver, rates.silverDisplayUnit || '1kg'],
  ];
  return (
    <>
      <dl className="grid grid-cols-[1fr_auto] gap-y-3 gap-x-8 tabular-nums">
        {rows.map(([label, perGram, unit]) => (
          <React.Fragment key={label}>
            <dt className="text-gray-600">{label}</dt>
            <dd className="font-bold text-right">{formatRateByUnit(perGram, unit)}</dd>
          </React.Fragment>
        ))}
      </dl>
      {rates.updatedAt && <p className="text-xs text-gray-500 mt-4">Updated {new Date(rates.updatedAt).toLocaleString('en-IN')}</p>}
    </>
  );
};

/** Simple text pages: policies, contact and today's metal rates. */
const InfoPage: React.FC = () => {
  const { slug = '' } = useParams<{ slug: string }>();
  const page = slug === 'gold-rate' ? { title: 'Today’s Gold & Silver Rates', sections: [] } : PAGES[slug];
  usePageTitle(page?.title);
  if (!page) return <NotFoundPage />;

  return (
    <div className="bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-xs text-gray-500 mb-2">
          <Link to="/" className="hover:underline">Home</Link> / {page.title}
        </p>
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">{page.title}</h1>
        <div className="space-y-6 text-gray-700 leading-relaxed">
          {slug === 'gold-rate' && <RatesContent />}
          {page.sections.map((section, idx) => (
            <section key={idx}>
              {section.heading && <h2 className="text-lg font-bold text-gray-900 mb-2 font-sans">{section.heading}</h2>}
              <div>{section.body}</div>
            </section>
          ))}
        </div>
        {slug !== 'gold-rate' && slug !== 'contact' && <p className="text-xs text-gray-400 mt-10">Last updated {LAST_UPDATED}</p>}
      </div>
    </div>
  );
};

export default InfoPage;
