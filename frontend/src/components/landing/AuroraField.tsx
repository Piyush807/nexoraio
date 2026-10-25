// Ambient animated background for the landing hero — pure CSS (see the
// .nexora-aurora* rules in index.css), so it adds zero new dependencies.
// Three drifting blobs in the app's existing cyan/mint/amber signal colors,
// plus a faint dot-grid texture for depth. Respects prefers-reduced-motion.
export function AuroraField() {
  return (
    <div className="nexora-aurora" aria-hidden="true">
      <div className="nexora-aurora__blob nexora-aurora__blob--a" />
      <div className="nexora-aurora__blob nexora-aurora__blob--b" />
      <div className="nexora-aurora__blob nexora-aurora__blob--c" />
      <div className="nexora-aurora__grain" />
    </div>
  )
}
