import { Link, useLocation } from "react-router-dom";
import { Home, Cpu, Monitor, Layers, PackageSearch } from "lucide-react";

const TABS = [
  { to: "/",           icon: Home,          label: "Главная",  exact: true },
  { to: "/components", icon: Cpu,           label: "Каталог"              },
  { to: "/periphery",  icon: Monitor,       label: "Периферия"            },
  { to: "/prebuilds",  icon: PackageSearch, label: "Сборки"               },
  { to: "/builds",     icon: Layers,        label: "Мои"                  },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-t border-gray-800"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="flex">
        {TABS.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 transition-colors ${
                active ? "text-blue-400" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {/* Top indicator line */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-400 rounded-full" />
              )}
              <Icon size={21} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? "text-blue-400" : "text-gray-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
