import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/crypto_provider.dart';
import '../widgets/clean_crypto_card.dart';
import '../utils/formatters.dart';

class CleanHomeScreen extends StatefulWidget {
  const CleanHomeScreen({super.key});

  @override
  State<CleanHomeScreen> createState() => _CleanHomeScreenState();
}

class _CleanHomeScreenState extends State<CleanHomeScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CryptoProvider>().loadInitialData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      body: SafeArea(
        child: Column(
          children: [
            // En-tête simple
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Titre et profil
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Portfolio',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          Text(
                            'Welcome back',
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      CircleAvatar(
                        radius: 20,
                        backgroundColor: Colors.grey[800],
                        child: const Icon(
                          Icons.person,
                          color: Colors.white,
                          size: 20,
                        ),
                      ),
                    ],
                  ),
                  
                  const SizedBox(height: 30),
                  
                  // Balance principale
                  Consumer<CryptoProvider>(
                    builder: (context, provider, child) {
                      final totalValue = provider.cryptos.isNotEmpty 
                          ? provider.cryptos.take(5).fold(0.0, (sum, crypto) => sum + crypto.currentPrice)
                          : 8559.00;
                      
                      return Column(
                        children: [
                          Text(
                            Formatters.formatCurrency(totalValue),
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 36,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Text(
                            '+2.51% today',
                            style: TextStyle(
                              color: Colors.green,
                              fontSize: 16,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      );
                    },
                  ),
                  
                  const SizedBox(height: 30),
                  
                  // Boutons d'action
                  Row(
                    children: [
                      Expanded(
                        child: _buildActionButton(
                          'Buy',
                          Colors.blue,
                          Icons.add,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionButton(
                          'Sell',
                          Colors.red,
                          Icons.remove,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildActionButton(
                          'Send',
                          Colors.grey[700]!,
                          Icons.send,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Navigation par onglets
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  _buildTab('Assets', true),
                  _buildTab('NFTs', false),
                  _buildTab('DeFi', false),
                  const Spacer(),
                  Icon(
                    Icons.search,
                    color: Colors.grey[600],
                    size: 20,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Liste des cryptos
            Expanded(
              child: Consumer<CryptoProvider>(
                builder: (context, provider, child) {
                  if (provider.isLoading && provider.cryptos.isEmpty) {
                    return const Center(
                      child: CircularProgressIndicator(
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                      ),
                    );
                  }

                  if (provider.error.isNotEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 48,
                            color: Colors.grey[600],
                          ),
                          const SizedBox(height: 16),
                          Text(
                            'Error loading data',
                            style: TextStyle(
                              color: Colors.grey[400],
                              fontSize: 16,
                            ),
                          ),
                          const SizedBox(height: 16),
                          ElevatedButton(
                            onPressed: () => provider.fetchTopCryptos(),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.blue,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                            child: const Text('Retry'),
                          ),
                        ],
                      ),
                    );
                  }

                  final cryptosToShow = provider.filteredCryptos.isEmpty 
                      ? provider.cryptos 
                      : provider.filteredCryptos;

                  return RefreshIndicator(
                    onRefresh: () => provider.fetchTopCryptos(),
                    color: Colors.blue,
                    child: ListView.builder(
                      padding: const EdgeInsets.only(bottom: 20),
                      itemCount: cryptosToShow.length,
                      itemBuilder: (context, index) {
                        return CleanCryptoCard(
                          crypto: cryptosToShow[index],
                        );
                      },
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

  Widget _buildActionButton(String text, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 16),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon,
            color: Colors.white,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTab(String text, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(right: 24),
      padding: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        border: isActive
            ? const Border(
                bottom: BorderSide(
                  color: Colors.blue,
                  width: 2,
                ),
              )
            : null,
      ),
      child: Text(
        text,
        style: TextStyle(
          color: isActive ? Colors.white : Colors.grey[600],
          fontSize: 16,
          fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
    );
  }
}
