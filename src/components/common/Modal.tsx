import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PropsWithChildren, ReactNode } from "react";

export type ModalProps = PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
  disabled?: boolean;
  footer?: ReactNode;
}>;

export default function Modal({ open, title, description, onClose, onSubmit, submitLabel = "Save", disabled, children, footer }: ModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">{children}</div>
        <DialogFooter>
          {footer ?? (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose} type="button">
                Cancel
              </Button>
              {onSubmit && (
                <Button onClick={onSubmit} disabled={disabled} type="button">
                  {submitLabel}
                </Button>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
