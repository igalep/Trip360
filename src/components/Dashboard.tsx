import React, { useState, useEffect } from 'react';

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

// Curated beautiful gradients representing travel destinations
const getGradientStyle = (imageUrl: string) => {
  const img = imageUrl.toLowerCase();
  if (img.includes('baku')) {
    return { background: 'linear-gradient(135deg, #FF512F 0%, #DD2476 100%)' };
  }
  if (img.includes('georgia')) {
    return { background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' };
  }
  if (img.includes('budapest')) {
    return { background: 'linear-gradient(135deg, #8A2387 0%, #E94057 50%, #F27121 100%)' };
  }
  if (img.includes('london')) {
    return { background: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' };
  }
  if (img.includes('paris')) {
    return { background: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' };
  }
  if (img.includes('newyork')) {
    return { background: 'linear-gradient(135deg, #4CA1AF 0%, #2C3E50 100%)' };
  }
  return { background: 'linear-gradient(135deg, #434343 0%, #000000 100%)' };
};

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
      console.error('Failed to load trips:', error);
    } finally {
      setLoading(false);
    }
  };

  // Live nights calculation
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
      console.error('Failed to create trip:', error);
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
    return `${symbol}${amount.toFixed(0)}`;
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>My Trips</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
          data-testid="create-trip-btn"
        >
          ✈ Create New Trip
        </button>
      </header>

      {loading ? (
        <div className="loading-spinner">Loading trips...</div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <p>No trips logged yet. Time to plan your next adventure! 🗺</p>
        </div>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="trip-card"
              onClick={() => onSelectTrip(trip.id)}
              data-testid={`trip-card-${trip.id}`}
            >
              <div
                className="trip-card-image"
                style={getGradientStyle(trip.image_url)}
              >
                <div className="trip-card-overlay">
                  <span className="nights-badge">{trip.nights} nights</span>
                </div>
              </div>
              <div className="trip-card-content">
                <h2>{trip.name}</h2>
                <p className="destination">{trip.destination}</p>
                <div className="trip-card-dates">
                  📅 {trip.start_date} - {trip.end_date}
                </div>
                <div className="trip-card-budget">
                  <span className="label">Spent: </span>
                  <span className="value">
                    {formatCurrency(trip.total_spent || 0, trip.base_currency)}
                  </span>
                  <span className="limit">
                    {' '}/ {formatCurrency(trip.budget_limit, trip.base_currency)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2 data-testid="modal-title">Create New Trip</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Trip Name</label>
                <input
                  type="text"
                  className={errors.name ? 'form-control is-invalid' : 'form-control'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baku Summer Getaway"
                  data-testid="input-trip-name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  className={errors.destination ? 'form-control is-invalid' : 'form-control'}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Baku, Azerbaijan"
                  data-testid="input-trip-destination"
                />
                {errors.destination && <span className="error-text">{errors.destination}</span>}
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>Start Date</label>
                  <input
                    type="date"
                    className={errors.startDate ? 'form-control is-invalid' : 'form-control'}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-trip-start"
                  />
                  {errors.startDate && <span className="error-text">{errors.startDate}</span>}
                </div>

                <div className="form-group col">
                  <label>End Date</label>
                  <input
                    type="date"
                    className={errors.endDate ? 'form-control is-invalid' : 'form-control'}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-trip-end"
                  />
                  {errors.endDate && <span className="error-text">{errors.endDate}</span>}
                </div>
              </div>

              <div className="nights-preview">
                Nights: <strong>{calculateNights()}</strong>
              </div>

              <div className="form-row">
                <div className="form-group col">
                  <label>Budget Limit</label>
                  <input
                    type="number"
                    className="form-control"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    min="1"
                    data-testid="input-trip-budget"
                  />
                </div>

                <div className="form-group col">
                  <label>Base Currency</label>
                  <select
                    className="form-control"
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

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
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
                  className="btn btn-primary"
                  data-testid="submit-trip-btn"
                >
                  Create Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
