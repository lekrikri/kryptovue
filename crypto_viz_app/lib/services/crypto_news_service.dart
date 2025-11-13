import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:xml/xml.dart';
import 'package:html/parser.dart' as html_parser;
import 'package:html/dom.dart' as html_dom;
import '../models/news_model.dart';

class CryptoNewsService {
  DateTime? _lastFetch;
  List<NewsModel>? _cachedNews;
  static const Duration _cacheTimeout = Duration(minutes: 5);
  
  // URL de l'API Gateway qui expose les données Kafka/Spark
  static const String _apiGatewayUrl = 'http://localhost:3000/api';
  
  /// Récupère les actualités crypto depuis le pipeline Kafka/Spark
  Future<List<NewsModel>> getCryptoNews({int limit = 20}) async {
    try {
      // Vérifie le cache
      if (_cachedNews != null && 
          _lastFetch != null && 
          DateTime.now().difference(_lastFetch!) < _cacheTimeout) {
        return _cachedNews!.take(limit).toList();
      }
      
      // Récupère depuis l'API Gateway (Kafka stream)
      final kafkaNews = await _fetchFromKafkaStream(limit);
      
      if (kafkaNews.isNotEmpty) {
        _cachedNews = kafkaNews;
        _lastFetch = DateTime.now();
        return kafkaNews;
      }
      
      // Fallback vers les données de base si Kafka n'est pas disponible
      return _getBaseFrenchNews().take(limit).toList();
    } catch (e) {
      print('Erreur service news: $e');
      return _getBaseFrenchNews().take(limit).toList();
    }
  }
  
