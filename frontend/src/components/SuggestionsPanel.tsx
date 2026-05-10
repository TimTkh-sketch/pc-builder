import { Link } from "react-router-dom";
import { Lightbulb, Plus, ChevronRight } from "lucide-react";
import type { ComponentList } from "../types";
import CategorySticker, { StickerBadge } from "./CategorySticker";

const CATEGORY_LABELS: Record<string, string> = {
  cpu: "Процессор",       motherboard: "Материнская плата",
  ram: "Оперативная память", gpu: "Видеокарта",
  storage: "Накопитель",  psu: "Блок питания",
  case: "Корпус",         cooler: "Охлаждение",
  monitor: "Монитор",     keyboard: "Клавиатура",
  mouse: "Мышь",
};

interface Props {
  hints: Record<string, ComponentList[]>;
  messages: string[];
  missingSlots: string[];
  onAddComponent: (id: number) => void;
  addingId: number | null;
}

function SuggestionCard({
  component,
  onAdd,
  adding,
}: {
  component: ComponentList;
  onAdd: (id: number) => void;
  adding: boolean;
}) {
  return (
    <div className="flex items-center gap-3 bg-gray-800/60 hover:bg-gray-800 rounded-lg p-2.5 transition-colors group">
      <div className="w-12 h-10 rounded overflow-hidden shrink-0">
        <CategorySticker slug={component.category_slug} size="sm" className="h-10" />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          to={`/components/${component.id}`}
          className="text-xs font-medium text-white hover:text-blue-400 line-clamp-2 leading-snug"
        >
          {component.name}
        </Link>
        {component.min_price && (
          <p className="text-xs text-blue-400 mt-0.5">
            от {component.min_price.toLocaleString("ru-RU")} ₽
          </p>
        )}
      </div>
      <button
        onClick={() => onAdd(component.id)}
        disabled={adding}
        title="Добавить в сборку"
        className="shrink-0 p-1.5 rounded-lg bg-blue-600/0 group-hover:bg-blue-600 text-gray-500 group-hover:text-white transition-all disabled:opacity-50"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function SuggestionsPanel({
  hints,
  messages,
  missingSlots,
  onAddComponent,
  addingId,
}: Props) {
  const hintEntries = Object.entries(hints).filter(([, items]) => items.length > 0);

  if (hintEntries.length === 0 && missingSlots.length === 0) return null;

  return (
    <div className="bg-gray-900 border border-yellow-700/50 rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb size={16} className="text-yellow-400 shrink-0" />
        <h3 className="font-semibold text-yellow-300 text-sm">Умные подсказки</h3>
      </div>

      {/* Contextual hint groups */}
      {hintEntries.map(([slug, items], idx) => (
        <div key={slug}>
          {messages[idx] && (
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <ChevronRight size={12} className="text-yellow-500 shrink-0" />
              {messages[idx]}
            </p>
          )}
          <p className="text-xs font-medium text-gray-300 mb-2">
            <StickerBadge slug={slug} /> {CATEGORY_LABELS[slug] ?? slug}
          </p>
          <div className="space-y-1.5">
            {items.map((c) => (
              <SuggestionCard
                key={c.id}
                component={c}
                onAdd={onAddComponent}
                adding={addingId === c.id}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Missing slots reminder */}
      {missingSlots.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-2">Ещё не выбраны:</p>
          <div className="flex flex-wrap gap-1.5">
            {missingSlots.map((slug) => (
              <Link
                key={slug}
                to={`/components?category=${slug}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded-full text-xs text-gray-400 hover:text-white transition-colors"
              >
                <StickerBadge slug={slug} /> {CATEGORY_LABELS[slug] ?? slug}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
