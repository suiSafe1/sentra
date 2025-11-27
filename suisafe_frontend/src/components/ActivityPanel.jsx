import React from "react";
import {
  X,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { formatActivityTime } from "../services/activityService";

/**
 * Activity item icons mapping
 */
const ActivityTypeIcons = {
  lock: "🔒",
  yield_lock: "💰",
  unlock: "🔓",
  yield_unlock: "💸",
  deposit: "➕",
  swap: "🔄",
};

/**
 * Activity item colors
 */
const ActivityTypeColors = {
  lock: "bg-blue-50 border-blue-200",
  yield_lock: "bg-green-50 border-green-200",
  unlock: "bg-purple-50 border-purple-200",
  yield_unlock: "bg-yellow-50 border-yellow-200",
  deposit: "bg-indigo-50 border-indigo-200",
  swap: "bg-pink-50 border-pink-200",
};

/**
 * Individual activity item
 */
function ActivityItem({ activity }) {
  const typeIcon = ActivityTypeIcons[activity.type] || "📋";
  const typeColor =
    ActivityTypeColors[activity.type] || "bg-gray-50 border-gray-200";

  const handleViewTx = (e) => {
    e.stopPropagation();
    if (activity.txDigest) {
      window.open(
        `https://suiscan.xyz/mainnet/tx/${activity.txDigest}`,
        "_blank"
      );
    }
  };

  if (activity.type === "swap") {
    return (
      <div
        className={`border ${typeColor} rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow`}
      >
        <div className="flex items-start gap-3">
          {/* Swap Token Icons with Arrow */}
          <div className="flex-shrink-0 flex items-center gap-1">
            <img
              src={activity.icon}
              alt={activity.token}
              className="w-8 h-8 rounded-full"
            />
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <img
              src={activity.toIcon}
              alt={activity.toToken}
              className="w-8 h-8 rounded-full"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Description */}
            <p className="text-sm font-semibold text-gray-800 mb-1">
              {activity.description}
            </p>

            {/* Time and Status */}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatActivityTime(activity.timestamp)}</span>

              {activity.status === "success" && (
                <>
                  <span>•</span>
                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                  <span className="text-green-600">Success</span>
                </>
              )}
            </div>
          </div>

          {/* View TX Button */}
          {activity.txDigest && (
            <button
              onClick={handleViewTx}
              className="flex-shrink-0 p-1.5 hover:bg-white rounded-md transition-colors"
              title="View transaction"
            >
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-500" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border ${typeColor} rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow`}
    >
      <div className="flex items-start gap-3">
        {/* Token Icon */}
        <div className="flex-shrink-0">
          <img
            src={activity.icon}
            alt={activity.token}
            className="w-10 h-10 rounded-full"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Description */}
          <p className="text-sm font-semibold text-gray-800 mb-1">
            {activity.description}
          </p>

          {/* Time and Status */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{formatActivityTime(activity.timestamp)}</span>

            {activity.status === "success" && (
              <>
                <span>•</span>
                <CheckCircle2 className="w-3 h-3 text-green-500" />
                <span className="text-green-600">Success</span>
              </>
            )}
          </div>
        </div>

        {/* View TX Button */}
        {activity.txDigest && (
          <button
            onClick={handleViewTx}
            className="flex-shrink-0 p-1.5 hover:bg-white rounded-md transition-colors"
            title="View transaction"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-500" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Main Activity Panel Component
 */
function ActivityPanel({
  isOpen,
  onClose,
  activities,
  isLoading,
  onRefresh,
  onMarkAllRead,
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#00076C]">
          <h2 className="text-lg font-bold text-white">Activity Feed</h2>

          <div className="flex items-center gap-2">
            {/* Refresh Button */}
            <button
              onClick={() => {
                onRefresh();
                onMarkAllRead();
              }}
              disabled={isLoading}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh activities"
            >
              <RefreshCw
                className={`w-4 h-4 text-white ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm">Loading activities...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Clock className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium">No activity yet</p>
              <p className="text-xs mt-1">Your transactions will appear here</p>
            </div>
          ) : (
            <div>
              {/* Activity List */}
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}

              {/* End marker */}
              {activities.length >= 50 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  Showing last 50 activities
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default ActivityPanel;
