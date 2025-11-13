import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/crypto_model.dart';
import '../utils/formatters.dart';

class EnhancedCryptoCard extends StatelessWidget {
  final CryptoModel crypto;

  const EnhancedCryptoCard({
    super.key,
    required this.crypto,
  });

  @override
  Widget build(BuildContext context) {
    final changeColor = crypto.priceChangePercentage24h >= 0 
        ? const Color(0xFF4CAF50) 
        : const Color(0xFFFF5252);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2D47)),
      ),
      child: Column(
        children: [
          // En-tête avec infos de base
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF4A90E2).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Center(
                  child: Text(
                    crypto.symbol.substring(0, 2).toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF4A90E2),
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      crypto.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      crypto.symbol.toUpperCase(),
                      style: const TextStyle(
                        color: Color(0xFF8B93A7),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    Formatters.formatCurrency(crypto.currentPrice),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '${crypto.priceChangePercentage24h >= 0 ? '+' : ''}${crypto.priceChangePercentage24h.toStringAsFixed(2)}%',
                    style: TextStyle(
                      color: changeColor,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Mini graphique
          SizedBox(
            height: 60,
            child: LineChart(
              LineChartData(
                gridData: const FlGridData(show: false),
                titlesData: const FlTitlesData(show: false),
                borderData: FlBorderData(show: false),
                minX: 0,
                maxX: 23,
                minY: crypto.currentPrice * 0.98,
                maxY: crypto.currentPrice * 1.02,
                lineBarsData: [
                  LineChartBarData(
                    spots: _generateMiniChartData(),
                    isCurved: true,
                    color: changeColor,
                    barWidth: 2,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                    belowBarData: BarAreaData(
                      show: true,
                      color: changeColor.withOpacity(0.1),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          const SizedBox(height: 12),
          
          // Métriques supplémentaires
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMetric('Market Cap', 
                '\$${(crypto.marketCap / 1000000000).toStringAsFixed(1)}B'),
              _buildMetric('Volume', 
                '\$${((crypto.totalVolume ?? 0) / 1000000).toStringAsFixed(0)}M'),
              _buildMetric('Rank', '#${crypto.marketCapRank}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetric(String label, String value) {
    return Column(
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Color(0xFF8B93A7),
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  List<FlSpot> _generateMiniChartData() {
    final basePrice = crypto.currentPrice;
    final trend = crypto.priceChangePercentage24h >= 0 ? 1 : -1;
    
    return List.generate(24, (index) {
      final variation = (index / 23) * trend * 0.02 + 
                      (index % 3 - 1) * 0.005;
      return FlSpot(index.toDouble(), basePrice * (1 + variation));
    });
  }
}
