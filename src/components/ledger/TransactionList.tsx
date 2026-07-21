import { useState } from 'react';
import type { Expense } from '../../hooks/useLedger';
import { getCurrencySymbol } from './ExpenseEntryForm';

interface TransactionListProps {
  expenses: Expense[];
  tripBaseCurrency: string;
  onDeleteExpense: (id: string) => void;
  onUpdateRate: (id: string, newRate: number) => Promise<boolean>;
}

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

export function TransactionList({
  expenses,
  tripBaseCurrency,
  onDeleteExpense,
  onUpdateRate,
}: TransactionListProps) {
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [editingRateValue, setEditingRateValue] = useState<string>('');

  const baseCurrencySymbol = getCurrencySymbol(tripBaseCurrency);

  const handleSaveRate = async (expId: string) => {
    const numRate = Number(editingRateValue);
    if (isNaN(numRate) || numRate <= 0) return;
    const success = await onUpdateRate(expId, numRate);
    if (success) {
      setEditingExpenseId(null);
    }
  };

  return (
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
          {expenses.map((exp) => {
            const isExpForeign = exp.original_currency && exp.original_currency.toUpperCase() !== tripBaseCurrency.toUpperCase();
            const origSymbol = getCurrencySymbol(exp.original_currency);
            const isEditing = editingExpenseId === exp.id;

            return (
              <div key={exp.id} className="p-4 flex flex-col gap-2 hover:bg-zinc-850 transition-colors" data-testid={`expense-item-${exp.id}`}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-zinc-400">{getCategoryIcon(exp.category_icon || 'payments')}</span>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{exp.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-zinc-500">{exp.date} • {exp.payment_method.toUpperCase()}</span>
                        {isExpForeign && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono flex items-center gap-1">
                            <span>{origSymbol}{exp.original_amount.toFixed(2)} {exp.original_currency} @ {exp.conversion_rate}</span>
                            <button
                              onClick={() => {
                                setEditingExpenseId(exp.id);
                                setEditingRateValue(String(exp.conversion_rate));
                              }}
                              className="text-zinc-400 hover:text-white underline ml-1"
                              data-testid={`btn-edit-rate-${exp.id}`}
                              title="Modify rate post purchase"
                            >
                              Edit Rate
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-100 font-mono block">
                        {baseCurrencySymbol}{exp.amount.toFixed(2)}
                      </span>
                      {isExpForeign && (
                        <span className="text-[10px] text-zinc-400 font-mono block">
                          ({exp.original_currency})
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-zinc-800 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                {/* Post-Purchase Conversion Rate Inline Editor */}
                {isEditing && (
                  <div className="mt-2 p-3 bg-zinc-950 border border-emerald-500/40 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400 font-semibold">New Rate: 1 {exp.original_currency} =</span>
                      <input
                        type="number"
                        step="0.0001"
                        value={editingRateValue}
                        onChange={(e) => setEditingRateValue(e.target.value)}
                        className="w-24 bg-zinc-900 border border-zinc-700 text-white rounded px-2 py-1 text-xs font-mono text-center"
                        data-testid={`input-rate-edit-${exp.id}`}
                      />
                      <span className="text-xs text-zinc-400">{tripBaseCurrency}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingExpenseId(null)}
                        className="px-2 py-1 text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveRate(exp.id)}
                        className="px-3 py-1 bg-emerald-500 text-black font-semibold text-xs rounded hover:bg-emerald-400 transition-colors"
                        data-testid={`save-rate-edit-${exp.id}`}
                      >
                        Save Rate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
