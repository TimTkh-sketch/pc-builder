import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Monitor, Keyboard, Mouse } from "lucide-react";
import { componentApi } from "../services/api";
import { Link } from "react-router-dom";
import type { ComponentList } from "../types";
import CategorySticker from "../components/CategorySticker";
import FilterPanel, { EMPTY_FILTERS, type Filters } from "../components/FilterPanel";

const TABS = [
  { slug: "monitor",  label: "Мониторы",   icon: <Monitor size={16} /> },
  { slug: "keyboard", label: "Клавиатуры", icon: <Keyboard size={16} /> },
  { slug: "mouse",    label: "Мыши",        icon: <Mouse size={16} /> },
];

function PeriphCard({ c }: { c: ComponentList }) {
  return (
    <Link
      to={`/components/${c.id}`}
      className="bg-gray-900 border border-gray-800 hover:border-blue-600 rounded-xl overflow-hidden flex flex-col transition-colors group"
    >
      <CategorySticker slug={c.category_slug} size="md" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-xs text-gray-500">{c.manufacturer_name}</p>
        <p className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
          {c.name}
        </p>
        <p className="mt-auto pt-2 border-t border-gray-800 text-blue-400 font-bold text-sm">
          {c.min_price ? `от ${c.min_price.toLocaleString("ru-RU")} ₽` : "Нет цены"}
        </p>
      </div>
    </Link>
  );
}

export default function PeripheryPage() {
  const [tab, setTab] = useState("monitor");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["periph", tab, search, filters],
    queryFn: () =>
      componentApi.list({
        category: tab,
        search: search || undefined,
        manufacturer: filters.manufacturer || undefined,
        min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Периферия</h1>
        <p className="text-gray-400 text-sm">Мониторы, клавиатуры и мыши</p>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.slug}
            onClick={() => { setTab(t.slug); setFilters(EMPTY_FILTERS); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setSearch(searchInput)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
        >
          Найти
        </button>
        <FilterPanel
          category={tab}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-16">Загрузка...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Ничего не найдено</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((c) => <PeriphCard key={c.id} c={c} />)}
        </div>
      )}
    </div>
  );
}
