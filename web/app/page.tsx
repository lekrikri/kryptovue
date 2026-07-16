import { fetchPrices } from "@/lib/api";
import { PriceTable } from "@/components/PriceTable";

export const revalidate = 30;

export default async function HomePage() {
  const prices = await fetchPrices();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Cours des cryptomonnaies en temps réel
        </h1>
        <p className="text-gray-600">
          Prix en direct, graphiques et heatmap du marché. Aucune inscription
          nécessaire.
        </p>
      </section>

      <PriceTable initial={prices} />
    </div>
  );
}
