import {
  UtensilsCrossed,
  Car,
  Clapperboard,
  ShoppingBag,
  Receipt,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { Category } from "@/types/expense";

interface CategoryMeta {
  label: Category;
  icon: LucideIcon;
  color: string; // hex, used for charts
  badgeClass: string; // tailwind classes for pills/badges
  dotClass: string; // tailwind class for solid color dots
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: {
    label: "Food",
    icon: UtensilsCrossed,
    color: "#f97316",
    badgeClass: "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
    dotClass: "bg-orange-500",
  },
  Transportation: {
    label: "Transportation",
    icon: Car,
    color: "#3b82f6",
    badgeClass: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
    dotClass: "bg-blue-500",
  },
  Entertainment: {
    label: "Entertainment",
    icon: Clapperboard,
    color: "#a855f7",
    badgeClass: "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-200",
    dotClass: "bg-purple-500",
  },
  Shopping: {
    label: "Shopping",
    icon: ShoppingBag,
    color: "#ec4899",
    badgeClass: "bg-pink-50 text-pink-700 ring-1 ring-inset ring-pink-200",
    dotClass: "bg-pink-500",
  },
  Bills: {
    label: "Bills",
    icon: Receipt,
    color: "#14b8a6",
    badgeClass: "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-200",
    dotClass: "bg-teal-500",
  },
  Other: {
    label: "Other",
    icon: MoreHorizontal,
    color: "#64748b",
    badgeClass: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
    dotClass: "bg-slate-500",
  },
};
