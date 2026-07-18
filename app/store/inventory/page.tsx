"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Gem,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { rewardService } from "@/lib/game";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import type { Currency, RewardPurchase } from "@/lib/indexed-db/types";
import { translateGameText, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export default function StoreInventoryPage() {
  const { error, isLoading, refresh, snapshot } = useGameSnapshot();
  const { formatNumber, language, t } = useI18n();
  const [actionNotice, setActionNotice] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [busyPurchaseId, setBusyPurchaseId] = useState<string | null>(null);

  const purchases = useMemo(() => {
    if (!snapshot) {
      return [];
    }

    return [...snapshot.rewardPurchases].sort((first, second) =>
      second.purchasedAt.localeCompare(first.purchasedAt),
    );
  }, [snapshot]);

  const totals = useMemo(
    () =>
      purchases.reduce(
        (summary, purchase) => {
          summary[purchase.currency] += purchase.cost;
          return summary;
        },
        { coins: 0, gems: 0 } satisfies Record<Currency, number>,
      ),
    [purchases],
  );
  const readyPurchases = purchases.filter((purchase) => !purchase.redeemedAt);
  const redeemedPurchases = purchases.filter((purchase) => purchase.redeemedAt);

  async function redeemPurchase(purchase: RewardPurchase) {
    try {
      setActionNotice(null);
      setBusyPurchaseId(purchase.id);
      await rewardService.redeemPurchase(purchase.id);
      await refresh();
      setActionNotice({
        tone: "success",
        message: t("store.markedUsed", {
          title: translateGameText(purchase.title, language) ?? purchase.title,
        }),
      });
    } catch (caughtError) {
      setActionNotice({
        tone: "error",
        message:
          caughtError instanceof Error
            ? caughtError.message
            : t("error.useReward"),
      });
    } finally {
      setBusyPurchaseId(null);
    }
  }

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <header className="flex items-center justify-between gap-3 pt-1">
        <div className="flex min-w-0 items-center gap-2">
          <Button
            asChild
            className="size-10 shrink-0 rounded-xl border border-slate-700/60 bg-[#07111f]/80 text-white hover:bg-[#0b1728]"
            size="icon"
            variant="ghost"
          >
            <Link aria-label={t("action.backStore")} href="/store">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#5aa0ff]">
              {t("common.store")}
            </p>
            <h1 className="truncate text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
              {t("common.inventory")}
            </h1>
          </div>
        </div>
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#2f8cff]/45 bg-blue-950/25 text-[#5aa0ff] shadow-[0_0_22px_rgba(47,140,255,0.22)]">
          <Boxes className="size-6" />
        </div>
      </header>

      {error && (
        <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
          {t("error.loadInventory", { message: error.message })}
        </p>
      )}

      {actionNotice && (
        <p
          className={cn(
            "rounded-xl border px-3 py-2 text-sm",
            actionNotice.tone === "success"
              ? "border-[#2f8cff]/45 bg-blue-950/25 text-blue-100"
              : "border-rose-500/50 bg-rose-950/25 text-rose-100",
          )}
        >
          {actionNotice.message}
        </p>
      )}

      {isLoading ? (
        <InventorySkeleton />
      ) : (
        <>
          <section className="grid grid-cols-2 gap-2">
            <SummaryTile
              icon={<PackageCheck className="size-5" />}
              label={t("store.ready")}
              value={formatNumber(readyPurchases.length)}
            />
            <SummaryTile
              icon={<CheckCircle2 className="size-5" />}
              label={t("store.redeemed")}
              value={formatNumber(redeemedPurchases.length)}
            />
            <SummaryTile
              icon={<CurrencyIcon currency="coins" />}
              label={t("store.coinsSpent")}
              value={formatNumber(totals.coins)}
            />
            <SummaryTile
              icon={<CurrencyIcon currency="gems" />}
              label={t("store.gemsSpent")}
              value={formatNumber(totals.gems)}
            />
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-medium text-white">{t("store.readyToUse")}</h2>
              <span className="text-xs text-slate-400">
                {t("store.availableCount", {
                  count: formatNumber(readyPurchases.length),
                })}
              </span>
            </div>

            {purchases.length === 0 ? (
              <EmptyInventory />
            ) : readyPurchases.length === 0 ? (
              <p className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-4 text-sm text-slate-300">
                {t("store.allUsed")}
              </p>
            ) : (
              <div className="space-y-1.5">
                {readyPurchases.map((purchase) => (
                  <InventoryPurchaseRow
                    isBusy={busyPurchaseId === purchase.id}
                    key={purchase.id}
                    onRedeem={() => redeemPurchase(purchase)}
                    purchase={purchase}
                  />
                ))}
              </div>
            )}
          </section>

          {redeemedPurchases.length > 0 && (
            <section className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-white">{t("store.redeemed")}</h2>
                <span className="text-xs text-slate-400">
                  {t("store.usedCount", {
                    count: formatNumber(redeemedPurchases.length),
                  })}
                </span>
              </div>

              <div className="space-y-1.5">
                {redeemedPurchases.map((purchase) => (
                  <InventoryPurchaseRow
                    isBusy={false}
                    key={purchase.id}
                    purchase={purchase}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <div className="mb-2 flex size-9 items-center justify-center rounded-xl border border-[#2f8cff]/35 bg-blue-950/25 text-[#5aa0ff]">
        {icon}
      </div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="text-lg font-semibold leading-tight text-white">{value}</p>
    </article>
  );
}

function InventoryPurchaseRow({
  isBusy,
  onRedeem,
  purchase,
}: {
  isBusy: boolean;
  onRedeem?: () => void;
  purchase: RewardPurchase;
}) {
  const { formatDate, formatNumber, language, t } = useI18n();
  const isRedeemed = Boolean(purchase.redeemedAt);
  const timelineDate = purchase.redeemedAt ?? purchase.purchasedAt;
  const title = translateGameText(purchase.title, language) ?? purchase.title;
  const dateLabel = formatDate(timelineDate, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <article
      className={cn(
        "grid grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-2.5 shadow-[0_8px_22px_rgba(0,0,0,0.24),inset_0_1px_16px_rgba(99,148,216,0.05)] backdrop-blur-xl",
        isRedeemed && "border-slate-800/70 bg-[#07111f]/55 opacity-80",
      )}
    >
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-xl border",
          isRedeemed
            ? "border-emerald-500/35 bg-emerald-950/20 text-emerald-300"
            : "border-[#2f8cff]/35 bg-blue-950/25 text-[#5aa0ff]",
        )}
      >
        <Sparkles className="size-6" />
      </div>

      <div className="min-w-0 space-y-1">
        <h3 className="truncate text-base font-medium leading-tight text-white">
          {title}
        </h3>
        <p className="flex items-center gap-1 truncate text-xs text-slate-400">
          <CalendarDays className="size-3.5 shrink-0" />
          {isRedeemed
            ? t("store.usedDate", { date: dateLabel })
            : t("store.boughtDate", { date: dateLabel })}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5 text-base font-medium text-white">
          <CurrencyIcon currency={purchase.currency} />
          <span>{formatNumber(purchase.cost)}</span>
        </div>
        {isRedeemed ? (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-emerald-500/35 bg-emerald-950/20 px-2.5 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="size-3.5" />
            {t("store.used")}
          </span>
        ) : (
          <Button
            className="h-7 rounded-lg bg-[#0d4fe0] px-2.5 text-xs font-semibold text-white shadow-[0_0_14px_rgba(47,140,255,0.28)] hover:bg-[#155df0]"
            disabled={isBusy}
            onClick={onRedeem}
            type="button"
            variant="default"
          >
            {isBusy ? (
              <Sparkles className="mr-1.5 size-3.5 animate-pulse" />
            ) : (
              <CheckCircle2 className="mr-1.5 size-3.5" />
            )}
            {t("action.markUsed")}
          </Button>
        )}
      </div>
    </article>
  );
}

function EmptyInventory() {
  const { t } = useI18n();

  return (
    <article className="rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-5 text-center shadow-[0_8px_22px_rgba(0,0,0,0.22),inset_0_1px_16px_rgba(99,148,216,0.05)]">
      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-[#2f8cff]/35 bg-blue-950/25 text-[#5aa0ff]">
        <Boxes className="size-6" />
      </div>
      <h2 className="text-base font-semibold text-white">{t("store.inventoryEmpty")}</h2>
      <p className="mt-1 text-sm text-slate-400">
        {t("store.inventoryEmptyBody")}
      </p>
      <Button
        asChild
        className="mt-4 rounded-xl bg-[#0d4fe0] px-5 text-white shadow-[0_0_18px_rgba(47,140,255,0.35)] hover:bg-[#155df0]"
      >
        <Link href="/store">{t("action.browseRewards")}</Link>
      </Button>
    </article>
  );
}

function InventorySkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-24 animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
            key={index}
          />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          className="h-[4.75rem] animate-pulse rounded-xl border border-slate-800/80 bg-[#07111f]/70"
          key={index}
        />
      ))}
    </div>
  );
}

function CurrencyIcon({ currency }: { currency: Currency }) {
  return currency === "coins" ? <CoinIcon /> : <GemIcon />;
}

function CoinIcon() {
  return (
    <span className="flex size-4 items-center justify-center rounded-full bg-amber-400 text-[0.6rem] text-amber-950 shadow-[0_0_8px_rgba(251,191,36,0.55)]">
      <CircleDollarSign className="size-3" />
    </span>
  );
}

function GemIcon() {
  return (
    <span className="flex size-4 items-center justify-center rounded-sm bg-cyan-400 text-cyan-950 shadow-[0_0_8px_rgba(34,211,238,0.55)]">
      <Gem className="size-3" />
    </span>
  );
}

