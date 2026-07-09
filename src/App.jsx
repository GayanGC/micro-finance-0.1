import { useState } from 'react';
import { LIGHT, DARK } from './theme.js';
import { initialLoans } from './data/mockLoans.js';
import { initialCustomers } from './data/mockCustomers.js';
import { initialTodayCollections, monthlyCollections, loanTypeBreakdown } from './data/mockCollections.js';

// Screens
import LoginScreen from './screens/LoginScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import LoansScreen from './screens/LoansScreen.jsx';
import NewLoanScreen from './screens/NewLoanScreen.jsx';
import CustomersScreen from './screens/CustomersScreen.jsx';
import CollectionScreen from './screens/CollectionScreen.jsx';
import ReportsScreen from './screens/ReportsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';

// Navigation shell
import BottomNav from './components/BottomNav.jsx';
import Sidebar from './components/Sidebar.jsx';

// Main nav tabs
const MAIN_SCREENS = ['dashboard', 'loans', 'collection', 'customers', 'reports'];

let loanIdCounter = 13; // starts after mock data

export default function App() {
  // ── Theme ──────────────────────────────────────────────────────────
  const [themeMode, setThemeMode] = useState('light');
  const t = themeMode === 'light' ? LIGHT : DARK;
  function toggleTheme() {
    setThemeMode(m => m === 'light' ? 'dark' : 'light');
  }

  // ── Auth ──────────────────────────────────────────────────────────
  const [loggedIn, setLoggedIn] = useState(false);

  // ── Screen navigation ─────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  // Stack for sub-screens that get "back" button (newloan, settings)
  const [screenStack, setScreenStack] = useState([]);

  function navigate(screen) {
    // Sub-screens pushed onto stack
    if (screen === 'newloan' || screen === 'settings') {
      setScreenStack(s => [...s, currentScreen]);
      setCurrentScreen(screen);
    } else {
      setScreenStack([]);
      setCurrentScreen(screen);
    }
  }

  function goBack() {
    if (screenStack.length > 0) {
      const prev = screenStack[screenStack.length - 1];
      setScreenStack(s => s.slice(0, -1));
      setCurrentScreen(prev);
    }
  }

  // ── State: Loans ──────────────────────────────────────────────────
  const [loans, setLoans] = useState(initialLoans);

  function addLoan(loanData) {
    const id = `L${String(loanIdCounter++).padStart(3, '0')}`;
    setLoans(prev => [{ id, customerId: 'C_NEW', ...loanData }, ...prev]);
  }

  // ── State: Collections ────────────────────────────────────────────
  const [collections, setCollections] = useState(initialTodayCollections);

  function collectPayment(id) {
    setCollections(prev =>
      prev.map(c => c.id === id ? { ...c, paid: true, justPaid: true } : c)
    );
  }

  // ── Derived nav ───────────────────────────────────────────────────
  const activeTab = MAIN_SCREENS.includes(currentScreen) ? currentScreen : screenStack[0] || 'dashboard';
  const isSubScreen = currentScreen === 'newloan' || currentScreen === 'settings';

  // ── Handlers ──────────────────────────────────────────────────────
  function handleLogout() {
    setLoggedIn(false);
    setCurrentScreen('dashboard');
    setScreenStack([]);
  }

  // ── Login gate ────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div
        className="theme-transition"
        style={{ minHeight: '100vh', background: t.bg }}
      >
        <LoginScreen t={t} onLogin={() => setLoggedIn(true)} />
      </div>
    );
  }

  // ── App shell ─────────────────────────────────────────────────────
  return (
    <div
      className="theme-transition"
      style={{
        minHeight: '100vh',
        background: t.bg,
        display: 'flex',
      }}
    >
      {/* Desktop sidebar */}
      <Sidebar
        t={t}
        current={activeTab}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
      />

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // On desktop, offset for sidebar
        }}
        className="lg:ml-60"
      >
        {/* Screen router */}
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            t={t}
            loans={loans}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'loans' && (
          <LoansScreen
            t={t}
            loans={loans}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'newloan' && (
          <NewLoanScreen
            t={t}
            onBack={goBack}
            onSubmit={addLoan}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentScreen === 'collection' && (
          <CollectionScreen
            t={t}
            collections={collections}
            onCollect={collectPayment}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'customers' && (
          <CustomersScreen
            t={t}
            customers={initialCustomers}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            t={t}
            monthlyCollections={monthlyCollections}
            loanTypeBreakdown={loanTypeBreakdown}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            t={t}
            onToggleTheme={toggleTheme}
            onLogout={handleLogout}
            onBack={goBack}
          />
        )}
      </main>

      {/* Mobile bottom nav (hidden on sub-screens for cleaner UX) */}
      {!isSubScreen && (
        <BottomNav
          t={t}
          current={activeTab}
          onNavigate={navigate}
        />
      )}
    </div>
  );
}
