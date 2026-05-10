import { Link } from "react-router-dom";
import {
  Cpu, CircuitBoard, Gamepad2, HardDrive,
  Monitor, Keyboard, Mouse, ArrowRight,
} from "lucide-react";
import HeroBanner from "../components/HeroBanner";

const QUICK_LINKS = [
  { to: "/components?cat=cpu",         icon: <Cpu size={20} />,          label: "Процессоры",        color: "text-blue-400",   bg: "bg-blue-500/10 hover:bg-blue-500/20 border-blue-800/50" },
  { to: "/components?cat=gpu",         icon: <Gamepad2 size={20} />,     label: "Видеокарты",        color: "text-red-400",    bg: "bg-red-500/10 hover:bg-red-500/20 border-red-800/50" },
  { to: "/components?cat=motherboard", icon: <CircuitBoard size={20} />, label: "Материнские платы", color: "text-purple-400", bg: "bg-purple-500/10 hover:bg-purple-500/20 border-purple-800/50" },
  { to: "/components?cat=storage",     icon: <HardDrive size={20} />,    label: "Накопители",        color: "text-yellow-400", bg: "bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-800/50" },
  { to: "/periphery",                  icon: <Monitor size={20} />,      label: "Мониторы",          color: "text-indigo-400", bg: "bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-800/50" },
  { to: "/periphery",                  icon: <Keyboard size={20} />,     label: "Клавиатуры",        color: "text-violet-400", bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-800/50" },
  { to: "/periphery",                  icon: <Mouse size={20} />,        label: "Мыши",              color: "text-fuchsia-400",bg: "bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border-fuchsia-800/50" },
];

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Hero banner carousel */}
      <HeroBanner />

      {/* Quick category nav */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Категории</h2>
          <Link to="/components" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors">
            Все компоненты <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
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
      </section>

      {/* CTA row */}
      <section className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/prebuilds"
          className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-900/40 to-blue-950/60 border border-blue-800/50 rounded-2xl hover:border-blue-600 transition-colors group"
        >
          <div>
            <p className="text-xs text-blue-400 mb-1 font-medium">Готово к сборке</p>
            <p className="text-lg font-bold text-white">7 готовых сборок</p>
            <p className="text-sm text-gray-400 mt-1">От бюджетного до флагмана</p>
          </div>
          <ArrowRight size={22} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/builds"
          className="flex items-center justify-between p-5 bg-gradient-to-br from-purple-900/40 to-purple-950/60 border border-purple-800/50 rounded-2xl hover:border-purple-600 transition-colors group"
        >
          <div>
            <p className="text-xs text-purple-400 mb-1 font-medium">Ваши конфигурации</p>
            <p className="text-lg font-bold text-white">Мои сборки</p>
            <p className="text-sm text-gray-400 mt-1">Создай и сохрани конфигурацию</p>
          </div>
          <ArrowRight size={22} className="text-purple-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
