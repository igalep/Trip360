import { useState } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-bg-app text-text-main pb-16">
      {!selectedTripId ? (
        <Dashboard onSelectTrip={setSelectedTripId} />
      ) : (
        <div className="p-6">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Trip Details</h1>
            <button
              onClick={() => setSelectedTripId(null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </header>
          <div className="p-6 bg-surface-card rounded-xl border border-outline-variant">
            <p>Active Ledger View for Trip: <code className="text-accent-green">{selectedTripId}</code></p>
            <p className="text-gray-400 mt-2">Ledger view component will load here in the next step.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
