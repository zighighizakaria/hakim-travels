import { Star } from "lucide-react";
import { useT } from "@/i18n/useI18n";
import type { Review } from "@/lib/types";
import { Reveal } from "./Reveal";
import { SectionHead } from "./ui";

/** Avis publiés uniquement : rien n'est affiché tant qu'il n'y en a pas. */
export function SocialProof({ reviews }: { reviews: readonly Review[] }) {
  const t = useT();
  if (!reviews.length) return null;
  return (
    <section className="section-y bg-background">
      <div className="container-page">
        <Reveal>
          <SectionHead eyebrow={t.home.reviews.eyebrow} title={t.home.reviews.title} />
        </Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 100}>
              <figure className="card-surface flex h-full flex-col justify-between p-7">
                <div>
                  {r.rating ? (
                    <div className="mb-4 flex gap-0.5 text-sun" aria-label={`${r.rating}/5`}>
                      {Array.from({ length: r.rating }, (_, k) => (
                        <Star key={k} className="h-4 w-4 fill-current" aria-hidden="true" />
                      ))}
                    </div>
                  ) : null}
                  <blockquote className="leading-relaxed text-navy/80">« {r.quote} »</blockquote>
                </div>
                <figcaption className="mt-6 border-t border-border pt-4">
                  <p className="font-display font-semibold text-navy">{r.authorName}</p>
                  {r.authorCity || r.travelLabel ? (
                    <p className="text-sm text-muted-foreground">
                      {[r.authorCity, r.travelLabel].filter(Boolean).join(" · ")}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
