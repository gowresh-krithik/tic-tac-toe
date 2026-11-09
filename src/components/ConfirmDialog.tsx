import { useEffect, useRef } from 'react';
import { ResetIcon } from './icons';

interface ConfirmDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="confirm-dialog"
      aria-labelledby="reset-dialog-title"
      aria-describedby="reset-dialog-description"
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onCancel();
      }}
    >
      <div className="confirm-dialog__panel">
        <span className="confirm-dialog__icon" aria-hidden="true">
          <ResetIcon size={24} />
        </span>
        <p className="eyebrow">Fresh start</p>
        <h2 id="reset-dialog-title">Reset the match?</h2>
        <p id="reset-dialog-description">
          This clears the board and both scores. Player names, sound and theme
          preferences stay exactly as they are.
        </p>
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn--secondary"
            autoFocus
            onClick={onCancel}
          >
            Keep playing
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            Reset match
          </button>
        </div>
      </div>
    </dialog>
  );
}
