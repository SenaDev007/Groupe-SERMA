interface TestimonialCardProps {
  result: string;
  quote: string;
  author: string;
  roleOrSub?: string;
  dark?: boolean;
}

export default function TestimonialCard({
  result,
  quote,
  author,
  roleOrSub,
  dark = false,
}: TestimonialCardProps) {
  return (
    <div
      className={`rounded-2xl p-6 sm:p-8 border transition-all duration-300 ${
        dark
          ? "bg-marine-moyen/30 border-white/[0.06] hover:border-orange-logo/20"
          : "bg-white border-slate-200 hover:border-orange-logo/20 shadow-sm"
      }`}
    >
      {/* Result Badge / Header */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-orange-logo/10 text-orange-logo">
          {result}
        </span>
      </div>

      {/* Quote */}
      <blockquote className={`text-sm md:text-base italic leading-relaxed mb-6 ${
        dark ? "text-slate-300" : "text-slate-700"
      }`}>
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author details */}
      <div className="border-t border-slate-100 dark:border-white/[0.05] pt-4">
        <p className={`text-sm font-bold ${dark ? "text-white" : "text-marine-profond"}`}>
          {author}
        </p>
        {roleOrSub && (
          <p className="text-slate-400 text-xs mt-0.5 font-medium">
            {roleOrSub}
          </p>
        )}
      </div>
    </div>
  );
}
