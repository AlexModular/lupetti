import type { ReactNode } from "react";

interface SectionHeaderProps {
  tagline?: string | null;
  heading?: string | null;
  description?: string | null;
  /** Contenuto sotto il titolo (es. un link "Vedi tutti"). */
  aside?: ReactNode;
  className?: string;
}

/**
 * Intestazione comune a tutte le sezioni, nello stile di Da Lucia: tutto
 * centrato, titolo grande in maiuscolo nel colore d'accento.
 */
export default function SectionHeader({
  tagline,
  heading,
  description,
  aside,
  className = "mb-10 sm:mb-12",
}: SectionHeaderProps) {
  if (!tagline && !heading && !description && !aside) return null;

  return (
    <div className={`text-center max-w-3xl mx-auto ${className}`} data-reveal="zoom">
      {tagline && <span className="occhiello mb-1">{tagline}</span>}
      {heading && <h2 className="titolo-sezione">{heading}</h2>}
      {description && (
        <p className="mt-5 text-slate-600 leading-relaxed">{description}</p>
      )}
      {aside && <div className="mt-4">{aside}</div>}
    </div>
  );
}
