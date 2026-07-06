import { db } from "@/lib/indexed-db/database";
import type {
  CreateEntity,
  RewardPurchase,
  StoreReward,
} from "@/lib/indexed-db/types";
import { isOffDay, toAppDate } from "./date";
import { gameService } from "./game-service";

const MAIN_PROGRESS_ID = "progress-main";
const createId = () => crypto.randomUUID();
const now = () => new Date().toISOString();

function defaultCurrencyForKind(kind: StoreReward["kind"]) {
  return kind === "physical" ? "coins" : "gems";
}

export const rewardService = {
  async list() {
    await gameService.initialize();
    return db.rewards
      .filter((reward) => !reward.isArchived)
      .reverse()
      .sortBy("updatedAt");
  },

  async createCustomReward(
    input: Omit<
      CreateEntity<StoreReward>,
      "isDefault" | "isArchived" | "currency"
    > & {
      currency?: StoreReward["currency"];
    },
  ): Promise<StoreReward> {
    const timestamp = now();
    const reward: StoreReward = {
      ...input,
      id: input.id ?? createId(),
      currency: input.currency ?? defaultCurrencyForKind(input.kind),
      isDefault: false,
      isArchived: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.rewards.add(reward);
    return reward;
  },

  async purchase(rewardId: string): Promise<RewardPurchase> {
    await gameService.initialize();
    const reward = await db.rewards.get(rewardId);
    const progress = await db.userProgress.get(MAIN_PROGRESS_ID);

    if (!reward || reward.isArchived) {
      throw new Error(`Reward is not available: ${rewardId}`);
    }

    if (!progress) {
      throw new Error("User progress is not initialized.");
    }

    if (!isOffDay(toAppDate(), progress.weeklyOffDay)) {
      throw new Error("The Store only opens on your weekly free day.");
    }

    const currentBalance =
      reward.currency === "coins" ? progress.coins : progress.gems;

    if (currentBalance < reward.cost) {
      throw new Error(`Not enough ${reward.currency} to buy ${reward.title}.`);
    }

    const timestamp = now();
    const purchase: RewardPurchase = {
      id: createId(),
      rewardId: reward.id,
      title: reward.title,
      cost: reward.cost,
      currency: reward.currency,
      purchasedAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await db.rewardPurchases.add(purchase);
    await db.userProgress.update(progress.id, {
      [reward.currency]: currentBalance - reward.cost,
      updatedAt: timestamp,
    });
    await db.walletTransactions.add({
      id: createId(),
      currency: reward.currency,
      amount: -reward.cost,
      reason: `Reward purchased: ${reward.title}`,
      sourceType: "reward-purchase",
      sourceId: purchase.id,
      occurredAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    await db.activityEvents.add({
      id: createId(),
      type: "reward-purchased",
      title: "Reward Purchased",
      description: reward.title,
      occurredAt: timestamp,
      coinDelta: reward.currency === "coins" ? -reward.cost : undefined,
      gemDelta: reward.currency === "gems" ? -reward.cost : undefined,
      metadata: { rewardId: reward.id },
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return purchase;
  },

  async archive(rewardId: string) {
    await db.rewards.update(rewardId, {
      isArchived: true,
      updatedAt: now(),
    });
  },

  async redeemPurchase(purchaseId: string) {
    await gameService.initialize();
    const purchase = await db.rewardPurchases.get(purchaseId);

    if (!purchase) {
      throw new Error(`Reward purchase was not found: ${purchaseId}`);
    }

    if (purchase.redeemedAt) {
      throw new Error(`${purchase.title} has already been used.`);
    }

    const timestamp = now();

    await db.rewardPurchases.update(purchase.id, {
      redeemedAt: timestamp,
      updatedAt: timestamp,
    });
    await db.activityEvents.add({
      id: createId(),
      type: "reward-redeemed",
      title: "Reward Redeemed",
      description: purchase.title,
      occurredAt: timestamp,
      metadata: { purchaseId: purchase.id, rewardId: purchase.rewardId },
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  },

};
