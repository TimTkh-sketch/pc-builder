import { useState, useEffect } from "react";
import { Download, X, Smartphone, Share, MoreHorizontal, Plus } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function IOSModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">PC Builder</p>
              <p className="text-xs text-gray-400">pc-build.pro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-4 text-sm text-gray-300">
          Добавь приложение на главный экран — работает без браузера, как нативное.
        </p>

        {/* Steps */}
        <div className="px-5 pb-5 space-y-3">
          <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-2xl">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Share size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Шаг 1</p>
              <p className="text-xs text-gray-400">Нажми кнопку <span className="text-white font-medium">«Поделиться»</span> внизу браузера</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-2xl">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Plus size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Шаг 2</p>
              <p className="text-xs text-gray-400">Выбери <span className="text-white font-medium">«На экран "Домой"»</span> в меню</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-800 rounded-2xl">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Шаг 3</p>
              <p className="text-xs text-gray-400">Нажми <span className="text-white font-medium">«Добавить»</span> — готово!</p>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-colors"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}

function AndroidModal({ onInstall, onClose }: { onInstall: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Smartphone size={24} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white">PC Builder</p>
              <p className="text-xs text-gray-400">pc-build.pro</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <p className="px-5 pb-5 text-sm text-gray-300">
          Установи приложение на главный экран — работает быстрее и без адресной строки, как нативное.
        </p>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-2xl transition-colors"
          >
            Позже
          </button>
          <button
            onClick={onInstall}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-colors flex items-center justify-center gap-2"
          >
            <Download size={16} /> Установить
          </button>
        </div>
      </div>
    </div>
  );
}

export default function InstallBanner() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
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
    setShowModal(false);
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setInstallEvent(null);
  };

  if (installed || dismissed) return null;
  if (!installEvent && !isIOS) return null;

  return (
    <>
      {/* Banner */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-blue-900/40 hover:bg-blue-900/60 border border-blue-700/50 rounded-2xl transition-colors text-left"
      >
        <div className="flex-shrink-0 w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
          <Download size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Установить приложение</p>
          <p className="text-xs text-gray-400">Работает без браузера, как нативное</p>
        </div>
        <MoreHorizontal size={16} className="text-gray-500 flex-shrink-0" />
        <button
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={16} />
        </button>
      </button>

      {/* Modal */}
      {showModal && (
        isIOS
          ? <IOSModal onClose={() => setShowModal(false)} />
          : <AndroidModal onInstall={handleInstall} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
