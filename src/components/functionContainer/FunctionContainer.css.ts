import {createVar, style} from '@vanilla-extract/css';

export const DEBUG_CSS = true;

const bgColor = '#3a3a3a'

export const cssValues = {
  functionContainerBg: 'transparent'
};

export const cssDebugValues = {
  functionContainerBg: bgColor
};



export const functionContainerBg = createVar();

export const functionContainer = style({
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: functionContainerBg,
  minWidth: '2.25rem',
  justifyContent: 'space-between',
  padding: '0.0rem',
  borderRadius: '0.5rem',
  margin: '1.0rem',
  overflow: 'hidden',
  userSelect: 'none',
  cursor: 'pointer',
  ':hover': {
    opacity: 0.9,
  },
});

export const codeSignature = style({
  overflow: 'auto',
  minWidth: 0,
  flex: 1,
  padding: '0.5rem 0.5rem 0.4rem 0.5rem',
});

export const statusAndRun = style({
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.0rem',
  marginTop: 0,
  maxHeight: 0,
  opacity: 0,
  overflow: 'hidden',
  transition: 'max-height 0.3s ease, opacity 0.2s ease, margin-top 0.3s ease',
  selectors: {
    [`${functionContainer}:hover &`]: {
      maxHeight: '2rem',
      opacity: 1,
      marginTop: '0.0rem',
    },
  },
});

export const kotlinCode = style({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
});
