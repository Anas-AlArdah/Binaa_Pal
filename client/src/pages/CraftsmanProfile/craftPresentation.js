import React from "react";
import {
  FaBroom,
  FaBolt,
  FaBrush,
  FaCouch,
  FaDoorOpen,
  FaDraftingCompass,
  FaFan,
  FaFireExtinguisher,
  FaHammer,
  FaHardHat,
  FaHome,
  FaKey,
  FaLayerGroup,
  FaPaintRoller,
  FaPlug,
  FaRoad,
  FaRulerCombined,
  FaScrewdriver,
  FaShower,
  FaSnowflake,
  FaSolarPanel,
  FaThLarge,
  FaTint,
  FaToilet,
  FaTools,
  FaTree,
  FaTruck,
  FaWarehouse,
  FaWindowMaximize,
  FaWrench,
} from "react-icons/fa";
import { GiBrickWall } from "react-icons/gi";

const fallbackPresentation = {
  tiling: {
    name: "التبليط",
    description:
      "تبليط الأرضيات والجدران للحمامات والمطابخ والمساحات الخارجية",
    iconKey: "tiling",
  },
  painting: {
    name: "الدهان",
    description:
      "دهان داخلي وخارجي وتشطيبات وديكورات",
    iconKey: "painting",
  },
  electrical: {
    name: "الكهرباء",
    description:
      "تمديدات كهربائية، إنارة، لوحات، وتركيبات كهربائية",
    iconKey: "electrical",
  },
  plumbing: {
    name: "السباكة",
    description:
      "تمديدات مياه، صرف صحي، سخانات، وتركيب الأدوات الصحية",
    iconKey: "plumbing",
  },
  gypsum: {
    name: "الجبس والأسقف",
    description:
      "أسقف مستعارة، جبس بورد، وديكورات جبسية",
    iconKey: "gypsum",
  },
  carpentry: {
    name: "النجارة",
    description:
      "أثاث مخصص، أبواب، مطابخ، وأعمال خشبية",
    iconKey: "carpentry",
  },
  aluminum: {
    name: "الألمنيوم والحديد",
    description:
      "شبابيك، أبواب، درابزين، وأعمال معدنية",
    iconKey: "aluminum",
  },
  masonry: {
    name: "البناء والحجر",
    description:
      "أعمال حجر، بناء بلوك، خرسانة، وجدران إنشائية",
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
  construction: <FaHardHat color="#F59E0B" />,
  appliances: <FaPlug color="#2563EB" />,
  blacksmithing: <FaTools color="#94A3B8" />,
  "interior-design": <FaCouch color="#C084FC" />,
  doors: <FaDoorOpen color="#A16207" />,
  locks: <FaKey color="#F59E0B" />,
  cleaning: <FaBroom color="#22C55E" />,
  roofing: <FaHome color="#64748B" />,
  gardening: <FaTree color="#16A34A" />,
  hvac: <FaFan color="#06B6D4" />,
  refrigeration: <FaSnowflake color="#38BDF8" />,
  solar: <FaSolarPanel color="#EAB308" />,
  "fire-safety": <FaFireExtinguisher color="#DC2626" />,
  roads: <FaRoad color="#64748B" />,
  waterproofing: <FaTint color="#0EA5E9" />,
  bathrooms: <FaShower color="#06B6D4" />,
  sanitary: <FaToilet color="#94A3B8" />,
  surveying: <FaRulerCombined color="#3B82F6" />,
  engineering: <FaDraftingCompass color="#2563EB" />,
  warehousing: <FaWarehouse color="#64748B" />,
  transport: <FaTruck color="#F97316" />,
  repairs: <FaScrewdriver color="#60A5FA" />,
  finishing: <FaBrush color="#F97316" />,
  default: <FaThLarge color="#3B82F6" />,
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
    workers: 0,
  })
);
