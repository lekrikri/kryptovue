import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/crypto_model.dart';
import '../utils/formatters.dart';

class MarketOverviewCharts extends StatefulWidget {
  final List<CryptoModel> cryptos;

  const MarketOverviewCharts({
    super.key,
    required this.cryptos,
  });

  @override
  State<MarketOverviewCharts> createState() => _MarketOverviewChartsState();
}

class _MarketOverviewChartsState extends State<MarketOverviewCharts> {
  int selectedChartIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 350,
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2D47)),
      ),
      child: Column(
        children: [
          // En-tête avec sélecteur
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF2A2D47), width: 1),
              ),
            ),
            child: Row(
              children: [
                const Text(
                  'Market Overview',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                _buildChartSelector(),
              ],
            ),
          ),
          
          // Contenu du graphique
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: _buildSelectedChart(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChartSelector() {
    final chartTypes = ['Market Cap', 'Volume', 'Performance', 'Dominance'];
    
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF2A2D47),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: chartTypes.asMap().entries.map((entry) {
          final index = entry.key;
          final type = entry.value;
          final isSelected = selectedChartIndex == index;
          
          return GestureDetector(
            onTap: () {
              setState(() {
                selectedChartIndex = index;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF4A90E2) : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                type,
                style: TextStyle(
                  color: isSelected ? Colors.white : const Color(0xFF8B93A7),
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildSelectedChart() {
    switch (selectedChartIndex) {
      case 0:
        return _buildMarketCapChart();
      case 1:
        return _buildVolumeChart();
      case 2:
        return _buildPerformanceChart();
      case 3:
        return _buildDominanceChart();
      default:
        return _buildMarketCapChart();
    }
  }

  Widget _buildMarketCapChart() {
    final topCryptos = widget.cryptos.take(8).toList();
    
    return PieChart(
      PieChartData(
        sectionsSpace: 2,
        centerSpaceRadius: 60,
        sections: topCryptos.asMap().entries.map((entry) {
          final index = entry.key;
          final crypto = entry.value;
          final colors = [
            const Color(0xFF4A90E2),
            const Color(0xFF50C878),
            const Color(0xFFFF6B6B),
            const Color(0xFFFFD93D),
            const Color(0xFF6BCF7F),
            const Color(0xFFFF8C42),
            const Color(0xFF9B59B6),
            const Color(0xFF3498DB),
          ];
          
          return PieChartSectionData(
            color: colors[index % colors.length],
            value: crypto.marketCap,
            title: crypto.symbol.toUpperCase(),
            radius: 80,
            titleStyle: const TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildVolumeChart() {
    final topCryptos = widget.cryptos.take(10).toList();
    
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: topCryptos.map((e) => e.totalVolume ?? 0).reduce((a, b) => a > b ? a : b) * 1.2,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: topCryptos.map((e) => e.totalVolume ?? 0).reduce((a, b) => a > b ? a : b) / 5,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: const Color(0xFF2A2D47),
              strokeWidth: 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < topCryptos.length) {
                  return Text(
                    topCryptos[value.toInt()].symbol.toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF8B93A7),
                      fontSize: 10,
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 50,
              getTitlesWidget: (value, meta) {
                return Text(
                  '${(value / 1000000000).toStringAsFixed(1)}B',
                  style: const TextStyle(
                    color: Color(0xFF8B93A7),
                    fontSize: 10,
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        barGroups: topCryptos.asMap().entries.map((entry) {
          final index = entry.key;
          final crypto = entry.value;
          
          return BarChartGroupData(
            x: index,
            barRods: [
              BarChartRodData(
                toY: crypto.totalVolume?.toDouble() ?? 0,
                gradient: LinearGradient(
                  begin: Alignment.bottomCenter,
                  end: Alignment.topCenter,
                  colors: [
                    const Color(0xFF4A90E2).withOpacity(0.8),
                    const Color(0xFF4A90E2).withOpacity(0.4),
                  ],
                ),
                width: 20,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(4),
                  topRight: Radius.circular(4),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildPerformanceChart() {
    final topCryptos = widget.cryptos.take(10).toList();
    
    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: topCryptos.map((e) => e.priceChangePercentage24h).reduce((a, b) => a > b ? a : b) + 5,
        minY: topCryptos.map((e) => e.priceChangePercentage24h).reduce((a, b) => a < b ? a : b) - 5,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: 5,
          getDrawingHorizontalLine: (value) {
            return FlLine(
              color: value == 0 ? const Color(0xFF8B93A7) : const Color(0xFF2A2D47),
              strokeWidth: value == 0 ? 2 : 1,
            );
          },
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                if (value.toInt() < topCryptos.length) {
                  return Text(
                    topCryptos[value.toInt()].symbol.toUpperCase(),
                    style: const TextStyle(
                      color: Color(0xFF8B93A7),
                      fontSize: 10,
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) {
                return Text(
                  '${value.toStringAsFixed(0)}%',
                  style: const TextStyle(
                    color: Color(0xFF8B93A7),
                    fontSize: 10,
                  ),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        barGroups: topCryptos.asMap().entries.map((entry) {
          final index = entry.key;
          final crypto = entry.value;
          final isPositive = crypto.priceChangePercentage24h >= 0;
          
          return BarChartGroupData(
            x: index,
            barRods: [
              BarChartRodData(
                fromY: 0,
                toY: crypto.priceChangePercentage24h,
                color: isPositive ? const Color(0xFF4CAF50) : const Color(0xFFFF5252),
                width: 20,
                borderRadius: BorderRadius.circular(4),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildDominanceChart() {
    final totalMarketCap = widget.cryptos.fold<double>(
      0, (sum, crypto) => sum + crypto.marketCap
    );
    
    final dominanceData = widget.cryptos.take(5).map((crypto) {
      return DominanceData(
        name: crypto.name,
        symbol: crypto.symbol,
        percentage: (crypto.marketCap / totalMarketCap) * 100,
      );
    }).toList();
    
    return Column(
      children: [
        // Graphique en anneau
        Expanded(
          flex: 2,
          child: PieChart(
            PieChartData(
              sectionsSpace: 3,
              centerSpaceRadius: 50,
              sections: dominanceData.asMap().entries.map((entry) {
                final index = entry.key;
                final data = entry.value;
                final colors = [
                  const Color(0xFF4A90E2),
                  const Color(0xFF50C878),
                  const Color(0xFFFF6B6B),
                  const Color(0xFFFFD93D),
                  const Color(0xFF6BCF7F),
                ];
                
                return PieChartSectionData(
                  color: colors[index % colors.length],
                  value: data.percentage,
                  title: '${data.percentage.toStringAsFixed(1)}%',
                  radius: 60,
                  titleStyle: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                );
              }).toList(),
            ),
          ),
        ),
        
        // Légende
        Expanded(
          flex: 1,
          child: ListView.builder(
            itemCount: dominanceData.length,
            itemBuilder: (context, index) {
              final data = dominanceData[index];
              final colors = [
                const Color(0xFF4A90E2),
                const Color(0xFF50C878),
                const Color(0xFFFF6B6B),
                const Color(0xFFFFD93D),
                const Color(0xFF6BCF7F),
              ];
              
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Row(
                  children: [
                    Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: colors[index % colors.length],
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        '${data.symbol.toUpperCase()} - ${data.percentage.toStringAsFixed(1)}%',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class DominanceData {
  final String name;
  final String symbol;
  final double percentage;

  DominanceData({
    required this.name,
    required this.symbol,
    required this.percentage,
  });
}
