import { create } from "zustand";
import { SAVE_VERSION, SETTINGS_KEY } from "../game/constants";
import type { CheckMode, InputOrder } from "../game/types";

export type SettingsState = {
  autoCheck: boolean;
  autoRemoveNotes: boolean;
  highlightSameNumbers: boolean;
  highlightPeers: boolean;
  sound: boolean;
  vibration: boolean;
  darkMode: boolean;
  mistakeLimit: number | null;
  timerVisible: boolean;
  inputOrder: InputOrder;
  checkMode: CheckMode;
  toggle: (key: BooleanSettingKey) => void;
  setMistakeLimit: (limit: number | null) => void;
  setInputOrder: (inputOrder: InputOrder) => void;
  setCheckMode: (checkMode: CheckMode) => void;
};

export type BooleanSettingKey = {
  [K in keyof SettingsState]: SettingsState[K] extends boolean ? K : never;
}[keyof SettingsState];

type SettingsValues = Pick<
  SettingsState,
  | "autoCheck"
  | "autoRemoveNotes"
  | "highlightSameNumbers"
  | "highlightPeers"
  | "sound"
  | "vibration"
  | "darkMode"
  | "mistakeLimit"
  | "timerVisible"
  | "inputOrder"
  | "checkMode"
>;

const defaults: SettingsValues = {
  autoCheck: true,
  autoRemoveNotes: true,
  highlightSameNumbers: true,
  highlightPeers: true,
  sound: false,
  vibration: true,
  darkMode: false,
  mistakeLimit: null,
  timerVisible: true,
  inputOrder: "cell-first",
  checkMode: "conflict-only",
};

function loadSettings(): SettingsValues {
  const raw = localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaults;
  try {
    const data = JSON.parse(raw) as { version?: number; state?: Partial<SettingsValues> };
    if (data.version !== SAVE_VERSION || !data.state) return defaults;
    return { ...defaults, ...data.state } as SettingsValues;
  } catch {
    return defaults;
  }
}

function saveSettings(state: SettingsValues): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify({ version: SAVE_VERSION, state }));
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  ...loadSettings(),
  toggle: (key) => {
    const next = { ...get(), [key]: !get()[key] };
    saveSettings({
      autoCheck: next.autoCheck,
      autoRemoveNotes: next.autoRemoveNotes,
      highlightSameNumbers: next.highlightSameNumbers,
      highlightPeers: next.highlightPeers,
      sound: next.sound,
      vibration: next.vibration,
      darkMode: next.darkMode,
      mistakeLimit: next.mistakeLimit,
      timerVisible: next.timerVisible,
      inputOrder: next.inputOrder,
      checkMode: next.checkMode,
    });
    set({ [key]: next[key] } as Pick<SettingsState, typeof key>);
  },
  setMistakeLimit: (limit) => {
    saveSettings({
      autoCheck: get().autoCheck,
      autoRemoveNotes: get().autoRemoveNotes,
      highlightSameNumbers: get().highlightSameNumbers,
      highlightPeers: get().highlightPeers,
      sound: get().sound,
      vibration: get().vibration,
      darkMode: get().darkMode,
      mistakeLimit: limit,
      timerVisible: get().timerVisible,
      inputOrder: get().inputOrder,
      checkMode: get().checkMode,
    });
    set({ mistakeLimit: limit });
  },
  setInputOrder: (inputOrder) => {
    saveSettings({
      autoCheck: get().autoCheck,
      autoRemoveNotes: get().autoRemoveNotes,
      highlightSameNumbers: get().highlightSameNumbers,
      highlightPeers: get().highlightPeers,
      sound: get().sound,
      vibration: get().vibration,
      darkMode: get().darkMode,
      mistakeLimit: get().mistakeLimit,
      timerVisible: get().timerVisible,
      inputOrder,
      checkMode: get().checkMode,
    });
    set({ inputOrder });
  },
  setCheckMode: (checkMode) => {
    saveSettings({
      autoCheck: get().autoCheck,
      autoRemoveNotes: get().autoRemoveNotes,
      highlightSameNumbers: get().highlightSameNumbers,
      highlightPeers: get().highlightPeers,
      sound: get().sound,
      vibration: get().vibration,
      darkMode: get().darkMode,
      mistakeLimit: get().mistakeLimit,
      timerVisible: get().timerVisible,
      inputOrder: get().inputOrder,
      checkMode,
    });
    set({ checkMode });
  },
}));
