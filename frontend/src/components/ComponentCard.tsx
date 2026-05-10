import { Link } from "react-router-dom";
import { Plus, Loader2, Check, Ban } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import type { ComponentList } from "../types";
import CategorySticker from "./CategorySticker";

interface Props {
  component: ComponentList;
  onAddToBuild?: (id: number) => void;
  adding?: boolean;
}

export default function ComponentCard({ component, onAddToBuild, adding = false }: Props) {
  const incompatible = component.compatible === false;

  const [justAdded, setJustAdded] = useState(false);
  const prevAddingRef = useRef(false);

  useEffect(() => {
    if (prevAddingRef.current && !adding) {
      setJustAdded(true);
      const t = setTimeout(() => setJustAdded(false), 1500);
      prevAddingRef.current = false;
      return () => clearTimeout(t);
    }
    prevAddingRef.current = adding;
  }, [adding]);

  return (
    <div
      className={`relative bg-gray-900 border rounded-xl overflow-hidden flex flex-col transition-all ${
        incompatible
          ? "border-red-900/60 opacity-50 grayscale-[40%]"
          : "border-gray-800 hover:border-blue-600"
      }`}
    >
      {/* Incompatible overlay */}
      {incompatible && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-950/60 gap-2 pointer-events-none">
          <Ban size={28} className="text-red-400" />
          <span className="text-xs font-semibold text-red-300 bg-red-950/80 px-2 py-0.5 rounded-full">
            Несовместим
          </span>
        </div>
      )}

      {/* Sticker header */}
      <CategorySticker slug={component.category_slug} size="md" />

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            {component.manufacturer_name}
          </p>
          <Link
            to={`/components/${component.id}`}
            className="font-semibold text-white hover:text-blue-400 transition-colors line-clamp-2 leading-snug mt-0.5"
          >
            {component.name}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">{component.model}</p>
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-800">
          <span className="text-blue-400 font-bold text-sm">
            {component.min_price
              ? `от ${component.min_price.toLocaleString("ru-RU")} ₽`
              : "Нет цены"}
          </span>

          {onAddToBuild && (
            <button
              onClick={() => !adding && !justAdded && !incompatible && onAddToBuild(component.id)}
              disabled={adding || justAdded || incompatible}
              title={incompatible ? "Несовместим с текущей сборкой" : "Добавить в сборку"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                incompatible
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : justAdded
                  ? "bg-green-700 text-white cursor-default"
                  : adding
                  ? "bg-blue-700/60 text-blue-300 cursor-wait"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
            >
              {adding    ? <><Loader2 size={14} className="animate-spin" /> Добавляю...</>
             : justAdded ? <><Check size={14} /> Добавлено</>
             : incompatible ? <><Ban size={14} /> Несовместим</>
             : <><Plus size={14} /> В сборку</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
