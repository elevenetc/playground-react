"use client";

import FileTree from "./FileTree";
import FileContent from "./FileContent";

export default function FileViewer() {
  return (
    <div className="flex h-full min-h-0">
      <aside
        className="relative bg-base-200 border-r border-base-300 w-80"
        aria-label="File tree"
      >
        <div className="h-full overflow-auto">
          <FileTree />
        </div>
      </aside>
      <main className="flex-1 min-w-0 h-full">
        <FileContent />
      </main>
    </div>
  );
}
