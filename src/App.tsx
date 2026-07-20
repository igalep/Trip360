import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LedgerView from './components/LedgerView';
import CategoryManageView from './components/CategoryManageView';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Match /trip/:trip_name/category/:category_name route
  const categoryMatch = currentPath.match(/^\/trip\/([^/]+)\/category\/([^/]+)$/);
  const rawCatTripParam = categoryMatch ? categoryMatch[1] : null;
  const rawCategoryParam = categoryMatch ? categoryMatch[2] : null;

  const categoryTripIdentifier = rawCatTripParam ? decodeURIComponent(rawCatTripParam) : null;
  const categoryIdentifier = rawCategoryParam ? decodeURIComponent(rawCategoryParam) : null;

  // Match /trip/:trip_name route
  const tripMatch = currentPath.match(/^\/trip\/([^/]+)$/);
  const rawTripParam = tripMatch ? tripMatch[1] : null;
  const selectedTripIdentifier = rawTripParam ? decodeURIComponent(rawTripParam) : null;

  return (
    <div className="flex flex-col min-h-screen bg-bg-app text-text-main pb-16">
      {categoryTripIdentifier && categoryIdentifier ? (
        <CategoryManageView
          tripIdentifier={categoryTripIdentifier}
          categoryIdentifier={categoryIdentifier}
          onBack={() => navigate(`/trip/${encodeURIComponent(categoryTripIdentifier)}`)}
        />
      ) : selectedTripIdentifier ? (
        <LedgerView
          tripId={selectedTripIdentifier}
          onBack={() => navigate('/')}
          onSelectCategory={(catName) =>
            navigate(`/trip/${encodeURIComponent(selectedTripIdentifier)}/category/${encodeURIComponent(catName)}`)
          }
        />
      ) : (
        <Dashboard onSelectTrip={(tripName) => navigate(`/trip/${encodeURIComponent(tripName)}`)} />
      )}
    </div>
  );
}

export default App;
