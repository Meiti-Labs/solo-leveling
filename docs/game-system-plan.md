# Game System Plan

## Core Loop

The app is a year-long solo progression game. Users complete daily tasks,
one-time goals, and boss quests to earn XP, coins, and gems.

- Daily tasks reset every day and build streaks.
- Goals are one-time tasks that complete once.
- Boss quests are high-impact one-time tasks and may have deadlines.
- Missing a required daily task breaks the streak and applies XP loss.
- Missing a boss deadline applies a larger XP penalty.
- Weekly off-day defaults to Friday: missing tasks does not break streaks or
  cost XP, while completed progress earns a 2x multiplier.

## XP And Levels

Overall XP and attribute XP are tracked separately.

- Overall level uses total XP from all completed work.
- Attribute levels use XP distributed by task attribute weights.
- Early levels are quick; later levels require progressively more XP.
- The curve is tuned so a strong year with consistent dailies, no XP loss, and
  around 20 boss completions can reach Level 100.

The formulas live in `lib/game/leveling.ts`.

## Currencies

Coins and gems are consumable.

- Gems buy non-physical rewards, such as movie nights or cheat meals.
- Coins buy real-world rewards, such as shoes, phone upgrades, or gym gear.
- Rewards can be defaults or user-created custom rewards.
- Wallet transactions are recorded for earning and spending.

## IndexedDB Tables

The local database lives in `lib/indexed-db/database.ts`.

- `profiles`: Telegram/local profile identity.
- `userProgress`: overall XP, wallet, streaks, off-day, loss tracking.
- `attributeProgress`: XP by attribute.
- `tasks`: daily tasks, goals, and boss quest definitions.
- `taskCompletions`: completion history.
- `rewards`: default and custom store rewards.
- `rewardPurchases`: purchases from the store.
- `walletTransactions`: currency ledger.
- `achievementDefinitions`: achievement rules.
- `achievementUnlocks`: unlocked achievements.
- `activityEvents`: recent activity and analytics source data.
- `settings`: flexible app settings.

## Services

- `gameService`: initialization, task completion, XP distribution, penalties,
  boss deadline checks, achievement evaluation, snapshots.
- `rewardService`: custom reward creation, reward purchasing, reward archiving.
- `analyticsService`: progress summaries for charts and stats.
- `questService`: low-level task CRUD compatibility wrapper.

## Implemented Client Flows

- Home, quests, store, analytics, and hall-of-fame screens read from the
  service-backed snapshot hook.
- Quest creation supports task kind, attributes, rewards, deadline, streak
  bonuses, and penalty controls.
- Store rewards can be created, purchased, and redeemed from inventory.
- Settings include weekly off-day, local notification preferences, export, and
  reset controls.
- App startup applies missed daily-task and boss-deadline penalties.

## Next Implementation Steps

1. Add a real Telegram reminder bridge that reads local notification
   preferences when backend scheduling exists.
2. Add import/restore for exported JSON data.
3. Add reward archive/edit controls for user-created custom rewards.
