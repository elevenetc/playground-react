"use client";

import { useEffect } from 'react';
import * as styles from './PopupComponent.css';
import Button from '../button/Button';

type PopupComponentProps = {
    visible: boolean;
    title: string;
    content: React.ReactNode;
    ok?: boolean;
    cancel?: boolean;
    onOk?: () => void;
    onCancel?: () => void;
    minWidth?: string;
    minHeight?: string;
};

export default function PopupComponent({
    visible,
    title,
    content,
    ok = true,
    cancel = true,
    onOk,
    onCancel,
    minWidth,
    minHeight
}: PopupComponentProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && visible && onCancel) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [visible, onCancel]);

    if (!visible) return null;

    const handleOverlayClick = () => {
        if (onCancel) {
            onCancel();
        }
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                className={styles.modal}
                onClick={handleModalClick}
                style={{
                    minWidth: minWidth,
                    minHeight: minHeight
                }}
            >
                <div className={styles.title}>{title}</div>
                <div className={styles.content}>{content}</div>
                <div className={styles.buttons}>
                    {ok && <Button onClick={onOk}>Ok</Button>}
                    {cancel && <Button onClick={onCancel}>Cancel</Button>}
                </div>
            </div>
        </div>
    );
}