import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, ShoppingCart } from "lucide-react";
import { componentApi } from "../services/api";
import type { Component, Price } from "../types";
import CategorySticker from "../components/CategorySticker";

const STORE_STYLES: Record<string, { bg: string; hover: string; logo: string }> = {
  DNS:      { bg: "bg-red-950/60 border-red-800/60",    hover: "hover:bg-red-900/70 hover:border-red-600",    logo: "🔴" },
  Citilink: { bg: "bg-orange-950/60 border-orange-800/60", hover: "hover:bg-orange-900/70 hover:border-orange-600", logo: "🟠" },
  OZON:     { bg: "bg-blue-950/60 border-blue-800/60",  hover: "hover:bg-blue-900/70 hover:border-blue-600",  logo: "🔵" },
};

function StoreButton({ price }: { price: Price }) {
  const style = STORE_STYLES[price.store_name] ?? {
    bg: "bg-gray-800/60 border-gray-700",
    hover: "hover:bg-gray-700/70 hover:border-gray-500",
    logo: "🏪",
  };
  const tag = price.store_name;
  const href = price.url || "#";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all ${style.bg} ${style.hover} group`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg leading-none">{style.logo}</span>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">{tag}</p>
          <p className="text-xs text-gray-400 leading-tight">Перейти в магазин</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-base font-bold text-white">
          {price.price_rub.toLocaleString("ru-RU")} ₽
        </span>
        <ExternalLink size={14} className="text-gray-500 group-hover:text-white transition-colors" />
      </div>
    </a>
  );
}

function SpecRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-gray-800">
      <td className="py-2 pr-4 text-gray-400 text-sm whitespace-nowrap">{label}</td>
      <td className="py-2 text-sm font-medium">{value}</td>
    </tr>
  );
}

function CPUSpecs({ spec }: { spec: NonNullable<Component["cpu"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="Сокет" value={spec.socket} />
        <SpecRow label="Ядра / Потоки" value={`${spec.cores} / ${spec.threads}`} />
        <SpecRow label="Базовая частота" value={`${spec.base_freq_ghz} ГГц`} />
        {spec.boost_freq_ghz && <SpecRow label="Макс. частота" value={`${spec.boost_freq_ghz} ГГц`} />}
        <SpecRow label="TDP" value={`${spec.tdp_w} Вт`} />
        <SpecRow label="Тип памяти" value={spec.memory_type} />
        {spec.l3_cache_mb && <SpecRow label="Кэш L3" value={`${spec.l3_cache_mb} МБ`} />}
        <SpecRow label="Встроенная графика" value={spec.integrated_graphics ? "Да" : "Нет"} />
      </tbody>
    </table>
  );
}

function MBSpecs({ spec }: { spec: NonNullable<Component["motherboard"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="Сокет" value={spec.socket} />
        <SpecRow label="Чипсет" value={spec.chipset} />
        <SpecRow label="Форм-фактор" value={spec.form_factor} />
        <SpecRow label="Слоты RAM" value={`${spec.ram_slots} x ${spec.ram_type}`} />
        <SpecRow label="Макс. RAM" value={`${spec.max_ram_gb} ГБ`} />
        {spec.max_ram_speed_mhz && <SpecRow label="Макс. частота RAM" value={`${spec.max_ram_speed_mhz} МГц`} />}
        {spec.m2_slots != null && <SpecRow label="Слоты M.2" value={spec.m2_slots} />}
        {spec.sata_ports != null && <SpecRow label="Порты SATA" value={spec.sata_ports} />}
      </tbody>
    </table>
  );
}

function RAMSpecs({ spec }: { spec: NonNullable<Component["ram"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="Тип" value={spec.ram_type} />
        <SpecRow label="Объём" value={`${spec.capacity_gb} ГБ (${spec.modules_count}x${spec.capacity_gb / spec.modules_count} ГБ)`} />
        <SpecRow label="Частота" value={`${spec.speed_mhz} МГц`} />
        {spec.cas_latency && <SpecRow label="CAS Latency" value={`CL${spec.cas_latency}`} />}
        {spec.voltage_v && <SpecRow label="Напряжение" value={`${spec.voltage_v} В`} />}
      </tbody>
    </table>
  );
}

function GPUSpecs({ spec }: { spec: NonNullable<Component["gpu"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="VRAM" value={`${spec.vram_gb} ГБ${spec.vram_type ? ` ${spec.vram_type}` : ""}`} />
        <SpecRow label="TDP" value={`${spec.tdp_w} Вт`} />
        {spec.length_mm && <SpecRow label="Длина" value={`${spec.length_mm} мм`} />}
        {spec.cuda_cores && <SpecRow label="Ядра CUDA" value={spec.cuda_cores.toLocaleString()} />}
        {spec.recommended_psu_w && <SpecRow label="Рекомендуемый БП" value={`${spec.recommended_psu_w} Вт`} />}
        {spec.power_connectors && <SpecRow label="Питание" value={spec.power_connectors} />}
      </tbody>
    </table>
  );
}

function StorageSpecs({ spec }: { spec: NonNullable<Component["storage"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="Тип" value={spec.storage_type} />
        <SpecRow label="Интерфейс" value={spec.interface} />
        <SpecRow label="Объём" value={`${spec.capacity_gb >= 1000 ? `${spec.capacity_gb / 1000} ТБ` : `${spec.capacity_gb} ГБ`}`} />
        {spec.read_speed_mbs && <SpecRow label="Скорость чтения" value={`${spec.read_speed_mbs} МБ/с`} />}
        {spec.write_speed_mbs && <SpecRow label="Скорость записи" value={`${spec.write_speed_mbs} МБ/с`} />}
        {spec.form_factor && <SpecRow label="Форм-фактор" value={spec.form_factor} />}
      </tbody>
    </table>
  );
}

function PSUSpecs({ spec }: { spec: NonNullable<Component["psu"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="Мощность" value={`${spec.wattage} Вт`} />
        {spec.efficiency_rating && <SpecRow label="Сертификат" value={spec.efficiency_rating} />}
        {spec.modular && <SpecRow label="Модульность" value={spec.modular} />}
        {spec.form_factor && <SpecRow label="Форм-фактор" value={spec.form_factor} />}
      </tbody>
    </table>
  );
}

function CaseSpecs({ spec }: { spec: NonNullable<Component["case"]> }) {
  return (
    <table className="w-full">
      <tbody>
        <SpecRow label="Форм-фактор" value={spec.form_factor} />
        {spec.max_gpu_length_mm && <SpecRow label="Макс. длина GPU" value={`${spec.max_gpu_length_mm} мм`} />}
        {spec.max_cooler_height_mm && <SpecRow label="Макс. высота кулера" value={`${spec.max_cooler_height_mm} мм`} />}
        {spec.usb_ports && <SpecRow label="USB порты" value={spec.usb_ports} />}
      </tbody>
    </table>
  );
}

function CoolerSpecs({ spec }: { spec: NonNullable<Component["cooler"]> }) {
  return (
    <table className="w-full">
      <tbody>
        {spec.cooler_type && <SpecRow label="Тип" value={spec.cooler_type} />}
        {spec.height_mm && <SpecRow label="Высота" value={`${spec.height_mm} мм`} />}
        {spec.tdp_rating_w && <SpecRow label="Макс. TDP" value={`${spec.tdp_rating_w} Вт`} />}
        {spec.fan_size_mm && <SpecRow label="Размер вентилятора" value={`${spec.fan_size_mm} мм`} />}
        <SpecRow label="Сокеты" value={spec.supported_sockets.replace(/,/g, ", ")} />
      </tbody>
    </table>
  );
}

function MonitorSpecs({ spec }: { spec: NonNullable<Component["monitor"]> }) {
  return (
    <table className="w-full">
      <tbody>
        {spec.size_inch && <SpecRow label="Диагональ" value={`${spec.size_inch}"`} />}
        {spec.resolution && <SpecRow label="Разрешение" value={spec.resolution} />}
        {spec.refresh_rate_hz && <SpecRow label="Частота обновления" value={`${spec.refresh_rate_hz} Гц`} />}
        {spec.response_time_ms && <SpecRow label="Время отклика" value={`${spec.response_time_ms} мс`} />}
        {spec.panel_type && <SpecRow label="Тип матрицы" value={spec.panel_type} />}
        <SpecRow label="HDR" value={spec.hdr ? "Да" : "Нет"} />
        <SpecRow label="FreeSync / G-Sync" value={`${spec.freesync ? "FreeSync" : ""}${spec.freesync && spec.gsync ? " / " : ""}${spec.gsync ? "G-Sync" : ""}` || "Нет"} />
        <SpecRow label="Изогнутый" value={spec.curved ? "Да" : "Нет"} />
        {spec.connectors && <SpecRow label="Разъёмы" value={spec.connectors} />}
      </tbody>
    </table>
  );
}

