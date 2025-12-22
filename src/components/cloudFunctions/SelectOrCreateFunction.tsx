"use client";

import { useState } from "react";
import Button from "@/components/button/Button";
import NewFunctionPopup from "@/components/cloudFunctions/NewFunctionPopup";

export default function SelectOrCreateFunction() {
    const [showPopup, setShowPopup] = useState(false);

    const handleCreate = () => {
        setShowPopup(true);
    };

    const handleOk = () => {
        console.log("Function created");
        setShowPopup(false);
    };

    const handleCancel = () => {
        setShowPopup(false);
    };

    return (
        <>
            <div className="flex flex-row">
                <div>Select or</div>
                <Button inline={true} onClick={handleCreate}>create</Button>
                <div>a function</div>
            </div>
            <NewFunctionPopup
                visible={showPopup}
                onOk={handleOk}
                onCancel={handleCancel}
            />
        </>
    );
}
