import Navbar from "./Navbar";
import "./AppLayout.css";

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="app-layout__content">{children}</main>
    </div>
  );
}

export default AppLayout;
