import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed PWA (standalone window), hide button
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-between text-emerald-700 dark:text-emerald-400">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span className="text-xs font-semibold">Đã cài đặt dạng ứng dụng</span>
          </div>
          <span className="text-[11px] opacity-80">Standalone</span>
        </div>
      );
    }
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleAction}
          title="Cài đặt ToolHub về máy"
          className={`flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl bg-[#eaedff] dark:bg-[#242b40] text-[#004ac6] dark:text-[#89b4ff] hover:bg-[#d8e0ff] text-xs font-semibold shadow-2xs active:scale-95 transition-all cursor-pointer border border-[#004ac6]/20 ${className}`}
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">install_mobile</span>
          <span className="hidden xs:inline">Cài ứng dụng</span>
        </button>
      )}

      {variant === 'banner' && (
        <button
          onClick={handleAction}
          className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#004ac6] text-white hover:bg-[#2563eb] text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer ${className}`}
          type="button"
        >
          <span className="material-symbols-outlined text-[16px]">install_mobile</span>
          <span>Cài ứng dụng về máy</span>
        </button>
      )}

      {variant === 'settings' && (
        <button
          onClick={handleAction}
          className={`w-full p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] flex items-center justify-between hover:bg-[#eaedff] text-left transition-colors cursor-pointer ${className}`}
          type="button"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#004ac6] dark:text-[#89b4ff]">install_mobile</span>
            <div>
              <div className="text-xs font-bold text-[#131b2e] dark:text-[#eef0ff]">
                Cài đặt ứng dụng (PWA)
              </div>
              <div className="text-[11px] text-[#737686]">
                Dùng như app độc lập, mở ngay từ màn hình chính
              </div>
            </div>
          </div>
          <span className="text-xs text-[#004ac6] dark:text-[#89b4ff] font-semibold">Cài đặt</span>
        </button>
      )}

      {/* Modal hướng dẫn cài đặt cho iOS Safari hoặc trình duyệt Desktop */}
      {showGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/60 backdrop-blur-xs p-4 animate-fade-in"
          onClick={() => setShowGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1c2336] p-5 shadow-2xl flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-1 border-b border-black/[0.04] dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#004ac6] dark:text-[#89b4ff] text-[22px]">
                  {isIOS ? 'phone_iphone' : 'desktop_windows'}
                </span>
                <h3 className="font-bold text-sm text-[#131b2e] dark:text-[#eef0ff]">
                  {isIOS ? 'Cài đặt trên iPhone / iPad' : 'Cài đặt ToolHub'}
                </h3>
              </div>
              <button 
                onClick={() => setShowGuide(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#737686] hover:bg-[#f2f3ff] dark:hover:bg-[#242b40]"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {isIOS ? (
              <div className="flex flex-col gap-2.5 text-xs text-[#434655] dark:text-[#b0b4c8] leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40]">
                  <span className="w-5 h-5 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Chạm vào biểu tượng <strong>Chia sẻ (Share)</strong> <span className="material-symbols-outlined text-[15px] align-middle text-[#004ac6]">ios_share</span> ở thanh dưới Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40]">
                  <span className="w-5 h-5 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong> <span className="material-symbols-outlined text-[15px] align-middle text-[#004ac6]">add_box</span>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40]">
                  <span className="w-5 h-5 rounded-full bg-[#004ac6] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    Bấm <strong>Thêm (Add)</strong> ở góc trên bên phải. Biểu tượng ToolHub sẽ xuất hiện trên màn hình chính của bạn như một App độc lập!
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 text-xs text-[#434655] dark:text-[#b0b4c8] leading-relaxed">
                <p>
                  Để cài ToolHub về máy tính hoặc điện thoại Android:
                </p>
                <div className="p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] flex flex-col gap-1.5">
                  <div className="font-semibold text-[#131b2e] dark:text-[#eef0ff]">
                    • Trên Chrome / Edge (Máy tính):
                  </div>
                  <div>
                    Bấm vào biểu tượng <strong>Cài đặt</strong> <span className="material-symbols-outlined text-[15px] align-middle text-[#004ac6]">install_desktop</span> ở thanh địa chỉ URL bên phải, hoặc chọn Menu (⋮) ➜ <em>"Cài đặt ToolHub..."</em>.
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#242b40] flex flex-col gap-1.5">
                  <div className="font-semibold text-[#131b2e] dark:text-[#eef0ff]">
                    • Trên Android (Chrome):
                  </div>
                  <div>
                    Bấm Menu (⋮) ở góc trên bên phải ➜ Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuide(false)}
              className="mt-1 w-full h-9 rounded-xl bg-[#004ac6] text-white text-xs font-semibold hover:bg-[#2563eb] cursor-pointer transition-all"
              type="button"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};
