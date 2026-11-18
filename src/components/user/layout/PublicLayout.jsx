
import { Link, NavLink } from 'react-router-dom';
import Logo from '../ui/Logo.jsx';
import './PublicLayout.css';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export function PublicLayout({ children }) {
    return (
        <div className="public-layout">
            <Header />

            <main className="public-main">
                {children}
            </main>

            <Footer/>
        </div>
    );
}

export default PublicLayout;
