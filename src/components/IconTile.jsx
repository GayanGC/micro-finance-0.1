// IconTile — rounded icon container with tinted background
export default function IconTile({ t, icon: Icon, color, size = 40, iconSize = 20, style = {} }) {
  const bg = color ? `${color}1A` : t.primarySoft;
  const iconColor = color || t.primary;
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.35),
        background: bg,
        ...style,
      }}
    >
      <Icon size={iconSize} color={iconColor} strokeWidth={2} />
    </div>
  );
}
