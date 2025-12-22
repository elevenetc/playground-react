import { style } from '@vanilla-extract/css';

export const overlay = style({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
});

export const modal = style({
    backgroundColor: '#2a2a2a',
    borderRadius: '0.5rem',
    padding: '0.5rem',
    minWidth: '300px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
});

export const title = style({
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    marginLeft: '0.5rem',
    cursor: 'default',
});

export const content = style({
    marginBottom: '1.0rem',
    marginLeft: '0.5rem',
    flex: 1,
});

export const buttons = style({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.5rem',
});

export const resizeHandle = style({
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '20px',
    height: '20px',
    cursor: 'nesw-resize',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: '0.5rem',
    ':hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
});
