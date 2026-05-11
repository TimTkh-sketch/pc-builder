import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Cpu, Gamepad2, Briefcase, Radio } from "lucide-react";
import { buildApi } from "../services/api";

const PURPOSE_ICON: Record<string, React.ReactNode> = {
  gaming:      <Gamepad2 size={14} />,
  workstation: <Briefcase size={14} />,
  streaming:   <Radio size={14} />,
  office:      <Cpu size={14} />,
};

const TIER_COLOR: Record<string, string> = {
  budget: "text-green-400",
  mid:    "text-blue-400",
  high:   "text-purple-400",
  ultra:  "text-yellow-400",
};

const TIER_LABEL: Record<string, string> = {
  budget: "Бюджет",
  mid:    "Средний",
  high:   "Высокий",
  ultra:  "Топ",
};

/* ── Slide 1: Welcome ───────────────────────────────────────── */
function WelcomeSlide() {
  return (
    <div className="relative h-full flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-gray-950 to-purple-950" />
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />

      <div className="relative z-10 px-5 sm:px-10 md:px-16 max-w-2xl">
        <div className="inline-flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 rounded-full px-3 py-1 text-blue-300 text-xs font-medium mb-3 md:mb-5">
          <Cpu size={12} /> Конфигуратор ПК
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight mb-2 md:mb-4">
          Собери идеальный
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"> ПК</span>
        </h1>
        <p className="hidden sm:block text-gray-400 text-base md:text-lg mb-5 md:mb-8 leading-relaxed">
          76 компонентов, проверка совместимости в реальном времени
          и готовые сборки под любой бюджет.
        </p>
        <p className="sm:hidden text-gray-400 text-sm mb-4 leading-relaxed">
          Подбери компоненты и собери свой ПК.
        </p>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <Link
            to="/components"
            className="px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm md:text-base font-semibold rounded-xl transition-colors"
          >
            Начать подбор
          </Link>
          <Link
            to="/prebuilds"
            className="px-4 py-2 md:px-6 md:py-3 bg-white/10 hover:bg-white/15 text-white text-sm md:text-base font-semibold rounded-xl border border-white/10 transition-colors"
          >
            Готовые сборки
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Slide 2: Prebuilds promo ───────────────────────────────── */
function PrebuildsSlide() {
  const { data: builds = [] } = useQuery({
    queryKey: ["prebuilds", "banner"],
    queryFn: () => buildApi.list({ preset: true }),
  });

  const showcase = builds.slice(0, 4);

  return (
    <div className="relative h-full flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-gray-950 to-blue-950" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full px-5 sm:px-10 md:px-16">
        <div className="flex items-end justify-between mb-3 md:mb-6">
          <div>
            <p className="text-purple-400 text-xs md:text-sm font-medium mb-0.5 md:mb-1">Готовые конфигурации</p>
            <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold text-white">
              Собрано экспертами
            </h2>
          </div>
          <Link
            to="/prebuilds"
            className="hidden md:flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Все сборки <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {showcase.slice(0, window.innerWidth < 640 ? 2 : 4).map((b) => (
            <Link
              key={b.id}
              to={`/builds/${b.id}`}
              className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl p-3 md:p-4 transition-all group"
            >
              <div className="flex items-center gap-1.5 mb-1.5 md:mb-2">
                <span className={`${TIER_COLOR[b.tier ?? ""] ?? "text-gray-400"}`}>
                  {PURPOSE_ICON[b.purpose ?? ""] ?? <Cpu size={14} />}
                </span>
                <span className={`text-xs font-semibold ${TIER_COLOR[b.tier ?? ""] ?? "text-gray-400"}`}>
                  {TIER_LABEL[b.tier ?? ""] ?? ""}
                </span>
              </div>
              <p className="text-white text-xs sm:text-sm font-semibold leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors mb-1.5 md:mb-2">
                {b.name}
              </p>
              {b.total_price && (
                <p className="text-xs text-gray-400">
                  от <span className="text-white font-bold">{Math.round(b.total_price / 1000)}к ₽</span>
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Carousel ───────────────────────────────────────────────── */
const SLIDES = [WelcomeSlide, PrebuildsSlide];
const AUTO_INTERVAL = 6000;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(id);
  }, [paused, next]);

  const Slide = SLIDES[current];

  return (
    <div
      className="relative w-full h-52 sm:h-64 md:h-80 rounded-2xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        setTouchStart(null);
      }}
    >
      <div key={current} className="absolute inset-0 animate-fade-in">
        <Slide />
      </div>

      {/* Arrows — hidden on mobile */}
      <button
        onClick={prev}
        className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
