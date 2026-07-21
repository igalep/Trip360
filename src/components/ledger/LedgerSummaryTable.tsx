import type { Category } from '../../hooks/useLedger';
import { getCurrencySymbol } from './ExpenseEntryForm';

interface LedgerSummaryTableProps {
  tripBaseCurrency: string;
  categoryAggregates: (Category & { total: number })[];
  dailyAverage: number;
  budgetPercent: number;
  onSelectCategory?: (categoryName: string) => void;
}

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

export function LedgerSummaryTable({
  tripBaseCurrency,
  categoryAggregates,
  dailyAverage,
  budgetPercent,
  onSelectCategory,
}: LedgerSummaryTableProps) {
  const baseCurrencySymbol = getCurrencySymbol(tripBaseCurrency);

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-850 border-b border-zinc-800 text-zinc-400 text-xs tracking-wider uppercase text-left">
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 text-right font-semibold">Spent ({tripBaseCurrency})</th>
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
                  {baseCurrencySymbol}{cat.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bento blocks */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <span className="text-xs text-zinc-500 font-semibold block mb-1">Daily Average ({tripBaseCurrency})</span>
          <span className="text-lg font-bold text-gray-100 font-mono">{baseCurrencySymbol}{dailyAverage.toFixed(2)}</span>
        </div>
        <div className={`p-4 rounded-2xl border ${budgetPercent >= 90 ? 'bg-red-950/20 border-red-800 text-red-500' : 'bg-zinc-900 border-zinc-800'}`}>
          <span className="text-xs text-zinc-500 font-semibold block mb-1">Budget Used</span>
          <span className="text-lg font-bold font-mono">{budgetPercent}%</span>
        </div>
      </div>
    </div>
  );
}
