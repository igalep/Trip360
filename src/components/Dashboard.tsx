import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';

export interface Trip {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
  nights: number;
  base_currency: string;
  budget_limit: number;
  image_url: string;
  total_spent?: number;
}

interface DashboardProps {
  onSelectTrip: (tripId: string) => void;
}

export default function Dashboard({ onSelectTrip }: DashboardProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetLimit, setBudgetLimit] = useState('1000');
  const [baseCurrency, setBaseCurrency] = useState('USD');

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trips');
      const json = await response.json();
      if (json.status === 'success') {
        setTrips(json.data);
      }
    } catch (error) {
      logger.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Trip name is required';
    if (!destination.trim()) newErrors.destination = 'Destination is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.endDate = 'End date cannot be before start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        name,
        destination,
        start_date: startDate,
        end_date: endDate,
        budget_limit: Number(budgetLimit) || 1000.0,
        base_currency: baseCurrency,
      };

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await response.json();
      if (json.status === 'success') {
        setShowModal(false);
        resetForm();
        fetchTrips();
      } else if (json.message === 'Validation failed' && json.errors) {
        const serverErrors: Record<string, string> = {};
        json.errors.forEach((err: any) => {
          serverErrors[err.field] = err.message;
        });
        setErrors(serverErrors);
      }
    } catch (error) {
      logger.error('Failed to create trip:', error);
    }
  };

  const resetForm = () => {
    setName('');
    setDestination('');
    setStartDate('');
    setEndDate('');
    setBudgetLimit('1000');
    setBaseCurrency('USD');
    setErrors({});
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbolMap: Record<string, string> = {
      USD: '$',
      EUR: '€',
      ILS: '₪',
      GBP: '£',
    };
    const symbol = symbolMap[currency] || currency + ' ';
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // YTD Stats calculations
  const totalSpentYTD = trips.reduce((sum, trip) => sum + (trip.total_spent || 0), 0);
  const activeDestinationsCount = trips.length;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-955 text-gray-100 pb-20">
      {/* TopNavBar */}
      <header className="flex justify-between items-center w-full px-6 h-16 sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-emerald-400 tracking-wider">TripVault</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined p-2 text-zinc-400 hover:bg-zinc-800 rounded-full transition-all">
            notifications
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 flex items-center justify-center font-bold text-sm text-emerald-400">
            A
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow px-6 pt-6 pb-4 max-w-2xl mx-auto w-full">
        {/* YTD Stats Grid */}
        <section className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg">
            <p className="text-[10px] tracking-wider font-semibold text-zinc-500 uppercase mb-1">Total Spent (YTD)</p>
            <p className="text-lg font-bold font-mono text-emerald-400">${totalSpentYTD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg">
            <p className="text-[10px] tracking-wider font-semibold text-zinc-500 uppercase mb-1">Destinations</p>
            <p className="text-lg font-bold font-mono text-gray-200">{activeDestinationsCount}</p>
          </div>
        </section>

        {/* Section Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-md font-bold uppercase tracking-wider text-zinc-400">Recent Trips</h2>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
            data-testid="create-trip-btn"
          >
            + Create Trip
          </button>
        </div>

        {/* Trips List */}
        {loading ? (
          <div className="text-center py-12 text-zinc-500">Loading your journeys...</div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-zinc-800 border-dashed rounded-2xl space-y-3">
            <p className="text-sm text-zinc-500 italic">No trips planned yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => {
              const spent = trip.total_spent || 0;
              const limit = trip.budget_limit;
              const percent = Math.min(100, limit > 0 ? Math.round((spent / limit) * 100) : 0);
              const isOver = spent > limit;

              return (
                <div
                  key={trip.id}
                  onClick={() => onSelectTrip(trip.id)}
                  data-testid={`trip-card-${trip.id}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col transition-all active:scale-[0.98] cursor-pointer hover:border-zinc-700"
                >
                  {/* Banner Gradient representing Destination cover */}
                  <div className="h-32 w-full relative bg-gradient-to-r from-emerald-950 to-zinc-900 flex items-end p-4">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-3 left-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-bold">
                      Active
                    </div>
                    <div className="relative z-10">
                      <span className="text-xs font-bold text-emerald-400 font-mono">{trip.nights} nights</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-bold text-gray-200">{trip.name}</h3>
                        <p className="text-xs text-zinc-500 mt-0.5">{trip.destination}</p>
                        <p className="text-[10px] text-zinc-600 font-medium mt-1">📅 {trip.start_date} - {trip.end_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] tracking-wider font-semibold text-zinc-500 uppercase">Spent</p>
                        <p className="text-sm font-bold text-gray-200 font-mono mt-0.5">
                          {formatCurrency(spent, trip.base_currency)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar indicator */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-semibold">
                        <span className={isOver ? 'text-red-400' : 'text-zinc-500'}>
                          Budget: {formatCurrency(limit, trip.base_currency)}
                        </span>
                        <span className={isOver ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                          {percent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            isOver ? 'bg-red-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Start New Journey Dashed Card */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full border-2 border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-zinc-900/20 hover:bg-zinc-900/40 transition-all mt-6 group"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-all">
            <span className="material-symbols-outlined text-emerald-400 text-2xl font-bold">add</span>
          </div>
          <p className="text-sm font-bold text-zinc-300">Start a New Journey</p>
          <p className="text-xs text-zinc-600">Plan your next adventure budget</p>
        </button>
      </main>

      {/* Floating Action Button (FAB) at bottom-right */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 bg-emerald-500 text-black rounded-full shadow-lg flex items-center justify-center active:scale-90 transition-transform z-30 font-bold hover:bg-emerald-400"
      >
        <span className="material-symbols-outlined text-2xl font-bold">add_task</span>
      </button>

      {/* Navigation bottom bar placeholder */}
      <nav className="fixed bottom-0 left-0 right-0 h-14 bg-zinc-900 border-t border-zinc-800 flex justify-around items-center z-40">
        <button className="flex flex-col items-center justify-center text-emerald-400 font-bold">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] tracking-wider mt-0.5">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-400">
          <span className="material-symbols-outlined">explore</span>
          <span className="text-[10px] tracking-wider mt-0.5">Trips</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-400">
          <span className="material-symbols-outlined">bar_chart</span>
          <span className="text-[10px] tracking-wider mt-0.5">Stats</span>
        </button>
        <button className="flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-400">
          <span className="material-symbols-outlined">account_circle</span>
          <span className="text-[10px] tracking-wider mt-0.5">Profile</span>
        </button>
      </nav>

      {/* Create Trip Dialog Modal Overlay */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
          ></div>
          <div className="fixed inset-x-6 top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl z-50 space-y-4 max-w-sm mx-auto">
            <h2 className="text-md font-bold text-gray-100 uppercase tracking-wider" data-testid="modal-title">
              Create New Journey
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-semibold uppercase">Trip Name</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:ring-0"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baku Summer Getaway"
                  data-testid="input-trip-name"
                />
                {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-500 font-semibold uppercase">Destination</label>
                <input
                  type="text"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:ring-0"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Baku, Azerbaijan"
                  data-testid="input-trip-destination"
                />
                {errors.destination && <span className="text-xs text-red-500">{errors.destination}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-semibold uppercase">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-emerald-500 focus:ring-0"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-trip-start"
                  />
                  {errors.startDate && <span className="text-xs text-red-500">{errors.startDate}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-semibold uppercase">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-emerald-500 focus:ring-0"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-trip-end"
                  />
                  {errors.endDate && <span className="text-xs text-red-500">{errors.endDate}</span>}
                </div>
              </div>

              <div className="text-xs text-zinc-500 font-semibold">
                Nights: <strong className="text-emerald-400 font-mono">{calculateNights()}</strong>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-semibold uppercase">Budget Limit</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:ring-0 font-mono"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    min="1"
                    data-testid="input-trip-budget"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-semibold uppercase">Base Currency</label>
                  <select
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:border-emerald-500 focus:ring-0"
                    value={baseCurrency}
                    onChange={(e) => setBaseCurrency(e.target.value)}
                    data-testid="input-trip-currency"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="ILS">ILS (₪)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  data-testid="cancel-trip-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                  data-testid="submit-trip-btn"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
