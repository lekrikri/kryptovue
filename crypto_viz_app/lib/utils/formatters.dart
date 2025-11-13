import 'package:intl/intl.dart';

class Formatters {
  static final NumberFormat _currencyFormatter = NumberFormat.currency(
    symbol: '\$',
    decimalDigits: 2,
  );

  static final NumberFormat _compactFormatter = NumberFormat.compact();

  /// Formate un prix en devise
  static String formatCurrency(double value) {
    if (value >= 1000000000) {
      return '\$${(value / 1000000000).toStringAsFixed(2)}B';
    } else if (value >= 1000000) {
      return '\$${(value / 1000000).toStringAsFixed(2)}M';
    } else if (value >= 1000) {
      return '\$${(value / 1000).toStringAsFixed(2)}K';
    } else if (value >= 1) {
      return _currencyFormatter.format(value);
    } else {
      return '\$${value.toStringAsFixed(6)}';
    }
  }

  /// Formate un nombre de manière compacte
  static String formatCompact(double value) {
    return _compactFormatter.format(value);
  }

  /// Formate un pourcentage
  static String formatPercentage(double value) {
    final sign = value >= 0 ? '+' : '';
    return '$sign${value.toStringAsFixed(2)}%';
  }

  /// Formate une date
  static String formatDate(DateTime date) {
    return DateFormat('dd/MM/yyyy HH:mm').format(date);
  }

  /// Formate une heure
  static String formatTime(DateTime date) {
    return DateFormat('HH:mm').format(date);
  }
}
