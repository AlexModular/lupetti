import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-xs font-extrabold uppercase tracking-wider text-lupetti-tealDark">
        Errore 404
      </p>
      <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-800 mt-1">
        Questa pagina si è nascosta nel bosco
      </h1>
      <p className="mt-3 text-slate-600">
        L&apos;indirizzo non esiste o la pagina è stata spostata.
      </p>
      <Link
        href="/"
        className="btn-pieno mt-8"
      >
        Torna alla home
      </Link>
    </div>
  );
}
