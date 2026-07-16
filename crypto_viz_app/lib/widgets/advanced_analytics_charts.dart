import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../models/crypto_model.dart';
import 'dart:math' as math;

class AdvancedAnalyticsCharts extends StatelessWidget {
  final CryptoModel crypto;
  final String timeframe;

  const AdvancedAnalyticsCharts({
    super.key,
    required this.crypto,
    this.timeframe = '24H',
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        _buildPriceChart(),
        const SizedBox(height: 20),
        _buildVolumeChart(),
        const SizedBox(height: 20),
        _buildRSIChart(),
      ],
    );
  }

  Widget _buildPriceChart() {
    return Container(
      height: 200,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
      ),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(show: false),
          titlesData: FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: _generatePriceData(),
              isCurved: true,
              color: const Color(0xFF4A90E2),
              barWidth: 3,
              dotData: FlDotData(show: false),
              belowBarData: BarAreaData(
                show: true,
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF4A90E2).withOpacity(0.3),
                    const Color(0xFF4A90E2).withOpacity(0.0),
                  ],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildVolumeChart() {
    return Container(
      height: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
      ),
      child: BarChart(
        BarChartData(
          gridData: FlGridData(show: false),
          titlesData: FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          barGroups: _generateVolumeData(),
        ),
      ),
    );
  }

  Widget _buildRSIChart() {
    return Container(
      height: 150,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
      ),
      child: LineChart(
        LineChartData(
          gridData: FlGridData(show: false),
          titlesData: FlTitlesData(show: false),
          borderData: FlBorderData(show: false),
          lineBarsData: [
            LineChartBarData(
              spots: _generateRSIData(),
              isCurved: true,
              color: const Color(0xFFFF9500),
              barWidth: 2,
              dotData: FlDotData(show: false),
            ),
          ],
        ),
      ),
    );
  }

  List<FlSpot> _generatePriceData() {
    final random = math.Random();
    final basePrice = crypto.currentPrice;
    return List.generate(24, (index) {
      final variance = (random.nextDouble() - 0.5) * basePrice * 0.05;
      return FlSpot(index.toDouble(), basePrice + variance);
    });
  }

  List<BarChartGroupData> _generateVolumeData() {
    final random = math.Random();
    return List.generate(24, (index) {
      return BarChartGroupData(
        x: index,
        barRods: [
          BarChartRodData(
            toY: random.nextDouble() * 100,
            color: const Color(0xFF4A90E2),
            width: 8,
          ),
        ],
      );
    });
  }

  List<FlSpot> _generateRSIData() {
    final random = math.Random();
    return List.generate(24, (index) {
      return FlSpot(index.toDouble(), 30 + random.nextDouble() * 40);
    });
  }
}
