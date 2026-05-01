export function BackgroundFX() {
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[#03050f]" />

      <div
        className="absolute inset-0 scale-[1.04] bg-cover bg-center opacity-100 brightness-[1.28] saturate-[1.15] animate-bgfx-pan"
        style={{ backgroundImage: "url('/assets/backgrounds/knowledge-quest-bg.png')" }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(180deg,_rgba(3,5,15,0.04)_0%,_rgba(3,5,15,0.16)_62%,_rgba(3,5,15,0.58)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(3,5,15,0)_0%,_rgba(3,5,15,0.18)_72%,_rgba(0,0,0,0.55)_100%)]" />

      <div
        className="absolute inset-0 opacity-[0.075]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_44%,_rgba(0,0,0,0.38)_100%)]" />
    </div>
  )
}
