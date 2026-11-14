"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  CalendarCheck,
  Loader2,
} from "lucide-react";

export interface EventItem {
  slug: string;
  title: string;
  date: string;
  category: string;
  ageRange: string;
  bookable?: boolean;
  maxCapacity?: number;
  price?: string;
  summary: string;
  image: string;
  featured: boolean;
}

interface AvailabilityInfo {
  slug: string;
  maxCapacity: number;
  bookedSpots: number;
  remainingSpots: number;
  isSoldOut: boolean;
}

interface EventsSectionProps {
  eventi: EventItem[];
}

export default function EventsSection({ eventi }: EventsSectionProps) {
  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, AvailabilityInfo>
  >({});
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);

  // Booking form state
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [spots, setSpots] = useState(1);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    booking_code: string;
    event_title: string;
    event_date: string;
    spots: number;
  } | null>(null);

  const fetchAvailability = useCallback(async () => {
    try {
      const res = await fetch("/api/prenotazioni", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<string, AvailabilityInfo> = {};
      for (const item of data.availability || []) {
        map[item.slug] = item;
      }
      setAvailabilityMap(map);
    } catch {
      // ignore offline error
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const openBookingModal = (ev: EventItem) => {
    setActiveEvent(ev);
    setSpots(1);
    setErrorMsg(null);
    setConfirmedBooking(null);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/prenotazioni", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_slug: activeEvent.slug,
          parent_name: parentName,
          parent_email: parentEmail,
          parent_phone: parentPhone,
          child_name: childName,
          child_age: childAge,
          spots,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Non è stato possibile completare la prenotazione.");
        await fetchAvailability();
      } else {
        setConfirmedBooking(data.booking);
        await fetchAvailability();
      }
    } catch {
      setErrorMsg("Errore di connessione. Riprova tra qualche istante.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="prenotazioni" className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
        {eventi.map((evento) => {
          const maxCap =
            availabilityMap[evento.slug]?.maxCapacity ??
            evento.maxCapacity ??
            10;
          const remaining =
            availabilityMap[evento.slug]?.remainingSpots ?? maxCap;
          const booked =
            availabilityMap[evento.slug]?.bookedSpots ?? maxCap - remaining;
          const isSoldOut = remaining <= 0;
          const percentBooked = Math.min(
            100,
            Math.round((booked / Math.max(1, maxCap)) * 100)
          );

          return (
            <div
              key={evento.slug}
              className="bg-white rounded-3xl border border-lupetti-teal/20 shadow-card overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-lupetti-tealLight/40 overflow-hidden">
                  <img
                    src={evento.image || "/images/gallery/laboratorio-pittura.svg"}
                    alt={evento.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/95 text-lupetti-tealDark shadow-sm">
                      {evento.category}
                    </span>
                    {evento.price && (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-lupetti-sky text-white shadow-sm">
                        {evento.price}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 text-lupetti-tealDark bg-lupetti-tealLight px-3 py-1 rounded-full">
                      <Calendar className="w-3.5 h-3.5" />
                      {evento.date}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Users className="w-3.5 h-3.5 text-lupetti-sky" />
                      {evento.ageRange}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-slate-800">
                    {evento.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {evento.summary}
                  </p>
                </div>
              </div>

              {/* Capacity Progress Bar & Booking Button */}
              <div className="px-6 pb-6 pt-3 border-t border-slate-100 space-y-3.5">
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold mb-1.5">
                    <span
                      className={
                        isSoldOut
                          ? "text-rose-600"
                          : remaining <= 3
                          ? "text-amber-600"
                          : "text-lupetti-tealDark"
                      }
                    >
                      {isSoldOut
                        ? "Posti Esauriti (Completo)"
                        : `Posti disponibili: ${remaining} su ${maxCap}`}
                    </span>
                    <span className="text-slate-400">
                      {booked}/{maxCap} prenotati
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSoldOut
                          ? "bg-rose-400"
                          : remaining <= 3
                          ? "bg-amber-400"
                          : "bg-gradient-to-r from-lupetti-teal to-lupetti-sky"
                      }`}
                      style={{ width: `${percentBooked}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => openBookingModal(evento)}
                  className={`w-full py-3 px-4 rounded-2xl font-display font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isSoldOut
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-lupetti-teal hover:bg-lupetti-tealDark text-white shadow-sm"
                  }`}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>
                    {isSoldOut ? "Turno al Completo" : "Prenota Posto Online"}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Prenotazione a Numero Chiuso */}
      {activeEvent && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveEvent(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-lupetti-teal/20 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                  Prenotazione a Numero Chiuso
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-800 mt-0.5">
                  {activeEvent.title}
                </h3>
                <p className="text-xs font-bold text-lupetti-skyDark mt-1">
                  {activeEvent.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveEvent(null)}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {confirmedBooking ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-lupetti-tealLight text-lupetti-tealDark flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-display text-2xl font-bold text-slate-800">
                  Prenotazione Confermata!
                </h4>
                <p className="text-sm text-slate-600">
                  Abbiamo registrato la tua prenotazione per{" "}
                  <strong>{confirmedBooking.spots}</strong>{" "}
                  {confirmedBooking.spots === 1 ? "bambino" : "bambini"}.
                </p>
                <div className="p-4 rounded-2xl bg-lupetti-tealLight/60 border border-lupetti-teal/25 inline-block">
                  <span className="text-xs font-bold uppercase text-slate-500 block">
                    Codice Prenotazione
                  </span>
                  <span className="font-display text-2xl font-bold text-lupetti-tealDark">
                    {confirmedBooking.booking_code}
                  </span>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveEvent(null)}
                    className="w-full py-3 rounded-2xl font-bold text-sm text-white bg-lupetti-teal hover:bg-lupetti-tealDark"
                  >
                    Chiudi
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="mt-5 space-y-4">
                {errorMsg && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nome e Cognome Genitore *
                    </label>
                    <input
                      type="text"
                      required
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Es. Laura Rossi"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Telefono *
                    </label>
                    <input
                      type="tel"
                      required
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="Es. 333 1234567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="Es. laura@email.it"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Nome Bimbo/a *
                    </label>
                    <input
                      type="text"
                      required
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="Es. Leo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Età Bimbo/a *
                    </label>
                    <input
                      type="text"
                      required
                      value={childAge}
                      onChange={(e) => setChildAge(e.target.value)}
                      placeholder="Es. 5 anni"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      N° Posti *
                    </label>
                    <select
                      value={spots}
                      onChange={(e) => setSpots(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm bg-white font-bold"
                    >
                      {[1, 2, 3, 4].map((n) => {
                        const rem =
                          availabilityMap[activeEvent.slug]?.remainingSpots ??
                          activeEvent.maxCapacity ??
                          10;
                        if (n > rem) return null;
                        return (
                          <option key={n} value={n}>
                            {n} {n === 1 ? "posto" : "posti"}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Note (opzionale)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Eventuali intolleranze o secondo fratellino/sorellina..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-lupetti-teal outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl font-display font-bold text-sm text-white bg-gradient-to-r from-lupetti-teal to-lupetti-sky hover:from-lupetti-tealDark hover:to-lupetti-skyDark shadow-md flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrazione in corso...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="w-4 h-4" />
                      <span>Conferma Prenotazione</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
