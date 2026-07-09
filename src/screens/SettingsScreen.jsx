import { useState } from 'react';
import { Sun, Moon, Globe, Lock, LogOut, ChevronRight, ArrowLeft } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';

function SettingRow({ t, icon: Icon, label, subtitle, right, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full text-left btn-press"
      style={{
        padding: '14px 0',
        background: 'transparent',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        borderBottom: `1px solid ${t.border}`,
      }}
    >
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-xl"
        style={{
          width: 38,
          height: 38,
          background: danger ? `${t.overdue}18` : t.primarySoft,
        }}
      >
        <Icon size={18} color={danger ? t.overdue : t.primary} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontWeight: 600, fontSize: '0.88rem', color: danger ? t.overdue : t.text }}>
          {label}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.72rem', color: t.textMuted, marginTop: 1 }}>
            {subtitle}
          </div>
        )}
      </div>
      {right || <ChevronRight size={16} color={t.textMuted} strokeWidth={2} />}
    </button>
  );
}

// Toggle switch component
function Toggle({ t, value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        background: value ? t.primary : t.border,
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 3,
          left: value ? 25 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

export default function SettingsScreen({ t, onToggleTheme, onLogout, onBack }) {
  const [pinModalOpen, setPinModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar
        t={t}
        title="Settings"
        onBack={onBack}
        onToggleTheme={onToggleTheme}
      />

      <div className="flex-1 px-4 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 20 }}>
        <div className="max-w-xl mx-auto">

          {/* Profile card */}
          <div
            className="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            {/* Avatar */}
            <div
              className="relative flex-shrink-0 flex items-center justify-center rounded-full"
              style={{
                width: 64,
                height: 64,
                background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
                boxShadow: `0 4px 16px ${t.primary}44`,
              }}
            >
              <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.4rem', color: '#fff' }}>
                AK
              </span>
              {/* Online dot */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: t.paid,
                  border: `2px solid ${t.card}`,
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: t.text }}>
                Amal Kumara
              </div>
              <div style={{ fontSize: '0.75rem', color: t.textMuted, marginTop: 2 }}>
                Field Agent · Colombo Branch
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  marginTop: 6,
                  background: t.primarySoft,
                  color: t.primary,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 10px',
                  borderRadius: 9999,
                  letterSpacing: '0.05em',
                }}
              >
                AGENT ID: AG-0042
              </div>
            </div>
          </div>

          {/* Appearance section */}
          <div
            className="rounded-2xl px-5 mb-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 16, paddingBottom: 8 }}>
              Appearance
            </div>
            <SettingRow
              t={t}
              icon={t.mode === 'light' ? Moon : Sun}
              label="Dark Mode"
              subtitle={t.mode === 'dark' ? 'Currently on' : 'Currently off'}
              right={<Toggle t={t} value={t.mode === 'dark'} onChange={onToggleTheme} />}
              onClick={onToggleTheme}
            />
            <SettingRow
              t={t}
              icon={Globe}
              label="Language"
              subtitle="English (Sri Lanka)"
            />
          </div>

          {/* Security section */}
          <div
            className="rounded-2xl px-5 mb-4"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 16, paddingBottom: 8 }}>
              Security
            </div>
            <SettingRow
              t={t}
              icon={Lock}
              label="Change PIN"
              subtitle="Update your 4–6 digit login PIN"
              onClick={() => alert('PIN change coming soon!')}
            />
          </div>

          {/* Account section */}
          <div
            className="rounded-2xl px-5"
            style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
          >
            <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: 16, paddingBottom: 8 }}>
              Account
            </div>
            <SettingRow
              t={t}
              icon={LogOut}
              label="Log Out"
              subtitle="You will need to sign in again"
              danger
              onClick={onLogout}
            />
          </div>

          {/* Version */}
          <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.65rem', color: t.textMuted }}>
            MicroFinance v0.1 · Passbook Ledger Build
            <br />
            © 2026 MicroFinance Systems Ltd.
          </div>
        </div>
      </div>
    </div>
  );
}
