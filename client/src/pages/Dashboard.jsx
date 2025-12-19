import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Trash2, Calendar as CalendarIcon, DollarSign, Tag, FileText, TrendingDown, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ amount: '', description: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd') });
    // Default to current month YYYY-MM
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            // Pass selectedMonth to API
            const res = await api.get(`/expenses?month=${selectedMonth}`);
            setExpenses(res.data);
        } catch (err) {
            console.error('Failed to fetch expenses');
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [selectedMonth]); // Refetch when month changes

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses', newItem);
            setShowModal(false);
            setNewItem({ amount: '', description: '', category: 'Food', date: format(new Date(), 'yyyy-MM-dd') });
            fetchExpenses();
            toast.success('Expense added successfully');
        } catch (err) {
            toast.error('Failed to add expense');
        }
    };

    const handleDelete = async (id) => {
        // if (!window.confirm('Delete this expense?')) return; // Optional: Keep confirm or use toast action
        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
            toast.success('Expense deleted');
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const categories = ['Food', 'Rent', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Other'];

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Food': return '🍔';
            case 'Rent': return '🏠';
            case 'Transport': return '🚗';
            case 'Utilities': return '💡';
            case 'Entertainment': return '🎬';
            case 'Shopping': return '🛍️';
            default: return '💸';
        }
    };

    const totalExpenses = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Calculate spend per user
    const spendByUser = expenses.reduce((acc, curr) => {
        const username = curr.users?.username || 'Unknown';
        if (!acc[username]) acc[username] = 0;
        acc[username] += Number(curr.amount);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh] w-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className=" pb-24 animate-in fade-in duration-500">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                        Hi, {user?.username} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Rental House Tracker
                    </p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center mb-4">
                    <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-border/50">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                                <Wallet className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">House Total</p>
                                <h2 className="text-xl font-bold tracking-tight">₹{totalExpenses.toFixed(2)}</h2>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm shadow-sm border-border/50">
                        <CardContent className="p-3 flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className={cn(
                                                "h-8 w-full justify-start p-0 text-left font-medium hover:bg-transparent hover:text-primary",
                                                !selectedMonth && "text-muted-foreground"
                                            )}
                                        >
                                            <span className="flex items-center gap-2">
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                {selectedMonth ? format(new Date(selectedMonth + '-01'), "MMMM yyyy") : <span>Pick a month</span>}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 opacity-100 z-50 bg-popover border-border shadow-md" align="start">
                                        <div className="p-3 border-b border-border/50 bg-muted/20">
                                            <p className="text-sm font-medium text-muted-foreground">Select a date (Month will be used)</p>
                                        </div>
                                        <Calendar
                                            mode="single"
                                            selected={selectedMonth ? new Date(selectedMonth + '-01') : undefined}
                                            onSelect={(date) => {
                                                if (date) {
                                                    setSelectedMonth(format(date, 'yyyy-MM'));
                                                    setIsCalendarOpen(false);
                                                }
                                            }}
                                            initialFocus
                                            className="m-2"
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </header>

            {/* Spending Breakdown */}
            {Object.keys(spendByUser).length > 0 && (
                <div className="flex gap-4 mb-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
                    {Object.entries(spendByUser).map(([username, amount]) => (
                        <Card key={username} className="bg-muted/30 border-none shadow-none min-w-[140px] snap-center">
                            <CardContent className="p-3">
                                <p className="text-xs font-medium text-muted-foreground uppercase truncate">{username}</p>
                                <p className="text-lg font-bold">₹{amount.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {expenses.map((expense) => (
                    <Card key={expense.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 overflow-hidden">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                                    {getCategoryIcon(expense.category)}
                                </div>
                                <div className="space-y-1 overflow-hidden">
                                    <p className="font-medium leading-snug group-hover:text-primary transition-colors truncate">{expense.description || expense.category}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="shrink-0">{format(new Date(expense.date), 'MMM dd')}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1 font-medium text-primary/80 truncate">
                                            👤 {expense.users?.username || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-lg text-destructive">-₹{expense.amount}</p>
                                {user?.username === expense.users?.username && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDelete(expense.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {expenses.length === 0 && (
                    <div className="col-span-full py-16 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-6 bg-muted/30 rounded-full animate-bounce">
                                <TrendingDown className="h-10 w-10 text-muted-foreground" />
                            </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No expenses yet</h3>
                        <p className="text-muted-foreground mb-6">Start tracking your spending by adding a new expense.</p>
                        <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" /> Add your first expense
                        </Button>
                    </div>
                )}
            </div>

            <Button
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-2xl z-50 p-0 bg-primary hover:bg-primary/90 hover:scale-105 transition-all duration-300"
                size="icon"
                onClick={() => setShowModal(true)}
            >
                <Plus className="h-6 w-6" />
            </Button>

            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl border-primary/20 animate-in zoom-in-95 duration-200">
                        <CardHeader className="border-b bg-muted/40 pb-4">
                            <CardTitle className="text-xl">Add New Expense</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <div className="absolute left-3 top-2.5 h-5 w-5 flex items-center justify-center pointer-events-none group-focus-within:text-primary transition-colors text-muted-foreground">
                                            <span className="text-lg font-bold">₹</span>
                                        </div>
                                        <Input
                                            type="number" step="0.01"
                                            className="pl-10 text-lg font-semibold" placeholder="0.00"
                                            value={newItem.amount} onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <FileText className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="text"
                                            className="pl-10" placeholder="Description (e.g. Lunch, Taxi)"
                                            value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Select
                                            value={newItem.category}
                                            onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                                        >
                                            <SelectTrigger className="w-full pl-10 relative">
                                                <div className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground">
                                                    <Tag className="h-5 w-5" />
                                                </div>
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal pl-10 relative",
                                                        !newItem.date && "text-muted-foreground"
                                                    )}
                                                >
                                                    <div className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground">
                                                        <CalendarIcon className="h-5 w-5" />
                                                    </div>
                                                    {newItem.date ? format(new Date(newItem.date), "MMM, dd, yyyy") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={newItem.date ? new Date(newItem.date) : undefined}
                                                    onSelect={(date) => setNewItem({ ...newItem, date: date ? format(date, 'yyyy-MM-dd') : '' })}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90">Add Expense</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};
export default Dashboard;
