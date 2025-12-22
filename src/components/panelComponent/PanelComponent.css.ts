import {style, styleVariants} from "@vanilla-extract/css";

const bgColor = '#3a3a3a'

const basePanel = style({
    backgroundColor: bgColor,
    position: 'fixed',
    padding: '1rem',
    margin: '0.5rem',
    borderRadius: '0.5rem',
});

export const panelVariants = styleVariants({
    top: {
        top: 0,
        left: 0,
        right: 0,
        height: '100px',
    },
    right: {
        top: 0,
        right: 0,
        bottom: 0,
        width: '250px',
    },
    bottom: {
        bottom: 0,
        left: 0,
        right: 0,
        height: '100px',
    },
    left: {
        top: 0,
        left: 0,
        bottom: 0,
        width: '250px',
    },
});

export const panelComponentCss = basePanel;

export const emptyViewContainer = style({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    cursor: 'default',
});