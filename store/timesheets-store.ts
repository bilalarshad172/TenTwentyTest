import { create } from "zustand";
import { message } from "antd";
import type { TimesheetEntry } from "@/lib/types";

type TimesheetState = {
  items: TimesheetEntry[];
  loading: boolean;
  error: string | null;
  fetchAll: () => Promise<void>;
  create: (data: Omit<TimesheetEntry, "id">) => Promise<void>;
  update: (id: string, data: Omit<TimesheetEntry, "id">) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload?.message || "Request failed");
  }
  return res.json();
}

export const useTimesheetsStore = create<TimesheetState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const data = await handleResponse<TimesheetEntry[]>(
        await fetch("/api/timesheets", { cache: "no-store" })
      );
      set({ items: data, loading: false });
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  create: async (data) => {
    set({ loading: true, error: null });
    try {
      const created = await handleResponse<TimesheetEntry>(
        await fetch("/api/timesheets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      );
      set({ items: [created, ...get().items], loading: false });
      message.success("Timesheet created successfully");
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  update: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const updated = await handleResponse<TimesheetEntry>(
        await fetch(`/api/timesheets/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      );
      set((state) => {
        const exists = state.items.some((item) => item.id === updated.id);
        const withoutDuplicates = state.items.filter(
          (item) =>
            item.id !== updated.id &&
            !(
              item.weekNumber === updated.weekNumber &&
              item.weekStart === updated.weekStart
            )
        );
        return {
          items: exists
            ? [updated, ...withoutDuplicates]
            : [updated, ...withoutDuplicates],
          loading: false,
        };
      });
      message.success("Timesheet updated successfully");
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },

  remove: async (id) => {
    set({ loading: true, error: null });
    try {
      await handleResponse<{ success: boolean }>(
        await fetch(`/api/timesheets/${id}`, { method: "DELETE" })
      );
      set({
        items: get().items.filter((item) => item.id !== id),
        loading: false,
      });
      message.success("Timesheet deleted successfully");
    } catch (err) {
      set({ error: (err as Error).message, loading: false });
    }
  },
}));
