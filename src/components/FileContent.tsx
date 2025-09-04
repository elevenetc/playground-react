"use client";
import React, { useEffect, useState } from "react";
import { useTree } from "../context/FileTreeContext";

const FILE_SIZE_LIMIT = 10_000_000; // 10MB threshold

async function isProbablyBinary(file: File): Promise<boolean> {
  if (file.type && file.type.startsWith("text/")) return false;
  const len = Math.min(4096, file.size);
  const buf = await file.slice(0, len).arrayBuffer();
  const bytes = new Uint8Array(buf);
  if (bytes.length === 0) return false;
  let binaryLike = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    // allow tab(9), LF(10), CR(13)
    const isCommonWhitespace = b === 9 || b === 10 || b === 13;
    const isPrintable = b >= 32 && b <= 126;
    if (!(isPrintable || isCommonWhitespace)) binaryLike++;
  }
  return binaryLike / bytes.length > 0.3 || bytes.includes(0);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function highlightJsonBrackets(text: string): string {
  const escaped = escapeHtml(text);
  // First, highlight JSON object keys: "&quot;key&quot;:" → wrap only the key text
  const withKeys = escaped.replace(/&quot;([\s\S]*?)&quot;(\s*:\s*)/g, (_m, key, after) => {
    return `&quot;<span class=\"text-accent\">${key}</span>&quot;${after}`;
  });
  // Then, highlight curly braces and square brackets for basic readability
  return withKeys.replace(/[{}\[\]]/g, (m) => {
    if (m === "{" || m === "}") return `<span class=\"text-primary\">${m}</span>`;
    return `<span class=\"text-secondary\">${m}</span>`; // [ or ]
  });
}

export default function FileContent() {
  const { selectedFile } = useTree();
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "too_big" | "binary" | "ready">("idle");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!selectedFile) {
        setStatus("idle");
        setContent("");
        return;
      }
      if (selectedFile.size > FILE_SIZE_LIMIT) {
        setStatus("too_big");
        setContent("");
        return;
      }
      setStatus("loading");
      const binary = await isProbablyBinary(selectedFile);
      if (cancelled) return;
      if (binary) {
        setStatus("binary");
        setContent("");
        return;
      }
      const text = await selectedFile.text();
      if (cancelled) return;
      setContent(text);
      setStatus("ready");
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  const isJson = !!selectedFile && (
    selectedFile.type === "application/json" || /\.json$/i.test(selectedFile.name)
  );

  return (
    <div className="h-full p-4 overflow-hidden">
      {status === "idle" && <div className="text-base-content/70">No file selected.</div>}
      {status === "too_big" && <div className="text-warning">File is too big.</div>}
      {status === "binary" && <div className="text-base-content/70">Binary file. Content can't be shown.</div>}
      {status === "loading" && <div className="text-base-content/70">Loading…</div>}
      {status === "ready" && (
        isJson ? (
          <pre
            className="h-full w-full overflow-auto whitespace-pre-wrap text-sm font-mono"
            dangerouslySetInnerHTML={{ __html: highlightJsonBrackets(content) }}
          />
        ) : (
          <pre className="h-full w-full overflow-auto whitespace-pre-wrap text-sm font-mono">{content}</pre>
        )
      )}
    </div>
  );
}
