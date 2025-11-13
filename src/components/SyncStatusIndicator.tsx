import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import type { YjsStatusSnapshot } from "@/lib/yjs-provider";

type SyncStatusIndicatorProps = {
  status: YjsStatusSnapshot;
  onRetry: () => void;
};

const tooltipCopy: Record<YjsStatusSnapshot["syncState"], string> = {
  synced: "All changes are synced.",
  syncing: "Syncing changes…",
  offline: "Offline. Click to retry when you're back online.",
  error: "Sync error. Click to retry.",
};

export default function SyncStatusIndicator({ status, onRetry }: SyncStatusIndicatorProps) {
  const isActionable = status.syncState === "offline" || status.syncState === "error";
  const colorClass =
    status.syncState === "error"
      ? "text-red-500"
      : status.syncState === "offline"
        ? "text-yellow-400"
        : "text-gray-400";
  const pendingTotal = status.pendingUpdateCount + status.offlineUpdateCount;

  const iconProps = "h-5 w-5 transition-transform";
  const tooltipText =
    status.syncState === "error" && status.lastError
      ? `${tooltipCopy.error} (${status.lastError})`
      : status.syncState === "syncing" && pendingTotal > 0
        ? `${tooltipCopy.syncing} (${pendingTotal} change${pendingTotal === 1 ? "" : "s"})`
        : tooltipCopy[status.syncState];

  const icon = (() => {
    if (status.syncState === "error") {
      return <FiAlertTriangle className={`${iconProps}`} />;
    }
    if (status.syncState === "offline") {
      return <BsCloudSlash className={iconProps} />;
    }
    if (status.syncState === "syncing") {
      return <FiRefreshCw className={`${iconProps} animate-spin`} />;
    }
    return <BsCloudCheck className={iconProps} />;
  })();

  return (
    <div className="fixed right-0 bottom-0 z-[9999] m-4">
      <button
        type="button"
        aria-label={tooltipText}
        onClick={() => {
          if (isActionable) {
            onRetry();
          }
        }}
        className={`group relative flex h-8 w-8 items-center justify-center rounded-full p-0 text-lg ${colorClass} ${
          isActionable ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {icon}
        <span className="pointer-events-none absolute top-1/2 right-full mr-2 w-max max-w-xs -translate-y-1/2 rounded bg-black/80 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          {tooltipText}
        </span>
      </button>
    </div>
  );
}
