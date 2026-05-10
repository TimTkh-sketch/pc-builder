import { X, ShoppingCart, ExternalLink, Package } from "lucide-react";
import type { BuildDetail, Price } from "../types";
import CategorySticker from "./CategorySticker";

const STORE: Record<string, { label: string; bg: string; dot: string }> = {
  DNS:      { label: "DNS",      bg: "bg-red-600 hover:bg-red-500",      dot: "bg-red-500" },
  Citilink: { label: "Citilink", bg: "bg-orange-500 hover:bg-orange-400", dot: "bg-orange-400" },
  OZON:     { label: "OZON",     bg: "bg-blue-600 hover:bg-blue-500",    dot: "bg-blue-500" },
};


function StoreLink({ price }: { price: Price }) {
  const s = STORE[price.store_name] ?? { label: price.store_name, bg: "bg-gray-600 hover:bg-gray-500", dot: "bg-gray-400" };
  return (
    <a
      href={price.url || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors ${s.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} opacity-80`} />
      {s.label}
      <span className="font-bold">{price.price_rub.toLocaleString("ru-RU")} ₽</span>
      <ExternalLink size={10} className="opacity-70" />
    </a>
  );
}

interface Props {
  build: BuildDetail;
  onClose: () => void;
}

export default function BuyModal({ build, onClose }: Props) {
  // Find cheapest price per component
  const minPrices = build.components.map((c) =>
    Math.min(...(c.prices.map((p) => p.price_rub).length ? c.prices.map((p) => p.price_rub) : [0]))
  );
  const totalMin = minPrices.reduce((s, p) => s + p, 0);

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={18} className="text-blue-400" />
            <div>
              <h2 className="font-bold text-base leading-tight">Купить все компоненты</h2>
              <p className="text-xs text-gray-500 leading-tight">{build.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Component list */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
          {build.components.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package size={40} className="mx-auto mb-3 opacity-40" />
              <p>В сборке нет компонентов</p>
            </div>
          ) : (
            build.components.map((c, idx) => (
              <div key={c.id} className="flex gap-3 bg-gray-800/50 border border-gray-800 rounded-xl p-3">
                {/* Sticker */}
                <div className="w-20 h-16 rounded-lg overflow-hidden shrink-0">
                  <CategorySticker slug={c.category_slug} size="sm" className="h-16 rounded-lg" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">{c.category_name}</p>
                      <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{c.name}</p>
                    </div>
                    {minPrices[idx] > 0 && (
                      <span className="text-sm font-bold text-blue-400 shrink-0">
                        от {minPrices[idx].toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                  </div>

                  {/* Store buttons */}
                  {c.prices.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {c.prices.map((p) => (
                        <StoreLink key={p.id} price={p} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600">Нет ссылок на магазины</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: total */}
        {build.components.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-800 shrink-0 flex items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              <span className="text-gray-500">Компонентов: </span>
              <span className="text-white font-medium">{build.components.length}</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-0.5">Минимальная стоимость сборки</p>
              <p className="text-xl font-bold text-blue-400">
                {totalMin.toLocaleString("ru-RU")} ₽
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
