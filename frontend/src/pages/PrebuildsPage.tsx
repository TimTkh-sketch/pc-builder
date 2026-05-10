import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gamepad2, Monitor, Briefcase, Radio, Copy, ChevronRight } from "lucide-react";
import { buildApi } from "../services/api";
import { useToast } from "../components/Toast";
import type { Build } from "../types";

const PURPOSE_META: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  gaming:      { label: "Игры",       icon: <Gamepad2 size={18} />,  color: "text-blue-400",   bg: "bg-blue-950/50 border-blue-800/60" },
  workstation: { label: "Работа",     icon: <Monitor size={18} />,   color: "text-purple-400", bg: "bg-purple-950/50 border-purple-800/60" },
  streaming:   { label: "Стриминг",   icon: <Radio size={18} />,     color: "text-red-400",    bg: "bg-red-950/50 border-red-800/60" },
  office:      { label: "Офис",       icon: <Briefcase size={18} />, color: "text-green-400",  bg: "bg-green-950/50 border-green-800/60" },
};

const TIER_LABEL: Record<string, { label: string; color: string }> = {
  budget: { label: "Бюджетный",  color: "text-green-400 bg-green-950/60 border-green-800" },
  mid:    { label: "Средний",    color: "text-blue-400 bg-blue-950/60 border-blue-800" },
  high:   { label: "Высокий",    color: "text-purple-400 bg-purple-950/60 border-purple-800" },
  ultra:  { label: "Топовый",    color: "text-yellow-400 bg-yellow-950/60 border-yellow-800" },
};

const ALL_PURPOSES = Object.entries(PURPOSE_META).map(([k, v]) => ({ key: k, ...v }));

function BuildCard({ build }: { build: Build }) {
  const qc = useQueryClient();
  const toast = useToast();
  const meta = PURPOSE_META[build.purpose ?? ""] ?? PURPOSE_META.gaming;
  const tier = TIER_LABEL[build.tier ?? ""] ?? TIER_LABEL.mid;

  const clone = useMutation({
    mutationFn: () =>
      buildApi.create({
        name: `${build.name} (копия)`,
        description: build.description ?? undefined,
      }),
    onSuccess: async (newBuild) => {
      // Copy components from preset to user's build via API
      const detail = await buildApi.get(build.id);
      for (const c of detail.components) {
        await buildApi.addComponent(newBuild.id, c.id);
      }
      qc.invalidateQueries({ queryKey: ["builds"] });
      toast.show(`Сборка «${newBuild.name}» добавлена в ваши сборки`, "success");
    },
    onError: () => toast.show("Не удалось скопировать сборку", "error"),
  });

  return (
    <div className={`border rounded-2xl overflow-hidden flex flex-col ${meta.bg}`}>
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`flex items-center gap-2 text-sm font-medium ${meta.color}`}>
            {meta.icon}
            {meta.label}
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tier.color}`}>
            {tier.label}
          </span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{build.name}</h3>
        <p className="text-sm text-gray-400 leading-relaxed">{build.description}</p>
      </div>

      {/* Price & actions */}
      <div className="mt-auto p-5 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
        <div>
          {build.total_price ? (
            <>
              <p className="text-xs text-gray-500">от</p>
              <p className="text-lg font-bold text-white">
                {build.total_price.toLocaleString("ru-RU")} ₽
              </p>
            </>
          ) : (
            <p className="text-gray-500 text-sm">{build.components_count} компонентов</p>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => clone.mutate()}
            disabled={clone.isPending}
            title="Скопировать в мои сборки"
            className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Copy size={14} />
            {clone.isPending ? "Копирую..." : "Взять"}
          </button>
          <Link
            to={`/builds/${build.id}`}
            className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
          >
            Смотреть <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PrebuildsPage() {
  const [filter, setFilter] = useState<string>("");

  const { data: builds = [], isLoading } = useQuery({
    queryKey: ["prebuilds", filter],
    queryFn: () => buildApi.list({ preset: true, purpose: filter || undefined }),
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Готовые сборки</h1>
        <p className="text-gray-400">Проверенные конфигурации под разные задачи — возьми любую за основу</p>
      </div>

      {/* Purpose filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFilter("")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === "" ? "bg-white text-gray-900" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          Все сборки
        </button>
        {ALL_PURPOSES.map((p) => (
          <button
            key={p.key}
            onClick={() => setFilter(p.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === p.key
                ? `bg-gray-800 border border-gray-600 ${p.color}`
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            {p.icon} {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-16">Загрузка...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {builds.map((b) => (
            <BuildCard key={b.id} build={b} />
          ))}
        </div>
      )}
    </div>
  );
}
