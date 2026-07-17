# Solo Leveling Mini App Game System Guide

This document describes the current app, the local game logic, and practical
balancing rules for an AI assistant that helps the user create fair tasks,
goals, boss quests, XP rewards, penalties, and store rewards.

The app is a client-only Telegram mini app. All game data is stored locally in
IndexedDB. There is no backend source of truth yet.

## Product Fantasy

The app turns real life into a Solo Leveling style progression game.

The user completes daily quests, one-time goals, challenges, and boss quests.
Those actions grant:

- Overall XP, which raises the user's main level.
- Attribute XP, which raises individual stat levels.
- Coins, mainly for real-world or physical rewards.
- Gems, mainly for experiences, treats, and premium-feeling rewards.
- Achievements, medals, boss trophies, titles, notifications, and activity.

The design goal is not to make every tiny action feel huge. The game should
reward consistency. A strong day should feel good, but a single normal task
should not carry the user through many levels.

## Current Pages And Flows

- Home: profile header, overall level progress, core attributes, today's
  overview, and recent activity.
- Quests: tabbed quest list for Daily, Goals, Bosses, Challenges, Completed.
  Users can complete or archive/delete quests. Completed quests may trigger
  level-up, achievement, badge, or boss defeated modals.
- Quest creation: supports task type, title, description, attributes, XP,
  coins, gems, difficulty, XP loss, streak bonus, and deadline.
- Attributes: shows all attributes. Core attributes are fixed. Custom
  attributes can be created and edited with title, icon, and color scheme.
- Store: rewards are visible but purchases are allowed only on the weekly free
  day. Reward detail is a full-screen flow with affordability progress.
- Inventory: purchased rewards can be marked as used.
- Analytics: XP growth chart, attribute radar, stats cards, and a level
  roadmap page that projects levels 1 through 200.
- Hall of Fame: achievements, recent unlocks, medals, and legacy timeline.
- Notifications: saved local notifications for level-ups, achievements,
  badges, and boss defeats.
- Activity: event history.
- Settings: weekly free day, notification preferences, export local data, and
  reset local data.

## Data Storage

IndexedDB database name: `solo-leveling-mini`.

Main tables:

- `profiles`: Telegram or local profile identity.
- `userProgress`: overall XP, coins, gems, streaks, weekly off-day, XP loss.
- `attributeProgress`: core and custom attributes, XP, icon, color scheme.
- `tasks`: daily tasks, goals, challenges, and boss quests.
- `taskCompletions`: completion history.
- `rewards`: default and custom store rewards.
- `rewardPurchases`: purchased inventory items.
- `walletTransactions`: currency ledger.
- `achievementDefinitions`: achievement rules.
- `achievementUnlocks`: unlocked achievements.
- `activityEvents`: recent activity and analytics source events.
- `notifications`: local notification inbox.
- `settings`: flexible app settings.

Important services:

- `gameService`: initialization, snapshots, task completion, XP distribution,
  streak logic, penalties, boss deadlines, achievements, attributes.
- `rewardService`: reward creation, purchase, archive, and mark-used.
- `analyticsService`: analytics summaries.
- `questService`: low-level task CRUD compatibility wrapper.

## Task Types

### Daily Tasks

Daily tasks are repeatable once per day. They are the backbone of the game.

Use daily tasks for repeatable habits:

- Workout
- Reading
- No sugar
- Save money
- Drink water
- Meditation
- Study block

Daily XP must stay modest because it can be earned every day. A full set of
default daily tasks currently grants about 160 XP per normal day before streak
or off-day bonuses.

### Goals

Goals are one-time tasks. They complete once and then leave the active list.

Use goals for finite outcomes:

- Finish a course module
- Save $100
- Clean one room
- Submit a portfolio piece
- Complete a project milestone

Goals can pay more than dailies because they are not repeatable.

### Challenges

