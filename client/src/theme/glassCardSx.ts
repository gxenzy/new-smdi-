export const glassCardSx = ({
  blur = 12,
  bgOpacity = 0.7,
  accent = '#222831',
  borderOpacity = 0.12,
  borderRadius = 12,
} = {}) => ({
  bgcolor: `rgba(238,238,238,${bgOpacity})`,
  color: accent,
  backdropFilter: `blur(${blur}px)`,
  WebkitBackdropFilter: `blur(${blur}px)`,
  boxShadow: '0 4px 24px rgba(34,40,49,0.08)',
  border: `1px solid rgba(34,40,49,${borderOpacity})`,
  borderRadius,
}); 