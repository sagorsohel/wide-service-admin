import React, { useState, useEffect } from "react";
import { Clock, Calendar, Check, RotateCcw, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ServiceSchedulePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const DAYS = [
  { key: "Sat", label: "Saturday", short: "Sat" },
  { key: "Sun", label: "Sunday", short: "Sun" },
  { key: "Mon", label: "Monday", short: "Mon" },
  { key: "Tue", label: "Tuesday", short: "Tue" },
  { key: "Wed", label: "Wednesday", short: "Wed" },
  { key: "Thu", label: "Thursday", short: "Thu" },
  { key: "Fri", label: "Friday", short: "Fri" },
] as const;

type DayKey = (typeof DAYS)[number]["key"];

const TIME_OPTIONS = [
  "06:00 AM",
  "07:00 AM",
  "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
  "10:00 PM",
  "11:00 PM",
  "12:00 AM",
];

const PRESETS = [
  { id: "sat-wed", label: "Saturday to Wednesday (Sat - Wed)", days: ["Sat", "Sun", "Mon", "Tue", "Wed"] },
  { id: "sat-thu", label: "Saturday to Thursday (Sat - Thu)", days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"] },
  { id: "everyday", label: "Everyday (All 7 Days)", days: ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] },
  { id: "sun-thu", label: "Sunday to Thursday (Sun - Thu)", days: ["Sun", "Mon", "Tue", "Wed", "Thu"] },
  { id: "weekend", label: "Friday & Saturday (Weekend Only)", days: ["Fri", "Sat"] },
];

export const ServiceSchedulePicker: React.FC<ServiceSchedulePickerProps> = ({ value, onChange }) => {
  const [selectedDays, setSelectedDays] = useState<DayKey[]>(["Sat", "Sun", "Mon", "Tue", "Wed"]);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("08:00 PM");
  const [is24Hours, setIs24Hours] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("sat-wed");
  const [isManualEdit, setIsManualEdit] = useState(false);

  // Sync initial value when editing
  useEffect(() => {
    if (value && !isManualEdit) {
      if (value.toLowerCase().includes("24/7") || value.toLowerCase().includes("24 hours")) {
        setIs24Hours(true);
      }
      // If value starts with preset pattern
      if (value.startsWith("Sat - Wed")) {
        setSelectedPreset("sat-wed");
        setSelectedDays(["Sat", "Sun", "Mon", "Tue", "Wed"]);
      } else if (value.startsWith("Sat - Thu")) {
        setSelectedPreset("sat-thu");
        setSelectedDays(["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"]);
      } else if (value.toLowerCase().startsWith("everyday")) {
        setSelectedPreset("everyday");
        setSelectedDays(["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]);
      }
    }
  }, []);

  const formatDaysSummary = (days: DayKey[]): string => {
    if (days.length === 0) return "";
    if (days.length === 7) return "Everyday";

    const allKeys = DAYS.map((d) => d.key);
    const sortedDays = [...days].sort((a, b) => allKeys.indexOf(a) - allKeys.indexOf(b));

    // Check Sat to Wed
    if (
      sortedDays.length === 5 &&
      sortedDays.every((d, i) => ["Sat", "Sun", "Mon", "Tue", "Wed"][i] === d)
    ) {
      return "Sat - Wed";
    }

    // Check Sat to Thu
    if (
      sortedDays.length === 6 &&
      sortedDays.every((d, i) => ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"][i] === d)
    ) {
      return "Sat - Thu";
    }

    // Check Sun to Thu
    if (
      sortedDays.length === 5 &&
      sortedDays.every((d, i) => ["Sun", "Mon", "Tue", "Wed", "Thu"][i] === d)
    ) {
      return "Sun - Thu";
    }

    // Check Fri & Sat
    if (sortedDays.length === 2 && sortedDays.includes("Sat") && sortedDays.includes("Fri")) {
      return "Fri & Sat";
    }

    return sortedDays.join(", ");
  };

  const updateScheduleString = (
    days: DayKey[],
    start: string,
    end: string,
    roundTheClock: boolean
  ) => {
    if (days.length === 0) {
      onChange("");
      return;
    }
    const daysText = formatDaysSummary(days);
    let result = "";
    if (roundTheClock) {
      result = `${daysText}: 24/7 Always Open`;
    } else {
      result = `${daysText}: ${start} - ${end}`;
    }
    onChange(result);
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    setIsManualEdit(false);

    if (presetId === "24-7") {
      const allDays: DayKey[] = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];
      setSelectedDays(allDays);
      setIs24Hours(true);
      updateScheduleString(allDays, startTime, endTime, true);
      return;
    }

    const matched = PRESETS.find((p) => p.id === presetId);
    if (matched) {
      const days = matched.days as DayKey[];
      setSelectedDays(days);
      setIs24Hours(false);
      updateScheduleString(days, startTime, endTime, false);
    }
  };

  const toggleDay = (dayKey: DayKey) => {
    setIsManualEdit(false);
    setSelectedPreset("custom");

    const newDays = selectedDays.includes(dayKey)
      ? selectedDays.filter((d) => d !== dayKey)
      : [...selectedDays, dayKey];

    setSelectedDays(newDays);
    updateScheduleString(newDays, startTime, endTime, is24Hours);
  };

  const handleStartTimeChange = (newStart: string) => {
    setIsManualEdit(false);
    setStartTime(newStart);
    updateScheduleString(selectedDays, newStart, endTime, is24Hours);
  };

  const handleEndTimeChange = (newEnd: string) => {
    setIsManualEdit(false);
    setEndTime(newEnd);
    updateScheduleString(selectedDays, startTime, newEnd, is24Hours);
  };

  const handleToggle24Hours = () => {
    setIsManualEdit(false);
    const nextVal = !is24Hours;
    setIs24Hours(nextVal);
    updateScheduleString(selectedDays, startTime, endTime, nextVal);
  };

  const handleClear = () => {
    setSelectedDays([]);
    setSelectedPreset("custom");
    setIs24Hours(false);
    setIsManualEdit(false);
    onChange("");
  };

  const applyQuickPreset = (presetDays: DayKey[], presetId: string) => {
    setIsManualEdit(false);
    setSelectedPreset(presetId);
    setSelectedDays(presetDays);
    setIs24Hours(false);
    updateScheduleString(presetDays, startTime, endTime, false);
  };

  return (
    <div className="space-y-3.5 p-4 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50/70 to-blue-50/20 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100/80 text-blue-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              Service Operating Schedule
              <span className="text-[11px] font-normal text-slate-400">(Optional)</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Select business days and working hours for this service
            </p>
          </div>
        </div>

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
            title="Clear Schedule"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Preset Select Box (Shadcn UI) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-600 block">
          Day Schedule Preset (Select Box)
        </label>
        <Select value={selectedPreset} onValueChange={handlePresetChange}>
          <SelectTrigger className="w-full text-xs h-9 bg-white">
            <SelectValue placeholder="-- Custom Days Selection --" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="custom">-- Custom Days Selection --</SelectItem>
            <SelectItem value="sat-wed">Saturday to Wednesday (Sat - Wed)</SelectItem>
            <SelectItem value="sat-thu">Saturday to Thursday (Sat - Thu)</SelectItem>
            <SelectItem value="everyday">Everyday (All 7 Days)</SelectItem>
            <SelectItem value="sun-thu">Sunday to Thursday (Sun - Thu)</SelectItem>
            <SelectItem value="weekend">Friday & Saturday (Weekend Only)</SelectItem>
            <SelectItem value="24-7">24/7 Always Open (All Days)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Week Calendar Day Selector (Shadcn styled) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Week Calendar (Click to toggle days)</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyQuickPreset(["Sat", "Sun", "Mon", "Tue", "Wed"], "sat-wed")}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                selectedPreset === "sat-wed"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Sat - Wed
            </button>
            <button
              type="button"
              onClick={() => applyQuickPreset(["Sat", "Sun", "Mon", "Tue", "Wed", "Thu"], "sat-thu")}
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                selectedPreset === "sat-thu"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Sat - Thu
            </button>
            <button
              type="button"
              onClick={() =>
                applyQuickPreset(["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"], "everyday")
              }
              className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                selectedPreset === "everyday"
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-slate-200/80 text-slate-700 hover:bg-slate-300"
              }`}
            >
              Everyday
            </button>
          </div>
        </div>

        {/* 7 Days of the Week Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {DAYS.map((day) => {
            const isSelected = selectedDays.includes(day.key);
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => toggleDay(day.key)}
                className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                  isSelected
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs font-bold ring-2 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300 font-medium"
                }`}
                title={day.label}
              >
                <span className="text-xs uppercase tracking-tight">{day.short}</span>
                <span
                  className={`text-[9px] px-1 rounded-full ${
                    isSelected ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {isSelected ? <Check className="w-2.5 h-2.5 mx-auto" /> : "Off"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Selection */}
      <div className="pt-1 border-t border-slate-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* Start Time */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 block">
              Opening Time
            </label>
            <Select
              value={startTime}
              disabled={is24Hours}
              onValueChange={handleStartTimeChange}
            >
              <SelectTrigger className="w-full text-xs h-8 bg-white">
                <SelectValue placeholder="Opening Time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* End Time */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-600 block">
              Closing Time
            </label>
            <Select
              value={endTime}
              disabled={is24Hours}
              onValueChange={handleEndTimeChange}
            >
              <SelectTrigger className="w-full text-xs h-8 bg-white">
                <SelectValue placeholder="Closing Time" />
              </SelectTrigger>
              <SelectContent>
                {TIME_OPTIONS.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 24/7 Service Option */}
        <div className="mt-2.5 flex items-center justify-between">
          <label className="text-xs text-slate-700 font-medium flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={is24Hours}
              onChange={handleToggle24Hours}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <span>24/7 Service (Emergency / Round the clock support)</span>
          </label>

          <span className="text-[11px] text-slate-400">
            {selectedDays.length} day{selectedDays.length === 1 ? "" : "s"} selected
          </span>
        </div>
      </div>

      {/* Resulting Schedule Preview & Manual Customization */}
      <div className="pt-2 border-t border-slate-200/60 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Configured Schedule Value</span>
          </label>
          <span className="text-[10px] text-slate-400 font-mono">
            {value ? "Formatted & Ready" : "No schedule set"}
          </span>
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            setIsManualEdit(true);
            onChange(e.target.value);
          }}
          placeholder="e.g. Sat - Wed: 09:00 AM - 08:00 PM (Emergency 24/7 Support)"
          className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />

        {value ? (
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/90 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-emerald-950">Active Display:</span>
            <span className="font-medium truncate">{value}</span>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic">
            Schedule is currently empty. The default or no schedule will be displayed.
          </p>
        )}
      </div>
    </div>
  );
};
