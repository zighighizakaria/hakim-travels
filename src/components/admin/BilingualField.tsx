import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldError, inputClass } from "./Field";

/**
 * Un contenu en deux langues, côte à côte : français à gauche (obligatoire par défaut),
 * arabe à droite (facultatif, saisie de droite à gauche).
 */
export function BilingualField({
  label,
  valueFr,
  valueAr,
  onChangeFr,
  onChangeAr,
  multiline,
  rows = 3,
  errorFr,
  errorAr,
  optionalFr,
  hint,
  maxLength,
  placeholderFr,
  placeholderAr,
  className,
}: {
  label: ReactNode;
  valueFr: string;
  valueAr: string;
  onChangeFr: (value: string) => void;
  onChangeAr: (value: string) => void;
  multiline?: boolean | undefined;
  rows?: number | undefined;
  errorFr?: string | undefined;
  errorAr?: string | undefined;
  /** Le français est lui aussi facultatif (ex. accroche). */
  optionalFr?: boolean | undefined;
  hint?: ReactNode | undefined;
  maxLength?: number | undefined;
  placeholderFr?: string | undefined;
  placeholderAr?: string | undefined;
  className?: string | undefined;
}) {
  const id = useId();
  const fr = `${id}-fr`;
  const ar = `${id}-ar`;

  const control = (
    side: "fr" | "ar",
    controlId: string,
    value: string,
    onChange: (v: string) => void,
    error: string | undefined,
    placeholder: string | undefined,
  ) => {
    const shared = {
      id: controlId,
      value,
      maxLength,
      placeholder,
      onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange(event.target.value),
      "aria-invalid": error ? true : undefined,
      "aria-describedby": error ? `${controlId}-error` : undefined,
      className: cn(inputClass(Boolean(error)), multiline && "resize-y leading-relaxed"),
      ...(side === "ar" ? { dir: "rtl" as const, lang: "ar" } : { lang: "fr" }),
    };
    return multiline ? <textarea rows={rows} {...shared} /> : <input type="text" {...shared} />;
  };

  return (
    <div className={className}>
      <p className="mb-2 text-sm font-semibold text-navy">{label}</p>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={fr} className="mb-1 block text-xs font-semibold text-muted-foreground">
            Français
            {optionalFr ? (
              <span className="ms-1.5 font-normal">(facultatif)</span>
            ) : (
              <span aria-hidden="true" className="ms-0.5 text-destructive">
                *
              </span>
            )}
          </label>
          {control("fr", fr, valueFr, onChangeFr, errorFr, placeholderFr)}
          <FieldError id={`${fr}-error`}>{errorFr}</FieldError>
        </div>
        <div>
          <label htmlFor={ar} className="mb-1 block text-xs font-semibold text-muted-foreground">
            Arabe <span className="font-normal">(facultatif)</span>
          </label>
          {control("ar", ar, valueAr, onChangeAr, errorAr, placeholderAr)}
          <FieldError id={`${ar}-error`}>{errorAr}</FieldError>
        </div>
      </div>
      {hint && !errorFr && !errorAr ? (
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
