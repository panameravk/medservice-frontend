import type { AnalyticsData } from "../types/analytics";

// ✅ Пока мок. Потом заменишь на реальный backend fetch.
export async function getAnalytics(branchId: string): Promise<AnalyticsData> {
  // имитация задержки сети
  await new Promise((r) => setTimeout(r, 250));

  // мок-данные, зависят от branchId (чтобы было видно, что парсится)
  const seed = Number(branchId) || 1;

  return {
    sent: 40 * seed,
    reviews: 7 * seed,
    complaints: 3 * seed,
    avgRating: Number((4.2 + (seed % 10) * 0.05).toFixed(1)),
  };
}