function KeyboardSpecs({ spec }: { spec: NonNullable<Component["keyboard"]> }) {
  return (
    <table className="w-full">
      <tbody>
        {spec.kb_type && <SpecRow label="Тип" value={spec.kb_type} />}
        {spec.switch_type && <SpecRow label="Переключатели" value={spec.switch_type} />}
        {spec.layout && <SpecRow label="Раскладка" value={spec.layout} />}
        <SpecRow label="Беспроводная" value={spec.wireless ? "Да" : "Нет"} />
        <SpecRow label="RGB-подсветка" value={spec.rgb ? "Да" : "Нет"} />
        {spec.connector && <SpecRow label="Подключение" value={spec.connector} />}
      </tbody>
    </table>
  );
}

function MouseSpecs({ spec }: { spec: NonNullable<Component["mouse"]> }) {
  return (
    <table className="w-full">
      <tbody>
        {spec.max_dpi && <SpecRow label="Макс. DPI" value={spec.max_dpi.toLocaleString()} />}
        {spec.sensor && <SpecRow label="Сенсор" value={spec.sensor} />}
        {spec.buttons && <SpecRow label="Кнопок" value={spec.buttons} />}
        <SpecRow label="Беспроводная" value={spec.wireless ? "Да" : "Нет"} />
        <SpecRow label="RGB-подсветка" value={spec.rgb ? "Да" : "Нет"} />
        {spec.weight_g && <SpecRow label="Вес" value={`${spec.weight_g} г`} />}
        {spec.polling_rate_hz && <SpecRow label="Частота опроса" value={`${spec.polling_rate_hz} Гц`} />}
      </tbody>
    </table>
  );
}

