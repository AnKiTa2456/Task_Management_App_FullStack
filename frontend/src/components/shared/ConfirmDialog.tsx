import Modal   from '../ui/Modal';
import Button  from '../ui/Button';

interface ConfirmDialogProps {
  isOpen:      boolean;
  onClose:     () => void;
  onConfirm:   () => void;
  title:       string;
  description: string;
  confirmLabel?: string;
  isLoading?:    boolean;
  danger?:       boolean;
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, description,
  confirmLabel = 'Confirm', isLoading = false, danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">{description}</p>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
