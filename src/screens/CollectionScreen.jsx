import { useState } from 'react';
import { CheckCircle, MapPin, PartyPopper } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import Stamp from '../components/Stamp.jsx';
import { formatRs } from '../theme.js';

function CollectionRow({ t, item, onCollect }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl p-4"
      style={{
        background: t.card,
        border: `1px solid ${item.paid ? t.border : t.border}`,
        boxShadow: t.shadow,
        opacity: item.paid ? 0.75 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      {/* Avatar */}
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-full"
        style={{
          width: 44,
          height: 44,
          background: item.paid ? `${t.paid}18` : t.primarySoft,
          fontFamily: 'Poppins',
          fontWeight: 700,
          fontSize: '0.85rem',
          color: item.paid ? t.paid : t.primary,
        }}
      >
        {item.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: t.text,
            fontFamily: 'Poppins',
            textDecoration: item.paid ? 'line-through' : 'none',
          }}
        >
          {item.customerName}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <MapPin size={11} color={t.textMuted} strokeWidth={2} />
          <span style={{ fontSize: '0.7rem', color: t.textMuted }}>{item.area}</span>
        </div>
        <div
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            fontSize: '0.85rem',
            color: item.paid ? t.paid : t.accent,
            marginTop: 3,
          }}
        >
          {formatRs(item.amountDue)}
        </div>
      </div>

      {/* Action */}
      <div className="flex-shrink-0">
        {item.paid ? (
          <div className={item.justPaid ? 'stamp-pop' : ''}>
            <Stamp t={t} status="Paid" />
          </div>
        ) : (
          <button
            onClick={() => onCollect(item.id)}
            className="flex items-center gap-2 rounded-xl btn-press"
            style={{
              background: t.primary,
              color: t.onPrimary,
              border: 'none',
              padding: '10px 16px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
              boxShadow: `0 3px 12px ${t.primary}44`,
              whiteSpace: 'nowrap',
            }}
          >
            <CheckCircle size={15} strokeWidth={2.5} />
            Collect
          </button>
        )}
      </div>
    </div>
  );
}

export default function CollectionScreen({ t, collections, onCollect, onToggleTheme, onOpenSettings }) {
  const total = collections.length;
  const paidCount = collections.filter(c => c.paid).length;
  const pendingCount = total - paidCount;
  const totalAmount = collections.reduce((s, c) => s + c.amountDue, 0);
  const collectedAmount = collections.filter(c => c.paid).reduce((s, c) => s + c.amountDue, 0);
  const allDone = pendingCount === 0;

  return (
    <div className="flex flex-col min-h-full screen-enter" style={{ background: t.bg }}>
      <TopBar t={t} title="Daily Collection" onToggleTheme={onToggleTheme} onOpenSettings={onOpenSettings} />

      <div className="flex-1 px-4 pb-24 lg:pb-8" style={{ overflowY: 'auto', paddingTop: 16 }}>

        {/* Progress summary card */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{ background: t.card, border: `1px solid ${t.border}`, boxShadow: t.shadow }}
        >
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.9rem', color: t.text }}>
              Today's Progress
            </div>
            <div
              style={{
                background: allDone ? `${t.paid}18` : t.primarySoft,
                color: allDone ? t.paid : t.primary,
                fontSize: '0.7rem',
                fontWeight: 700,
                padding: '4px 12px',
                borderRadius: 9999,
              }}
            >
              {paidCount}/{total} Collected
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              height: 8,
              background: t.bgSubtle,
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${total === 0 ? 0 : (paidCount / total) * 100}%`,
                background: `linear-gradient(90deg, ${t.primary}, ${t.paid})`,
                borderRadius: 4,
                transition: 'width 0.5s ease',
              }}
            />
          </div>

          <div className="flex justify-between">
            <div>
              <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Collected
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: '0.92rem', color: t.paid }}>
                {formatRs(collectedAmount)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.65rem', color: t.textMuted, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pending
              </div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: '0.92rem', color: t.pending }}>
                {formatRs(totalAmount - collectedAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* All done state */}
        {allDone ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <PartyPopper size={40} color={t.paid} strokeWidth={1.5} />
            <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', color: t.paid }}>
              All collections done!
            </div>
            <div style={{ fontSize: '0.8rem', color: t.textMuted, textAlign: 'center' }}>
              Great work today. All {total} payments have been collected.
            </div>
          </div>
        ) : (
          <>
            {/* Pending header */}
            <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {pendingCount} Pending
            </div>

            {/* Pending rows */}
            <div className="flex flex-col gap-3 mb-5">
              {collections.filter(c => !c.paid).map(item => (
                <CollectionRow key={item.id} t={t} item={item} onCollect={onCollect} />
              ))}
            </div>

            {/* Paid rows */}
            {paidCount > 0 && (
              <>
                <div style={{ fontSize: '0.72rem', color: t.textMuted, fontWeight: 500, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {paidCount} Collected
                </div>
                <div className="flex flex-col gap-3">
                  {collections.filter(c => c.paid).map(item => (
                    <CollectionRow key={item.id} t={t} item={item} onCollect={onCollect} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
