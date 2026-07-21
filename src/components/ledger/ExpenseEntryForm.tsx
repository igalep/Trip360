import React, { useState, useEffect } from 'react';
import type { Trip, Category, CreateExpensePayload } from '../../hooks/useLedger';
import { useCurrencyRate } from '../../hooks/useCurrencyRate';

interface ExpenseEntryFormProps {
  trip: Trip;
  categories: Category[];
  onSubmitExpense: (payload: CreateExpensePayload) => Promise<boolean>;
  onAddCustomCategory: (name: string, icon: string) => Promise<boolean>;
  onSelectCategory?: (categoryName: string) => void;
  onSuccess?: () => void;
}

const SUPPORTED_CURRENCIES = [
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel (ILS)' },
  { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  { code: 'GBP', symbol: '£', name: 'British Pound (GBP)' },
  { code: 'GEL', symbol: '₾', name: 'Georgian Lari (GEL)' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar (CAD)' },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar (AUD)' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen (JPY)' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc (CHF)' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham (AED)' },
];

export const getCurrencySymbol = (code?: string): string => {
  if (!code) return '$';
  const found = SUPPORTED_CURRENCIES.find((c) => c.code.toUpperCase() === code.toUpperCase());
  return found ? found.symbol : code;
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

export function ExpenseEntryForm({
  trip,
  categories,
  onSubmitExpense,
  onAddCustomCategory,
  onSelectCategory,
  onSuccess,
}: ExpenseEntryFormProps) {
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(trip.base_currency || 'USD');
  const [conversionRate, setConversionRate] = useState(1.0);
  const [showRateEdit, setShowRateEdit] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  // Custom Category state
  const [showCustomCatForm, setShowCustomCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon] = useState('category');

  // Inline Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dynamic exchange rate hook
  const { rate: fetchedRate, loading: fetchingRate } = useCurrencyRate(
    selectedCurrency,
    trip.base_currency || 'USD',
    expenseDate
  );

  useEffect(() => {
    setConversionRate(fetchedRate);
  }, [fetchedRate]);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (todayStr < trip.start_date || todayStr > trip.end_date) {
      setExpenseDate(trip.start_date);
    } else {
      setExpenseDate(todayStr);
    }
  }, [trip, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const baseCurr = trip.base_currency || 'USD';
    const origAmount = Number(amount);
    const rate = selectedCurrency.toUpperCase() === baseCurr.toUpperCase() ? 1.0 : Number(conversionRate);
    const computedAmountInBase = Number((origAmount * rate).toFixed(2));

    const payload: CreateExpensePayload = {
      trip_id: trip.id,
      category_id: effectiveCatId,
      amount: computedAmountInBase,
      original_amount: origAmount,
      original_currency: selectedCurrency,
      conversion_rate: rate,
      payment_method: paymentMethod,
      description: description || 'Logged Cost',
      date: expenseDate || new Date().toISOString().split('T')[0],
    };

    const success = await onSubmitExpense(payload);
    if (success) {
      setAmount('');
      setDescription('');
      setErrors({});
      const selCat = categories.find((c) => c.id === effectiveCatId);
      const categoryName = selCat ? selCat.name : (categories.length > 0 ? categories[0].name : 'Misc');
      if (onSelectCategory) {
        onSelectCategory(categoryName);
      }
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const handleAddCustomCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const success = await onAddCustomCategory(newCatName, newCatIcon);
    if (success) {
      setNewCatName('');
      setShowCustomCatForm(false);
    }
  };

  const baseCurrencySymbol = getCurrencySymbol(trip.base_currency);
  const selectedCurrencySymbol = getCurrencySymbol(selectedCurrency);
  const isForeignCurrency = selectedCurrency.toUpperCase() !== trip.base_currency.toUpperCase();
  const computedBaseAmount = Number(amount || 0) * conversionRate;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
      <div className="p-5 bg-zinc-850 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-200">New Expense</h2>
          <p className="text-xs text-gray-400">{trip.destination} • Main Currency: {trip.base_currency} ({baseCurrencySymbol})</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Amount & Currency Input */}
        <div className="text-center space-y-3">
          <span className="text-xs uppercase text-zinc-500 font-semibold tracking-wider block">Amount Spent</span>
          
          <div className="flex items-center justify-center gap-3">
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-zinc-850 text-emerald-400 font-bold text-lg border border-zinc-700 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
              data-testid="select-currency"
            >
              {SUPPORTED_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              <span className="text-3xl text-emerald-500 font-bold">{selectedCurrencySymbol}</span>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className={`w-36 text-center text-4xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-zinc-700 ${
                  errors.amount ? 'border-b border-red-500' : ''
                }`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="input-expense-amount"
              />
            </div>
          </div>

          {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}

          {/* Multi-Currency Conversion Live Preview */}
          {isForeignCurrency && (
            <div className="p-3 bg-zinc-850 border border-zinc-800 rounded-xl space-y-2 text-center" data-testid="currency-conversion-preview">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-400">
                <span>Converted Total:</span>
                <span className="text-sm font-bold text-gray-100 font-mono">
                  {baseCurrencySymbol}{computedBaseAmount.toFixed(2)} {trip.base_currency}
                </span>
                {fetchingRate && <span className="text-zinc-500 text-[10px] animate-pulse">(fetching rate...)</span>}
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400">
                <span>Rate: 1 {selectedCurrency} = {conversionRate} {trip.base_currency}</span>
                <button
                  type="button"
                  onClick={() => setShowRateEdit(!showRateEdit)}
                  className="text-emerald-400 underline hover:text-emerald-300 ml-1"
                >
                  {showRateEdit ? 'Hide Rate Edit' : 'Edit Rate'}
                </button>
              </div>

              {showRateEdit && (
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-800">
                  <label className="text-xs text-zinc-400 font-semibold">Custom Rate:</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={conversionRate}
                    onChange={(e) => setConversionRate(Number(e.target.value))}
                    className="w-24 bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-xs font-mono text-center"
                    data-testid="input-conversion-rate"
                  />
                </div>
              )}
            </div>
          )}
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
                  onClick={handleAddCustomCategorySubmit}
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

        {/* Note / Details */}
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
          data-testid="submit-transaction"
        >
          Add Expense
        </button>
      </form>
    </div>
  );
}
