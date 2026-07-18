"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { ArrowLeft, Check, Plus, Save } from "lucide-react";
import {
  attributeColorSchemeOptions,
  attributeIconOptions,
  getAttributeColorSchemeOption,
  getAttributeIconOption,
} from "@/components/attribute-visuals";
import { Button } from "@/components/ui/button";
import { useGameSnapshot } from "@/hooks/use-game-snapshot";
import { gameService } from "@/lib/game";
import { useI18n } from "@/lib/i18n";
import type {
  AttributeColorScheme,
  AttributeIconKey,
  AttributeProgress,
} from "@/lib/indexed-db/types";
import { isCoreAttributeKey } from "@/lib/indexed-db/types";
import { cn } from "@/lib/utils";

type AttributeFormScreenProps = {
  attributeId?: string;
};

export default function AttributeFormScreen({
  attributeId,
}: AttributeFormScreenProps) {
  const { error: loadError, isLoading, snapshot } = useGameSnapshot();
  const { t } = useI18n();
  const isEditing = Boolean(attributeId);
  const attribute = isEditing
    ? snapshot?.attributes.find((candidate) => candidate.id === attributeId)
    : undefined;

  if (isEditing && isLoading) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <Header title={t("attribute.edit")} />
        <div className="h-72 animate-pulse rounded-2xl border border-slate-800/80 bg-[#07111f]/70" />
      </main>
    );
  }

  if (loadError || (isEditing && !attribute)) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <Header title={isEditing ? t("attribute.edit") : t("attribute.create")} />
        <section className="rounded-xl border border-rose-500/50 bg-rose-950/20 p-4 text-sm text-rose-100">
          {loadError?.message ?? t("error.attributeNotFound")}
        </section>
      </main>
    );
  }

  if (attribute && isLockedDefaultAttribute(attribute)) {
    return (
      <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
        <Header title={t("attribute.edit")} />
        <section className="rounded-xl border border-amber-500/50 bg-amber-950/20 p-4 text-sm text-amber-100">
          {t("error.attributeLocked")}
        </section>
      </main>
    );
  }

  return (
    <AttributeForm
      attribute={attribute}
      isEditing={isEditing}
      key={attribute?.id ?? "new-attribute"}
    />
  );
}

