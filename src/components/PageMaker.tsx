import React from "react";
import Banner, { BannerBlockProps } from "./blocks/Banner";
import TextWithIllustration, {
  TextWithIllustrationBlockProps,
} from "./blocks/TextWithIllustration";
import QuickActions, { QuickActionsBlockProps } from "./blocks/QuickActions";
import ServicesList, {
  ServicesListBlockProps,
  ServiceEntry,
} from "./blocks/ServicesList";
import BookingsCalendar, {
  BookingsCalendarBlockProps,
} from "./blocks/BookingsCalendar";
import Gallery, { GalleryBlockProps } from "./blocks/Gallery";
import Slider, { SliderBlockProps } from "./blocks/Slider";
import Promotion, { PromotionBlockProps } from "./blocks/Promotion";
import Video, { VideoBlockProps } from "./blocks/Video";
import MapBlock, { MapBlockProps, SiteSettingsForMap } from "./blocks/Map";
import { EventItem } from "./EventsSection";
import { GalleryItem } from "./GallerySection";

export interface PageBuilderBlock {
  discriminant: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

interface PageMakerProps {
  page: {
    slug?: string;
    fullWidth?: boolean;
    pageBuilder?: readonly PageBuilderBlock[];
  };
  siteData: {
    impostazioni: SiteSettingsForMap;
    servizi: ServiceEntry[];
    eventi: EventItem[];
    galleria: GalleryItem[];
  };
}

export default function PageMaker({ page, siteData }: PageMakerProps) {
  const blocks = page.pageBuilder || [];

  const makeBlock = (block: PageBuilderBlock, index: number) => {
    switch (block.discriminant) {
      case "banner":
        return <Banner key={index} item={block.value as BannerBlockProps} />;
      case "textWithIllustration":
        return (
          <TextWithIllustration
            key={index}
            item={block.value as TextWithIllustrationBlockProps}
          />
        );
      case "quickActions":
        return (
          <QuickActions
            key={index}
            item={block.value as QuickActionsBlockProps}
          />
        );
      case "servicesList":
        return (
          <ServicesList
            key={index}
            item={block.value as ServicesListBlockProps}
            servizi={siteData.servizi}
          />
        );
      case "bookingsCalendar":
        return (
          <BookingsCalendar
            key={index}
            item={block.value as BookingsCalendarBlockProps}
            eventi={siteData.eventi}
          />
        );
      case "gallery":
        return (
          <Gallery
            key={index}
            item={block.value as GalleryBlockProps}
            galleria={siteData.galleria}
          />
        );
      case "slider":
        return <Slider key={index} item={block.value as SliderBlockProps} />;
      case "promotion":
        return (
          <Promotion key={index} item={block.value as PromotionBlockProps} />
        );
      case "video":
        return <Video key={index} item={block.value as VideoBlockProps} />;
      case "map":
        return (
          <MapBlock
            key={index}
            item={block.value as MapBlockProps}
            impostazioni={siteData.impostazioni}
          />
        );
      case "separator":
        return (
          <div key={index} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            {block.value?.line && (
              <hr className="border-t border-lupetti-teal/15" />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={
        page.slug === "home"
          ? "homepage"
          : `page-content${page.fullWidth ? " full-width" : ""}`
      }
    >
      {blocks.map((block, index) => makeBlock(block, index))}
    </div>
  );
}

