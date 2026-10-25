export function NexoraAtmosphere({ variant = 'default' }: { variant?: 'default' | 'cyan' | 'mint' | 'amber' | 'rose' }) {
  return (
    <div className={`nexora-atmosphere nexora-atmosphere-${variant}`} aria-hidden="true">
      <div className="nexora-atmosphere__halo nexora-atmosphere__halo-a" />
      <div className="nexora-atmosphere__halo nexora-atmosphere__halo-b" />
      <div className="nexora-atmosphere__halo nexora-atmosphere__halo-c" />
      <div className="nexora-atmosphere__grid" />
      <div className="nexora-atmosphere__orb"><span /><i /><b /></div>
      <div className="nexora-atmosphere__vignette" />
    </div>
  )
}
