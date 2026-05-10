import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { componentApi, buildApi } from "../services/api";
import ComponentCard from "../components/ComponentCard";
import { useToast } from "../components/Toast";
import FilterPanel, { EMPTY_FILTERS, type Filters } from "../components/FilterPanel";

const PC_CATEGORIES: Record<string, string> = {
  cpu: "Процессоры",
  motherboard: "Материнские платы",
  ram: "Оперативная память",
  gpu: "Видеокарты",
  storage: "Накопители",
  psu: "Блоки питания",
  case: "Корпуса",
  cooler: "Охлаждение",
};

const PERIPHERAL_CATEGORIES: Record<string, string> = {
  monitor: "Мониторы",
  keyboard: "Клавиатуры",
  mouse: "Мыши",
};



export default function ComponentsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [buildName, setBuildName] = useState("");
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [pendingComponentId, setPendingComponentId] = useState<number | null>(null);
  const [loadingComponentId, setLoadingComponentId] = useState<number | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const { data: builds = [] } = useQuery({
    queryKey: ["builds", "user"],
    queryFn: () => buildApi.list({ preset: false }),
  });

  // Active build = the most recently created one
  const activeBuild = builds.length > 0 ? builds[builds.length - 1] : null;

  const { data: activeBuildDetail } = useQuery({
    queryKey: ["build", String(activeBuild?.id)],
    queryFn: () => buildApi.get(activeBuild!.id),
    enabled: !!activeBuild,
  });

  const activeBuildIds = activeBuildDetail?.components.map((c) => c.id).join(",") ?? "";

  const { data: components = [], isLoading } = useQuery({
    queryKey: ["components", category, search, activeBuildIds, filters],
    queryFn: () =>
      componentApi.list({
        category: category || undefined,
        search: search || undefined,
        build_ids: activeBuildIds || undefined,
        manufacturer: filters.manufacturer || undefined,
        min_price: filters.minPrice ? Number(filters.minPrice) : undefined,
        max_price: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      }),
  });

  const createBuild = useMutation({
    mutationFn: buildApi.create,
    onSuccess: (newBuild) => {
      qc.invalidateQueries({ queryKey: ["builds"] });
      if (pendingComponentId) {
        addToExistingBuild.mutate({ buildId: newBuild.id, componentId: pendingComponentId });
      }
      setShowBuildModal(false);
      setBuildName("");
      setPendingComponentId(null);
      toast.show(`Сборка «${newBuild.name}» создана`, "success");
    },
    onError: () => toast.show("Не удалось создать сборку", "error"),
  });

  const addToExistingBuild = useMutation({
    mutationFn: ({ buildId, componentId }: { buildId: number; componentId: number }) =>
      buildApi.addComponent(buildId, componentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["builds"] });
      qc.invalidateQueries({ queryKey: ["build", String(vars.buildId)] });
      const comp = components.find((c) => c.id === vars.componentId);
      const build = builds.find((b) => b.id === vars.buildId);
      toast.show(
        `«${comp?.name ?? "Компонент"}» добавлен в «${build?.name ?? "сборку"}»`,
        "success"
      );
      setLoadingComponentId(null);
    },
    onError: () => {
      toast.show("Не удалось добавить компонент", "error");
      setLoadingComponentId(null);
    },
  });

  const handleAddToBuild = (componentId: number) => {
    if (builds.length === 0) {
      setPendingComponentId(componentId);
      setShowBuildModal(true);
    } else {
      setLoadingComponentId(componentId);
      const latest = builds[builds.length - 1];
      addToExistingBuild.mutate({ buildId: latest.id, componentId });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Компоненты</h1>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-56">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Поиск компонентов..."
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
          category={category || undefined}
          filters={filters}
          onChange={setFilters}
          onReset={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            category === "" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Все
        </button>
        {/* PC components */}
        {Object.entries(PC_CATEGORIES).map(([slug, name]) => (
          <button key={slug} onClick={() => setCategory(slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === slug ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
            {name}
          </button>
        ))}

        {/* Divider */}
        <span className="w-px h-6 bg-gray-700 self-center mx-1" />

        {/* Peripherals */}
        {Object.entries(PERIPHERAL_CATEGORIES).map(([slug, name]) => (
          <button key={slug} onClick={() => setCategory(slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === slug ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>
            {name}
          </button>
        ))}
      </div>

      {/* Active build indicator */}
      {builds.length > 0 && (
        <div className="mb-4 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Активная сборка: <span className="text-white font-medium">{builds[builds.length - 1].name}</span>
          — нажмите «В сборку», чтобы добавить компонент
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-16">Загрузка...</div>
      ) : components.length === 0 ? (
        <div className="text-center text-gray-500 py-16">Компоненты не найдены</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {components.map((c) => (
            <ComponentCard
              key={c.id}
              component={c}
              onAddToBuild={handleAddToBuild}
              adding={loadingComponentId === c.id}
            />
          ))}
        </div>
      )}

      {/* Create build modal */}
      {showBuildModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Создать новую сборку</h2>
            <input
              type="text"
              placeholder="Название сборки..."
              value={buildName}
              onChange={(e) => setBuildName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createBuild.mutate({ name: buildName || "Моя сборка", component_ids: pendingComponentId ? [pendingComponentId] : [] })}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => createBuild.mutate({ name: buildName || "Моя сборка", component_ids: pendingComponentId ? [pendingComponentId] : [] })}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
              >
                Создать и добавить
              </button>
              <button
                onClick={() => { setShowBuildModal(false); setPendingComponentId(null); }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