Challenges are hard one-time goals. In the current UI, they are goals with
`difficulty: "hard"`.

Use challenges for multi-day or high-friction tasks that are not quite a boss:

- 7 day no sugar challenge
- Deep-clean apartment
- Finish a difficult chapter
- Apply to 10 jobs

### Boss Quests

Boss quests are high-impact one-time tasks. They can have deadlines and larger
penalties. They are for meaningful enemy-style obstacles, not routine tasks.

Use boss quests for:

- Defeat procrastination around a major deadline
- Finish a scary project
- Have an important conversation
- Complete a monthly transformation target
- Solve a recurring personal blocker

The default boss quest is "Inner Procrastination" with 650 XP, 120 coins, 3
gems, and 250 missed penalty XP.

## Attributes

Overall XP and attribute XP are separate.

Core attributes:

- Strength
- Intelligence
- Discipline
- Finance
- Wisdom
- Communication

Users can also create custom attributes. Custom attributes have:

- Title
- Icon
- Color scheme
- XP and level

Tasks can assign one or more attributes with weights. When a task is completed,
earned XP is split across its attributes by weight.

Example:

- Task earns 100 XP.
- Strength weight 0.75.
- Discipline weight 0.25.
- Strength receives 75 attribute XP.
- Discipline receives 25 attribute XP.
- Overall XP still receives the full 100 XP.

Guidance for AI agents:

- Use one primary attribute for simple tasks.
- Use two attributes for mixed tasks.
- Use three attributes only for large or complex quests.
- Keep weights simple: `1`, `0.75/0.25`, `0.6/0.4`, or `0.5/0.3/0.2`.

## Level System

The main level and attribute levels use the same curve.

Source: `lib/game/leveling.ts`

Formula:

```ts
xpRequiredForNextLevel(level) = round(240 + 1.6 * level ** 1.45)
```

Total XP for a level is the sum of all previous next-level requirements.

Important behavior:

- The normal level display caps at Level 100.
- The analytics roadmap projects levels 1 through 200 for long-term planning.
- Early levels are intentionally quick.
- Later levels are much slower.

Key thresholds:

| Level | Total XP Needed | XP For Next Level |
| --- | ---: | ---: |
| 2 | 242 | 244 |
| 3 | 486 | 248 |
| 5 | 986 | 257 |
| 10 | 2,324 | 285 |
| 25 | 7,413 | 410 |
| 50 | 21,021 | 705 |
| 75 | 42,976 | 1,077 |
| 100 | 74,997 | 1,511 |
| 150 | 174,696 | 2,528 |
| 200 | 329,470 | 3,687 |

Rank labels:

| Level | Title | Rank |
| ---: | --- | --- |
| 1-9 | New Hunter | E-Rank Awakener |
| 10-24 | The Rising One | C-Rank Awakener |
| 25-49 | The Disciplined One | B-Rank Awakener |
| 50-74 | The Awakened One | A-Rank Awakener |
| 75-99 | The Relentless One | S-Rank Awakener |
| 100+ | The Legendary One | Legendary Awakener |

Important balancing note:

Because Level 2 starts at 242 XP and Level 3 starts at 486 XP, a single 650 XP
boss quest will jump a brand-new user to Level 3. That is acceptable only for a
true boss moment. Do not assign boss-level XP to normal daily tasks or small
goals.

## Streaks And Off-Day

The current weekly off-day defaults to Friday (`weeklyOffDay: 5`).

Daily streak rules:

- A day is secured only when all active daily tasks are completed.
- Missing required dailies on a normal day breaks the streak and applies XP
  loss.
- The streak card shows exactly which daily quests remain today.
- Daily tasks can define a streak bonus, usually every 7 days.

Off-day rules:

- Missing dailies on the weekly off-day does not break the streak.
- Completing quests on the weekly off-day earns a 2x multiplier.
- The 2x multiplier applies to XP, coins, and gems.
- The store opens only on the weekly off-day.