  /// Récupère les actualités depuis le stream Kafka via l'API Gateway
  Future<List<NewsModel>> _fetchFromKafkaStream(int limit) async {
    try {
      final response = await http.get(
        Uri.parse('$_apiGatewayUrl/crypto/news?limit=$limit'),
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
            id: item['timestamp']?.toString() ?? DateTime.now().millisecondsSinceEpoch.toString(),
            title: item['title'] ?? '',
            description: item['description'] ?? '',
            url: item['url'] ?? '',
            imageUrl: '',
            publishedAt: _parseKafkaTimestamp(item['published_at']),
            source: '${item['source'] ?? 'Kafka Stream'} 🔴 LIVE',
            tags: List<String>.from(item['tags'] ?? ['crypto']),
          )).toList();
        }
      }
      
      throw Exception('API Gateway non disponible');
    } catch (e) {
      throw Exception('Erreur Kafka stream: $e');
    }
  }
  
  /// Parse le timestamp depuis Kafka
  DateTime _parseKafkaTimestamp(dynamic timestamp) {
    if (timestamp == null) return DateTime.now();
    
    try {
      if (timestamp is String) {
        return DateTime.parse(timestamp);
      }
      return DateTime.now();
    } catch (e) {
      return DateTime.now();
    }
  }
  
  /// Récupère les actualités depuis plusieurs sources avec fallback
  Future<List<NewsModel>> _fetchRealCryptoNews() async {
    final List<NewsModel> allNews = [];
    
    // Source 1: Flux RSS Journal du Coin
    try {
      final journalNews = await _fetchFromRSS('https://journalducoin.com/feed/', 'Journal du Coin');
      allNews.addAll(journalNews);
    } catch (e) {
      print('Erreur Journal du Coin RSS: $e');
    }
    
    // Source 2: Flux RSS Cryptoast
    try {
      final cryptoastNews = await _fetchFromRSS('https://cryptoast.fr/feed/', 'Cryptoast');
      allNews.addAll(cryptoastNews);
    } catch (e) {
      print('Erreur Cryptoast RSS: $e');
    }
    
    // Source 3: Flux RSS CoinTribune
    try {
      final tribuneNews = await _fetchFromRSS('https://cointribune.com/feed/', 'CoinTribune');
      allNews.addAll(tribuneNews);
    } catch (e) {
      print('Erreur CoinTribune RSS: $e');
    }
    
    // Source 4: Flux RSS CryptoActu
    try {
      final cryptoActuNews = await _fetchFromRSS('https://cryptoactu.com/feed/', 'CryptoActu');
      allNews.addAll(cryptoActuNews);
    } catch (e) {
      print('Erreur CryptoActu RSS: $e');
    }
    
    // Source 5: NewsAPI avec mots-clés français
    try {
      final newsApiNews = await _fetchFromNewsAPI();
      allNews.addAll(newsApiNews);
    } catch (e) {
      print('Erreur NewsAPI: $e');
    }
    
    // Supprime les doublons et trie par date
    final uniqueNews = _removeDuplicates(allNews);
    uniqueNews.sort((a, b) => b.publishedAt.compareTo(a.publishedAt));
    
    return uniqueNews;
  }
  
  /// Récupère les actualités depuis un flux RSS
  Future<List<NewsModel>> _fetchFromRSS(String rssUrl, String sourceName) async {
    final response = await http.get(
      Uri.parse(rssUrl),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CryptoVizApp/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    ).timeout(const Duration(seconds: 10));
    
    if (response.statusCode == 200) {
      return _parseRSSFeed(response.body, sourceName);
    } else {
      throw Exception('RSS failed: ${response.statusCode}');
    }
  }
  
  /// Parse un flux RSS XML
  List<NewsModel> _parseRSSFeed(String xmlContent, String sourceName) {
    final document = XmlDocument.parse(xmlContent);
    final items = document.findAllElements('item');
    final List<NewsModel> news = [];
    
    for (final item in items.take(10)) { // Limite à 10 par source
      try {
        final title = item.findElements('title').first.innerText.trim();
        final description = _extractDescription(item);
        final link = item.findElements('link').first.innerText.trim();
        final pubDate = _parseDate(item.findElements('pubDate').first.innerText);
        
        // Filtre uniquement les actualités crypto
        if (_isCryptoRelated(title, description)) {
          news.add(NewsModel(
            id: '${sourceName.toLowerCase()}_${link.hashCode}',
            title: _cleanTitle(title),
            description: _cleanDescription(description),
            url: link,
            imageUrl: _extractImageUrl(item),
            publishedAt: pubDate,
            source: sourceName,
            tags: _extractTags(title, description),
          ));
        }
      } catch (e) {
        continue; // Ignore les articles malformés
      }
    }
    
    return news;
  }
  
  /// Récupère les actualités depuis NewsAPI
  Future<List<NewsModel>> _fetchFromNewsAPI() async {
    // Note: NewsAPI nécessite une clé API payante pour un usage commercial
    // Pour la démo, on simule un appel qui échoue gracieusement
    throw Exception('NewsAPI nécessite une clé API payante');
    
    /* Code pour NewsAPI si vous avez une clé:
    final response = await http.get(
      Uri.parse('$_newsApiUrl?q=bitcoin OR ethereum OR crypto OR blockchain&language=fr&sortBy=publishedAt&pageSize=10'),
      headers: {
        'X-API-Key': _newsApiKey,
        'Accept': 'application/json',
      },
    ).timeout(const Duration(seconds: 10));
    
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      final articles = data['articles'] as List;
      return articles.map((article) => _parseNewsAPIArticle(article)).toList();
    } else {
      throw Exception('NewsAPI failed: ${response.statusCode}');
    }
    */
  }

  /// Fonctions utilitaires pour le parsing RSS
  
  String _extractDescription(XmlElement item) {
    // Essaie plusieurs balises possibles pour la description
    final descriptionTags = ['description', 'content:encoded', 'summary'];
    for (final tag in descriptionTags) {
      final elements = item.findElements(tag);
      if (elements.isNotEmpty) {
        return elements.first.innerText.trim();
      }
    }
    return '';
  }
  
  DateTime _parseDate(String dateString) {
    try {
      // Parse les formats de date RSS courants
      return DateTime.parse(dateString.replaceAll('GMT', '').trim());
    } catch (e) {
      try {
        // Format RFC 2822
        final parts = dateString.split(' ');
        if (parts.length >= 4) {
          final dateOnly = '${parts[1]} ${parts[2]} ${parts[3]}';
          return DateTime.parse(dateOnly);
        }
      } catch (e2) {
        // Fallback vers maintenant si le parsing échoue
        return DateTime.now();
      }
      return DateTime.now();
    }
  }
  
  String _extractImageUrl(XmlElement item) {
    // Cherche une image dans différentes balises
    final imageTags = ['media:thumbnail', 'enclosure', 'media:content'];
    for (final tag in imageTags) {
      final elements = item.findElements(tag);
      if (elements.isNotEmpty) {
        final url = elements.first.getAttribute('url');
        if (url != null && url.isNotEmpty) {
          return url;
        }
      }
    }
    return '';
  }
  
  bool _isCryptoRelated(String title, String description) {
    final cryptoKeywords = [
      'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'blockchain', 
      'solana', 'cardano', 'polygon', 'defi', 'nft', 'web3',
      'binance', 'coinbase', 'trading', 'altcoin', 'stablecoin',
      'mining', 'staking', 'yield', 'dex', 'dao', 'metaverse'
    ];
    
    final content = '${title.toLowerCase()} ${description.toLowerCase()}';
    return cryptoKeywords.any((keyword) => content.contains(keyword));
  }
  
  String _cleanTitle(String title) {
    if (title.isEmpty) return '';
    
    try {
      // Parse le HTML avec la librairie html
      final document = html_parser.parse(title);
      
      // Extrait uniquement le texte, sans les balises HTML
      String cleaned = document.body?.text ?? document.documentElement?.text ?? title;
      
      // Normalise les espaces
      return cleaned
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();
    } catch (e) {
      // Fallback vers la méthode regex si le parsing HTML échoue
      return title
          .replaceAll(RegExp(r'<[^>]*>'), '')
          .replaceAll('&amp;', '&')
          .replaceAll('&lt;', '<')
          .replaceAll('&gt;', '>')
          .replaceAll('&quot;', '"')
          .replaceAll('&nbsp;', ' ')
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();
    }
  }
  
  String _cleanDescription(String description) {
    if (description.isEmpty) return '';
    
    try {
      // Parse le HTML avec la librairie html
      final document = html_parser.parse(description);
      
      // Extrait uniquement le texte, sans les balises HTML
      String cleaned = document.body?.text ?? document.documentElement?.text ?? '';
      
      // Normalise les espaces
      cleaned = cleaned
          .replaceAll(RegExp(r'\s+'), ' ')
          .replaceAll(RegExp(r'\n+'), ' ')
          .trim();
      
      // Si la description est trop longue, la tronquer intelligemment
      if (cleaned.length > 200) {
        int cutIndex = cleaned.lastIndexOf(' ', 200);
        if (cutIndex > 100) {
          cleaned = cleaned.substring(0, cutIndex) + '...';
        } else {
          cleaned = cleaned.substring(0, 200) + '...';
        }
      }
      
      return cleaned;
    } catch (e) {
      // Fallback vers la méthode regex si le parsing HTML échoue
      return description
          .replaceAll(RegExp(r'<[^>]*>'), '')
          .replaceAll('&amp;', '&')
          .replaceAll('&lt;', '<')
          .replaceAll('&gt;', '>')
          .replaceAll('&quot;', '"')
          .replaceAll('&nbsp;', ' ')
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();
    }
  }
  
  List<String> _extractTags(String title, String description) {
    final content = '${title.toLowerCase()} ${description.toLowerCase()}';
    final tags = <String>[];
    
    final tagMap = {
      'bitcoin': ['bitcoin', 'btc'],
      'ethereum': ['ethereum', 'eth'],
      'solana': ['solana', 'sol'],
      'defi': ['defi', 'finance décentralisée'],
      'nft': ['nft', 'token non fongible'],
      'regulation': ['réglementation', 'régulation', 'loi'],
      'france': ['france', 'français', 'européen'],
      'trading': ['trading', 'échange', 'bourse'],
      'mining': ['mining', 'minage', 'mineur'],
    };
    
    tagMap.forEach((tag, keywords) {
      if (keywords.any((keyword) => content.contains(keyword))) {
        tags.add(tag);
      }
    });
    
    return tags.isEmpty ? ['crypto'] : tags;
  }
  
  List<NewsModel> _removeDuplicates(List<NewsModel> news) {
    final seen = <String>{};
    return news.where((article) {
      final key = article.title.toLowerCase().trim();
      if (seen.contains(key)) {
        return false;
      }
      seen.add(key);
      return true;
    }).toList();
  }
  
  /// Récupère les actualités par catégorie
  Future<List<NewsModel>> getNewsByCategory(String category, {int limit = 10}) async {
    final allNews = await getCryptoNews(limit: 50);
    final filteredNews = allNews.where((news) {
      return news.tags.any((tag) => tag.toLowerCase().contains(category.toLowerCase()));
    }).toList();
    
    if (filteredNews.isNotEmpty) {
      return filteredNews.take(limit).toList();
    }
    
    return allNews.take(limit).toList();
  }
  
  /// Force la mise à jour du cache
  void forceRefresh() {
    _cachedNews = null;
    _lastFetch = null;
  }

  /// Actualités de base françaises
  List<NewsModel> _getBaseFrenchNews() {
    final now = DateTime.now();
    return [
      NewsModel(
        id: '1',
        title: 'Bitcoin franchit les 45 000€ grâce aux ETF européens',
        description: 'Le Bitcoin atteint de nouveaux sommets mensuels alors que les ETF européens drainent des milliards d\'euros d\'investissements institutionnels.',
        url: 'https://journalducoin.com/bitcoin-45000-euros-etf-europeens',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(minutes: 25)),
        source: 'Journal du Coin',
        tags: ['bitcoin', 'prix', 'etf'],
      ),
      NewsModel(
        id: '2',
        title: 'Ethereum : Les Layer 2 traitent plus de transactions que le mainnet',
        description: 'Arbitrum et Optimism dépassent Ethereum en volume quotidien, marquant un tournant dans l\'adoption des solutions de mise à l\'échelle.',
        url: 'https://cryptoast.fr/ethereum-layer2-volume-record',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 1, minutes: 15)),
        source: 'Cryptoast',
        tags: ['ethereum', 'layer2', 'scaling'],
      ),
      NewsModel(
        id: '3',
        title: 'La France autorise les paiements en crypto dans les commerces',
        description: 'Un décret gouvernemental autorise officiellement les commerçants français à accepter les paiements en cryptomonnaies sous certaines conditions.',
        url: 'https://www.cointribune.com/france-paiements-crypto-commerces',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 3)),
        source: 'CoinTribune',
        tags: ['france', 'regulation', 'paiements'],
      ),
      NewsModel(
        id: '4',
        title: 'Solana dépasse Ethereum en nombre de développeurs actifs',
        description: 'L\'écosystème Solana attire de plus en plus de développeurs, dépassant Ethereum pour la première fois selon GitHub.',
        url: 'https://journalducoin.com/solana-depasse-ethereum-developpeurs',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 5)),
        source: 'Journal du Coin',
        tags: ['solana', 'developpeurs', 'ecosysteme'],
      ),
      NewsModel(
        id: '5',
        title: 'BNP Paribas lance ses services de custody crypto',
        description: 'La plus grande banque française annonce le lancement de ses services de garde pour les actifs numériques destinés aux clients institutionnels.',
        url: 'https://cryptoast.fr/bnp-paribas-custody-crypto',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 7)),
        source: 'Cryptoast',
        tags: ['banque', 'custody', 'france'],
      ),
      NewsModel(
        id: '6',
        title: 'L\'UE finalise le règlement MiCA sur les cryptomonnaies',
        description: 'Le règlement européen MiCA entre en vigueur, créant un cadre réglementaire unifié pour les actifs numériques dans l\'Union européenne.',
        url: 'https://www.cointribune.com/ue-reglementation-mica-crypto',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 10)),
        source: 'CoinTribune',
        tags: ['regulation', 'europe', 'mica'],
      ),
      NewsModel(
        id: '7',
        title: 'Nouveau protocole DeFi français lève 50M€',
        description: 'Une startup française spécialisée dans la finance décentralisée lève 50 millions d\'euros pour développer son protocole multi-chaînes.',
        url: 'https://journalducoin.com/defi-francais-levee-50m',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 12)),
        source: 'Journal du Coin',
        tags: ['defi', 'france', 'levee'],
      ),
      NewsModel(
        id: '8',
        title: 'Les NFT français cartonnent sur OpenSea',
        description: 'Les collections NFT créées par des artistes français connaissent un succès grandissant sur la plus grande marketplace mondiale.',
        url: 'https://cryptoast.fr/nft-francais-succes-opensea',
        imageUrl: '',
        publishedAt: now.subtract(const Duration(hours: 15)),
        source: 'Cryptoast',
        tags: ['nft', 'france', 'art'],
      ),
    ];
  }
}
