import stadium from "@/assets/stadium-hero.jpg";

export function Stadium({ className = "" }: { className?: string }) {
  return (
    <div className={"pointer-events-none absolute inset-0 overflow-hidden " + className}>
      <img
        src={stadium}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/70 to-background" />
      {/* Spotlights */}
      <div className="absolute -top-40 left-1/4 h-[60vh] w-40 bg-neon-yellow/25 blur-3xl animate-spotlight" />
      <div className="absolute -top-40 right-1/4 h-[60vh] w-40 bg-neon-green/25 blur-3xl animate-spotlight" style={{ animationDelay: "-3s" }} />
      <div className="absolute inset-0 grid-pitch opacity-60" />
    </div>
  );
}
