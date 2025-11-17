import React, { useState } from "react";
import { View, ScrollView, Text } from "react-native";
import { Card } from "@/components/ui";
import { Reward } from "./types";

// Hooks
import {
  useRewardCategories,
  useRewardsFiltering,
  useUserBalance,
} from "./hooks";

// Components
import { CategoryFilter, RewardsGrid } from "./components";

// Styles
import { containerStyles } from "./styles";
import { ThemedHeader } from "src/components/shared/headers/Header";
import { BeCoinsBalance } from "@components/shared";
import { useCustomNavigation, useNotify } from "src/hooks";

export const RewardsScreen = () => {
  // Hooks personalizados
  const { selectedCategory, selectCategory } = useRewardCategories();
  const { filteredRewards } = useRewardsFiltering(selectedCategory);
  const { userBalance, canAffordReward, spendCoins, formatBalance } =
    useUserBalance();
  const notify = useNotify();
  const { navigate } = useCustomNavigation();
  // Estado para manejar la confirmación del canje
  const [pendingReward, setPendingReward] = useState<Reward | null>(null);

  // Función para manejar el canje de recompensas
  const handleClaimReward = (reward: Reward) => {
    if (!reward.available) {
      notify.error({ message: "Esta recompensa ya ha sido canjeada." });
      return;
    }

    if (!canAffordReward(reward)) {
      notify.confirm({
        message: `Necesitas ${reward.cost} BeCoins para canjear esta recompensa. Tu saldo actual es ${userBalance} BeCoins. Quieres recargar?`,
        onConfirm: () => navigate("RechargeScreen"),
        onCancel: cancelRewardClaim,
      });
      return;
    }

    // Mostrar confirmación personalizada
    setPendingReward(reward);
  };

  // Función para confirmar el canje después del alert
  const confirmRewardClaim = () => {
    if (!pendingReward) return;

    const success = spendCoins(
      pendingReward.cost,
      pendingReward.title,
      pendingReward.id.toString()
    );

    if (success) {
      // Obtener el balance actualizado después del gasto
      const newBalance = userBalance - pendingReward.cost;
      notify.success({
        message: `Has canjeado "${pendingReward.title}". Tu nuevo saldo es ${newBalance} BeCoins.`,
      });
    } else {
      notify.error({
        message: "No tienes suficientes BeCoins para canjear esta recompensa.",
      });
    }

    // Limpiar estado
    setPendingReward(null);
  };

  const cancelRewardClaim = () => {
    setPendingReward(null);
  };

  const getSectionTitle = () => {
    return selectedCategory === "Todos"
      ? "Todas las recompensas"
      : selectedCategory;
  };

  return (
    <View style={containerStyles.container}>
      <ThemedHeader
        title="Premios"
        canGoBack
        buttons={<BeCoinsBalance size="medium" variant="header" />}
      />

      <ScrollView
        style={containerStyles.scrollView}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        {/* Filtro de categorías */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={selectCategory}
        />

        {/* Banner destacado */}
        <View style={containerStyles.featuredSection}>
          <Card style={containerStyles.featuredCard}>
            <View style={containerStyles.featuredContent}>
              <View style={containerStyles.featuredText}>
                <Text style={containerStyles.featuredTitle}>
                  ¡Ofertas especiales!
                </Text>
                <Text style={containerStyles.featuredSubtitle}>
                  Descuentos exclusivos por reciclar
                </Text>
              </View>
              <View style={containerStyles.featuredBadge}>
                <Text style={containerStyles.featuredBadgeText}>NUEVO</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Grilla de recompensas */}
        <RewardsGrid
          rewards={filteredRewards}
          canAffordReward={canAffordReward}
          onClaimReward={handleClaimReward}
          sectionTitle={getSectionTitle()}
        />

        <View style={containerStyles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};