function AttributeForm({
  attribute,
  isEditing,
}: {
  attribute?: AttributeProgress;
  isEditing: boolean;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [title, setTitle] = useState(attribute?.label ?? "");
  const [colorScheme, setColorScheme] = useState<AttributeColorScheme>(
    getAttributeColorSchemeOption(attribute?.colorScheme).key,
  );
  const [icon, setIcon] = useState<AttributeIconKey>(
    getAttributeIconOption(attribute?.icon).key,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function submitAttribute(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const label = title.trim();

    if (!label) {
      setError(t("error.attributeTitleRequired"));
      return;
    }

    try {
      setIsSaving(true);

      if (attribute) {
        await gameService.updateAttribute(attribute.id, {
          colorScheme,
          icon,
          label,
        });
      } else {
        await gameService.createAttribute({
          colorScheme,
          icon,
          label,
        });
      }

      router.push("/attributes");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : t("error.saveAttribute"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  const selectedIcon = getAttributeIconOption(icon);
  const selectedScheme = getAttributeColorSchemeOption(colorScheme);
  const SelectedIcon = selectedIcon.icon;

  return (
    <main className="mx-auto min-h-[calc(100svh-8rem)] w-full max-w-md space-y-4 px-3 py-4">
      <Header title={isEditing ? t("attribute.edit") : t("attribute.create")} />

      <form className="space-y-4" onSubmit={submitAttribute}>
        <section className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <div
            className={cn(
              "flex size-14 items-center justify-center border",
              selectedScheme.badge,
            )}
            style={{
              clipPath:
                "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0 50%)",
            }}
          >
            <SelectedIcon
              className={cn("size-7 stroke-[2.3]", selectedScheme.icon)}
            />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
              {t("attribute.preview")}
            </p>
            <h2 className="truncate text-xl font-semibold text-white">
              {title.trim() || t("attribute.new")}
            </h2>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800/85">
              <div
                className={cn(
                  "h-full w-2/3 rounded-full bg-gradient-to-r",
                  selectedScheme.progress,
                )}
              />
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-700/55 bg-[#07111f]/82 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.28),inset_0_1px_18px_rgba(99,148,216,0.06)] backdrop-blur-xl">
          <LabeledField label={t("attribute.titleLabel")}>
            <input
              className={inputClassName}
              disabled={isSaving}
              maxLength={32}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t("attribute.titlePlaceholder")}
              value={title}
            />
          </LabeledField>
        </section>

        <section className="space-y-3">
          <SectionLabel>{t("attribute.colorScheme")}</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {attributeColorSchemeOptions.map((scheme) => {
              const isActive = colorScheme === scheme.key;

              return (
                <button
                  className={cn(
                    "flex h-12 items-center justify-between rounded-xl border border-slate-700/55 bg-[#07111f]/82 px-3 text-sm font-medium text-slate-300 transition hover:border-[#2f8cff]/60 hover:bg-[#0b1728]",
                    isActive && scheme.selected,
                  )}
                  disabled={isSaving}
                  key={scheme.key}
                  onClick={() => setColorScheme(scheme.key)}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-3 rounded-full bg-gradient-to-br",
                        scheme.progress,
                      )}
                    />
                    {t(`attribute.color.${scheme.key}`)}
                  </span>
                  {isActive && <Check className="size-4" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>{t("attribute.icon")}</SectionLabel>
          <div className="grid grid-cols-5 gap-2">
            {attributeIconOptions.map((option) => {
              const isActive = icon === option.key;
              const Icon = option.icon;

              return (
                <button
                  aria-label={t(`attribute.icon.${option.key}`)}
                  className={cn(
                    "flex size-13 items-center justify-center rounded-2xl border border-slate-700/55 bg-[#07111f]/82 text-slate-300 shadow-[inset_0_1px_18px_rgba(99,148,216,0.05)] transition hover:border-[#2f8cff]/60 hover:text-white",
                    isActive &&
                      "border-[#2f8cff]/85 bg-[#0d4fe0]/70 text-white shadow-[0_0_18px_rgba(47,140,255,0.32)]",
                  )}
                  disabled={isSaving}
                  key={option.key}
                  onClick={() => setIcon(option.key)}
                  title={t(`attribute.icon.${option.key}`)}
                  type="button"
                >
                  <Icon className="size-5" />
                </button>
              );
            })}
          </div>
        </section>

        {error && (
          <p className="rounded-xl border border-rose-500/50 bg-rose-950/25 px-3 py-2 text-sm text-rose-100">
            {error}
          </p>
        )}

        <Button
          className="h-12 w-full rounded-full border border-[#2f8cff]/80 bg-[#0d4fe0] text-base font-semibold text-white shadow-[0_0_22px_rgba(47,140,255,0.5),0_12px_26px_rgba(0,0,0,0.36),inset_0_1px_12px_rgba(255,255,255,0.14)] hover:bg-[#155df0]"
          disabled={isSaving}
          type="submit"
        >
          {isEditing ? <Save className="size-5" /> : <Plus className="size-5" />}
          {isSaving
            ? t("action.saving")
            : isEditing
              ? t("action.saveAttribute")
              : t("action.createAttribute")}
        </Button>
      </form>
    </main>
  );
}

function Header({ title }: { title: string }) {
  const { t } = useI18n();

  return (
    <header className="flex items-center justify-between gap-3 pt-2">
      <Button
        asChild
        className="size-11 rounded-2xl border border-slate-700/60 bg-[#07111f]/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35),inset_0_1px_18px_rgba(99,148,216,0.08)] hover:bg-[#0b1728]"
        size="icon"
        variant="ghost"
      >
        <Link aria-label={t("action.backAttributes")} href="/attributes">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#3d87ff]">{t("attribute.customAttribute")}</p>
        <h1 className="truncate text-2xl font-semibold leading-none tracking-[-0.03em] text-white">
          {title}
        </h1>
      </div>
    </header>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-slate-700/70 bg-[#030914]/80 px-3 text-base text-white outline-none transition placeholder:text-slate-600 focus:border-[#2f8cff]/80 focus:ring-2 focus:ring-[#2f8cff]/20 disabled:opacity-70";

function LabeledField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-semibold text-white">{children}</h2>;
}

function isLockedDefaultAttribute(attribute: AttributeProgress) {
  return attribute.isDefault || isCoreAttributeKey(attribute.key);
}
