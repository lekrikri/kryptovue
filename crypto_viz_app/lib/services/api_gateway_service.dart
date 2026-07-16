import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/crypto_model.dart';
import '../models/news_model.dart';

class ApiGatewayService {
  static const String _baseUrl = 'http://localhost:3000/api';

  /// Vérifie si l'API Gateway est disponible
  Future<bool> isAvailable() async {
    return await checkHealth();
  }

  /// Récupère les top cryptos (alias pour getCryptoPrices)
  Future<List<CryptoModel>> getTopCryptos({int limit = 50}) async {
    return await getCryptoPrices(limit: limit);
  }

  /// Récupère les prix crypto depuis l'API Gateway (Kafka stream)
  Future<List<CryptoModel>> getCryptoPrices({int limit = 50}) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/crypto/prices?limit=$limit'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> cryptoData = data['data'];

          return cryptoData.map((item) => CryptoModel(
            id: item['symbol']?.toString().toLowerCase() ?? '',
            name: _getCryptoName(item['symbol']),
            symbol: item['symbol']?.toString().toUpperCase() ?? '',
            currentPrice: (item['price_usd'] ?? item['price_eur'] ?? 0).toDouble(),
            marketCap: (item['market_cap_usd'] ?? 0).toDouble(),
            marketCapRank: 0,
            priceChangePercentage24h: (item['change_24h'] ?? 0).toDouble(),
            image: _getCryptoImage(item['symbol']),
            priceChange24h: (item['change_24h_usd'] ?? 0).toDouble(),
            totalVolume: (item['volume_24h_usd'] ?? 0).toDouble(),
          )).toList();
        }
      }

      throw Exception('API Gateway non disponible');
    } catch (e) {
      throw Exception('Erreur API Gateway: $e');
    }
  }

  /// Récupère les actualités crypto depuis l'API Gateway
  Future<List<NewsModel>> getCryptoNews({int limit = 20}) async {
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/crypto/news?limit=$limit'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['success'] == true && data['data'] != null) {
          final List<dynamic> newsData = data['data'];

          return newsData.map((item) => NewsModel(
            id: item['id']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
            title: item['title'] ?? '',
            description: item['description'] ?? item['content'] ?? '',
            url: item['url'] ?? item['link'] ?? '',
            imageUrl: item['image'] ?? '',
            publishedAt: DateTime.tryParse(item['published_at'] ?? item['timestamp'] ?? '') ?? DateTime.now(),
            source: item['source'] ?? 'Kafka Stream',
            tags: List<String>.from(item['tags'] ?? []),
          )).toList();
        }
      }

      throw Exception('API Gateway news non disponible');
    } catch (e) {
      throw Exception('Erreur API Gateway news: $e');
    }
  }

  /// Vérifier la santé de l'API Gateway
  Future<bool> checkHealth() async {
    try {
      final response = await http.get(
        Uri.parse('http://localhost:3000/health'),
      ).timeout(const Duration(seconds: 5));

      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  String _getCryptoName(String? symbol) {
    final names = {
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'USDT': 'Tether',
      'BNB': 'Binance Coin',
      'SOL': 'Solana',
      'XRP': 'Ripple',
      'USDC': 'USD Coin',
      'ADA': 'Cardano',
      'AVAX': 'Avalanche',
      'DOGE': 'Dogecoin',
      'DOT': 'Polkadot',
      'MATIC': 'Polygon',
      'SHIB': 'Shiba Inu',
      'LTC': 'Litecoin',
      'UNI': 'Uniswap',
    };
    return names[symbol?.toUpperCase()] ?? symbol ?? 'Unknown';
  }

  String _getCryptoImage(String? symbol) {
    final symbolLower = symbol?.toLowerCase() ?? 'bitcoin';
    return 'https://assets.coincap.io/assets/icons/$symbolLower@2x.png';
  }
}
