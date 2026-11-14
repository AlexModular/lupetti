import React from "react";

export interface VideoBlockProps {
  title?: string;
  videoUrl?: string;
}

export default function Video({ item }: { item: VideoBlockProps }) {
  if (!item.videoUrl) return null;

  const isMp4 = item.videoUrl.endsWith(".mp4");

  return (
    <section className="py-14 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {item.title && (
          <h2 className="font-display text-2xl font-bold text-slate-800 text-center mb-6">
            {item.title}
          </h2>
        )}
        <div className="rounded-3xl overflow-hidden border border-lupetti-teal/20 shadow-card aspect-video bg-slate-900">
          {isMp4 ? (
            <video src={item.videoUrl} controls className="w-full h-full" />
          ) : (
            <iframe
              src={item.videoUrl}
              title={item.title || "Video"}
              className="w-full h-full border-0"
              allowFullScreen
            />
          )}
        </div>
      </div>
    </section>
  );
}

