import 'package:flutter/material.dart';
import '../models/crypto_model.dart';
import '../utils/formatters.dart';

class CleanCryptoCard extends StatelessWidget {
  final CryptoModel crypto;

  const CleanCryptoCard({
    super.key,
    required this.crypto,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = crypto.priceChangePercentage24h >= 0;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E2E),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          // Logo crypto
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: _getCryptoColor(crypto.symbol),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Center(
              child: Text(
                crypto.symbol.substring(0, 1).toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Nom et symbole
          Expanded(
            flex: 2,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  crypto.name,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  crypto.symbol.toUpperCase(),
                  style: const TextStyle(
                    color: Colors.grey,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          
          // Mini graphique
          Expanded(
            flex: 2,
            child: Container(
              height: 30,
              child: CustomPaint(
                painter: MiniSparklinePainter(
                  isPositive: isPositive,
                  color: isPositive ? Colors.green : Colors.red,
                ),
                size: const Size(double.infinity, 30),
              ),
            ),
          ),
          
          const SizedBox(width: 12),
          
          // Prix et variation
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                Formatters.formatCurrency(crypto.currentPrice),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                '${isPositive ? '+' : ''}${Formatters.formatPercentage(crypto.priceChangePercentage24h)}',
                style: TextStyle(
                  color: isPositive ? Colors.green : Colors.red,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Color _getCryptoColor(String symbol) {
    switch (symbol.toLowerCase()) {
      case 'btc':
        return Colors.orange;
      case 'eth':
        return Colors.blue;
      case 'bnb':
        return Colors.yellow[700]!;
      case 'ada':
        return Colors.blue[800]!;
      case 'sol':
        return Colors.purple;
      case 'dot':
        return Colors.pink;
      default:
        return Colors.grey[600]!;
    }
  }
}

class MiniSparklinePainter extends CustomPainter {
  final bool isPositive;
  final Color color;

  MiniSparklinePainter({
    required this.isPositive,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.8)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    // Génère des points pour une courbe simple
    final points = <Offset>[];
    final segments = 8;
    
    for (int i = 0; i <= segments; i++) {
      final x = (size.width / segments) * i;
      final baseY = size.height * 0.5;
      final variation = (i % 2 == 0 ? -1 : 1) * (size.height * 0.2);
      final trend = isPositive ? -i * 2.0 : i * 2.0;
      final y = baseY + variation + trend;
      
      points.add(Offset(x, y.clamp(0, size.height)));
    }

    if (points.isNotEmpty) {
      path.moveTo(points[0].dx, points[0].dy);
      for (int i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
