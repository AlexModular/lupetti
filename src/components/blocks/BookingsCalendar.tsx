import React from "react";
import Link from "next/link";
import EventsSection, { EventItem } from "@/components/EventsSection";

export interface BookingsCalendarBlockProps {
  tagline?: string;
  heading?: string;
  description?: string;
  onlyFeatured?: boolean;
}

export default function BookingsCalendar({
  item,
  eventi,
}: {
  item: BookingsCalendarBlockProps;
  eventi: EventItem[];
}) {
  const list = item.onlyFeatured
    ? eventi.filter((e) => e.featured)
    : eventi;

  return (
    <section
      id="prenotazioni"
      className="py-14 sm:py-18 bg-gradient-to-b from-lupetti-skyLight/35 to-white border-t border-lupetti-sky/15"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div className="max-w-2xl">
            {item.tagline && (
              <span className="text-xs font-extrabold uppercase tracking-wider text-lupetti-teal">
                {item.tagline}
              </span>
            )}
            {item.heading && (
              <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-800 mt-1">
                {item.heading}
              </h2>
            )}
            {item.description && (
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {item.onlyFeatured && (
            <Link
              href="/ludoteca-e-laboratori"
              className="text-sm font-extrabold text-lupetti-tealDark hover:underline shrink-0"
            >
              Vedi tutti i turni →
            </Link>
          )}
        </div>

        <EventsSection eventi={list} />
      </div>
    </section>
  );
}

