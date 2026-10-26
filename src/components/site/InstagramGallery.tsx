import { Instagram } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";
import gallery2 from "@/assets/gallery-2.jpg";
import gallery3 from "@/assets/gallery-3.jpg";
import gallery4 from "@/assets/gallery-4.jpg";
import gallery5 from "@/assets/gallery-5.jpg";
import gallery6 from "@/assets/gallery-6.jpg";
import { interpolate } from "@/i18n/config";
import { useT } from "@/i18n/useI18n";
import { Reveal } from "./Reveal";
import { useSettings } from "./useSite";
import { Arrow, SectionHead } from "./ui";

const images = [gallery1, gallery3, gallery6, gallery2, gallery4, gallery5] as const;

/** Visuels de la communauté. Rien n'est affiché sans lien Instagram dans les réglages. */
export function InstagramGallery() {
  const t = useT();
  const settings = useSettings();
  const url = settings?.instagramUrl;
  if (!url) return null;
  const followers = settings?.instagramFollowersLabel;

  return (
    <section className="section-y bg-mist">
      <div className="container-page">
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHead
              eyebrow={t.home.instagram.eyebrow}
              title={t.home.instagram.title}
              subtitle={t.home.instagram.subtitle}
            />
            <div className="flex shrink-0 flex-col gap-2 md:items-end">
              {followers ? (
                <p className="font-display text-lg font-bold text-navy">
                  {interpolate(t.home.instagram.followers, { label: followers })}
                </p>
              ) : null}
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 font-semibold text-primary"
              >
                <Instagram className="h-5 w-5" />
                {t.common.seeInstagram}
                <Arrow />
              </a>
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {images.map((src, i) => (
            <Reveal key={i} delay={i * 70}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`media-zoom group relative block overflow-hidden rounded-2xl ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}
              >
                <div className={i === 0 ? "aspect-square md:aspect-[2/1.02]" : "aspect-square"}>
                  <img
                    src={src}
                    alt={t.home.instagram.alts[i] ?? ""}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="absolute inset-0 flex items-center justify-center bg-navy/35 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Instagram className="h-7 w-7 text-white" />
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
