import React from "react";
import {
  FaBolt,
  FaHammer,
  FaLayerGroup,
  FaPaintRoller,
  FaThLarge,
  FaWindowMaximize,
  FaWrench,
} from "react-icons/fa";
import { GiBrickWall } from "react-icons/gi";

const fallbackPresentation = {
  tiling: {
    name: "\u0627\u0644\u062a\u0628\u0644\u064a\u0637",
    description:
      "\u062a\u0628\u0644\u064a\u0637 \u0627\u0644\u0623\u0631\u0636\u064a\u0627\u062a \u0648\u0627\u0644\u062c\u062f\u0631\u0627\u0646 \u0644\u0644\u062d\u0645\u0627\u0645\u0627\u062a \u0648\u0627\u0644\u0645\u0637\u0627\u0628\u062e \u0648\u0627\u0644\u0645\u0633\u0627\u062d\u0627\u062a \u0627\u0644\u062e\u0627\u0631\u062c\u064a\u0629",
    iconKey: "tiling",
  },
  painting: {
    name: "\u0627\u0644\u062f\u0647\u0627\u0646",
    description:
      "\u062f\u0647\u0627\u0646 \u062f\u0627\u062e\u0644\u064a \u0648\u062e\u0627\u0631\u062c\u064a \u0648\u062a\u0634\u0637\u064a\u0628\u0627\u062a \u0648\u062f\u064a\u0643\u0648\u0631\u0627\u062a",
    iconKey: "painting",
  },
  electrical: {
    name: "\u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621",
    description:
      "\u062a\u0645\u062f\u064a\u062f\u0627\u062a \u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629\u060c \u0625\u0646\u0627\u0631\u0629\u060c \u0644\u0648\u062d\u0627\u062a\u060c \u0648\u062a\u0631\u0643\u064a\u0628\u0627\u062a \u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629",
    iconKey: "electrical",
  },
  plumbing: {
    name: "\u0627\u0644\u0633\u0628\u0627\u0643\u0629",
    description:
      "\u062a\u0645\u062f\u064a\u062f\u0627\u062a \u0645\u064a\u0627\u0647\u060c \u0635\u0631\u0641 \u0635\u062d\u064a\u060c \u0633\u062e\u0627\u0646\u0627\u062a\u060c \u0648\u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0623\u062f\u0648\u0627\u062a \u0627\u0644\u0635\u062d\u064a\u0629",
    iconKey: "plumbing",
  },
  gypsum: {
    name: "\u0627\u0644\u062c\u0628\u0633 \u0648\u0627\u0644\u0623\u0633\u0642\u0641",
    description:
      "\u0623\u0633\u0642\u0641 \u0645\u0633\u062a\u0639\u0627\u0631\u0629\u060c \u062c\u0628\u0633 \u0628\u0648\u0631\u062f\u060c \u0648\u062f\u064a\u0643\u0648\u0631\u0627\u062a \u062c\u0628\u0633\u064a\u0629",
    iconKey: "gypsum",
  },
  carpentry: {
    name: "\u0627\u0644\u0646\u062c\u0627\u0631\u0629",
    description:
      "\u0623\u062b\u0627\u062b \u0645\u062e\u0635\u0635\u060c \u0623\u0628\u0648\u0627\u0628\u060c \u0645\u0637\u0627\u0628\u062e\u060c \u0648\u0623\u0639\u0645\u0627\u0644 \u062e\u0634\u0628\u064a\u0629",
    iconKey: "carpentry",
  },
  aluminum: {
    name: "\u0627\u0644\u0623\u0644\u0645\u0646\u064a\u0648\u0645 \u0648\u0627\u0644\u062d\u062f\u064a\u062f",
    description:
      "\u0634\u0628\u0627\u0628\u064a\u0643\u060c \u0623\u0628\u0648\u0627\u0628\u060c \u062f\u0631\u0627\u0628\u0632\u064a\u0646\u060c \u0648\u0623\u0639\u0645\u0627\u0644 \u0645\u0639\u062f\u0646\u064a\u0629",
    iconKey: "aluminum",
  },
  masonry: {
    name: "\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u062d\u062c\u0631",
    description:
      "\u0623\u0639\u0645\u0627\u0644 \u062d\u062c\u0631\u060c \u0628\u0646\u0627\u0621 \u0628\u0644\u0648\u0643\u060c \u062e\u0631\u0633\u0627\u0646\u0629\u060c \u0648\u062c\u062f\u0631\u0627\u0646 \u0625\u0646\u0634\u0627\u0626\u064a\u0629",
    iconKey: "masonry",
  },
};

const iconByKey = {
  tiling: <FaThLarge color="#3B82F6" />,
  painting: <FaPaintRoller color="#F97316" />,
  electrical: <FaBolt color="#EAB308" />,
  plumbing: <FaWrench color="#06B6D4" />,
  gypsum: <FaLayerGroup color="#8B5CF6" />,
  carpentry: <FaHammer color="#A16207" />,
  aluminum: <FaWindowMaximize color="#64748B" />,
  masonry: <GiBrickWall color="#DC2626" />,
  default: <FaThLarge color="#3B82F6" />,
};

const fallbackWorkerCounts = {
  tiling: 2,
  painting: 2,
  electrical: 2,
  plumbing: 2,
  gypsum: 2,
  carpentry: 1,
  aluminum: 2,
  masonry: 2,
};

export function decorateCraft(craft = {}) {
  const slug = craft.slug || String(craft.id || "");
  const fallback = fallbackPresentation[slug] || {};
  const iconKey = craft.iconKey || craft.icon_key || fallback.iconKey || slug;

  return {
    ...craft,
    id: craft.id || slug,
    slug,
    name: craft.name || craft.skill_name || fallback.name || "Craft",
    description: craft.description || fallback.description || "",
    workers: Number(craft.workers ?? craft.workerCount ?? 0),
    icon: iconByKey[iconKey] || iconByKey[slug] || iconByKey.default,
  };
}

export const defaultCrafts = Object.entries(fallbackPresentation).map(([slug, craft], index) =>
  decorateCraft({
    id: index + 1,
    slug,
    ...craft,
    workers: fallbackWorkerCounts[slug] || 0,
  })
);
