
import React from 'react';

export const RefrigeratorIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M7 2H17C18.1 2 19 2.9 19 4V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V4C5 2.9 5.9 2 7 2ZM8 4V9H16V4H8ZM8 11V13H10V11H8Z" />
  </svg>
);

export const WasherIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 4V10H6V4H18ZM12 19C9.79 19 8 17.21 8 15C8 12.79 9.79 11 12 11C14.21 11 16 12.79 16 15C16 17.21 14.21 19 12 19ZM7 5H8V7H7V5ZM10 5H11V7H10V5ZM13 5H14V7H13V5Z" />
  </svg>
);

export const OvenIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6H3ZM9 12C9 10.9 9.9 10 11 10H13C14.1 10 15 10.9 15 12V16H9V12ZM21 4H3C2.45 4 2 3.55 2 3V2H22V3C22 3.55 21.55 4 21 4Z" />
  </svg>
);

export const AirConditionerIcon: React.FC<{ className?: string }> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M21 3H3C2.45 3 2 3.45 2 4V13C2 13.55 2.45 14 3 14H21C21.55 14 22 13.55 22 13V4C22 3.45 21.55 3 21 3ZM12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6S15 7.34 15 9C15 10.66 13.66 12 12 12ZM4 16H20V18H4V16ZM5 19H19V21H5V19Z" />
  </svg>
);

export const TvIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>
    </svg>
);

export const MicrowaveIcon: React.FC<{ className?: string }> = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-1 12H5V7h14v9zM8 12h6v2H8v-2zm-3-3h2v2H5v-2zm-1-1h1v1H4v-1z"/>
    </svg>
);
