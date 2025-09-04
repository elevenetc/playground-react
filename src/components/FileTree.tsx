"use client";
import React, { useEffect, useRef, useState } from "react";

type TreeNode = {
  name: string;
  type: "folder" | "file";
  children?: TreeNode[];
};

function buildTreeFromFiles(fileList: FileList): TreeNode[] {
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

  return mapToArray(root);
}

function TreeView({ nodes }: { nodes: TreeNode[] }) {
  return (
    <ul>
      {nodes.map((node) => (
        <li key={node.name}>
          {node.type === "folder" ? (
            <details open>
              <summary>{node.name}</summary>
              {node.children && node.children.length > 0 && <TreeView nodes={node.children} />}
            </details>
          ) : (
            <a>{node.name}</a>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function FileTree() {
  const [tree, setTree] = useState<TreeNode[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "");
      inputRef.current.setAttribute("directory", "");
      inputRef.current.multiple = true;
    }
  }, []);

  const onPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const hasDir = Array.from(files).some(
      (f) => (f as any).webkitRelativePath && (f as any).webkitRelativePath.includes("/")
    );
    if (hasDir) {
      const t = buildTreeFromFiles(files);
      setTree(t);
    } else {
      // Only show tree for directories per requirements
    }
  };

  if (!tree) {
    return (
      <div className="p-4 w-80">
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Pick a file</legend>
          <input ref={inputRef} type="file" className="file-input" onChange={onPick} />
          <label className="label">Max size 2MB</label>
        </fieldset>
      </div>
    );
  }

  return (
    <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
      <li>
        <details open>
          <summary>Selected folder</summary>
          <TreeView nodes={tree} />
        </details>
      </li>
    </ul>
  );
}
