import { Link, useLocation } from "react-router-dom";
import { Cpu } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();

  const link = (to: string, label: string, exact = false) => {
    const active = exact ? pathname === to : pathname.startsWith(to);
    return (
      <Link
        to={to}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
          active
            ? "bg-blue-600 text-white"
            : "text-gray-300 hover:text-white hover:bg-gray-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-2 overflow-x-auto">
        <Link to="/" className="flex items-center gap-2 text-blue-400 font-bold text-lg mr-4 shrink-0">
          <Cpu size={22} />
          PC Builder
        </Link>
        <nav className="flex gap-1">
          {link("/", "Главная", true)}
          {link("/components", "Каталог")}
          {link("/periphery", "Периферия")}
          {link("/prebuilds", "Готовые сборки")}
          {link("/builds", "Мои сборки")}
        </nav>
      </div>
    </header>
  );
}
