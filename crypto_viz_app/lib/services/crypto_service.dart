import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/crypto_model.dart';

class CryptoService {
  // URL de l'API Gateway qui expose les données Kafka/Spark
  static const String _apiGatewayUrl = 'http://localhost:3000/api';
  static const String _fallbackUrl = 'https://api.coingecko.com/api/v3';
  
  /// Récupère les prix crypto depuis le pipeline Kafka/Spark
  Future<List<CryptoModel>> getTopCryptos({int limit = 50}) async {
    try {
      // Essaie d'abord l'API Gateway (données Kafka/Spark)
      final kafkaData = await _fetchFromKafkaStream(limit);
      if (kafkaData.isNotEmpty) {
        return kafkaData;
      }
      
      // Fallback vers CoinGecko si Kafka n'est pas disponible
      return await _fetchFromCoinGecko(limit);
      
    } catch (e) {
      print('Erreur CryptoService: $e');
      // Fallback vers CoinGecko en cas d'erreur
      return await _fetchFromCoinGecko(limit);
    }
  }
  
  /// Récupère depuis le stream Kafka via l'API Gateway
  Future<List<CryptoModel>> _fetchFromKafkaStream(int limit) async {
    try {
      final response = await http.get(
        Uri.parse('$_apiGatewayUrl/crypto/prices?limit=$limit'),
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
            marketCapRank: 0, // Pas disponible dans Kafka
            priceChangePercentage24h: (item['change_24h'] ?? 0).toDouble(),
            image: _getCryptoImage(item['symbol']),
            // sparklineIn7d pas disponible dans cette version
            priceChange24h: (item['change_24h_usd'] ?? 0).toDouble(),
            totalVolume: (item['volume_24h_usd'] ?? 0).toDouble(),
          )).toList();
        }
      }
      
      throw Exception('API Gateway non disponible');
    } catch (e) {
      throw Exception('Erreur Kafka stream: $e');
    }
  }
  
  /// Fallback vers CoinGecko
  Future<List<CryptoModel>> _fetchFromCoinGecko(int limit) async {
    try {
      final response = await http.get(
        Uri.parse('$_fallbackUrl/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=$limit&page=1&sparkline=true'),
        headers: {'accept': 'application/json'},
      ).timeout(const Duration(seconds: 15));
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => CryptoModel.fromJson(json)).toList();
      } else {
        throw Exception('CoinGecko API failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur CoinGecko: $e');
    }
  }
  
  /// Récupère les cryptos tendance depuis Kafka/Spark
  Future<List<CryptoModel>> getTrendingCryptos({int limit = 10}) async {
    try {
      final response = await http.get(
        Uri.parse('$_apiGatewayUrl/crypto/trending?limit=$limit'),
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
            currentPrice: (item['price_usd'] ?? 0).toDouble(),
            marketCap: (item['market_cap_usd'] ?? 0).toDouble(),
            marketCapRank: 0,
            priceChangePercentage24h: (item['change_24h'] ?? 0).toDouble(),
            image: _getCryptoImage(item['symbol']),
            // sparklineIn7d pas disponible
            priceChange24h: (item['change_24h_usd'] ?? 0).toDouble(),
            totalVolume: (item['volume_24h_usd'] ?? 0).toDouble(),
          )).toList();
        }
      }
      
      // Fallback vers les top cryptos si trending n'est pas disponible
      final topCryptos = await getTopCryptos(limit: limit);
      return topCryptos.take(limit).toList();
      
    } catch (e) {
      // Fallback vers les top cryptos
      final topCryptos = await getTopCryptos(limit: limit);
      return topCryptos.take(limit).toList();
    }
  }
  
  /// Récupère les statistiques du marché depuis Kafka/Spark
  Future<Map<String, dynamic>> getMarketStats() async {
    try {
      final response = await http.get(
        Uri.parse('$_apiGatewayUrl/stats'),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10));
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        
        if (data['success'] == true && data['data'] != null) {
          return data['data'];
        }
      }
      
      return {
        'total_market_cap_usd': 0,
        'total_volume_24h_usd': 0,
        'total_cryptos': 0,
        'source': 'fallback'
      };
      
    } catch (e) {
      return {
        'total_market_cap_usd': 0,
        'total_volume_24h_usd': 0,
        'total_cryptos': 0,
        'source': 'error'
      };
    }
  }
  
  /// Mapping des noms de cryptos
  String _getCryptoName(String? symbol) {
    if (symbol == null) return 'Unknown';
    
    final names = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'solana': 'Solana',
      'cardano': 'Cardano',
      'polkadot': 'Polkadot',
      'BTC': 'Bitcoin',
      'ETH': 'Ethereum',
      'SOL': 'Solana',
      'ADA': 'Cardano',
      'DOT': 'Polkadot',
    };
    
    return names[symbol.toLowerCase()] ?? symbol.toUpperCase();
  }
  
  /// URLs des images crypto
  String _getCryptoImage(String? symbol) {
    if (symbol == null) return '';
    
    final images = {
      'bitcoin': 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      'ethereum': 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      'solana': 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      'cardano': 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      'polkadot': 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
    };
    
    return images[symbol.toLowerCase()] ?? '';
  }
}
