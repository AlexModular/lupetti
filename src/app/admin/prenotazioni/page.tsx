"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Trash2,
  RefreshCw,
  ArrowLeft,
  Users,
  Calendar,
} from "lucide-react";

interface AvailabilityRow {
  slug: string;
  title: string;
  date: string;
  maxCapacity: number;
  bookedSpots: number;
  remainingSpots: number;
}

interface BookingRow {
  id: number;
  booking_code: string;
  event_slug: string;
  event_title: string;
  event_date: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  child_name: string;
  child_age: string;
  spots: number;
  notes: string;
  created_at: string;
}

export default function AdminPrenotazioniPage() {
  const [availability, setAvailability] = useState<AvailabilityRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/prenotazioni?admin=1", {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setAvailability(data.availability || []);
      setBookings(data.bookings || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number, code: string) => {
    if (!window.confirm(`Vuoi annullare la prenotazione ${code} e liberare i posti?`)) {
      return;
    }
    await fetch(`/api/prenotazioni?id=${id}`, { method: "DELETE" });
    await loadData();
  };

  const filteredBookings =
    selectedEvent === "ALL"
      ? bookings
      : bookings.filter((b) => b.event_slug === selectedEvent);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-lupetti-teal/20 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src="/images/logo.webp"
              alt="I Lupetti"
              className="h-14 w-auto object-contain"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-800">
                Registro Prenotazioni a Numero Chiuso
              </h1>
              <p className="text-xs font-semibold text-slate-500">
                Database SQLite locale (`data/prenotazioni.sqlite`) / Turso Cloud
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lupetti-tealLight text-lupetti-tealDark text-xs font-bold hover:bg-lupetti-teal hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Aggiorna</span>
            </button>
            <Link
              href="/keystatic"
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
            >
              Modifica Capienze in Keystatic
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Torna al Sito</span>
            </Link>
          </div>
        </div>

        {/* Capacity Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {availability.map((ev) => {
            const pct = Math.min(
              100,
              Math.round((ev.bookedSpots / Math.max(1, ev.maxCapacity)) * 100)
            );
            const active = selectedEvent === ev.slug;
            return (
              <button
                key={ev.slug}
                type="button"
                onClick={() =>
                  setSelectedEvent(active ? "ALL" : ev.slug)
                }
                className={`text-left p-5 rounded-2xl border transition-all ${
                  active
                    ? "bg-lupetti-tealLight/50 border-lupetti-teal shadow-sm"
                    : "bg-white border-slate-200 hover:border-lupetti-teal/40"
                }`}
              >
                <span className="text-[11px] font-bold text-lupetti-tealDark block truncate">
                  {ev.date}
                </span>
                <h3 className="font-display font-bold text-sm text-slate-800 mt-1 line-clamp-1">
                  {ev.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-700">
                    {ev.bookedSpots} / {ev.maxCapacity} posti
                  </span>
                  <span
                    className={
                      ev.remainingSpots === 0
                        ? "text-rose-600"
                        : "text-lupetti-tealDark"
                    }
                  >
                    {ev.remainingSpots} liberi
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-lupetti-teal rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-lupetti-teal" />
              <h2 className="font-display text-lg font-bold text-slate-800">
                Elenco Iscritti ({filteredBookings.length})
              </h2>
            </div>
            {selectedEvent !== "ALL" && (
              <button
                type="button"
                onClick={() => setSelectedEvent("ALL")}
                className="text-xs font-bold text-lupetti-skyDark hover:underline"
              >
                Mostra tutte le attività
              </button>
            )}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Nessuna prenotazione registrata per questo filtro.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 text-xs font-extrabold uppercase text-slate-500 border-b border-slate-200">
                    <th className="py-3.5 px-4">Codice</th>
                    <th className="py-3.5 px-4">Laboratorio / Turno</th>
                    <th className="py-3.5 px-4">Bambino/a</th>
                    <th className="py-3.5 px-4">Genitore &amp; Contatti</th>
                    <th className="py-3.5 px-4">Posti</th>
                    <th className="py-3.5 px-4">Note</th>
                    <th className="py-3.5 px-4 text-right">Azioni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-display font-bold text-lupetti-tealDark whitespace-nowrap">
                        {b.booking_code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800">
                          {b.event_title}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {b.event_date}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800">
                          {b.child_name}
                        </span>{" "}
                        <span className="text-xs text-slate-500">
                          ({b.child_age})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {b.parent_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {b.parent_phone} • {b.parent_email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-lupetti-tealLight text-lupetti-tealDark font-extrabold text-xs">
                          {b.spots}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                        {b.notes || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id, b.booking_code)}
                          title="Annulla prenotazione"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Annulla</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

