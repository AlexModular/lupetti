import React from "react";

interface PageIntroProps {
  title?: string;
  subtitle?: string;
  introImage?: string | null;
}

export default function PageIntro({
  title,
  subtitle,
  introImage,
}: PageIntroProps) {
  if (!introImage && !subtitle) return null;

  return (
    <div className="bg-lupetti-tealLight/30 border-b border-lupetti-teal/15 py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {title && (
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-800">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="mt-2 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