AI guidance:

- Do not make the off-day the primary way to progress. It is a bonus day.
- Warn that a high reward on the off-day doubles.
- If suggesting a weekly plan, keep normal daily XP reasonable because the
  off-day can inflate weekly earnings.

## Penalties

Daily missed penalties:

- Each daily task has `missedPenaltyXp`.
- When yesterday had missed dailies and was not an off-day, penalties are
  applied and current streak resets to 0.

Boss deadline penalties:

- Boss quests with expired deadlines and no completion become failed.
- Their `missedPenaltyXp` is subtracted from overall XP.

Penalty guidance:

- Daily penalty should usually be 25% to 40% of the task XP.
- Easy daily: 8 to 15 missed XP.
- Medium daily: 12 to 25 missed XP.
- Hard daily: 20 to 40 missed XP.
- Goal penalty: optional, often 20% to 35%.
- Boss penalty: 35% to 50% of XP, sometimes more for serious deadlines.
- Never make penalties so high that the user avoids creating tasks.

## Default Game Balance

Default dailies:

| Task | Kind | XP | Coins | Gems | Penalty | Streak Bonus |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Morning Workout | daily | 40 | 8 | 0 | 15 | 25 every 7 days |
| Read 20 Pages | daily | 45 | 0 | 1 | 15 | 25 every 7 days |
| No Sugar Day | daily | 40 | 6 | 0 | 15 | 25 every 7 days |
| Save $20 | daily | 35 | 12 | 0 | 12 | 20 every 7 days |

Default boss:

| Task | Kind | XP | Coins | Gems | Penalty |
| --- | --- | ---: | ---: | ---: | ---: |
| Inner Procrastination | boss | 650 | 120 | 3 | 250 |

Baseline target:

- Four default dailies grant 160 XP per normal day.
- Completing the default dailies consistently for a year, using the off-day,
  avoiding XP loss, and completing around 20 boss quests is intended to be near
  Level 100.
- Level 100 requires about 74,997 total XP.

This means routine daily progression should be steady, not explosive.

## XP Calibration Guide For AI Agents

When creating a task, first classify it by frequency and weight:

1. Is it repeatable daily? Keep XP low.
2. Is it one-time but small? Use goal XP.
3. Is it a hard one-time challenge? Use challenge XP.
4. Is it emotionally or strategically major? Use boss XP.
5. Does it have a deadline and real consequence? Add penalty.
6. Does it improve money or represent savings? Add coins, not too much XP.
7. Does it unlock a treat or experience? Add gems sparingly.

Recommended XP ranges:

| Work Type | Suggested XP | Notes |
| --- | ---: | --- |
| Tiny habit, 2-5 min | 10-20 | Avoid making trivial tasks farmable. |
| Easy daily, 5-15 min | 25-40 | Hydration, stretch, quick tidy. |
| Medium daily, 20-45 min | 40-65 | Workout, reading, study block. |
| Hard daily, 45-90 min | 65-100 | Deep work, serious training. |
| Small goal | 60-120 | One clear finite outcome. |
| Normal goal | 120-240 | 1-3 hours or meaningful milestone. |
| Hard goal/challenge | 240-400 | Multi-day or high resistance. |
| Major challenge | 400-600 | Rare, meaningful, not routine. |
| Boss quest | 500-900 | Serious blocker or milestone. |
| Epic boss | 900-1,400 | Monthly/quarterly transformation. |
| Legendary boss | 1,400+ | Very rare. Could jump levels early. |

Early-level caution:

- 250 XP can produce a level-up for a new user.
- 500 XP can push a new user to Level 3.
- 1,000 XP can push a new user to about Level 5.
- Avoid 1,000+ XP unless the quest is truly exceptional.

Daily cap guidance:

- A normal daily task should almost never exceed 100 XP.
- A normal day of routine dailies should usually land around 100-220 XP.
- A very strong day with several serious tasks can land around 250-450 XP.
- A day with a boss quest can be higher, but that should feel like an event.

