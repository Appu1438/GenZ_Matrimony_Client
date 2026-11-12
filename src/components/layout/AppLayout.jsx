import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import './AppLayout.css';

export function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-layout__body">
        <Sidebar />
        <main className="app-layout__main">{children}</main>
      </div>
      <Footer />
    </div>
  );
}

export default AppLayout;
