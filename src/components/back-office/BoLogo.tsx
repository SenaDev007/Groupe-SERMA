/**
 * Logo du back-office — identique à l'identité publique (pastille marine "S"
 * orange + wordmark SERMA). Statique par exigence : aucune animation autour
 * du logo.
 */
export function BoLogo({
  variant = "dark",
  size = "md",
  sub = "BACK-OFFICE",
}: {
  variant?: "light" | "dark";
  size?: "md" | "lg";
  sub?: string;
}) {
  const isLight = variant === "light";
  const pill = size === "lg" ? "w-14 h-14" : "w-10 h-10";
  const letter = size === "lg" ? "text-2xl" : "text-lg";
  const word = size === "lg" ? "text-2xl sm:text-3xl" : "text-xl";

  return (
    <div className="flex items-center gap-3 select-none">
      <span
        className={`flex items-center justify-center ${pill} rounded-full ${
          isLight ? "bg-white/[0.1] border border-white/15" : "bg-marine-profond"
        } shadow-md shrink-0`}
      >
        <span className={`font-playfair font-black ${letter} text-orange-logo`}>S</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-playfair ${word} font-black tracking-tight ${isLight ? "text-white" : "text-marine-profond"}`}>
          SERMA <span className="text-orange-logo">{sub}</span>
        </span>
        <span
          className={`hidden sm:block text-[9px] font-bold uppercase tracking-[0.22em] mt-1 ${
            isLight ? "text-white/50" : "text-vert-tech"
          }`}
        >
          Former · Structurer · Performer
        </span>
      </span>
    </div>
  );
}
