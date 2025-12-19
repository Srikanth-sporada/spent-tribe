import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(username, password);
            toast.success('Welcome back!');
            navigate('/');
        } catch (err) {
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted/50">
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
            <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

            <Card className="w-full max-w-md relative z-10 border-muted/40 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold tracking-tight text-center bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Welcome Back
                    </CardTitle>
                    <p className="text-center text-sm text-muted-foreground">
                        Enter your credentials to access your account
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-background/50 border-muted/50 focus:bg-background transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="bg-background/50 border-muted/50 focus:bg-background transition-colors"
                            />
                        </div>
                        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            Login
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                        Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline underline-offset-4">Sign up</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;