## Difficulty Guidelines

Use these labels in quest creation:

- `easy`: low resistance, short time, low consequence.
- `medium`: normal effort, useful but manageable.
- `hard`: high resistance, time-consuming, or important.
- `boss`: major one-time enemy-style task.

Examples:

| Example | Type | Difficulty | Fair XP | Notes |
| --- | --- | --- | ---: | --- |
| Drink 3L water | daily | easy | 20-30 | No gems, no coins. |
| 10 min walk | daily | easy | 25-35 | Strength or Wisdom. |
| Morning workout | daily | easy/medium | 40-60 | Default is 40. |
| Read 20 pages | daily | medium | 40-55 | Default is 45 and 1 gem. |
| 90 min deep work | daily | hard | 70-100 | Avoid if too easy to repeat. |
| Save $20 | daily | easy | 25-40 | Prefer coins over high XP. |
| Save $100 | goal | medium | 150-240 | Finance, coins 40-80. |
| Finish course module | goal | medium | 160-260 | Intelligence. |
| Build a feature | goal | hard | 240-450 | Intelligence/Discipline. |
| 7 day no sugar | challenge | hard | 250-400 | Discipline, penalty 80-140. |
| Finish big project | boss | boss | 650-1,100 | Add deadline and penalty. |
| Defeat procrastination | boss | boss | 500-800 | Default boss is 650. |

## Currency Calibration

Coins:

- Use for physical or real-world rewards.
- Use more coins for finance, saving, work, and real-world effort.
- Do not make coins too generous or physical rewards become too easy.

Gems:

- Use for treats, experiences, digital rewards, and premium-feeling rewards.
- Gems should be rarer than coins.
- Most daily tasks should grant 0 gems.
- A meaningful medium daily may grant 1 gem.
- Bosses usually grant 2 to 5 gems.

Suggested earning ranges:

| Task Type | Coins | Gems |
| --- | ---: | ---: |
| Easy daily | 0-10 | 0 |
| Medium daily | 0-15 | 0-1 |
| Hard daily | 5-25 | 0-1 |
| Small goal | 10-40 | 0-1 |
| Normal goal | 25-100 | 0-2 |
| Hard challenge | 45-150 | 1-3 |
| Boss quest | 100-250 | 2-5 |
| Epic boss | 250-500 | 5-10 |

Default rewards:

| Reward | Currency | Cost |
| --- | --- | ---: |
| Movie Night | gems | 18 |
| Cheat Meal | gems | 14 |
| New Shoes | coins | 2,400 |
| Gym Gear | coins | 3,200 |

Reward cost guidance:

- Small treat: 8-18 gems.
- Medium experience: 18-35 gems.
- Bigger day trip or premium treat: 35-75 gems.
- Small physical purchase: 800-1,500 coins.
- Medium physical reward: 1,500-3,500 coins.
- Large physical reward: 3,500-8,000+ coins.

Remember: the store only opens on the weekly free day.

## Streak Bonus Calibration

Default dailies use a 7 day streak bonus of about 20-25 XP.

Guidance:

- Use `streakBonusEvery: 7` for normal daily habits.
- Streak bonus should usually be 40% to 70% of one completion's XP.
- Keep daily streak bonuses small enough that missing one day matters but does
  not ruin the user's year.
- Do not give huge streak bonuses to very easy dailies.

Suggested streak bonuses:

| Daily XP | Weekly Streak Bonus |
| ---: | ---: |
| 20-30 | 10-15 |
| 35-45 | 20-25 |
| 50-70 | 25-40 |
| 80-100 | 40-60 |

## Achievement System

Current default achievements:

