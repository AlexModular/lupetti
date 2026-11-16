import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "next-sanity";

import SmartLink from "./SmartLink";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p className="leading-relaxed">{children}</p>,
    h3: ({ children }) => (
      <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-800 pt-2">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="font-display text-lg font-bold text-slate-800 pt-1">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-lupetti-teal/40 pl-4 italic text-slate-700">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 space-y-1.5 marker:text-lupetti-teal text-left">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 space-y-1.5 marker:text-lupetti-teal marker:font-bold text-left">
        {children}
      </ol>
    ),
  },
  marks: {
    link: ({ value, children }) => (
      <SmartLink
        href={value?.href}
        className="font-bold text-lupetti-tealDark underline underline-offset-2 hover:text-lupetti-skyDark"
      >
        {children}
      </SmartLink>
    ),
  },
};

/** Testo ricco scritto nello Studio (paragrafi, elenchi, grassetti, link). */
export default function RichText({
  value,
  className = "",
}: {
  value?: PortableTextBlock[] | null;
  className?: string;
}) {
  if (!value?.length) return null;
  return (
    <div className={`space-y-4 text-base sm:text-lg text-slate-600 ${className}`}>
      <PortableText value={value} components={components} />
    </div>
  );
}
