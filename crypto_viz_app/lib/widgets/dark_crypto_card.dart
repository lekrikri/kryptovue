import 'package:flutter/material.dart';
import '../models/crypto_model.dart';
import '../utils/formatters.dart';

class DarkCryptoCard extends StatelessWidget {
  final CryptoModel crypto;

  const DarkCryptoCard({
    super.key,
    required this.crypto,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = crypto.priceChangePercentage24h >= 0;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2139),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF2A2D47),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Logo crypto
          Container(
            width: 45,
            height: 45,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  const Color(0xFF4A90E2),
                  const Color(0xFF357ABD),
                ],
              ),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Text(
                crypto.symbol.substring(0, 2).toUpperCase(),
                style: const TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ),
          
          const SizedBox(width: 16),
          
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
                const SizedBox(height: 2),
                Text(
                  crypto.symbol.toUpperCase(),
                  style: const TextStyle(
                    color: Color(0xFF8B93A7),
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          
          // Mini graphique
          Expanded(
            flex: 2,
            child: Container(
              height: 35,
              child: CustomPaint(
                painter: DarkSparklinePainter(
                  isPositive: isPositive,
                ),
                size: const Size(double.infinity, 35),
              ),
            ),
          ),
          
          const SizedBox(width: 16),
          
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
              const SizedBox(height: 2),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: isPositive 
                    ? const Color(0xFF4CAF50).withOpacity(0.2)
                    : const Color(0xFFFF5252).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${isPositive ? '+' : ''}${Formatters.formatPercentage(crypto.priceChangePercentage24h)}',
                  style: TextStyle(
                    color: isPositive ? const Color(0xFF4CAF50) : const Color(0xFFFF5252),
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class DarkSparklinePainter extends CustomPainter {
  final bool isPositive;

  DarkSparklinePainter({
    required this.isPositive,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = isPositive ? const Color(0xFF4CAF50) : const Color(0xFFFF5252)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    final path = Path();
    
    // Génère des points pour une courbe
    final points = <Offset>[];
    final segments = 6;
    
    for (int i = 0; i <= segments; i++) {
      final x = (size.width / segments) * i;
      final baseY = size.height * 0.5;
      final variation = (i % 2 == 0 ? -1 : 1) * (size.height * 0.15);
      final trend = isPositive ? -i * 1.5 : i * 1.5;
      final y = (baseY + variation + trend).clamp(size.height * 0.2, size.height * 0.8);
      
      points.add(Offset(x, y));
    }

    if (points.isNotEmpty) {
      path.moveTo(points[0].dx, points[0].dy);
      for (int i = 1; i < points.length; i++) {
        path.lineTo(points[i].dx, points[i].dy);
      }
      canvas.drawPath(path, paint);
      
      // Ajoute des points
      final pointPaint = Paint()
        ..color = isPositive ? const Color(0xFF4CAF50) : const Color(0xFFFF5252)
        ..style = PaintingStyle.fill;

      canvas.drawCircle(points.last, 2, pointPaint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
