// Card — rounded, bordered, themed card container
export default function Card({ t, children, className = '', style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border ${className}`}
      style={{
        background: t.card,
        borderColor: t.border,
        boxShadow: t.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
