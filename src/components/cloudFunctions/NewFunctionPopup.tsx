"use client";

import PopupComponent from "@/components/popup/PopupComponent";

type NewFunctionPopupProps = {
    visible: boolean;
    onOk: () => void;
    onCancel: () => void;
};

export default function NewFunctionPopup({ visible, onOk, onCancel }: NewFunctionPopupProps) {
    return (
        <PopupComponent
            visible={visible}
            title="New function"
            content={<div>Enter function details here...</div>}
            minWidth="600px"
            minHeight="350px"
            onOk={onOk}
            onCancel={onCancel}
        />
    );
}