| Achievement | Requirement | Reward |
| --- | --- | --- |
| Awakened Hunter | Reach overall Level 25 | 250 coins, 3 gems |
| Unbroken Flame | Keep a 100 day streak | 1,000 coins, 10 gems |
| Boss Breaker | Complete 20 boss quests | 1,500 coins, 15 gems |
| Legendary Year | Reach Level 100 with no XP loss | 5,000 coins, 50 gems |

Achievements create activity events and notifications. They can also trigger
full-screen celebration modals after task completion.

## Notifications And Activity Events

Saved notification types:

- `level-up`
- `achievement`
- `badge`
- `boss`

Activity event types include:

- `task-completed`
- `daily-missed`
- `boss-failed`
- `reward-purchased`
- `reward-redeemed`
- `achievement-unlocked`
- `level-up`

These events drive recent activity, activity page, notifications, analytics,
and Hall of Fame timeline.

## Store Rules

The store is intentionally gated.

- The store is visible every day.
- Purchasing is allowed only on the weekly free day.
- The default weekly free day is Friday.
- If the user cannot afford an item, the purchase button is disabled.
- Inventory items can be marked as used.
- Physical rewards use coins by default.
- Experience, digital, and custom rewards use gems by default.

AI guidance:

- Do not suggest reward prices without considering earning rate.
- A reward should feel earned after repeated effort.
- Gems should buy indulgence; coins should buy real-world items.

## How To Recommend A New Quest

When an AI agent recommends a task, output these fields:

```ts
{
  title: string;
  description?: string;
  kind: "daily" | "goal" | "boss";
  difficulty: "easy" | "medium" | "hard" | "boss";
  attributes: Array<{ key: string; weight: number }>;
  xpReward: number;
  coinReward: number;
  gemReward: number;
  missedPenaltyXp: number;
  deadline?: "YYYY-MM-DD";
  streakBonusEvery?: number;
  streakBonusXp?: number;
  reasoning: string;
}
```

For a daily task:

- Include `streakBonusEvery` and `streakBonusXp`.
- Usually avoid deadline.
- Keep XP low because it repeats.

For a goal:

- No streak fields.
- Deadline is optional.
- XP can be moderate.

For a boss:

- `difficulty` should be `"boss"`.
- Deadline is recommended if the user has a real due date.
- Penalty should be meaningful.
- XP can be high, but only for major outcomes.

## Anti-Exploitation Rules

An AI helper should avoid:

- Giving large XP to tasks that take less than 5 minutes.
- Making many tiny daily tasks that can be farmed.
- Giving gems to every daily.
- Giving coins and gems and high XP all at once unless it is a boss.
- Giving high XP to goals that are actually just reminders.
- Rewarding the same effort twice across multiple tasks.
- Creating too many active dailies. More dailies make streaks fragile.
- Making penalties so harsh that the user stops using the app.

Better approach:

- Bundle tiny habits into one daily checklist-like quest.
- Split massive goals into milestones.
- Use boss quests for psychological blockers.
- Keep XP proportional to effort, resistance, impact, and frequency.

## Current Visual And Theming Notes

- The UI is dark, compact, blue-accented, and mobile-first.
- Bottom navigation has Home, Quests, Store, Analytics, Hall of Fame.
- Core attributes have fixed visual identities.
- Custom attributes support 40 icon options and 8 color schemes.
- Level badges use assets from `public/images/level-badge-containers`.
- Avatar tiers use assets from `public/images/avatars`.
- Store and boss cards use assets from `public/images/card-backgrounds`.
- Hall of Fame uses `public/images/hall-of-fame-banners` and
  `public/images/medals`.

## Design Intent For Future AI Guidance

The AI should help the user make a sustainable RPG plan, not maximize numbers.

The best recommendations:

- Are fair for the user's actual effort.
- Keep repeatable tasks modest.
- Make boss quests feel rare and meaningful.
- Use coins and gems intentionally.
- Explain why the reward is fair.
- Consider the user's current level, streak, and existing daily load.
- Keep the road to Level 100 hard but achievable over a strong year.
