import 'package:flutter/material.dart';
import '../models/news_model.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:html/parser.dart' as html_parser;

class DarkNewsCard extends StatelessWidget {
  final NewsModel news;

  const DarkNewsCard({
    super.key,
    required this.news,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFF2A2D47),
          width: 1,
        ),
      ),
      child: InkWell(
        onTap: () => _launchUrl(news.url),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // En-tête avec source et temps
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF4A90E2).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    news.source,
                    style: const TextStyle(
                      color: Color(0xFF4A90E2),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                Text(
                  news.timeAgo,
                  style: const TextStyle(
                    color: Color(0xFF8B93A7),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 12),
            
            // Titre
            Text(
              _cleanHtmlText(news.title),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 15,
                fontWeight: FontWeight.w600,
                height: 1.3,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            
            if (news.description.isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(
                _cleanHtmlText(news.description),
                style: const TextStyle(
                  color: Color(0xFF8B93A7),
                  fontSize: 13,
                  height: 1.4,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            
            // Tags
            if (news.tags.isNotEmpty) ...[
              const SizedBox(height: 12),
              Wrap(
                spacing: 6,
                runSpacing: 4,
                children: news.tags.take(2).map((tag) => Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: const Color(0xFF2A2D47),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    '#$tag',
                    style: const TextStyle(
                      color: Color(0xFF8B93A7),
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                )).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _cleanHtmlText(String text) {
    if (text.isEmpty) return '';
    
    try {
      // Parse le HTML avec la librairie html
      final document = html_parser.parse(text);
      
      // Extrait uniquement le texte, sans les balises HTML
      String cleaned = document.body?.text ?? document.documentElement?.text ?? text;
      
      // Normalise les espaces
      return cleaned
          .replaceAll(RegExp(r'\s+'), ' ')
          .trim();
    } catch (e) {
      // Fallback vers la méthode regex si le parsing HTML échoue
      return text
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

  Future<void> _launchUrl(String url) async {
    if (url.isEmpty) return;
    
    try {
      final Uri uri = Uri.parse(url);
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      }
    } catch (e) {
      // Silently handle URL launch errors
    }
  }
}
