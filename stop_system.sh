#!/bin/bash

echo "🛑 Arrêt du système Kafka/Spark pour l'app Flutter Crypto"

# Arrêter les processus Python
echo "📡 Arrêt du producteur Kafka..."
pkill -f kafka_crypto_producer
sleep 2

echo "🌐 Arrêt de l'API Gateway..."
pkill -f "python.*app.py"
sleep 2

# Arrêter Kafka et les containers Docker
echo "🔧 Arrêt de Kafka et Zookeeper..."
docker-compose -f docker/docker-compose.kafka.yml down

echo ""
echo "✅ Système arrêté avec succès !"
echo ""
echo "📝 Pour redémarrer le système:"
echo "bash start_system.sh"
echo ""
