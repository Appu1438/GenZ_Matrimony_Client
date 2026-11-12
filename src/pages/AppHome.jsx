import AppLayout from '../components/layout/AppLayout.jsx';
import useAuth from '../hooks/useAuth.js';
import './AppHome.css';

export function AppHome() {
  const { user } = useAuth();

  return (
    <AppLayout>
      <div className="app-home">
        <span className="app-home__eyebrow">You&rsquo;re in</span>
        <h1 className="app-home__title">Welcome to GenZ Matrimony{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}.</h1>
        <p className="app-home__subtitle">
          This is a temporary placeholder for the authenticated experience. Profile creation,
          discovery, matching, and chat all land in later stages.
        </p>
      </div>
    </AppLayout>
  );
}

export default AppHome;
