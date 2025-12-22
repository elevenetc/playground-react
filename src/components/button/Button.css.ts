import { style } from '@vanilla-extract/css';

export const button = style({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.25rem',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#ef4444',
  },
  selectors: {
    '&:disabled': {
      color: '#6b7280',
      cursor: 'default',
      backgroundColor: 'transparent',
    },
    '&:disabled:hover': {
      backgroundColor: 'transparent',
    },
  },
});

export const inlineButton = style({
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  borderRadius: '0.25rem',
  textDecoration: 'underline',
  margin: '0 0.25rem',
  transition: 'background-color 0.2s',
  ':hover': {
    backgroundColor: '#ef4444',
  },
  selectors: {
    '&:disabled': {
      color: '#6b7280',
      cursor: 'default',
      backgroundColor: 'transparent',
    },
    '&:disabled:hover': {
      backgroundColor: 'transparent',
    },
  },
});
