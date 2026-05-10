import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Trash2, Zap, ShoppingCart } from "lucide-react";
import { buildApi, suggestionsApi } from "../services/api";
import { useToast } from "../components/Toast";
import CompatibilityAlert from "../components/CompatibilityAlert";
import SuggestionsPanel from "../components/SuggestionsPanel";
import BuyModal from "../components/BuyModal";
import CategorySticker from "../components/CategorySticker";

export default function BuildDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const toast = useToast();
  const [addingId, setAddingId] = useState<number | null>(null);
  const [showBuyModal, setShowBuyModal] = useState(false);

  const { data: build, isLoading } = useQuery({
    queryKey: ["build", id],
    queryFn: () => buildApi.get(Number(id)),
    enabled: !!id,
  });

  const componentIds = build?.components.map((c) => c.id) ?? [];

  const { data: suggestions } = useQuery({
    queryKey: ["suggestions", componentIds.join(",")],
    queryFn: () => suggestionsApi.get(componentIds),
    enabled: componentIds.length >= 0,
  });

  const removeComponent = useMutation({
    mutationFn: ({ buildId, componentId }: { buildId: number; componentId: number }) =>
      buildApi.removeComponent(buildId, componentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["build", id] });
      const comp = build?.components.find((c) => c.id === vars.componentId);
      toast.show(`«${comp?.name ?? "Компонент"}» убран из сборки`, "info");
    },
    onError: () => toast.show("Не удалось убрать компонент", "error"),
  });

  const addComponent = useMutation({
    mutationFn: ({ buildId, componentId }: { buildId: number; componentId: number }) =>
      buildApi.addComponent(buildId, componentId),
    onSuccess: (data, vars) => {
      qc.invalidateQueries({ queryKey: ["build", id] });
      const added = data.components.find((c) => c.id === vars.componentId);
      toast.show(`«${added?.name ?? "Компонент"}» добавлен в сборку`, "success");
      setAddingId(null);
    },
    onError: () => {
      toast.show("Не удалось добавить компонент", "error");
      setAddingId(null);
    },
  });

  const deleteBuild = useMutation({
    mutationFn: buildApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["builds"] });
      toast.show("Сборка удалена", "info");
      navigate("/builds");
    },
  });

  const handleAddFromSuggestion = (componentId: number) => {
    if (!build) return;
    setAddingId(componentId);
    addComponent.mutate({ buildId: build.id, componentId });
  };

  if (isLoading) return <div className="text-center text-gray-500 py-16">Загрузка...</div>;
  if (!build) return <div className="text-center text-red-400 py-16">Сборка не найдена</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/builds" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> Назад к сборкам
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{build.name}</h1>
          {build.author && <p className="text-gray-400 text-sm mt-1">Автор: {build.author}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBuyModal(true)}
            disabled={build.components_count === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            <ShoppingCart size={14} /> Купить всё
          </button>
          <button
            onClick={() => {
              if (confirm(`Удалить сборку «${build.name}»?`)) deleteBuild.mutate(build.id);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-sm transition-colors"
          >
            <Trash2 size={14} /> Удалить
          </button>
        </div>
      </div>

      {/* Two-column layout: build + suggestions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: main build content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Итого</p>
              <p className="text-xl font-bold text-blue-400">
                {build.total_price ? `${build.total_price.toLocaleString("ru-RU")} ₽` : "—"}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Потребление</p>
              <p className="text-xl font-bold flex items-center gap-1">
                <Zap size={16} className="text-yellow-400" />
                {build.total_tdp ? `${build.total_tdp} Вт` : "—"}
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Компонентов</p>
              <p className="text-xl font-bold">{build.components_count}</p>
            </div>
          </div>

          {/* Compatibility */}
          <CompatibilityAlert issues={build.compatibility_issues} />

          {/* Components list */}
          <div>
            <h2 className="font-semibold mb-3">Компоненты</h2>
            {build.components.length === 0 ? (
              <div className="text-gray-500 text-sm py-8 text-center border border-dashed border-gray-700 rounded-xl">
                Добавьте компоненты из{" "}
                <Link to="/components" className="text-blue-400 hover:underline">каталога</Link>
                {" "}или используйте подсказки →
              </div>
            ) : (
              <div className="space-y-2">
                {build.components.map((c) => (
                  <div
                    key={c.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-14 h-10 rounded overflow-hidden shrink-0">
                      <CategorySticker slug={c.category_slug} size="sm" className="h-10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">{c.category_name} · {c.manufacturer_name}</p>
                      <Link
                        to={`/components/${c.id}`}
                        className="font-medium hover:text-blue-400 transition-colors text-sm"
                      >
                        {c.name}
                      </Link>
                    </div>
                    <div className="text-right shrink-0">
                      {c.min_price && (
                        <p className="text-blue-400 font-bold text-sm">
                          от {c.min_price.toLocaleString("ru-RU")} ₽
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeComponent.mutate({ buildId: build.id, componentId: c.id })}
                      className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                      title="Убрать из сборки"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/components"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
          >
            + Добавить компонент из каталога
          </Link>
        </div>

        {/* Right: suggestions */}
        <div className="space-y-4">
          {suggestions && (
            <SuggestionsPanel
              hints={suggestions.hints}
              messages={suggestions.messages}
              missingSlots={suggestions.missing_slots}
              onAddComponent={handleAddFromSuggestion}
              addingId={addingId}
            />
          )}
        </div>
      </div>

      {showBuyModal && (
        <BuyModal build={build} onClose={() => setShowBuyModal(false)} />
      )}
    </div>
  );
}
