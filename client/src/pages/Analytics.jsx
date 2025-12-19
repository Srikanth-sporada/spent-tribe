import React, { useState, useEffect } from 'react';
import api from '../api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Wallet, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';

const Analytics = () => {
    const [data, setData] = useState({ byCategory: [], byUser: [] });
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/analytics/monthly?month=${month}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [month]);

    const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

    const totalSpent = data.byCategory?.reduce((acc, curr) => acc + curr.total, 0) || 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Visualize your monthly spending
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-stretch md:items-center">
                    <Card className="bg-primary/5 border-primary/10 shadow-sm w-full md:w-auto">
                        <CardContent className="p-2 px-4 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Wallet className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Total House Spent</p>
                                <h2 className="text-lg font-bold tracking-tight">₹{totalSpent.toFixed(2)}</h2>
                            </div>
                        </CardContent>
                    </Card>

                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full md:w-[240px] justify-start text-left font-normal bg-card/50 backdrop-blur-sm border-border/50",
                                    !month && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {month ? format(new Date(month), "MMMM yyyy") : <span>Pick a month</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={month ? new Date(month) : undefined}
                                onSelect={(date) => {
                                    if (date) {
                                        setMonth(format(date, 'yyyy-MM'));
                                        setOpen(false);
                                    }
                                }}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">

                <div className="col-span-2 lg:col-span-2 grid gap-4 md:grid-cols-2">
                    {/* Category Chart */}
                    <Card className="col-span-1 border-white/10 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>By Category</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {data.byCategory?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.byCategory}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="category"
                                            stroke="none"
                                        >
                                            {data.byCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--popover-foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                            formatter={(value) => `₹${Number(value).toFixed(2)}`}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* User Chart */}
                    <Card className="col-span-1 border-white/10 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>By User</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            {data.byUser?.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data.byUser}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="username"
                                            stroke="none"
                                        >
                                            {data.byUser.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.75rem', color: 'hsl(var(--popover-foreground))' }}
                                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                                            formatter={(value) => `₹${Number(value).toFixed(2)}`}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-muted-foreground">
                                    No data available
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Breakdown List (Category) */}
                    <Card className="col-span-1 md:col-span-2 border-white/10 bg-card/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle>Category Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data.byCategory?.map((item, index) => (
                                    <div key={item.category} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="h-3 w-3 rounded-full ring-2 ring-transparent"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="font-medium">{item.category}</span>
                                        </div>
                                        <div className="font-mono font-semibold">₹{item.total.toFixed(2)}</div>
                                    </div>
                                ))}
                                {data.byCategory?.length > 0 && (
                                    <div className="flex items-center justify-between pt-4 border-t border-primary/20 mt-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-3 w-3 rounded-full bg-primary/20" />
                                            <span className="font-bold text-lg text-primary">Total</span>
                                        </div>
                                        <div className="font-mono font-bold text-lg text-primary">
                                            ₹{data.byCategory.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                                {(!data.byCategory || data.byCategory.length === 0) && (
                                    <div className="text-center text-muted-foreground py-8">
                                        No expenses recorded for this month.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
