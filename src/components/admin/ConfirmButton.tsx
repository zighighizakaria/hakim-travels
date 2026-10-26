import { useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { abtn } from "./ui";

/** Bouton qui demande une confirmation (boîte de dialogue) avant d'exécuter une action sensible. */
export function ConfirmButton({
  children,
  title,
  message,
  confirmLabel = "Confirmer",
  onConfirm,
  buttonClassName = abtn.dangerOutline,
  confirmClassName = abtn.danger,
  disabled,
  ariaLabel,
}: {
  children: ReactNode;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  buttonClassName?: string;
  confirmClassName?: string;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen(true)}
        disabled={disabled}
        aria-label={ariaLabel}
      >
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => {
          if (!busy) setOpen(false);
        }}
        title={title}
        size="sm"
        footer={
          <>
            <button
              type="button"
              className={abtn.secondary}
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Annuler
            </button>
            <button type="button" className={confirmClassName} onClick={confirm} disabled={busy}>
              {busy ? "En cours..." : confirmLabel}
            </button>
          </>
        }
      >
        <div className="text-sm leading-relaxed text-foreground">{message}</div>
      </Modal>
    </>
  );
}
