"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = 'eq_watchlist';
const STORAGE_EVENT = 'eq-watchlist-change';
const EMPTY_WATCHLIST_SNAPSHOT = '[]';

function parseWatchlist(snapshot: string): string[] {
  try {
    return JSON.parse(snapshot) as string[];
  } catch {
    return [];
  }
}

function getWatchlistSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_WATCHLIST_SNAPSHOT;
  return localStorage.getItem(STORAGE_KEY) ?? EMPTY_WATCHLIST_SNAPSHOT;
}

function saveWatchlist(symbols: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
  } catch {
    // ignore quota errors
  }
}

function subscribeToWatchlist(callback: () => void) {
  if (typeof window === 'undefined') return () => {};

  const handleChange = () => callback();
  window.addEventListener('storage', handleChange);
  window.addEventListener(STORAGE_EVENT, handleChange);

  return () => {
    window.removeEventListener('storage', handleChange);
    window.removeEventListener(STORAGE_EVENT, handleChange);
  };
}

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const watchlistSnapshot = useSyncExternalStore(
    subscribeToWatchlist,
    getWatchlistSnapshot,
    () => (isInWatchlist ? JSON.stringify([symbol]) : EMPTY_WATCHLIST_SNAPSHOT)
  );
  const watchlist = useMemo(() => parseWatchlist(watchlistSnapshot), [watchlistSnapshot]);
  const added = watchlist.includes(symbol);
  const displayName = company || symbol;
  const label = type === "icon" ? "" : added ? "Remove from Watchlist" : "Add to Watchlist";

  const handleClick = useCallback(() => {
    let next: string[];
    if (added) {
      next = watchlist.filter((s) => s !== symbol);
    } else {
      next = [...watchlist, symbol];
    }
    saveWatchlist(next);
    window.dispatchEvent(new Event(STORAGE_EVENT));
    onWatchlistChange?.(symbol, !added);
  }, [added, onWatchlistChange, symbol, watchlist]);

  if (type === "icon") {
    return (
      <button
        type="button"
        title={added ? `Remove ${displayName} from watchlist` : `Add ${displayName} to watchlist`}
        aria-label={added ? `Remove ${displayName} from watchlist` : `Add ${displayName} to watchlist`}
        className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""}`}
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "#FACC15" : "none"}
          stroke="#FACC15"
          strokeWidth="1.5"
          className="watchlist-star"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button type="button" className={`watchlist-btn ${added ? "watchlist-remove" : ""}`} onClick={handleClick}>
      {showTrashIcon && added ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 mr-2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
        </svg>
      ) : null}
      <span>{label}</span>
    </button>
  );
};

export default WatchlistButton;
