'use client';

import { useState } from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

export function FAQAccordionClient({
  items,
}: {
  items: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {items.map((faq, i) => (
        <div key={i} className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full px-6 py-4 text-left flex items-center justify-between"
          >
            <span className="font-semibold">{faq.question}</span>
            <svg
              className={`w-5 h-5 transition-transform ${openIndex === i ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openIndex === i && (
            <div className="px-6 pb-4 text-gray-600">{faq.answer}</div>
          )}
        </div>
      ))}
    </div>
  );
}
