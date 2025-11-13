import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/crypto_model.dart';

class SimpleAdvancedCharts extends StatefulWidget {
  final CryptoModel crypto;

  const SimpleAdvancedCharts({
    super.key,
    required this.crypto,
  });

  @override
  State<SimpleAdvancedCharts> createState() => _SimpleAdvancedChartsState();
}

class _SimpleAdvancedChartsState extends State<SimpleAdvancedCharts>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 400,
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2D47)),
      ),
      child: Column(
        children: [
          // En-tête avec sélecteur de graphique
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0xFF2A2D47), width: 1),
              ),
            ),
            child: Row(
              children: [
                Text(
                  '${widget.crypto.name} Charts',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2D47),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    isScrollable: true,
                    indicator: BoxDecoration(
                      color: const Color(0xFF4A90E2),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    labelColor: Colors.white,
                    unselectedLabelColor: const Color(0xFF8B93A7),
                    labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    tabs: const [
                      Tab(text: 'Price'),
                      Tab(text: 'Volume'),
                      Tab(text: 'RSI'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Contenu des graphiques
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildPriceChart(),
                _buildVolumeChart(),
                _buildRSIChart(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceChart() {
    final priceData = _generatePriceData();
    
    return Padding(
      padding: const EdgeInsets.all(16),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: widget.crypto.currentPrice / 5,
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
                interval: 5,
                getTitlesWidget: (value, meta) {
                  return Text(
                    '${value.toInt()}h',
                    style: const TextStyle(
                      color: Color(0xFF8B93A7),
                      fontSize: 10,
                    ),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 60,
                getTitlesWidget: (value, meta) {
                  return Text(
                    '\$${value.toStringAsFixed(0)}',
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
          minX: 0,
          maxX: 24,
          minY: widget.crypto.currentPrice * 0.95,
          maxY: widget.crypto.currentPrice * 1.05,
          lineBarsData: [
            LineChartBarData(
              spots: priceData,
              isCurved: true,
              gradient: const LinearGradient(
                colors: [Color(0xFF4A90E2), Color(0xFF357ABD)],
              ),
              barWidth: 3,
              isStrokeCapRound: true,
              dotData: const FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    const Color(0xFF4A90E2).withOpacity(0.3),
                    const Color(0xFF4A90E2).withOpacity(0.05),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVolumeChart() {
    final volumeData = _generateVolumeData();
    
    return Padding(
      padding: const EdgeInsets.all(16),
      child: BarChart(
        BarChartData(
          alignment: BarChartAlignment.spaceAround,
          maxY: volumeData.map((e) => e.y).reduce((a, b) => a > b ? a : b) * 1.2,
          gridData: FlGridData(
            show: true,
            drawVerticalLine: false,
            horizontalInterval: volumeData.map((e) => e.y).reduce((a, b) => a > b ? a : b) / 5,
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
                  return Text(
                    '${value.toInt()}h',
                    style: const TextStyle(
                      color: Color(0xFF8B93A7),
                      fontSize: 10,
                    ),
                  );
                },
              ),
            ),
            leftTitles: AxisTitles(
              sideTitles: SideTitles(
                showTitles: true,
                reservedSize: 50,
                getTitlesWidget: (value, meta) {
                  return Text(
                    '${(value / 1000000).toStringAsFixed(1)}M',
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
          barGroups: volumeData.asMap().entries.map((entry) {
            return BarChartGroupData(
              x: entry.key,
              barRods: [
                BarChartRodData(
                  toY: entry.value.y,
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      const Color(0xFF4A90E2).withOpacity(0.8),
                      const Color(0xFF4A90E2).withOpacity(0.4),
                    ],
                  ),
                  width: 8,
                  borderRadius: const BorderRadius.only(
                    topLeft: Radius.circular(4),
                    topRight: Radius.circular(4),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildRSIChart() {
    final rsiData = _generateRSIData();
    
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Indicateurs RSI
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF2A2D47),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildRSIIndicator('RSI (14)', rsiData.last.y),
                _buildRSIIndicator('MACD', 0.12),
                _buildRSIIndicator('Signal', -0.05),
              ],
            ),
          ),
          const SizedBox(height: 16),
          
          // Graphique RSI
          Expanded(
            child: LineChart(
              LineChartData(
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 20,
                  getDrawingHorizontalLine: (value) {
                    Color lineColor = const Color(0xFF2A2D47);
                    if (value == 70 || value == 30) {
                      lineColor = value == 70 ? Colors.red.withOpacity(0.5) : Colors.green.withOpacity(0.5);
                    }
                    return FlLine(color: lineColor, strokeWidth: 1);
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
                        return Text(
                          '${value.toInt()}h',
                          style: const TextStyle(color: Color(0xFF8B93A7), fontSize: 10),
                        );
                      },
                    ),
                  ),
                  leftTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      reservedSize: 40,
                      getTitlesWidget: (value, meta) {
                        return Text(
                          value.toInt().toString(),
                          style: const TextStyle(color: Color(0xFF8B93A7), fontSize: 10),
                        );
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                minX: 0,
                maxX: 24,
                minY: 0,
                maxY: 100,
                lineBarsData: [
                  LineChartBarData(
                    spots: rsiData,
                    isCurved: true,
                    color: const Color(0xFFFF9800),
                    barWidth: 2,
                    isStrokeCapRound: true,
                    dotData: const FlDotData(show: false),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRSIIndicator(String label, double value) {
    Color valueColor = const Color(0xFF8B93A7);
    if (label.contains('RSI')) {
      if (value > 70) {
        valueColor = Colors.red;
      } else if (value < 30) {
        valueColor = Colors.green;
      }
    }

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
          value.toStringAsFixed(2),
          style: TextStyle(
            color: valueColor,
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  List<FlSpot> _generatePriceData() {
    final basePrice = widget.crypto.currentPrice;
    return List.generate(25, (index) {
      final variation = (index - 12) * 0.02 + (index % 3 - 1) * 0.01;
      return FlSpot(index.toDouble(), basePrice * (1 + variation));
    });
  }

  List<FlSpot> _generateVolumeData() {
    return List.generate(24, (index) {
      final baseVolume = widget.crypto.totalVolume ?? 1000000000;
      final variation = (index % 4) * 0.3 + (index % 7) * 0.2;
      return FlSpot(index.toDouble(), baseVolume * (0.5 + variation));
    });
  }

  List<FlSpot> _generateRSIData() {
    return List.generate(25, (index) {
      final baseRSI = 50.0;
      final variation = (index - 12) * 2 + (index % 5 - 2) * 5;
      final rsi = (baseRSI + variation).clamp(0.0, 100.0);
      return FlSpot(index.toDouble(), rsi);
    });
  }
}
