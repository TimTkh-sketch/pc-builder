import { useState, useEffect } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    if (ios) setIsIOS(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstallEvent(null);
  };

  if (installed || dismissed) return null;
  if (!installEvent && !isIOS) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-blue-900/40 border border-blue-700/50 rounded-2xl">
      <div className="flex-shrink-0 w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
        <Download size={18} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">Установить приложение</p>
        {isIOS ? (
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 flex-wrap">
            Нажми <Share size={11} className="inline text-blue-400" /> → «На экран "Домой"»
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-0.5">Работает без браузера, как нативное</p>
        )}
      </div>

      {!isIOS && (
        <button
          onClick={handleInstall}
          className="flex-shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Установить
        </button>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
