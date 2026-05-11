import { Link } from "react-router-dom";
import {
  Cpu, CircuitBoard, Gamepad2, HardDrive,
  Monitor, Keyboard, Mouse, ArrowRight,
} from "lucide-react";
import HeroBanner from "../components/HeroBanner";
import InstallBanner from "../components/InstallBanner";

const QUICK_LINKS = [
  { to: "/components?cat=cpu",         icon: <Cpu size={22} />,          label: "Процессоры",        color: "text-blue-400",   bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-800/50" },
  { to: "/components?cat=gpu",         icon: <Gamepad2 size={22} />,     label: "Видеокарты",        color: "text-red-400",    bg: "bg-red-500/10 hover:bg-red-500/20 border-red-800/50" },
  { to: "/components?cat=motherboard", icon: <CircuitBoard size={22} />, label: "Мат. платы",        color: "text-purple-400", bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-800/50" },
  { to: "/components?cat=storage",     icon: <HardDrive size={22} />,    label: "Накопители",        color: "text-yellow-400", bg: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-800/50" },
  { to: "/periphery",                  icon: <Monitor size={22} />,      label: "Мониторы",          color: "text-indigo-400", bg: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-800/50" },
  { to: "/periphery",                  icon: <Keyboard size={22} />,     label: "Клавиатуры",        color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-800/50" },
  { to: "/periphery",                  icon: <Mouse size={22} />,        label: "Мыши",              color: "text-fuchsia-400",bg: "bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-800/50" },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-10">
      <HeroBanner />

      <InstallBanner />

      {/* Quick category nav */}
      <section>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-lg md:text-xl font-bold">Категории</h2>
          <Link to="/components" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            Все <ArrowRight size={14} />
          </Link>
        </div>

        {/* Mobile: horizontal scroll with fade hint */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1 md:hidden">
            {QUICK_LINKS.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                className={`flex-none w-20 flex flex-col items-center gap-2 p-3 rounded-xl border snap-start transition-all ${l.bg}`}
              >
                <span className={l.color}>{l.icon}</span>
                <span className="text-xs font-medium text-center text-gray-300 leading-snug">{l.label}</span>
              </Link>
            ))}
          </div>
          {/* Fade gradient to hint more content */}
          <div className="md:hidden absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />

          {/* Desktop: grid */}
          <div className="hidden md:grid grid-cols-4 lg:grid-cols-7 gap-3">
            {QUICK_LINKS.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${l.bg}`}
              >
                <span className={l.color}>{l.icon}</span>
                <span className="text-xs font-medium text-center text-gray-300 leading-snug">{l.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <Link
          to="/prebuilds"
          className="flex items-center justify-between p-4 md:p-5 bg-gradient-to-br from-blue-900/40 to-blue-950/60 border border-blue-800/50 rounded-2xl hover:border-blue-600 transition-colors group"
        >
          <div>
            <p className="text-xs text-blue-400 mb-1 font-medium">Готово к сборке</p>
            <p className="text-base md:text-lg font-bold text-white">7 готовых сборок</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">От бюджетного до флагмана</p>
          </div>
          <ArrowRight size={20} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/builds"
          className="flex items-center justify-between p-4 md:p-5 bg-gradient-to-br from-purple-900/40 to-purple-950/60 border border-purple-800/50 rounded-2xl hover:border-purple-600 transition-colors group"
        >
          <div>
            <p className="text-xs text-purple-400 mb-1 font-medium">Ваши конфигурации</p>
            <p className="text-base md:text-lg font-bold text-white">Мои сборки</p>
            <p className="text-xs md:text-sm text-gray-400 mt-1">Создай и сохрани конфигурацию</p>
          </div>
          <ArrowRight size={20} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
