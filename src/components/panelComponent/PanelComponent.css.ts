import {style, styleVariants} from "@vanilla-extract/css";

const bgColor = '#3a3a3a'

const basePanel = style({
    backgroundColor: bgColor,
    position: 'fixed',
    padding: '1rem',
    margin: '1rem',
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
        width: '200px',
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
        width: '200px',
    },
});

export const panelComponentCss = basePanel;