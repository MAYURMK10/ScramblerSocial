import React from 'react';
import '../index.css';
import { useAuth } from '../AuthContext';

const Navbar = () => {
  const { user, loginWithGoogle, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="container nav-content">
        <h1 className="logo">SCRAMBLER<span>SOCIAL</span></h1>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-name">{user.displayName}</span>
              <button className="btn btn-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={loginWithGoogle}>Login with Google</button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
