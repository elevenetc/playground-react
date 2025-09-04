"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

export type TreeNode = {
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
};

export function buildTreeFromFiles(fileList: FileList): TreeNode[] {
  const root = new Map<string, any>();
  const files = Array.from(fileList);

  for (const file of files) {
    const relative: string = (file as any).webkitRelativePath || file.name;
    const parts = relative.split("/").filter(Boolean);
    if (parts.length === 0) continue;

    let current: Map<string, any> = root;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        if (!current.has(part)) {
          current.set(part, { name: part, type: "file" });
        }
      } else {
        let node = current.get(part);
        if (!node || node.type !== "folder") {
          node = { name: part, type: "folder", _children: new Map<string, any>() };
          current.set(part, node);
        }
        current = node._children;
      }
    }
  }

  function mapToArray(map: Map<string, any>): TreeNode[] {
    const arr: TreeNode[] = [];
    for (const [, node] of map) {
      if (node.type === "folder") {
        arr.push({ name: node.name, type: "folder", children: mapToArray(node._children) });
      } else {
        arr.push({ name: node.name, type: "file" });
      }
    }
    arr.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }

  const arr = mapToArray(root);
  // Flatten the single selected root directory so its contents appear at the top level
  if (arr.length === 1 && arr[0].type === "folder") {
    return arr[0].children ?? [];
  }
  return arr;
}

export type TreeContextType = {
  tree: TreeNode[] | null;
  setTree: (t: TreeNode[] | null) => void;
  loadFromFiles: (files: FileList) => void;
};

const TreeContext = createContext<TreeContextType | undefined>(undefined);

export function TreeProvider({ children }: { children: React.ReactNode }) {
  const [tree, setTree] = useState<TreeNode[] | null>(null);

  const loadFromFiles = (files: FileList) => {
    const hasDir = Array.from(files).some(
      (f) => (f as any).webkitRelativePath && (f as any).webkitRelativePath.includes("/")
    );
    if (hasDir) {
      const t = buildTreeFromFiles(files);
      setTree(t);
    } else {
      // Only accept directories per requirements
      setTree(null);
    }
  };

  const value = useMemo(() => ({ tree, setTree, loadFromFiles }), [tree]);

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>;
}

export function useTree() {
  const ctx = useContext(TreeContext);
  if (!ctx) throw new Error("useTree must be used within TreeProvider");
  return ctx;
}
