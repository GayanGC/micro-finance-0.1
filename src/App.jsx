import { useState, useContext, useEffect } from 'react';
import { LIGHT, DARK } from './theme.js';
import { AuthContext } from './context/AuthContext.jsx';

// Screens
import LoginScreen        from './screens/LoginScreen.jsx';
import DashboardScreen    from './screens/DashboardScreen.jsx';
import LoansScreen        from './screens/LoansScreen.jsx';
import NewLoanScreen      from './screens/NewLoanScreen.jsx';
import CustomersScreen    from './screens/CustomersScreen.jsx';
import CollectionScreen   from './screens/CollectionScreen.jsx';
import ReportsScreen      from './screens/ReportsScreen.jsx';
import SettingsScreen     from './screens/SettingsScreen.jsx';
import EmployeesScreen    from './screens/EmployeesScreen.jsx';
import AttendanceScreen   from './screens/AttendanceScreen.jsx';
import LeaveScreen        from './screens/LeaveScreen.jsx';
import PolicyScreen       from './screens/PolicyScreen.jsx';
import SalariesScreen     from './screens/SalariesScreen.jsx';
import SupportScreen      from './screens/SupportScreen.jsx';
import ETFEPFScreen       from './screens/ETFEPFScreen.jsx';
import LoanRepaymentScreen from './screens/LoanRepaymentScreen.jsx';
import CustomerPortalScreen from './screens/CustomerPortalScreen.jsx';

// Shell
import BottomNav from './components/BottomNav.jsx';
import Sidebar   from './components/Sidebar.jsx';

// Which screens are "main" nav tabs
const MAIN_SCREENS = [
  'dashboard','loans','collection','customers','reports',
  'employees','attendance','leave','policies','salaries','support','etfepf',
];
// Which screens show a back-button instead of hamburger
const SUB_SCREENS = ['newloan','settings','repayment'];

export default function App() {
  /* ── Theme ── */
  const [themeMode, setThemeMode] = useState('light');
  const t = themeMode === 'light' ? LIGHT : DARK;
  const toggleTheme = () => setThemeMode(m => m === 'light' ? 'dark' : 'light');

  /* ── Auth ── */
  const { isAuthenticated, loading: authLoading, logout } = useContext(AuthContext);

  /* ── Navigation ── */
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [screenStack,   setScreenStack]   = useState([]);
  const [screenParams,  setScreenParams]  = useState({});

  function navigate(screen, params = {}) {
    if (SUB_SCREENS.includes(screen)) {
      setScreenStack(s => [...s, currentScreen]);
      setCurrentScreen(screen);
      setScreenParams(params);
    } else {
      setScreenStack([]);
      setCurrentScreen(screen);
      setScreenParams({});
      setMobileNavOpen(false); // close drawer on nav
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

  const activeTab   = MAIN_SCREENS.includes(currentScreen)
    ? currentScreen
    : screenStack.find(s => MAIN_SCREENS.includes(s)) || 'dashboard';
  const isSubScreen = SUB_SCREENS.includes(currentScreen);

  /* ── Mobile sidebar drawer ── */
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') setMobileNavOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileNavOpen]);

  /* ── Auth loading ── */
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: t.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 700, color: t.primary, fontSize: '1rem' }}>
          Loading MicroFinance...
        </div>
      </div>
    );
  }

  /* ── Login ── */
  if (!isAuthenticated) {
    return (
      <div className="theme-transition" style={{ minHeight: '100vh', background: t.bg }}>
        <LoginScreen t={t} onToggleTheme={toggleTheme} />
      </div>
    );
  }

  /* ── Customer Portal Gate ── */
  const { user } = useContext(AuthContext);
  if (user?.role === 'customer') {
    return (
      <div className="theme-transition" style={{ minHeight: '100vh', background: t.bg }}>
        <CustomerPortalScreen t={t} onToggleTheme={toggleTheme} />
      </div>
    );
  }

  /* ── Common screen props ── */
  const commonProps = {
    t,
    onNavigate:       navigate,
    onToggleTheme:    toggleTheme,
    onOpenSettings:   () => navigate('settings'),
    onOpenMobileNav:  () => setMobileNavOpen(true),
  };

  /* ── Screen router ── */
  function renderScreen() {
    switch (currentScreen) {
      case 'dashboard':  return <DashboardScreen    {...commonProps} />;
      case 'loans':      return <LoansScreen         {...commonProps} />;
      case 'newloan':    return <NewLoanScreen        t={t} onBack={goBack} onToggleTheme={toggleTheme} />;
      case 'repayment':  return <LoanRepaymentScreen  t={t} loanId={screenParams.loanId} onBack={goBack} onToggleTheme={toggleTheme} />;
      case 'collection': return <CollectionScreen    {...commonProps} />;
      case 'customers':  return <CustomersScreen     {...commonProps} />;
      case 'reports':    return <ReportsScreen       {...commonProps} />;
      case 'settings':   return <SettingsScreen       t={t} onToggleTheme={toggleTheme} onLogout={logout} onBack={goBack} />;
      case 'employees':  return <EmployeesScreen     {...commonProps} />;
      case 'attendance': return <AttendanceScreen    {...commonProps} />;
      case 'leave':      return <LeaveScreen         {...commonProps} />;
      case 'policies':   return <PolicyScreen        {...commonProps} />;
      case 'salaries':   return <SalariesScreen      {...commonProps} />;
      case 'support':    return <SupportScreen       {...commonProps} />;
      case 'etfepf':     return <ETFEPFScreen        {...commonProps} />;
      default:           return <DashboardScreen     {...commonProps} />;
    }
  }

  return (
    <div
      className="theme-transition"
      style={{ minHeight: '100vh', background: t.bg, display: 'flex', position: 'relative' }}
    >
      {/* ══ DESKTOP SIDEBAR — always visible on lg+ ══ */}
      <Sidebar
        t={t}
        current={activeTab}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
        variant="desktop"
      />

      {/* ══ MOBILE SIDEBAR DRAWER OVERLAY ══ */}
      {mobileNavOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setMobileNavOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              animation: 'fadeIn 0.18s ease',
            }}
          />
          {/* Drawer */}
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: 272, zIndex: 210,
              animation: 'slideInLeft 0.22s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '4px 0 32px rgba(0,0,0,0.3)',
            }}
          >
            <Sidebar
              t={t}
              current={activeTab}
              onNavigate={navigate}
              onToggleTheme={toggleTheme}
              variant="mobile"
              onClose={() => setMobileNavOpen(false)}
            />
          </div>
        </>
      )}

      {/* ══ MAIN CONTENT ══ */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          minWidth: 0,
        }}
        className="w-full overflow-x-hidden lg:p-4"
      >
        <div
          className="flex flex-col flex-1 lg:rounded-2xl lg:border lg:shadow-sm overflow-hidden"
          style={{
            background: t.bg,
            borderColor: t.border,
          }}
        >
          {renderScreen()}
        </div>
      </main>

      {/* ══ MOBILE BOTTOM NAV (hidden on sub-screens) ══ */}
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
