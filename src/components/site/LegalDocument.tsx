import type { ReactNode } from "react";
import { PageHero } from "./PageHero";

type Section = { title: string; paragraphs: readonly string[] };

/** Mise en page commune des pages légales (mentions, confidentialité, conditions générales). */
export function LegalDocument({
  eyebrow,
  title,
  subtitle,
  intro,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Bloc affiché avant les sections (ex. informations de l'éditeur issues des réglages). */
  intro?: ReactNode;
  sections: readonly Section[];
  /** Bloc affiché après les sections (ex. coordonnées pour exercer ses droits). */
  children?: ReactNode;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="section-y bg-background">
        <div className="container-page max-w-3xl space-y-12">
          {intro}
          {sections.map((s, i) => (
            <div key={s.title}>
              <h2 className="font-display text-2xl font-bold text-navy">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-3 space-y-3">
                {s.paragraphs.map((p, k) => (
                  <p key={k} className="leading-relaxed text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          ))}
          {children}
        </div>
      </section>
    </>
  );
}
