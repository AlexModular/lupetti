"use client";

import React from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Palette,
  Puzzle,
  Gift,
  MapPin,
  Phone,
} from "lucide-react";

export interface QuickActionsBlockProps {
  actions?: readonly {
    label: string;
    icon: string;
    href: string;
  }[];
}

export default function QuickActions({
  item,
}: {
  item: QuickActionsBlockProps;
}) {
  const actions = item.actions || [];
  if (actions.length === 0) return null;

  const getIcon = (name: string) => {
    switch (name) {
      case "Palette":
        return <Palette className="w-5 h-5 text-lupetti-teal" />;
      case "Puzzle":
        return <Puzzle className="w-5 h-5 text-lupetti-sky" />;
      case "Gift":
        return <Gift className="w-5 h-5 text-lupetti-teal" />;
      case "MapPin":
        return <MapPin className="w-5 h-5 text-lupetti-sky" />;
      case "Phone":
        return <Phone className="w-5 h-5 text-lupetti-teal" />;
      default:
        return <CalendarCheck className="w-5 h-5 text-lupetti-teal" />;
    }
  };

  return (
    <section className="border-y border-lupetti-teal/15 bg-white">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-lupetti-teal/15">
        {actions.map((act, index) => (
          <Link
            key={index}
            href={act.href || "/"}
            className="flex items-center justify-center gap-3 py-5 px-4 hover:bg-lupetti-tealLight/30 transition-colors group"
          >
            <div className="transition-transform duration-300 group-hover:scale-110">
              {getIcon(act.icon)}
            </div>
            <span className="font-display font-bold text-xs sm:text-sm text-slate-700 group-hover:text-lupetti-tealDark">
              {act.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

