"use client";

import Link from "next/link";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import {
  getAttributeColorSchemeOption,
  getAttributeVisual,
} from "@/components/attribute-visuals";
import { Button } from "@/components/ui/button";
import type { LevelProgress } from "@/lib/game/leveling";
import type { AttributeProgress } from "@/lib/indexed-db/types";
import { ATTRIBUTE_KEYS, isCoreAttributeKey } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import { useI18n } from "@/lib/i18n";

type AttributeWithLevel = AttributeProgress & { level: LevelProgress };

export default function AttributesPage() {
  const { error, isLoading, snapshot } = useGameSnapshot();
  const { formatNumber, t } = useI18n();

  if (isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            className="h-28 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70"
            key={index}
          />
        ))}
      </main>
    );
  }

  if (error || !snapshot) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-3 px-3 py-4">
        <Header />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          {t("error.loadAttributes", { message: error?.message ?? "" })}
        </section>
      </main>
    );
  }

  const attributes = buildAttributeList(snapshot.attributes);
  const customAttributeCount = attributes.filter(isEditableCustomAttribute).length;

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <Header />

      <section className="rounded-2xl border border-[#2f8cff]/45 bg-[#07111f]/82 p-4 shadow-[0_0_26px_rgba(47,140,255,0.16),inset_0_1px_18px_rgba(99,148,216,0.08)]">
        <p className="text-sm text-slate-400">{t("attribute.overallXp")}</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold leading-none text-white">
            {formatNumber(snapshot.progress.overallXp)}
          </p>
          <p className="text-sm font-medium text-[#4f8cff]">
            {t("level.value", { level: formatNumber(snapshot.overallLevel.level) })}
          </p>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-medium text-white">{t("attribute.all")}</h2>
            <p className="text-xs text-slate-500">
              {t("attribute.customSummary", {
                custom: formatNumber(customAttributeCount),
                total: formatNumber(attributes.length),
              })}
            </p>
          </div>
        </div>
        {attributes.map((attribute) => (
          <AttributeRow attribute={attribute} key={attribute.key} />
        ))}
      </section>
    </main>
  );
}

function Header() {
  const { t } = useI18n();

  return (
    <header className="flex items-center gap-3 pt-2">
      <Button
        asChild
        className="size-11 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
        size="icon"
        variant="ghost"
      >
        <Link aria-label={t("action.backHome")} href="/">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#3d87ff]">{t("common.progress")}</p>
        <div className="flex items-center gap-2">
          <h1 className="truncate text-3xl font-semibold leading-none tracking-[-0.03em] text-white">
            {t("common.attributes")}
          </h1>
          <Button
            asChild
            className="size-9 shrink-0 rounded-xl border border-[#2f8cff]/70 bg-[#0d4fe0] text-white shadow-[0_0_18px_rgba(47,140,255,0.35)] hover:bg-[#155df0]"
            size="icon"
          >
            <Link aria-label={t("action.createAttribute")} href="/attributes/create">
              <Plus className="size-5" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function AttributeRow({ attribute }: { attribute: AttributeWithLevel }) {
  const { formatNumber, t } = useI18n();
  const visual = getAttributeVisual(attribute);
  const colorScheme = getAttributeColorSchemeOption(visual.color);
  const Icon = visual.icon;
  const isLegendary = attribute.level.level >= 100;
  const isEditable = isEditableCustomAttribute(attribute);

  return (
    <article className="grid grid-cols-[3.75rem_minmax(0,1fr)] items-center gap-3 rounded-xl border border-slate-700/55 bg-[#07111f]/82 p-3 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
      <div
        className={cn(
          "flex size-14 items-center justify-center border",
          colorScheme.badge,
        )}
        style={{
          clipPath:
            "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
        }}
      >
        <Icon className={cn("size-7 stroke-[2.3]", colorScheme.icon)} />
      </div>

      <div className="min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-medium leading-none text-white">
              {getAttributeLabel(attribute, t)}
            </h2>
            {isEditable && (
              <p className="mt-1 text-xs font-medium text-[#4f8cff]">
                {t("attribute.custom")}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-sm text-slate-300">
              {t("level.shortValue", { level: formatNumber(attribute.level.level) })}
            </span>
            {isEditable && (
              <Button
                asChild
                className="size-8 rounded-xl border border-slate-700/70 bg-transparent text-slate-400 hover:border-[#3d87ff]/70 hover:bg-blue-950/20 hover:text-blue-200"
                size="icon"
                type="button"
                variant="ghost"
              >
                <Link
                  aria-label={t("attribute.editLabel", {
                    label: getAttributeLabel(attribute, t),
                  })}
                  href={`/attributes/${attribute.id}/edit`}
                >
                  <Pencil className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/85 shadow-[inset_0_1px_5px_rgba(0,0,0,0.55)]">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r",
              colorScheme.progress,
            )}
            style={{ width: `${attribute.level.progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 text-sm text-slate-400">
          <p className="truncate">
            {isLegendary
              ? t("level.totalXp", {
                  xp: formatNumber(attribute.level.totalXp),
                })
              : `${formatNumber(attribute.level.xpIntoLevel)} / ${formatNumber(
                  attribute.level.xpForNextLevel,
                )} ${t("common.xp")}`}
          </p>
          <p className="shrink-0 text-slate-500">
            {t("attribute.totalValue", { total: formatNumber(attribute.xp) })}
          </p>
        </div>
      </div>
    </article>
  );
}

function buildAttributeList(attributes: AttributeWithLevel[]) {
  const attributesByKey = new Map(
    attributes.map((attribute) => [attribute.key, attribute]),
  );
  const coreAttributes = ATTRIBUTE_KEYS.map((key) => attributesByKey.get(key)).filter(
    Boolean,
  ) as AttributeWithLevel[];
  const customAttributes = attributes
    .filter((attribute) => !isCoreAttributeKey(attribute.key))
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt));

  return [...coreAttributes, ...customAttributes];
}

function isEditableCustomAttribute(attribute: AttributeProgress) {
  return !attribute.isDefault && !isCoreAttributeKey(attribute.key);
}

function getAttributeLabel(
  attribute: AttributeProgress,
  t: (key: string) => string,
) {
  return attribute.isDefault && isCoreAttributeKey(attribute.key)
    ? t(`attribute.${attribute.key}`)
    : attribute.label;
}
