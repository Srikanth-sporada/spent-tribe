import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import { Home, PieChart, LogOut } from 'lucide-react';
import { ThemeProvider } from "@/components/theme-provider"
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/sonner"

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                    <img src="/logo.svg" alt="SpendTribe Logo" className="h-8 w-8 object-contain" />
                    <span>SpendTribe</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <Home className="h-5 w-5" />
                    </Link>
                    <Link to="/analytics" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/analytics' ? 'text-primary' : 'text-muted-foreground'}`}>
                        <PieChart className="h-5 w-5" />
                    </Link>
                    <ModeToggle />
                    <button onClick={logout} className="text-muted-foreground transition-colors hover:text-destructive">
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

function App() {
    return (
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <div className="min-h-screen bg-background font-sans antialiased text-foreground">
                <Navbar />
                <div className="container py-8">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
                    </Routes>
                </div>
                <Toaster />
            </div>
        </ThemeProvider>
    );
}

export default App;
