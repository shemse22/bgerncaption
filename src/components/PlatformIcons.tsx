import React from 'react';

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="6" fill="#000000" />
    <path
      d="M17.5 7.2a4.2 4.2 0 0 1-3.2-3.6V3.2h-2.8v11.2a2.3 2.3 0 0 1-4.2 1.4 2.3 2.3 0 0 1 2.5-3.6V9.4a5.1 5.1 0 0 0-5.8 5 5.1 5.1 0 0 0 5.1 5.1 5.1 5.1 0 0 0 5.1-5.1V8.8a6.6 6.6 0 0 0 3.8 1.2V7.3a4.2 4.2 0 0 1-.5-.1z"
      fill="#25F4EE"
      transform="translate(-0.8, -0.6)"
    />
    <path
      d="M17.5 7.2a4.2 4.2 0 0 1-3.2-3.6V3.2h-2.8v11.2a2.3 2.3 0 0 1-4.2 1.4 2.3 2.3 0 0 1 2.5-3.6V9.4a5.1 5.1 0 0 0-5.8 5 5.1 5.1 0 0 0 5.1 5.1 5.1 5.1 0 0 0 5.1-5.1V8.8a6.6 6.6 0 0 0 3.8 1.2V7.3a4.2 4.2 0 0 1-.5-.1z"
      fill="#FE2C55"
      transform="translate(0.8, 0.6)"
    />
    <path
      d="M17.5 7.2a4.2 4.2 0 0 1-3.2-3.6V3.2h-2.8v11.2a2.3 2.3 0 0 1-4.2 1.4 2.3 2.3 0 0 1 2.5-3.6V9.4a5.1 5.1 0 0 0-5.8 5 5.1 5.1 0 0 0 5.1 5.1 5.1 5.1 0 0 0 5.1-5.1V8.8a6.6 6.6 0 0 0 3.8 1.2V7.3a4.2 4.2 0 0 1-.5-.1z"
      fill="#FFFFFF"
    />
  </svg>
);

export const YouTubeShortsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path
      d="M14.9 9.5a2.5 2.5 0 0 0-3.3-1.3l-.8.4 1 .5a1.6 1.6 0 0 1 .8 2.1 1.6 1.6 0 0 1-2.1.8l-2.2-.9a2.5 2.5 0 0 0-1.5 3.3 2.5 2.5 0 0 0 3.3 1.3l4.3-1.8a2.5 2.5 0 0 0 1.5-3.3l-1-1.1z"
      fill="#FFFFFF"
      opacity="0.35"
    />
    <path d="M10 8.5v7l5.5-3.5L10 8.5z" fill="#FFFFFF" />
  </svg>
);

export const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className}>
    <defs>
      <linearGradient id="igBrandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#igBrandGrad)" />
    <rect x="5.5" y="5.5" width="13" height="13" rx="3.8" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3.2" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="15.8" cy="8.2" r="0.8" fill="#FFFFFF" />
  </svg>
);

export const ReelsIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <defs>
      <linearGradient id="reelsBrandGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <rect width="24" height="24" rx="6" fill="url(#reelsBrandGrad)" />
    <path d="M7 6.8h10a2.2 2.2 0 0 1 2.2 2.2v6a2.2 2.2 0 0 1-2.2 2.2H7A2.2 2.2 0 0 1 4.8 15V9A2.2 2.2 0 0 1 7 6.8z" stroke="#FFFFFF" strokeWidth="1.5" />
    <path d="M4.8 10.5h14.4" stroke="#FFFFFF" strokeWidth="1.4" />
    <path d="M8.5 6.8l2 3.7" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M13.5 6.8l2 3.7" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" />
    <path d="M10.8 12.2l3.4 1.8-3.4 1.8v-3.6z" fill="#FFFFFF" />
  </svg>
);

export const FacebookIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2" />
    <path d="M15.1 12.5l.5-3.5h-3.4V6.8c0-1 .5-1.9 2-1.9h1.5V1.9a18.7 18.7 0 0 0-2.7-.2c-2.8 0-4.6 1.7-4.6 4.7v2.7H5.4v3.5h3v8.9c.6.1 1.2.1 1.9.1s1.3 0 1.9-.1v-8.9h2.9z" fill="#FFFFFF" />
  </svg>
);

export const YouTubeIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <rect width="24" height="24" rx="6" fill="#FF0000" />
    <path d="M10 8.5v7l5.5-3.5L10 8.5z" fill="#FFFFFF" />
  </svg>
);

