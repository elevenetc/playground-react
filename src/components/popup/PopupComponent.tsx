"use client";

import { useEffect, useState, useRef } from 'react';
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
    const [width, setWidth] = useState<number | undefined>(undefined);
    const [height, setHeight] = useState<number | undefined>(undefined);
    const [isResizing, setIsResizing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const wasResizingRef = useRef(false);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && visible && onCancel) {
                onCancel();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [visible, onCancel]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!modalRef.current) return;
            const rect = modalRef.current.getBoundingClientRect();
            const newWidth = rect.right - e.clientX;
            const newHeight = e.clientY - rect.top;

            const minW = parseInt((minWidth || '300').replace('px', ''));
            const minH = parseInt((minHeight || '200').replace('px', ''));

            setWidth(Math.max(minW, newWidth));
            setHeight(Math.max(minH, newHeight));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            wasResizingRef.current = true;
            setTimeout(() => {
                wasResizingRef.current = false;
            }, 100);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, minWidth, minHeight]);

    if (!visible) return null;

    const handleOverlayClick = () => {
        if (isResizing || wasResizingRef.current) return;
        if (onCancel) {
            onCancel();
        }
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div
                ref={modalRef}
                className={styles.modal}
                onClick={handleModalClick}
                style={{
                    minWidth: minWidth,
                    minHeight: minHeight,
                    width: width ? `${width}px` : undefined,
                    height: height ? `${height}px` : undefined
                }}
            >
                <div className={styles.title}>{title}</div>
                <div className={styles.content}>{content}</div>
                <div className={styles.buttons}>
                    {ok && <Button onClick={onOk}>Ok</Button>}
                    {cancel && <Button onClick={onCancel}>Cancel</Button>}
                </div>
                <div
                    className={styles.resizeHandle}
                    onMouseDown={handleResizeStart}
                />
            </div>
        </div>
    );
}