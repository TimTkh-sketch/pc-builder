const OFFERS = [
  "🔥 76 компонентов в каталоге — найди идеальный вариант",
  "⚡ Проверка совместимости в реальном времени",
  "🎮 7 готовых сборок: от офиса до игрового флагмана",
  "💾 Сохраняй конфигурации и возвращайся в любой момент",
  "🖥️ Мониторы, клавиатуры и мыши — всё в одном месте",
  "✅ Подбери ПК под свой бюджет — от 40 000 ₽",
];

export default function OfferTicker() {
  const text = OFFERS.join("   •   ");

  return (
    <div className="md:hidden overflow-hidden bg-blue-600/10 border-b border-blue-800/30 py-1.5">
      <div className="flex whitespace-nowrap animate-ticker">
        <span className="text-xs text-blue-300 px-4">{text}</span>
        <span className="text-xs text-blue-300 px-4" aria-hidden>{text}</span>
      </div>
    </div>
  );
}
