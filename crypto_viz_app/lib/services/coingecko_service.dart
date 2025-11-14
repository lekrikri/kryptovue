import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/crypto_model.dart';

class CoinGeckoService {
  static const String _baseUrl = 'https://api.coingecko.com/api/v3';
  static const String _apiKey = ''; // Optionnel pour version gratuite
  
  // Headers pour les requêtes
  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (_apiKey.isNotEmpty) 'X-CG-Demo-API-Key': _apiKey,
  };

  /// Récupère le top des cryptomonnaies par market cap
  Future<List<CryptoModel>> getTopCryptos({int limit = 50}) async {
    try {
      final url = Uri.parse(
        '$_baseUrl/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=$limit&page=1&sparkline=false'
      );
      
      final response = await http.get(url, headers: _headers);
      
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((crypto) => CryptoModel.fromJson(crypto)).toList();
      } else if (response.statusCode == 429) {
        throw Exception('Limite de taux CoinGecko atteinte (429). Veuillez utiliser l\'API Gateway ou réessayer plus tard.');
      } else {
        throw Exception('Erreur API: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur réseau: $e');
    }
  }

  /// Récupère les cryptos trending
  Future<List<String>> getTrendingCryptos() async {
    try {
      final url = Uri.parse('$_baseUrl/search/trending');
      final response = await http.get(url, headers: _headers);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> coins = data['coins'];
        return coins.map((coin) => coin['item']['id'].toString()).toList();
      } else {
        throw Exception('Erreur API trending: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur trending: $e');
    }
  }

  /// Récupère les prix simples pour plusieurs cryptos
  Future<Map<String, double>> getSimplePrices(List<String> cryptoIds) async {
    try {
      final ids = cryptoIds.join(',');
      final url = Uri.parse(
        '$_baseUrl/simple/price?ids=$ids&vs_currencies=usd&include_24hr_change=true'
      );
      
      final response = await http.get(url, headers: _headers);
      
      if (response.statusCode == 200) {
        final Map<String, dynamic> data = json.decode(response.body);
        Map<String, double> prices = {};
        
        data.forEach((key, value) {
          prices[key] = (value['usd'] ?? 0).toDouble();
        });
        
        return prices;
      } else {
        throw Exception('Erreur prix simples: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur prix: $e');
    }
  }

  /// Récupère les données historiques d'une crypto
  Future<List<List<double>>> getHistoricalData(String cryptoId, {int days = 7}) async {
    try {
      final url = Uri.parse(
        '$_baseUrl/coins/$cryptoId/market_chart?vs_currency=usd&days=$days'
      );
      
      final response = await http.get(url, headers: _headers);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> prices = data['prices'];
        return prices.map((price) => [
          (price[0] as num).toDouble(), // timestamp
          (price[1] as num).toDouble(), // price
        ]).toList();
      } else {
        throw Exception('Erreur données historiques: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur historique: $e');
    }
  }

  /// Recherche de cryptomonnaies
  Future<List<CryptoModel>> searchCryptos(String query) async {
    try {
      final url = Uri.parse('$_baseUrl/search?query=$query');
      final response = await http.get(url, headers: _headers);
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final List<dynamic> coins = data['coins'];
        
        // Récupérer les détails des premiers résultats
        final cryptoIds = coins.take(10).map((coin) => coin['id'].toString()).toList();
        if (cryptoIds.isNotEmpty) {
          return getTopCryptos(); // Simplifié pour l'exemple
        }
        return [];
      } else {
        throw Exception('Erreur recherche: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Erreur recherche: $e');
    }
  }
}
