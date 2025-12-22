"use client";
import React, { useEffect, useRef } from "react";
import { useTree } from "./FileTreeContext";

export default function HeaderPicker() {
  const { loadFromFiles } = useTree();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "");
      inputRef.current.setAttribute("directory", "");
      inputRef.current.multiple = true;
    }
  }, []);

  return (
    <div className="px-2">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            loadFromFiles(files);
          }
        }}
      />
      <button
        className="btn btn-ghost btn-sm"
        title="Select folder"
        aria-label="Select folder"
        onClick={() => inputRef.current?.click()}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M2.25 6.75A2.25 2.25 0 014.5 4.5h4.379c.298 0 .585.118.796.33l1.06 1.06c.212.212.499.33.797.33H19.5a2.25 2.25 0 012.25 2.25v.75H4.5a2.25 2.25 0 00-2.25 2.25v-3.75z" />
          <path d="M2.25 12.75A2.25 2.25 0 014.5 10.5h15a2.25 2.25 0 012.25 2.25v4.5A2.25 2.25 0 0119.5 19.5h-15A2.25 2.25 0 012.25 16.5v-3.75z" />
        </svg>
      </button>
    </div>
  );
}
