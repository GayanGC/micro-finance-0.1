import { useState, useContext } from 'react';
import { LIGHT, DARK } from './theme.js';
import { AuthContext } from './context/AuthContext.jsx';

// Screens
import LoginScreen from './screens/LoginScreen.jsx';
import DashboardScreen from './screens/DashboardScreen.jsx';
import LoansScreen from './screens/LoansScreen.jsx';
import NewLoanScreen from './screens/NewLoanScreen.jsx';
import CustomersScreen from './screens/CustomersScreen.jsx';
import CollectionScreen from './screens/CollectionScreen.jsx';
import ReportsScreen from './screens/ReportsScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import EmployeesScreen from './screens/EmployeesScreen.jsx';
import AttendanceScreen from './screens/AttendanceScreen.jsx';
import LeaveScreen from './screens/LeaveScreen.jsx';
import PolicyScreen from './screens/PolicyScreen.jsx';
import SalariesScreen from './screens/SalariesScreen.jsx';
import SupportScreen from './screens/SupportScreen.jsx';
import ETFEPFScreen from './screens/ETFEPFScreen.jsx';
import LoanRepaymentScreen from './screens/LoanRepaymentScreen.jsx';

// Navigation shell
import BottomNav from './components/BottomNav.jsx';
import Sidebar from './components/Sidebar.jsx';

// Main nav tabs (all navigable top-level screens)
const MAIN_SCREENS = [
  'dashboard', 'loans', 'collection', 'customers', 'reports',
  'employees', 'attendance', 'leave', 'policies', 'salaries', 'support', 'etfepf'
];

// Sub-screens that get a "back" button
const SUB_SCREENS = ['newloan', 'settings', 'repayment'];

export default function App() {
  // ── Theme ──────────────────────────────────────────────────────────
  const [themeMode, setThemeMode] = useState('light');
  const t = themeMode === 'light' ? LIGHT : DARK;
  function toggleTheme() {
    setThemeMode(m => m === 'light' ? 'dark' : 'light');
  }

  // ── Auth ──────────────────────────────────────────────────────────
  const { isAuthenticated, loading: authLoading, logout } = useContext(AuthContext);

  // ── Screen navigation ─────────────────────────────────────────────
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [screenStack, setScreenStack] = useState([]);
  // Extra params for sub-screens (e.g. loanId for repayment)
  const [screenParams, setScreenParams] = useState({});

  function navigate(screen, params = {}) {
    if (SUB_SCREENS.includes(screen)) {
      setScreenStack(s => [...s, currentScreen]);
      setCurrentScreen(screen);
      setScreenParams(params);
    } else {
      setScreenStack([]);
      setCurrentScreen(screen);
      setScreenParams({});
    }
  }

  function goBack() {
    if (screenStack.length > 0) {
      const prev = screenStack[screenStack.length - 1];
      setScreenStack(s => s.slice(0, -1));
      setCurrentScreen(prev);
      setScreenParams({});
    }
  }

  const activeTab = MAIN_SCREENS.includes(currentScreen)
    ? currentScreen
    : screenStack.find(s => MAIN_SCREENS.includes(s)) || 'dashboard';
  const isSubScreen = SUB_SCREENS.includes(currentScreen);

  // ── Loading state for token verification ──────────────────────────
  if (authLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen theme-transition"
        style={{ background: t.bg }}
      >
        <div className="animate-pulse" style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.primary }}>
          Loading MicroFinance...
        </div>
      </div>
    );
  }

  // ── Login gate ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div
        className="theme-transition"
        style={{ minHeight: '100vh', background: t.bg }}
      >
        <LoginScreen t={t} onToggleTheme={toggleTheme} />
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
          minWidth: 0,
        }}
        className="w-full overflow-x-hidden"
      >
        {/* Screen router */}
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'loans' && (
          <LoansScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'newloan' && (
          <NewLoanScreen
            t={t}
            onBack={goBack}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentScreen === 'repayment' && (
          <LoanRepaymentScreen
            t={t}
            loanId={screenParams.loanId}
            onBack={goBack}
            onToggleTheme={toggleTheme}
          />
        )}

        {currentScreen === 'collection' && (
          <CollectionScreen
            t={t}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'customers' && (
          <CustomersScreen
            t={t}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'reports' && (
          <ReportsScreen
            t={t}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'settings' && (
          <SettingsScreen
            t={t}
            onToggleTheme={toggleTheme}
            onLogout={logout}
            onBack={goBack}
          />
        )}

        {currentScreen === 'employees' && (
          <EmployeesScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'attendance' && (
          <AttendanceScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'leave' && (
          <LeaveScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'policies' && (
          <PolicyScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'salaries' && (
          <SalariesScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'support' && (
          <SupportScreen
            t={t}
            onNavigate={navigate}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
          />
        )}

        {currentScreen === 'etfepf' && (
          <ETFEPFScreen
            t={t}
            onToggleTheme={toggleTheme}
            onOpenSettings={() => navigate('settings')}
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
