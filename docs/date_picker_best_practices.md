# Date Picker Implementation Best Practices

This document outlines the design standards, technical implementation guidelines, and common pitfalls resolved during the date picker refactoring in the **BudgetControl** app.

---

## 🎨 1. Legibility & Styling in Dark Mode

### The Problem
When styling native `<input type="date">` elements in dark themes (using Tailwind or custom CSS), developers often set the text color to white (`text-white`) and background to dark (`bg-zinc-950`). However, browsers default to rendering native calendar selector popovers in **light mode**, leading to severe readability issues (white-on-white text, invisible fields, or low-contrast icons).

### The Best Practice
Always enforce the dark color scheme on date inputs using the `color-scheme` CSS property. This instructs the browser to render the native calendar dropdown panels, selectors, and controls using its built-in dark styles.

```tsx
<input
  type="date"
  style={{ colorScheme: 'dark' }}
  className="w-full bg-zinc-950 text-white focus:border-emerald-500"
/>
```

---

## 📅 2. Active Date Range Validation & Synchrony

### The Problem
Allowing users to select invalid trip durations (e.g., an End Date before the Start Date) creates application state errors and negative day/night calculations.

### The Best Practices
1. **Dynamic Inputs Boundaries**: Use the native `min` and `max` attributes on start/end fields to prevent selecting invalid dates in the calendar picker.
2. **State Auto-Adjustment**: If the user updates the Start Date to be later than the current End Date, automatically bump or clear the End Date to keep the range valid.

#### Example React Implementation:
```tsx
const [startDate, setStartDate] = useState('');
const [endDate, setEndDate] = useState('');

const handleStartDateChange = (val: string) => {
  setStartDate(val);
  // Auto-bump End Date if it becomes earlier than the new Start Date
  if (endDate && val > endDate) {
    setEndDate(val);
  }
};

const handleEndDateChange = (val: string) => {
  setEndDate(val);
  // Auto-pull Start Date if it becomes later than the new End Date
  if (startDate && val < startDate) {
    setStartDate(val);
  }
};

return (
  <>
    <input
      type="date"
      value={startDate}
      onChange={(e) => handleStartDateChange(e.target.value)}
      max={endDate || undefined}
      style={{ colorScheme: 'dark' }}
    />
    <input
      type="date"
      value={endDate}
      onChange={(e) => handleEndDateChange(e.target.value)}
      min={startDate || undefined}
      style={{ colorScheme: 'dark' }}
    />
  </>
);
```

---

## 💰 3. Smart Presets & Context-Aware Defaults

### The Problem
When logging a transaction or expense for an active trip, defaulting the field to "today's date" can trigger immediate validation failures if the trip occurred in the past or is planned in the future.

### The Best Practices
1. **Enforce Context Boundaries**: Restrict transaction date fields to the parent trip's actual duration by setting `min={trip.start_date}` and `max={trip.end_date}`.
2. **Context-Aware Default Initialization**: Check if the current date lies within the trip's start and end dates.
   * If **Yes**: Default the picker input to the current date.
   * If **No**: Auto-preset the input value to the trip's `start_date` so the user is immediately prompted with a valid default.

```tsx
const todayStr = new Date().toISOString().split('T')[0];

if (todayStr < trip.start_date || todayStr > trip.end_date) {
  setExpenseDate(trip.start_date);
} else {
  setExpenseDate(todayStr);
}
```

---

## 🧪 4. Testing Date inputs in Jest/JSDOM

Ensure unit tests are decoupled from system time offsets by matching formatted string patterns (`YYYY-MM-DD`). If stubbing native browser date behaviors, ensure `jsdom` or testing-library inputs trigger standard `change` events rather than direct state mutation:

```tsx
fireEvent.change(screen.getByTestId('input-trip-start'), {
  target: { value: '2026-08-01' },
});
```
