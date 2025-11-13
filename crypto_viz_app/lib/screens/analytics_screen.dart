import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/crypto_provider.dart';
import '../widgets/simple_advanced_charts.dart';
import '../models/crypto_model.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  CryptoModel? selectedCrypto;
  String selectedTimeframe = '24H';
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F1419),
      body: SafeArea(
        child: Column(
          children: [
            // En-tête
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(color: Color(0xFF2A2D47), width: 1),
                ),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  const Text(
                    'Advanced Analytics',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const Spacer(),
                  _buildTimeframeSelector(),
                ],
              ),
            ),
            
            // Contenu principal avec scroll complet
            Expanded(
              child: Consumer<CryptoProvider>(
                builder: (context, provider, child) {
                  if (provider.cryptos.isEmpty) {
                    return const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF4A90E2)),
                      ),
                    );
                  }
                  
                  final crypto = selectedCrypto ?? provider.cryptos.first;
                  
                  return SingleChildScrollView(
                    child: Column(
                      children: [
                        // Sélecteur de crypto
                        SizedBox(
                          height: 80,
                          child: ListView.builder(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                            itemCount: provider.cryptos.length > 10 ? 10 : provider.cryptos.length,
                            itemBuilder: (context, index) {
                              final crypto = provider.cryptos[index];
                              final isSelected = selectedCrypto?.id == crypto.id;
                              
                              return GestureDetector(
                                onTap: () {
                                  setState(() {
                                    selectedCrypto = crypto;
                                  });
                                },
                                child: Container(
                                  margin: const EdgeInsets.only(right: 12),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: isSelected ? const Color(0xFF4A90E2) : const Color(0xFF1E2139),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSelected ? const Color(0xFF4A90E2) : const Color(0xFF2A2D47),
                                    ),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        crypto.symbol.toUpperCase(),
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : const Color(0xFF8B93A7),
                                          fontSize: 11,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                      Text(
                                        '\$${crypto.currentPrice.toStringAsFixed(2)}',
                                        style: TextStyle(
                                          color: isSelected ? Colors.white : const Color(0xFF8B93A7),
                                          fontSize: 9,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                        
                        // Contenu principal
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Informations de la crypto sélectionnée
                              _buildCryptoHeader(crypto),
                              const SizedBox(height: 20),
                              
                              // Graphiques avancés
                              SimpleAdvancedCharts(crypto: crypto),
                              const SizedBox(height: 20),
                              
                              // Métriques techniques
                              _buildTechnicalMetrics(crypto),
                              const SizedBox(height: 20),
                              
                              // Analyse de marché
                              _buildMarketAnalysis(crypto),
                              const SizedBox(height: 100),
                            ],
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTimeframeSelector() {
    final timeframes = ['1H', '4H', '24H', '7D', '30D'];
    
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: timeframes.map((timeframe) {
          final isSelected = selectedTimeframe == timeframe;
          return GestureDetector(
            onTap: () {
              setState(() {
                selectedTimeframe = timeframe;
              });
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF4A90E2) : Colors.transparent,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                timeframe,
                style: TextStyle(
                  color: isSelected ? Colors.white : const Color(0xFF8B93A7),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildCryptoHeader(CryptoModel crypto) {
    final changeColor = crypto.priceChangePercentage24h >= 0 
        ? const Color(0xFF4CAF50) 
        : const Color(0xFFFF5252);
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2D47)),
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: const Color(0xFF4A90E2).withOpacity(0.2),
              borderRadius: BorderRadius.circular(25),
            ),
            child: Center(
              child: Text(
                crypto.symbol.substring(0, 2).toUpperCase(),
                style: const TextStyle(
                  color: Color(0xFF4A90E2),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  crypto.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  crypto.symbol.toUpperCase(),
                  style: const TextStyle(
                    color: Color(0xFF8B93A7),
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '\$${crypto.currentPrice.toStringAsFixed(2)}',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${crypto.priceChangePercentage24h >= 0 ? '+' : ''}${crypto.priceChangePercentage24h.toStringAsFixed(2)}%',
                style: TextStyle(
                  color: changeColor,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTechnicalMetrics(CryptoModel crypto) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2D47)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Technical Indicators',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          Row(
            children: [
              Expanded(child: _buildMetricCard('RSI (14)', '65.4', Colors.orange)),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard('MACD', '0.12', const Color(0xFF4CAF50))),
            ],
          ),
          const SizedBox(height: 12),
          
          Row(
            children: [
              Expanded(child: _buildMetricCard('SMA (20)', '\$${(crypto.currentPrice * 0.98).toStringAsFixed(2)}', const Color(0xFF2196F3))),
              const SizedBox(width: 12),
              Expanded(child: _buildMetricCard('EMA (12)', '\$${(crypto.currentPrice * 1.01).toStringAsFixed(2)}', const Color(0xFF9C27B0))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricCard(String title, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF2A2D47),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Color(0xFF8B93A7),
              fontSize: 12,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              color: color,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMarketAnalysis(CryptoModel crypto) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2A2D47)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Market Analysis',
            style: TextStyle(
              color: Colors.white,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          _buildAnalysisRow('Market Cap', '\$${(crypto.marketCap / 1000000000).toStringAsFixed(2)}B'),
          _buildAnalysisRow('24h Volume', '\$${((crypto.totalVolume ?? 0) / 1000000000).toStringAsFixed(2)}B'),
          _buildAnalysisRow('Supply', '${(crypto.marketCap / crypto.currentPrice / 1000000).toStringAsFixed(1)}M ${crypto.symbol.toUpperCase()}'),
          _buildAnalysisRow('All Time High', '\$${(crypto.currentPrice * 1.5).toStringAsFixed(2)}'),
          _buildAnalysisRow('Market Cap Rank', '#${crypto.marketCapRank}'),
        ],
      ),
    );
  }

  Widget _buildAnalysisRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(
              color: Color(0xFF8B93A7),
              fontSize: 14,
            ),
          ),
          Text(
            value,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
