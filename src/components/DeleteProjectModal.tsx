import React from 'react';
import { Trash2, AlertTriangle, X, Film } from 'lucide-react';
import { Project } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';

interface DeleteProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (projectId: string) => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 touch-tap z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center space-y-4">
          {/* Warning Icon */}
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <Trash2 className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Delete Project Video?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
              Are you sure you want to permanently delete this video? All subtitles and stylized cover artwork will be removed.
            </p>
          </div>

          {/* Project Preview Card */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3 text-left">
            <div className="relative w-16 h-12 rounded-xl bg-slate-900 overflow-hidden shrink-0">
              {project.thumbnailUrl ? (
                <img
                  src={project.thumbnailUrl}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <Film className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {project.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Duration: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{formatTimeSeconds(project.duration)}</span> • {project.segments.length} captions
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition active:scale-95 touch-tap"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-delete-project-btn"
              onClick={() => {
                onConfirmDelete(project.id);
                onClose();
              }}
              className="flex-1 min-h-[44px] py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm active:scale-95 touch-tap flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Yes, Delete Video</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
