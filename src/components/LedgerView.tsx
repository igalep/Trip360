import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

interface Category {
  id: string;
  trip_id: string;
  name: string;
  icon: string;
  group_name: string;
  is_default: number;
}

interface Expense {
  id: string;
  trip_id: string;
  category_id: string;
  amount: number;
  original_amount: number;
  original_currency: string;
  conversion_rate: number;
  payment_method: string;
  description: string;
  date: string;
  category_name?: string;
  category_icon?: string;
}

interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  nights: number;
  base_currency: string;
  budget_limit: number;
  image_url: string;
}

interface LedgerViewProps {
  tripId: string;
  onBack: () => void;
  onSelectCategory?: (categoryName: string) => void;
}

export default function LedgerView({ tripId, onBack, onSelectCategory }: LedgerViewProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'entry' | 'ledger' | 'stats'>('entry');

  // Drawers
  const [showSideDrawer, setShowSideDrawer] = useState(false);
  const [showNotifyDrawer, setShowNotifyDrawer] = useState(false);

  // New Expense form states
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom Category form states
  const [showCustomCatForm, setShowCustomCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('category');

  // Inline Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLedgerData();
  }, [tripId]);

  const fetchLedgerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/trips/${tripId}`);
      const json = await response.json();
      if (json.status === 'success') {
        const loadedTrip = json.data.trip;
        setTrip(loadedTrip);
        setCategories(json.data.categories);
        setExpenses(json.data.expenses);
        
        // Select first category by default if none selected
        if (json.data.categories.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(json.data.categories[0].id);
        }

        // Adjust default expense date if today is outside trip bounds
        const todayStr = new Date().toISOString().split('T')[0];
        if (todayStr < loadedTrip.start_date || todayStr > loadedTrip.end_date) {
          setExpenseDate(loadedTrip.start_date);
        } else {
          setExpenseDate(todayStr);
        }
      }
    } catch (error) {
      logger.error('LedgerView: Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCatId = selectedCategoryId || (categories.length > 0 ? categories[0].id : '');
    const newErrors: Record<string, string> = {};

    if (!amount || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    if (!effectiveCatId) {
      newErrors.category = 'Please select a category';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        trip_id: trip?.id || tripId,
        category_id: effectiveCatId,
        amount: Number(amount),
        original_amount: Number(amount),
        original_currency: trip?.base_currency || 'USD',
        conversion_rate: 1.0,
        payment_method: paymentMethod,
        description: description || 'Logged Cost',
        date: expenseDate || new Date().toISOString().split('T')[0],
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (json.status === 'success') {
        setAmount('');
        setDescription('');
        setErrors({});
        const selCat = categories.find((c) => c.id === effectiveCatId);
        const categoryName = selCat ? selCat.name : (categories.length > 0 ? categories[0].name : 'Misc');
        if (onSelectCategory) {
          onSelectCategory(categoryName);
        } else {
          fetchLedgerData();
          setActiveTab('ledger');
        }
      }
    } catch (error) {
      logger.error('LedgerView: Failed to save expense:', error);
    }
  };

  const handleDeleteExpense = async (expId: string) => {
    try {
      const response = await fetch(`/api/expenses/${expId}`, {
        method: 'DELETE',
      });
      const json = await response.json();
      if (json.status === 'success') {
        fetchLedgerData();
      }
    } catch (error) {
      logger.error('LedgerView: Failed to delete expense:', error);
    }
  };

  const handleAddCustomCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const response = await fetch(`/api/trips/${tripId}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName, icon: newCatIcon }),
      });
      const json = await response.json();
      if (json.status === 'success') {
        setNewCatName('');
        setShowCustomCatForm(false);
        fetchLedgerData();
      }
    } catch (error) {
      logger.error('LedgerView: Failed to create custom category:', error);
    }
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const budgetLimit = trip?.budget_limit || 1000;
  const budgetPercent = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));
  const dailyAverage = trip?.nights ? (totalSpent / trip.nights) : totalSpent;

  // Category Aggregates
  const categoryAggregates = categories.map((cat) => {
    const total = expenses
      .filter((exp) => exp.category_id === cat.id)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { ...cat, total };
  });

  const getCategoryColorClass = (groupName: string) => {
    switch (groupName.toLowerCase()) {
      case 'fixed': return 'bg-zinc-900 border-b border-zinc-800 text-zinc-400';
      case 'transit': return 'bg-expense-variable-bg border-b border-expense-variable-border text-yellow-500';
      case 'living': return 'bg-zinc-900 border-b border-zinc-800 text-orange-500';
      case 'leisure': return 'bg-expense-discretionary-bg border-b border-expense-discretionary-border text-emerald-500';
      default: return 'bg-zinc-900 border-b border-zinc-800 text-zinc-400';
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'flight': return 'flight';
      case 'accommodation': return 'hotel';
      case 'hotel': return 'hotel';
      case 'transport': return 'directions_car';
      case 'restaurants': return 'restaurant';
      case 'shopping': return 'shopping_cart';
      default: return 'payments';
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-400">Loading ledger details...</div>;
  }

  if (!trip) {
    return (
      <div className="p-12 text-center text-gray-400 space-y-4">
        <p className="text-lg font-bold text-gray-200">Trip not found</p>
        <p className="text-xs text-zinc-500">The requested trip ID could not be retrieved from the database.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-500 text-black font-bold text-sm rounded-lg hover:bg-emerald-400 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-app text-text-main pb-24">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-100">{trip.name}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowNotifyDrawer(true)}
            className="relative p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-primary border border-zinc-700">
            {trip.destination[0]}
          </div>
        </div>
      </header>

      {/* Main Ledger Content */}
      <main className="mt-20 px-6 max-w-2xl mx-auto w-full flex-grow">
        {/* Tab 1: Quick Entry */}
        {activeTab === 'entry' && (
          <section className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-5 bg-zinc-850 border-b border-zinc-800">
                <h2 className="text-lg font-semibold text-gray-200">New Expense</h2>
                <p className="text-xs text-gray-400">{trip.destination} • {trip.base_currency}</p>
              </div>

              <form onSubmit={handleAddExpense} className="p-6 space-y-6">
                {/* Huge Amount Input */}
                <div className="text-center space-y-2">
                  <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider">Amount Spent</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl text-emerald-500 font-bold">$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`w-40 text-center text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-zinc-700 ${
                        errors.amount ? 'border-b border-red-500' : ''
                      }`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                  {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
                </div>

                {/* Category Chips Selector */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-zinc-400">Category</span>
                    <button
                      type="button"
                      onClick={() => setShowCustomCatForm(!showCustomCatForm)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                    >
                      + Add Custom
                    </button>
                  </div>

                  {showCustomCatForm && (
                    <div className="p-4 bg-zinc-850 rounded-xl border border-zinc-800 space-y-3">
                      <input
                        type="text"
                        placeholder="Category Name"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-sm text-white"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowCustomCatForm(false)}
                          className="px-3 py-1 text-xs text-gray-400 hover:bg-zinc-800 rounded"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddCustomCategory}
                          className="px-3 py-1 text-xs bg-emerald-500 text-black font-semibold rounded hover:bg-emerald-400"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                          selectedCategoryId === cat.id
                            ? 'bg-emerald-500 border-emerald-500 text-black'
                            : 'bg-zinc-850 border-zinc-800 text-gray-300 hover:bg-zinc-850'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">{getCategoryIcon(cat.icon)}</span>
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Note / Details Row */}
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-semibold uppercase">Note / Details</span>
                  <input
                    type="text"
                    placeholder="e.g. Flight ticket"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-gray-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    data-testid="input-expense-description"
                  />
                </div>

                {/* Payment Method toggle */}
                <div className="flex justify-between items-center p-3 bg-zinc-850 border border-zinc-800 rounded-xl">
                  <span className="text-sm font-semibold text-gray-300">Payment Method</span>
                  <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        paymentMethod === 'card' ? 'bg-zinc-800 text-white' : 'text-gray-400'
                      }`}
                    >
                      CARD
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        paymentMethod === 'cash' ? 'bg-zinc-800 text-white' : 'text-gray-400'
                      }`}
                    >
                      CASH
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-wider"
                >
                  Add Expense
                </button>
              </form>
            </div>
          </section>
        )}

        {/* Tab 2: Ledger Summary Table */}
        {activeTab === 'ledger' && (
          <section className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-zinc-850 border-b border-zinc-800 text-zinc-400 text-xs tracking-wider uppercase text-left">
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 text-right font-semibold">Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-850">
                  {categoryAggregates.map((cat) => (
                    <tr
                      key={cat.id}
                      onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                      className={`${getCategoryColorClass(cat.group_name)} hover:bg-zinc-800 transition-colors cursor-pointer`}
                      data-testid={`category-row-${cat.id}`}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <span className="material-symbols-outlined text-sm">{getCategoryIcon(cat.icon)}</span>
                        <span className="font-semibold text-gray-200">{cat.name}</span>
                      </td>
                      <td className="p-4 text-right font-bold text-gray-100 font-mono">
                        ${cat.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bento blocks */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                <span className="text-xs text-zinc-500 font-semibold block mb-1">Daily Average</span>
                <span className="text-lg font-bold text-gray-100 font-mono">${dailyAverage.toFixed(2)}</span>
              </div>
              <div className={`p-4 rounded-2xl border ${budgetPercent >= 90 ? 'bg-red-950/20 border-red-800 text-red-500' : 'bg-zinc-900 border-zinc-800'}`}>
                <span className="text-xs text-zinc-500 font-semibold block mb-1">Budget Used</span>
                <span className="text-lg font-bold font-mono">{budgetPercent}%</span>
              </div>
            </div>

            {/* Ledger Transactions Entries list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Transactions</h3>
                <span
                  className="text-xs font-mono px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-400 border border-zinc-700 font-semibold"
                  data-testid="transactions-count"
                >
                  {expenses.length} {expenses.length === 1 ? 'transaction' : 'transactions'}
                </span>
              </div>
              {expenses.length === 0 ? (
                <p className="text-zinc-600 text-sm italic">No transactions registered yet.</p>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl divide-y divide-zinc-850 overflow-hidden">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="p-4 flex justify-between items-center hover:bg-zinc-850 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-zinc-400">{getCategoryIcon(exp.category_icon || 'payments')}</span>
                        <div>
                          <p className="text-sm font-bold text-gray-200">{exp.description}</p>
                          <p className="text-xs text-zinc-500">{exp.date} • {exp.payment_method.toUpperCase()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold text-gray-100 font-mono">${exp.amount.toFixed(2)}</span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id)}
                          className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-zinc-800 transition-colors"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 3: Stats */}
        {activeTab === 'stats' && (
          <section className="text-center py-12 space-y-3">
            <span className="material-symbols-outlined text-6xl text-zinc-700">analytics</span>
            <p className="text-sm text-zinc-500 font-medium">Spending graphs and analytics coming soon.</p>
          </section>
        )}
      </main>

      {/* Sticky Footer budget tracker */}
      <div className="fixed bottom-14 left-0 right-0 bg-zinc-950 border-t border-zinc-800 shadow-[0_-4px_12px_rgba(0,0,0,0.5)] z-40">
        <div className="grid grid-cols-2 h-20">
          <div className="flex flex-col justify-center px-6 border-r border-zinc-800">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Remaining</span>
            <span className="text-md font-bold text-zinc-300 font-mono">${Math.max(0, budgetLimit - totalSpent).toFixed(2)}</span>
          </div>
          <div className="flex flex-col justify-center px-6">
            <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Total Spent</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">${totalSpent.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center z-50">
        <button
          onClick={() => setActiveTab('entry')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'entry' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
          }`}
          data-testid="tab-btn-entry"
        >
          <span className="material-symbols-outlined text-sm">edit_note</span>
          <span className="text-[10px] tracking-wider mt-0.5">Entry</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'ledger' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
          }`}
          data-testid="tab-btn-ledger"
        >
          <span className="material-symbols-outlined text-sm">receipt_long</span>
          <span className="text-[10px] tracking-wider mt-0.5">Ledger</span>
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex flex-col items-center justify-center transition-all ${
            activeTab === 'stats' ? 'text-emerald-400 font-bold' : 'text-zinc-500'
          }`}
          data-testid="tab-btn-stats"
        >
          <span className="material-symbols-outlined text-sm">analytics</span>
          <span className="text-[10px] tracking-wider mt-0.5">Stats</span>
        </button>
      </nav>

      {/* Notification Drawer (Right overlay) */}
      {showNotifyDrawer && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => setShowNotifyDrawer(false)}
          ></div>
          <div className="fixed inset-y-0 right-0 w-80 bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-md font-bold text-emerald-400">Incoming Expenses</h3>
                <p className="text-xs text-zinc-500">Parsed from SMS & Emails</p>
              </div>
              <button
                onClick={() => setShowNotifyDrawer(false)}
                className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="p-4 bg-zinc-850 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Taxi Bolt</span>
                  <span className="text-sm font-bold text-gray-100 font-mono">$12.50</span>
                </div>
                <p className="text-xs text-zinc-500">Taxi ride back to hotel • Card</p>
                <button
                  onClick={() => {
                    setAmount('12.50');
                    setDescription('Taxi ride');
                    setShowNotifyDrawer(false);
                    setActiveTab('entry');
                  }}
                  className="w-full py-2 bg-emerald-500 text-black font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors uppercase tracking-wider"
                >
                  Load to Entry
                </button>
              </div>
              <div className="p-4 bg-zinc-850 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Bravo Super</span>
                  <span className="text-sm font-bold text-gray-100 font-mono">$45.20</span>
                </div>
                <p className="text-xs text-zinc-500">Snacks & groceries • Card</p>
                <button
                  onClick={() => {
                    setAmount('45.20');
                    setDescription('Groceries');
                    setShowNotifyDrawer(false);
                    setActiveTab('entry');
                  }}
                  className="w-full py-2 bg-emerald-500 text-black font-bold rounded-lg text-xs hover:bg-emerald-400 transition-colors uppercase tracking-wider"
                >
                  Load to Entry
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
