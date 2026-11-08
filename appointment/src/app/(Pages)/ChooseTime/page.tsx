"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const toFa = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

const days = [
  { name: "شنبه", date: 2, month: "آبان", booked: ["16:30"] },
  { name: "یکشنبه", date: 3, month: "آبان", booked: ["17:30", "20:00"] },
  { name: "دوشنبه", date: 4, month: "آبان", booked: ["16:00", "18:30"] },
  { name: "سه‌شنبه", date: 5, month: "آبان", booked: [] },
  { name: "چهارشنبه", date: 6, month: "آبان", booked: ["19:00"] },
];

const times = [
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
];

const doctor = "دکتر سارا کریمی";

export default function SelectTimePage() {
  const router = useRouter();
  const [dayIndex, setDayIndex] = useState(0);
  const [time, setTime] = useState<string | null>("17:00");

  const day = days[dayIndex];

  const selectDay = (index: number) => {
    setDayIndex(index);
    setTime(null);
  };

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-[#f1f5f9] text-right">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1096px] items-center gap-3 px-4 sm:h-[70px]">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="بازگشت"
            className="grid size-10 shrink-0 place-items-center rounded-full text-slate-900 transition hover:bg-slate-100"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-6 text-slate-900 sm:text-lg">
              انتخاب زمان
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              {doctor} · مرحله {toFa(1)} از {toFa(2)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-[1096px] px-4">
          <section>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              روز مراجعه
            </h2>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:gap-3 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {days.map((item, index) => {
                const active = index === dayIndex;
                return (
                  <button
                    key={item.date}
                    type="button"
                    onClick={() => selectDay(index)}
                    className={`flex min-w-[68px] flex-1 shrink-0 flex-col items-center rounded-2xl border px-2 py-3 transition sm:py-4 ${
                      active
                        ? "border-[#0b6e75] bg-[#0b6e75] text-white"
                        : "border-slate-300 bg-white text-slate-900 hover:border-[#0b6e75]"
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{item.name}</span>
                    <span className="mt-1 text-2xl font-extrabold leading-8 sm:text-3xl sm:leading-10">
                      {toFa(item.date)}
                    </span>
                    <span className="mt-1 text-xs sm:text-sm">{item.month}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="mt-8 sm:mt-10">
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              ساعت‌های خالی
            </h2>
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
              {times.map((item) => {
                const disabled = day.booked.includes(item);
                const active = time === item;
                return (
                  <button
                    key={item}
                    type="button"
                    disabled={disabled}
                    onClick={() => setTime(item)}
                    className={`h-[46px] rounded-xl border text-sm font-bold transition sm:h-[50px] ${
                      disabled
                        ? "cursor-not-allowed border-slate-200 bg-[#eaeef3] text-slate-400 line-through"
                        : active
                          ? "border-[#0b6e75] bg-[#0b6e75] text-white"
                          : "border-slate-300 bg-white text-slate-900 hover:border-[#0b6e75]"
                    }`}
                  >
                    {toFa(item)}
                  </button>
                );
              })}
            </div>
          </section>

          {time && (
            <section className="mt-8 rounded-2xl border border-[#b9dcdf] bg-[#e1f0f1] px-4 py-4 sm:mt-10 sm:px-6 sm:py-5">
              <p className="text-xs text-slate-500 sm:text-sm">
                نوبت انتخابی شما
              </p>
              <p className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
                {day.name} {toFa(day.date)} {day.month}، ساعت {toFa(time)}
              </p>
            </section>
          )}
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1096px] p-4 sm:justify-end">
          <button
            type="button"
            disabled={!time}
            className="h-[52px] w-full rounded-2xl bg-[#0b6e75] text-base font-bold text-white transition hover:bg-[#095a60] disabled:cursor-not-allowed disabled:opacity-50 sm:w-60"
          >
            ادامه
          </button>
        </div>
      </footer>
    </div>
  );
}