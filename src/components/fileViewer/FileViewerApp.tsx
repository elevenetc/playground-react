"use client";

import HeaderPicker from "./HeaderPicker";
import HeaderTitle from "./HeaderTitle";
import FileViewer from "./FileViewer";
import { TreeProvider } from "./FileTreeContext";

export default function FileViewerApp() {
  return (
    <TreeProvider>
      <nav className="navbar bg-base-200 border-b border-base-300">
        <div className="flex-1">
          <HeaderTitle />
        </div>
        <div className="flex-none">
          <HeaderPicker />
        </div>
      </nav>
      <div className="flex-1 min-h-0">
        <FileViewer />
      </div>
    </TreeProvider>
  );
}
