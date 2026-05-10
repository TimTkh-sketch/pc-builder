import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { componentApi } from "../services/api";

export interface Filters {
  manufacturer: string;
  minPrice: string;
  maxPrice: string;
}

interface Props {
  category?: string;
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}

export const EMPTY_FILTERS: Filters = { manufacturer: "", minPrice: "", maxPrice: "" };

export default function FilterPanel({ category, filters, onChange, onReset }: Props) {
  const [open, setOpen] = useState(false);

  const { data: manufacturers = [] } = useQuery({
    queryKey: ["manufacturers", category],
    queryFn: () => componentApi.manufacturers(category),
  });

  const activeCount = [filters.manufacturer, filters.minPrice, filters.maxPrice].filter(Boolean).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
          activeCount > 0
            ? "bg-blue-600 border-blue-500 text-white"
            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
        }`}
      >
        <SlidersHorizontal size={15} />
        Фильтры
        {activeCount > 0 && (
          <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute left-0 top-full mt-2 z-20 bg-gray-900 border border-gray-700 rounded-2xl p-5 w-72 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Фильтры</h3>
              {activeCount > 0 && (
                <button
                  onClick={() => { onReset(); setOpen(false); }}
                  className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                >
                  <X size={12} /> Сбросить
                </button>
              )}
            </div>

            {/* Manufacturer */}
            {manufacturers.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Производитель</p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {manufacturers.map((m) => (
                    <button
                      key={m}
                      onClick={() => onChange({ ...filters, manufacturer: filters.manufacturer === m ? "" : m })}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        filters.manufacturer === m
                          ? "bg-blue-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price range */}
            <div>
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Цена, ₽</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="от"
                  value={filters.minPrice}
                  onChange={(e) => onChange({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
                <span className="text-gray-600 shrink-0">—</span>
                <input
                  type="number"
                  placeholder="до"
                  value={filters.maxPrice}
                  onChange={(e) => onChange({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-medium transition-colors"
            >
              Применить
            </button>
          </div>
        </>
      )}
    </div>
  );
}
