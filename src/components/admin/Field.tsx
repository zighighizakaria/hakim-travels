import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Champs natifs (input, textarea, select, case à cocher) stylés avec l'identité du site. */

export function inputClass(invalid?: boolean): string {
  return cn(
    "block w-full rounded-xl border bg-card px-3.5 py-2.5 text-[0.95rem] text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25 disabled:bg-muted disabled:opacity-70",
    invalid
      ? "border-destructive focus:border-destructive focus:ring-destructive/25"
      : "border-navy/20",
  );
}

export function FieldError({ id, children }: { id?: string | undefined; children?: ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-destructive">
      {children}
    </p>
  );
}

/** Étiquette + aide + message d'erreur autour d'un contrôle. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  errorId,
  required,
  optional,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor?: string | undefined;
  hint?: ReactNode | undefined;
  error?: string | undefined;
  errorId?: string | undefined;
  required?: boolean | undefined;
  optional?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-navy">
        {label}
        {required ? (
          <span aria-hidden="true" className="ms-0.5 text-destructive">
            *
          </span>
        ) : null}
        {optional ? (
          <span className="ms-1.5 text-xs font-normal text-muted-foreground">(facultatif)</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p> : null}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

type CommonProps = {
  label: ReactNode;
  hint?: ReactNode | undefined;
  error?: string | undefined;
  required?: boolean | undefined;
  optional?: boolean | undefined;
  className?: string | undefined;
  disabled?: boolean | undefined;
  placeholder?: string | undefined;
  name?: string | undefined;
};

export function TextField({
  label,
  hint,
  error,
  required,
  optional,
  className,
  value,
  onChange,
  type = "text",
  inputMode,
  maxLength,
  min,
  max,
  step,
  autoComplete,
  dir,
  lang,
  disabled,
  placeholder,
  name,
  autoFocus,
}: CommonProps & {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "number" | "date" | "url" | "tel" | undefined;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email" | "url" | undefined;
  maxLength?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  autoComplete?: string | undefined;
  dir?: "ltr" | "rtl" | undefined;
  lang?: string | undefined;
  autoFocus?: boolean | undefined;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      errorId={errorId}
      required={required}
      optional={optional}
      className={className}
    >
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        maxLength={maxLength}
        min={min}
        max={max}
        step={step}
        autoComplete={autoComplete}
        dir={dir}
        lang={lang}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass(Boolean(error))}
      />
    </Field>
  );
}

/** Nombre entier (prix en MAD, durées, places...) : la valeur reste une chaîne dans l'état du formulaire. */
export function NumberField(
  props: Omit<Parameters<typeof TextField>[0], "type" | "inputMode" | "step">,
) {
  return <TextField {...props} type="number" inputMode="numeric" step={1} />;
}

export function DateField(props: Omit<Parameters<typeof TextField>[0], "type">) {
  return <TextField {...props} type="date" />;
}

export function TextAreaField({
  label,
  hint,
  error,
  required,
  optional,
  className,
  value,
  onChange,
  rows = 4,
  maxLength,
  dir,
  lang,
  disabled,
  placeholder,
  name,
}: CommonProps & {
  value: string;
  onChange: (value: string) => void;
  rows?: number | undefined;
  maxLength?: number | undefined;
  dir?: "ltr" | "rtl" | undefined;
  lang?: string | undefined;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      errorId={errorId}
      required={required}
      optional={optional}
      className={className}
    >
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        maxLength={maxLength}
        dir={dir}
        lang={lang}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(inputClass(Boolean(error)), "resize-y leading-relaxed")}
      />
    </Field>
  );
}

export function SelectField({
  label,
  hint,
  error,
  required,
  optional,
  className,
  value,
  onChange,
  disabled,
  name,
  children,
}: Omit<CommonProps, "placeholder"> & {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <Field
      label={label}
      htmlFor={id}
      hint={hint}
      error={error}
      errorId={errorId}
      required={required}
      optional={optional}
      className={className}
    >
      <select
        id={id}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={inputClass(Boolean(error))}
      >
        {children}
      </select>
    </Field>
  );
}

export function CheckboxField({
  label,
  hint,
  checked,
  onChange,
  disabled,
  className,
}: {
  label: ReactNode;
  hint?: ReactNode | undefined;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean | undefined;
  className?: string | undefined;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded-md border-navy/30 accent-[var(--primary)]"
      />
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
        {hint ? (
          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">{hint}</span>
        ) : null}
      </label>
    </div>
  );
}