export default function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: component, isLoading } = useQuery({
    queryKey: ["component", id],
    queryFn: () => componentApi.get(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <div className="text-center text-gray-500 py-16">Загрузка...</div>;
  if (!component) return <div className="text-center text-red-400 py-16">Компонент не найден</div>;

  const specs = component.cpu ? <CPUSpecs spec={component.cpu} />
    : component.motherboard ? <MBSpecs spec={component.motherboard} />
    : component.ram ? <RAMSpecs spec={component.ram} />
    : component.gpu ? <GPUSpecs spec={component.gpu} />
    : component.storage ? <StorageSpecs spec={component.storage} />
    : component.psu ? <PSUSpecs spec={component.psu} />
    : component.case ? <CaseSpecs spec={component.case} />
    : component.cooler ? <CoolerSpecs spec={component.cooler} />
    : component.monitor ? <MonitorSpecs spec={component.monitor} />
    : component.keyboard ? <KeyboardSpecs spec={component.keyboard} />
    : component.mouse ? <MouseSpecs spec={component.mouse} />
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/components" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
        <ArrowLeft size={16} /> Назад к компонентам
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="md:col-span-2 space-y-6">
          {/* Sticker */}
          <div className="rounded-xl overflow-hidden border border-gray-800">
            <CategorySticker slug={component.category_slug} size="xl" />
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {component.manufacturer_name} · {component.category_name}
            </p>
            <h1 className="text-2xl font-bold">{component.name}</h1>
            <p className="text-gray-400 text-sm mt-1">{component.model}</p>
          </div>

          {specs && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h2 className="font-semibold mb-4">Характеристики</h2>
              {specs}
            </div>
          )}
        </div>

        {/* Prices & Store Links */}
        <div className="space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart size={16} className="text-gray-400" />
              <h2 className="font-semibold">Купить</h2>
            </div>
            {component.prices.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет данных о ценах</p>
            ) : (
              <div className="space-y-2.5">
                {component.prices.map((p) => (
                  <StoreButton key={p.id} price={p} />
                ))}
              </div>
            )}
          </div>

          {component.release_year && (
            <div className="text-sm text-gray-500">
              Год выхода: {component.release_year}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
