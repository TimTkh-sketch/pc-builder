import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { buildApi } from "../services/api";
import { useToast } from "../components/Toast";

export default function BuildsPage() {
  const qc = useQueryClient();
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [author, setAuthor] = useState("");

  const { data: builds = [], isLoading } = useQuery({
    queryKey: ["builds", "user"],
    queryFn: () => buildApi.list({ preset: false }),
  });

  const createBuild = useMutation({
    mutationFn: buildApi.create,
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["builds"] });
      setShowModal(false);
      setName("");
      setAuthor("");
      toast.show(`Сборка «${b.name}» создана`, "success");
    },
    onError: () => toast.show("Не удалось создать сборку", "error"),
  });

  const deleteBuild = useMutation({
    mutationFn: buildApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["builds"] });
      toast.show("Сборка удалена", "info");
    },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Мои сборки</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
        >
          <Plus size={16} />
          Новая сборка
        </button>
      </div>

      {isLoading ? (
        <div className="text-center text-gray-500 py-16">Загрузка...</div>
      ) : builds.length === 0 ? (
        <div className="text-center text-gray-500 py-16">
          <p className="text-lg mb-2">Нет сборок</p>
          <p className="text-sm">Создайте сборку и добавляйте компоненты из каталога</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {builds.map((b) => (
            <div key={b.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-blue-600 transition-colors flex flex-col gap-3">
              <div>
                <h3 className="font-bold text-lg">{b.name}</h3>
                {b.author && <p className="text-sm text-gray-400">Автор: {b.author}</p>}
                {b.description && <p className="text-sm text-gray-400 mt-1">{b.description}</p>}
              </div>
              <div className="text-sm text-gray-400">
                Компонентов: <span className="text-white">{b.components_count}</span>
              </div>
              {b.total_price != null && (
                <div className="text-blue-400 font-bold">
                  {b.total_price.toLocaleString("ru-RU")} ₽
                </div>
              )}
              <div className="flex gap-2 mt-auto pt-3 border-t border-gray-800">
                <Link
                  to={`/builds/${b.id}`}
                  className="flex-1 text-center py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                >
                  Открыть
                </Link>
                <button
                  onClick={() => {
                    if (confirm(`Удалить сборку «${b.name}»?`)) {
                      deleteBuild.mutate(b.id);
                    }
                  }}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-red-900/50 hover:text-red-400 rounded-lg text-sm transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Новая сборка</h2>
            <input
              type="text"
              placeholder="Название сборки*"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-3"
              autoFocus
            />
            <input
              type="text"
              placeholder="Автор (необязательно)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-blue-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => createBuild.mutate({ name: name || "Моя сборка", author: author || undefined })}
                disabled={!name.trim()}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium"
              >
                Создать
              </button>
              <button
                onClick={() => setShowModal(false)}
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
