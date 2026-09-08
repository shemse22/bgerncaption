import React from 'react';
import { Bell, CheckCheck, Clock, Sparkles, CheckCircle2, ShieldCheck, Film } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationsViewProps {
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onSelectNotification,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-24 md:pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Notifications</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Updates on your video transcriptions and account credits
          </p>
        </div>

        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.map((notif) => {
          return (
            <div
              key={notif.id}
              onClick={() => onSelectNotification(notif)}
              className={`p-4 flex items-start gap-3.5 cursor-pointer hover:bg-slate-50 transition ${
                !notif.read ? 'bg-blue-50/30' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.type === 'project'
                    ? 'bg-blue-100 text-blue-600'
                    : notif.type === 'payment'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                }`}
              >
                {notif.type === 'project' ? (
                  <Film className="w-4 h-4" />
                ) : notif.type === 'payment' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
