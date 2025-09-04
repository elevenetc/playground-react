import FileTree from "../components/FileTree";

export default function Home() {
  return (
    <div className="drawer">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content min-h-screen flex items-center justify-center p-4">
        <label htmlFor="app-drawer" className="btn btn-primary drawer-button">
          Open File Tree
        </label>
      </div>
      <div className="drawer-side z-50">
        <label htmlFor="app-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        <FileTree />
      </div>
    </div>
  );
}
