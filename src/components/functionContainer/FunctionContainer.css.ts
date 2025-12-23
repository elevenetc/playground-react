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
  padding: '0.5rem 0.5rem 0.0rem 0.5rem',
});

export const statusAndRun = style({
  display: 'flex',
  justifyContent: 'space-between',
  backgroundColor: bgColor,
  padding: '0.0rem',
});

export const status = style({
  padding: '0.5rem 0.75rem',
  fontStyle: 'italic',
  color: '#6b7280',
});

export const kotlinCode = style({
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  fontSize: '0.875rem',
  lineHeight: '1.25rem',
});
