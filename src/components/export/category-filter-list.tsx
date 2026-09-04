"use client";

import { CATEGORIES, type Category } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";

interface CategoryFilterListProps {
  selected: Category[];
  onToggle: (category: Category) => void;
  onClear: () => void;
}

export function CategoryFilterList({ selected, onToggle, onClear }: CategoryFilterListProps) {
  const allSelected = selected.length === 0;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onClear}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            allSelected
              ? "border-indigo-500 bg-indigo-50 text-indigo-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
          }`}
        >
          All categories
        </button>
        {CATEGORIES.map((category) => {
          const isSelected = selected.includes(category);
          const meta = CATEGORY_META[category];
          return (
            <button
              key={category}
              type="button"
              onClick={() => onToggle(category)}
              aria-pressed={isSelected}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} aria-hidden="true" />
              {category}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        {allSelected ? "Including every category." : `${selected.length} of ${CATEGORIES.length} categories selected.`}
      </p>
    </div>
  );
}
