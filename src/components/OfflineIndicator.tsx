import React, { useState, useEffect } from 'react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 inset-x-0 z-40 flex items-center justify-center pointer-events-none p-2">
      <div className="flex items-center gap-2 rounded-xl bg-amber-500/95 text-white px-3.5 py-1.5 text-xs font-semibold shadow-lg backdrop-blur-xs">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span>Chế độ Ngoại tuyến (Offline) — Đang sử dụng dữ liệu lưu cục bộ.</span>
      </div>
    </div>
  );
};
