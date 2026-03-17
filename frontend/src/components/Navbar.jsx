import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Heart, History, Home, LogIn } from 'lucide-react';

const Navbar = () => {
    const { user, authenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xl italic">M</span>
                    </div>
                    <span className="text-xl font-black text-dark tracking-tighter">Movie<span className="text-primary italic">DB</span></span>
                </Link>

                {/* Nav Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <NavLink to="/" icon={<Home size={18} />} active={isActive('/')}>Home</NavLink>
                    {authenticated && (
                        <>
                            <NavLink to="/favorites" icon={<Heart size={18} />} active={isActive('/favorites')}>Favorites</NavLink>
                            <NavLink to="/history" icon={<History size={18} />} active={isActive('/history')}>History</NavLink>
                        </>
                    )}
                </div>

                {/* Auth Actions */}
                <div className="flex items-center space-x-4">
                    {authenticated ? (
                        <div className="flex items-center space-x-6">
                            <Link to="/profile" className="flex items-center space-x-2 text-dark font-semibold text-sm transition-all hover:text-primary">
                                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-primary">
                                    <User size={16} />
                                </div>
                                <span className="hidden sm:inline">{user?.name}</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-400 hover:text-danger hover:bg-red-50 p-2 rounded-lg transition-all"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3">
                            <Link 
                                to="/login" 
                                className="text-gray-600 font-bold text-sm px-4 py-2 hover:text-primary transition-all"
                            >
                                Sign In
                            </Link>
                            <Link 
                                to="/register" 
                                className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-900 transition-all flex items-center space-x-2"
                            >
                                <LogIn size={16} />
                                <span>Get Started</span>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, children, icon, active }) => (
    <Link 
        to={to} 
        className={`relative flex items-center space-x-2 text-sm font-bold transition-all px-2 py-1 h-full
            ${active ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
    >
        {icon}
        <span>{children}</span>
        {active && <motion.div layoutId="nav-underline" className="absolute -bottom-[21px] left-0 right-0 h-1 bg-primary rounded-t-full" />}
    </Link>
);

export default Navbar;
