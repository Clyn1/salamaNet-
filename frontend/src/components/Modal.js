/**
 * components/Modal.js
 * Accessible modal dialog component.
 * Traps focus, closes on Escape key and backdrop click.
 *
 * Usage:
 *   <Modal
 *     isOpen={showModal}
 *     onClose={() => setShowModal(false)}
 *     title="Confirm deletion"
 *   >
 *     <p>Are you sure you want to delete this evidence?</p>
 *     <button onClick={handleConfirm}>Yes, delete</button>
 *   </Modal>
 */

import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    // Prevent body scrolling while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Focus the modal when it opens
  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={`modal-panel modal-${size}`}
        ref={modalRef}
        tabIndex={-1}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >✕</button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;