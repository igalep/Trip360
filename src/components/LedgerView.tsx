import { useState } from 'react';
import { useLedger } from '../hooks/useLedger';
import { ExpenseEntryForm, getCurrencySymbol } from './ledger/ExpenseEntryForm';
import { LedgerSummaryTable } from './ledger/LedgerSummaryTable';
import { TransactionList } from './ledger/TransactionList';

interface LedgerViewProps {
  tripId: string;
  onBack: () => void;
  onSelectCategory?: (categoryName: string) => void;
}

export default function LedgerView({ tripId, onBack, onSelectCategory }: LedgerViewProps) {
  const {
    trip,
    categories,
    expenses,
    loading,
    totalSpent,
    budgetLimit,
    budgetPercent,
    dailyAverage,
    categoryAggregates,
    addExpense,
    deleteExpense,
    updateExpenseRate,
    addCategory,
  } = useLedger(tripId);

  const [activeTab, setActiveTab] = useState<'entry' | 'ledger' | 'stats'>('entry');
  const [showNotifyDrawer, setShowNotifyDrawer] = useState(false);

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

  const baseCurrencySymbol = getCurrencySymbol(trip.base_currency);

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
            <ExpenseEntryForm
              trip={trip}
              categories={categories}
              onSubmitExpense={addExpense}
              onAddCustomCategory={addCategory}
              onSelectCategory={onSelectCategory}
              onSuccess={() => setActiveTab('ledger')}
            />
          </section>
        )}

        {/* Tab 2: Ledger Summary Table & Transactions */}
        {activeTab === 'ledger' && (
          <section className="space-y-6">
            <LedgerSummaryTable
              tripBaseCurrency={trip.base_currency}
              categoryAggregates={categoryAggregates}
              dailyAverage={dailyAverage}
              budgetPercent={budgetPercent}
              onSelectCategory={onSelectCategory}
            />

            <TransactionList
              expenses={expenses}
              tripBaseCurrency={trip.base_currency}
              onDeleteExpense={deleteExpense}
              onUpdateRate={updateExpenseRate}
            />
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
            <span className="text-md font-bold text-zinc-300 font-mono">{baseCurrencySymbol}{Math.max(0, budgetLimit - totalSpent).toFixed(2)}</span>
          </div>
          <div className="flex flex-col justify-center px-6">
            <span className="text-xs text-emerald-500 uppercase tracking-wider font-semibold">Total Spent</span>
            <span className="text-xl font-bold text-emerald-400 font-mono">{baseCurrencySymbol}{totalSpent.toFixed(2)}</span>
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
