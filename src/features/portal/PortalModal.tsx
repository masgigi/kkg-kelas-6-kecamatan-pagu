import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function PortalModal({ title, onClose, busy = false, children }: { title: string; onClose: () => void; busy?: boolean; children: React.ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => { dialog.current?.close(); previous?.focus(); };
  }, []);
  return <dialog ref={dialog} aria-label={title} onCancel={e => { e.preventDefault(); if (!busy) onClose(); }} className="portal-dialog w-[calc(100%_-_2rem)] max-w-2xl max-h-[90dvh] m-auto p-0 bg-white text-black rounded-3xl border-4 border-black shadow-[8px_8px_0_#000] backdrop:bg-black/60">
    <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-yellow-300 border-b-4 border-black p-4">
      <h2 className="text-lg font-black">{title}</h2>
      <button type="button" aria-label="Tutup" disabled={busy} onClick={onClose} className="portal-button bg-white p-2"><X size={20} /></button>
    </div>
    <div className="p-5">{children}</div>
  </dialog>;
}
