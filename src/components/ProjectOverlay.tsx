import { useEffect, useId, useRef } from 'react';
import type { ProjectData } from '../types/project';

export interface ProjectOverlayProps {
  project: ProjectData | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

const SUPPORTS_CLOSED_BY =
  typeof HTMLDialogElement !== 'undefined' && 'closedBy' in HTMLDialogElement.prototype;

function isOutsideDialogBackdrop(
  event: React.PointerEvent<HTMLDialogElement>,
  dialog: HTMLDialogElement
): boolean {
  if (event.target !== dialog) {
    return false;
  }
  const rect = dialog.getBoundingClientRect();
  // Unmocked jsdom returns a 0x0 rect; treat direct pointer events on the dialog element as backdrop clicks.
  if (rect.width === 0 && rect.height === 0) {
    return true;
  }
  return (
    event.clientX < rect.left ||
    event.clientX > rect.right ||
    event.clientY < rect.top ||
    event.clientY > rect.bottom
  );
}

export function ProjectOverlay({ project, onClose, triggerRef }: ProjectOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const pressedOutsideRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (project) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [project]);

  const requestClose = () => {
    const dialog = dialogRef.current;
    if (dialog?.open) {
      dialog.close();
    }
  };

  const handleNativeClose = () => {
    const dialog = dialogRef.current;
    if (dialog) {
      dialog.returnValue = '';
    }
    pressedOutsideRef.current = false;
    onClose();

    const trigger = triggerRef?.current;
    if (
      trigger &&
      trigger.isConnected &&
      document.activeElement !== trigger &&
      (!document.activeElement ||
        document.activeElement === document.body ||
        dialog?.contains(document.activeElement))
    ) {
      trigger.focus();
    }
  };

  const handleCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    requestClose();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDialogElement>) => {
    if (SUPPORTS_CLOSED_BY) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    pressedOutsideRef.current = isOutsideDialogBackdrop(event, dialog);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDialogElement>) => {
    if (SUPPORTS_CLOSED_BY) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const wasPressedOutside = pressedOutsideRef.current;
    pressedOutsideRef.current = false;
    if (wasPressedOutside && isOutsideDialogBackdrop(event, dialog)) {
      requestClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="project-overlay"
      closedby="any"
      aria-labelledby={project ? titleId : undefined}
      onCancel={handleCancel}
      onClose={handleNativeClose}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {project && (
        <div className="project-overlay__surface">
          <header className="project-overlay__header">
            <div className="project-overlay__heading-group">
              <div className="project-overlay__meta">
                <span className="project-overlay__period">{project.period}</span>
                <span className="project-overlay__context">{project.context}</span>
                {project.status === 'in-progress' && project.statusLabel && (
                  <span className="project-overlay__status">{project.statusLabel}</span>
                )}
              </div>
              <h2 id={titleId} className="project-overlay__title">
                {project.title}
              </h2>
              <p className="project-overlay__subtitle">{project.subtitle}</p>
            </div>
            <button
              type="button"
              className="project-overlay__close"
              aria-label="Close"
              onClick={requestClose}
            >
              <span aria-hidden="true">×</span>
            </button>
          </header>

          <div className="project-overlay__media">
            <img
              className="project-overlay__img"
              src={project.tileImage}
              alt={project.tileAlt}
              width={project.tileWidth}
              height={project.tileHeight}
              loading="eager"
            />
          </div>

          <p className="project-overlay__summary">{project.overlaySummary}</p>

          <section aria-label="Highlights" className="project-overlay__section">
            <h3 className="project-overlay__section-title">Key highlights</h3>
            <ul className="project-overlay__highlights">
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <ul className="project-overlay__tags" aria-label="Technologies">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>

          <footer className="project-overlay__footer">
            <a className="project-overlay__cta" href={project.route}>
              Read full article
            </a>
          </footer>
        </div>
      )}
    </dialog>
  );
}
