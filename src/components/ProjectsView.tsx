import React, { useState } from 'react';
import {
  FolderClosed,
  Search,
  Plus,
  Play,
  Sliders,
  Download,
  Trash2,
  Clock,
  CheckCircle,
  Loader2,
  Film,
  Sparkles,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { Project } from '../types';
import { formatTimeSeconds } from '../lib/subtitles';
import { ThumbnailGeneratorModal } from './ThumbnailGeneratorModal';
import { DeleteProjectModal } from './DeleteProjectModal';

interface ProjectsViewProps {
  projects: Project[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onDeleteProject: (projectId: string) => void;
  onUpdateProjectCover?: (projectId: string, thumbnailUrl: string) => void;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onDeleteProject,
  onUpdateProjectCover,
  isAuthenticated = true,
  onRequireAuth,
}) => {
  const [filter, setFilter] = useState<'all' | 'completed' | 'processing'>('all');
  const [search, setSearch] = useState<string>('');
  const [coverModalProject, setCoverModalProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-14 text-center p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-purple-600/10 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto border border-purple-500/30 shadow-md">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Sign In to Access Your Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Your video library, captioned projects, and exported subtitles are private and securely saved under your account.
          </p>
        </div>
        <button
          onClick={onRequireAuth}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition active:scale-95 touch-tap"
        >
          Sign In to Bgern
        </button>
      </div>
    );
  }

  const filtered = projects.filter((p) => {
    const matchesFilter =
      filter === 'all' ? true : filter === 'completed' ? p.status === 'completed' : p.status === 'processing';
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">Your Video Library</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your captioned videos, subtitles, and stylized cover artwork
          </p>
        </div>

        <button
          id="projects-new-btn"
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition shadow-xs touch-tap"
        >
          <Plus className="w-4 h-4" />
          <span>New Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 focus:outline-hidden shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-850 p-1 rounded-xl w-full sm:w-auto">
          {(['all', 'completed', 'processing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 sm:flex-initial py-1.5 px-3 rounded-lg text-xs font-bold capitalize transition ${
                filter === tab
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => {
            const isCompleted = project.status === 'completed';
            const isProcessing = project.status === 'processing';

            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-blue-200 dark:hover:border-blue-800/80 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Thumbnail Cover Card */}
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    {project.thumbnailUrl ? (
                      <img
                        src={project.thumbnailUrl}
                        alt={project.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-1.5">
                        <Film className="w-8 h-8" />
                        <span className="text-[10px] font-semibold text-slate-400">No cover art</span>
                      </div>
                    )}

                    {/* Quick Cover Regenerate Action Overlay */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverModalProject(project);
                      }}
                      className="absolute top-2 right-2 px-2 py-1 rounded-lg bg-black/75 hover:bg-black/90 backdrop-blur-xs text-amber-400 hover:text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-white/10 transition active:scale-95 touch-tap z-10"
                      title="Regenerate Cover Image"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Cover Art</span>
                    </button>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                      {formatTimeSeconds(project.duration)}
                    </div>

                    {/* Status badge */}
                    <div className="absolute top-2 left-2">
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold shadow-xs">
                          Completed
                        </span>
                      )}
                      {isProcessing && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-bold animate-pulse shadow-xs">
                          Processing ({project.progress}%)
                        </span>
                      )}
                      {project.status === 'failed' && (
                        <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold shadow-xs">
                          Failed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {project.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {project.segments.length} captions • Style: {project.style.preset}
                    </p>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="px-4 pb-4 pt-2 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCoverModalProject(project);
                      }}
                      className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition touch-tap"
                      title="Edit / Regenerate Cover Art"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenProject(project.id);
                      }}
                      className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition touch-tap"
                      title="Open Subtitle Editor"
                    >
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition touch-tap"
                      title="Delete Project Video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
            <FolderClosed className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No projects found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            Upload your first video to start transcribing with Amharic captions and stylized cover artwork.
          </p>
          <button
            onClick={onNewProject}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
          >
            Upload Video
          </button>
        </div>
      )}

      {/* Cover Generator Modal for any project */}
      {coverModalProject && (
        <ThumbnailGeneratorModal
          isOpen={Boolean(coverModalProject)}
          onClose={() => setCoverModalProject(null)}
          initialTitle={coverModalProject.title}
          initialThumbnailUrl={coverModalProject.thumbnailUrl}
          durationSeconds={coverModalProject.duration}
          onApplyCover={(newThumb) => {
            if (onUpdateProjectCover) {
              onUpdateProjectCover(coverModalProject.id, newThumb);
            }
            setCoverModalProject(null);
          }}
        />
      )}

      {/* Delete Project Confirmation Modal */}
      {projectToDelete && (
        <DeleteProjectModal
          isOpen={Boolean(projectToDelete)}
          project={projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirmDelete={(projectId) => {
            onDeleteProject(projectId);
            setProjectToDelete(null);
          }}
        />
      )}
    </div>
  );
};
