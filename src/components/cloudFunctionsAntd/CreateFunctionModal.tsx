"use client";

import { useState, useEffect, useRef } from 'react';
import { Modal } from 'antd';

type CreateFunctionModalProps = {
    open: boolean;
    onClose: () => void;
    onCreate: () => void;
};

export default function CreateFunctionModal({ open, onClose, onCreate }: CreateFunctionModalProps) {
    const [width, setWidth] = useState(600);
    const [height, setHeight] = useState(350);
    const [isResizing, setIsResizing] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const wasResizingRef = useRef(false);
    const resizeStartRef = useRef<{ mouseX: number; mouseY: number; width: number; height: number } | null>(null);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!resizeStartRef.current) return;

            const deltaX = resizeStartRef.current.mouseX - e.clientX;
            const deltaY = e.clientY - resizeStartRef.current.mouseY;

            const newWidth = resizeStartRef.current.width + deltaX;
            const newHeight = resizeStartRef.current.height + deltaY;

            setWidth(Math.max(400, newWidth));
            setHeight(Math.max(300, newHeight));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeStartRef.current = null;
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
    }, [isResizing]);

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        resizeStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            width,
            height,
        };
        setIsResizing(true);
    };

    const handleCancel = () => {
        if (wasResizingRef.current) return;
        onClose();
    };

    return (
        <Modal
            title="New Function"
            open={open}
            onOk={onCreate}
            onCancel={handleCancel}
            transitionName=""
            width={width}
            style={{ height }}
            modalRender={(modal) => (
                <div ref={modalRef} style={{ position: 'relative' }}>
                    {modal}
                    <div
                        onMouseDown={handleResizeStart}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: 24,
                            height: 24,
                            cursor: 'nesw-resize',
                            backgroundColor: 'rgba(100, 100, 100, 0.3)',
                            borderBottomLeftRadius: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.5)',
                            zIndex: 9999,
                            pointerEvents: 'auto',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(100, 100, 100, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(100, 100, 100, 0.3)';
                        }}
                    >
                        ⋱
                    </div>
                </div>
            )}
        >
            <div style={{ padding: '20px 0', minHeight: height - 150 }}>
                Enter function details here...
            </div>
        </Modal>
    );
}
