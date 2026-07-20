import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

interface CategoryManageViewProps {
  tripIdentifier: string;
  categoryIdentifier: string;
  onBack: () => void;
}

interface Category {
  id: string;
  trip_id: string;
  name: string;
  icon: string;
  group_name: string;
}

interface Expense {
  id: string;
  trip_id: string;
  category_id: string;
  amount: number;
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
  base_currency: string;
  budget_limit: number;
}

export default function CategoryManageView({
  tripIdentifier,
  categoryIdentifier,
  onBack,
}: CategoryManageViewProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    fetchCategoryData();
  }, [tripIdentifier, categoryIdentifier]);

  const fetchCategoryData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/trips/${encodeURIComponent(tripIdentifier)}`);
      const json = await res.json();

      if (json.status === 'success') {
        const loadedTrip: Trip = json.data.trip;
        setTrip(loadedTrip);

        const loadedCategories: Category[] = json.data.categories || [];
        const loadedExpenses: Expense[] = json.data.expenses || [];

        // Match category by ID or Name (case insensitive)
        const matchedCat = loadedCategories.find(
          (c) =>
            c.id === categoryIdentifier ||
            c.name.toLowerCase() === categoryIdentifier.toLowerCase() ||
            c.name.toLowerCase().replace(/\s+/g, '-') === categoryIdentifier.toLowerCase()
        ) || loadedCategories[0] || null;

        setCategory(matchedCat);

        if (matchedCat) {
          const catExpenses = loadedExpenses.filter((e) => e.category_id === matchedCat.id);
          setExpenses(catExpenses);
        }
      }
    } catch (err) {
      logger.error('Failed to load category manage details:', err);
    } finally {
      setLoading(false);
    }
  };



  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.status === 'success') {
        await fetchCategoryData();
      }
    } catch (err) {
      logger.error('Failed to delete expense:', err);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch ((iconName || '').toLowerCase()) {
      case 'flight': return 'flight';
      case 'accommodation': return 'hotel';
      case 'hotel': return 'hotel';
      case 'transport': return 'directions_car';
      case 'restaurants': return 'restaurant';
      case 'shopping': return 'shopping_cart';
      default: return 'category';
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading category details...</div>;
  }

  if (!trip || !category) {
    return (
      <div className="p-12 text-center text-gray-400 space-y-4">
        <p className="text-lg font-bold text-gray-200">Category not found</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-emerald-500 text-black font-bold text-sm rounded-lg hover:bg-emerald-400 transition-colors"
        >
          Return to Trip
        </button>
      </div>
    );
  }

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const entryCount = expenses.length;
  const targetBudget = trip.budget_limit > 0 ? trip.budget_limit / 4 : 500;
  const progressPercent = Math.min(100, Math.round((totalSpent / (targetBudget || 1)) * 100));

  return (
    <div className="flex flex-col min-h-screen bg-bg-app text-text-main pb-24">
      {/* Top AppBar matching Stitch specs */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            data-testid="btn-category-manage-back"
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">arrow_back</span>
          </button>
          <h1 className="text-lg font-bold text-gray-100" data-testid="category-manage-title">
            {category.name}
          </h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-emerald-400 text-sm">
            {getCategoryIcon(category.icon)}
          </span>
        </div>
      </header>

      <main className="mt-20 px-6 max-w-md mx-auto w-full flex-grow">
        {/* Summary Matrix Block (Category Specific) */}
        <section className="mb-6 p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
              Total Category Spending
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-3xl font-bold font-mono text-emerald-400">
                ${totalSpent.toFixed(2)}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 bg-zinc-800 rounded-lg text-gray-300 border border-zinc-700">
                {entryCount} {entryCount === 1 ? 'Entry' : 'Entries'}
              </span>
            </div>

            <div className="mt-4 h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {progressPercent}% of category target allocation (${targetBudget.toFixed(2)})
            </p>
          </div>
        </section>

        {/* Entries Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-200">Entries</h2>
        </div>

        {/* Transaction / Entry List */}
        {expenses.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500 text-xs">
            No entries logged for this category yet.
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                data-testid={`expense-item-${exp.id}`}
                className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-100">
                    {exp.description || `${category.name} Expense`}
                  </span>
                  <span className="text-xs text-zinc-400 mt-0.5">{exp.date}</span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-base font-bold font-mono text-emerald-400">
                    ${Number(exp.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    title="Delete Entry"
                    className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
