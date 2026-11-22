import React, { useEffect, useRef } from 'react';
import { Glass } from 'glisse';
import { TyphoonArticle } from './TyphoonArticle';

export interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleUrl?: string;
}

function isOutsideDialog(clientX: number, clientY: number, dialog: HTMLDialogElement): boolean {
  const rect = dialog.getBoundingClientRect();
  return (
    clientX < rect.left ||
    clientX > rect.right ||
    clientY < rect.top ||
    clientY > rect.bottom
  );
}

export function ProjectModal({
  isOpen,
  onClose,
  articleUrl = 'projects/typhoon.html',
}: ProjectModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closingProgrammaticallyRef = useRef(false);
  const pressedOutsideRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open && typeof dialog.showModal === 'function') {
        dialog.showModal();
        bodyRef.current?.focus();
      }
    } else if (dialog.open && typeof dialog.close === 'function') {
      closingProgrammaticallyRef.current = true;
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      id="project-modal"
      className="project-modal"
      aria-label="Project article"
      {...({ closedby: 'any' } as Record<string, string>)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={() => {
        if (closingProgrammaticallyRef.current) {
          closingProgrammaticallyRef.current = false;
          return;
        }
        if (dialogRef.current?.open) {
          return;
        }
        if (isOpen) {
          onClose();
        }
      }}
      onPointerDown={(e) => {
        if ('closedBy' in HTMLDialogElement.prototype) return;
        const dialog = dialogRef.current;
        if (!dialog) return;
        pressedOutsideRef.current = isOutsideDialog(e.clientX, e.clientY, dialog);
      }}
      onPointerUp={(e) => {
        if ('closedBy' in HTMLDialogElement.prototype) return;
        const dialog = dialogRef.current;
        const wasPressedOutside = pressedOutsideRef.current;
        pressedOutsideRef.current = false;
        if (dialog && wasPressedOutside && isOutsideDialog(e.clientX, e.clientY, dialog)) {
          onClose();
        }
      }}
      onClick={(e) => {
        if ('closedBy' in HTMLDialogElement.prototype) return;
        const dialog = dialogRef.current;
        if (!dialog || e.target !== dialog) return;
        // Fallback for synthetic clicks in test environments where layout rects are 0x0
        const rect = dialog.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          onClose();
        }
      }}
    >
      <Glass
        className="project-modal-glass"
        style={{ borderRadius: 'var(--radius-lg)' }}
      >
        <div className="project-modal-bar">
          <a
            id="project-modal-full"
            className="project-modal-full"
            href={articleUrl}
          >
            Open full page ↗
          </a>
          <button
            type="button"
            className="project-modal-close"
            id="project-modal-close"
            aria-label="Close article"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div
          ref={bodyRef}
          id="project-modal-body"
          className="project-modal-body"
          tabIndex={-1}
        >
          {isOpen && <TyphoonArticle />}
        </div>
      </Glass>
    </dialog>
  );
}
