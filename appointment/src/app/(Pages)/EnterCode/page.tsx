"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { useRouter } from "next/navigation";

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

const toFa = (value: string | number) =>
  String(value).replace(/\d/g, (d) => faDigits[Number(d)]);

const toEn = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/\D/g, "");

const isValidNationalCode = (code: string) => {
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;

  const sum = code
    .slice(0, 9)
    .split("")
    .reduce((acc, digit, i) => acc + Number(digit) * (10 - i), 0);

  const remainder = sum % 11;
  const check = Number(code[9]);

  return remainder < 2 ? check === remainder : check === 11 - remainder;
};

const doctor = "دکتر سارا کریمی";
const summary = "شنبه ۲ آبان، ساعت ۱۷:۰۰";
const CODE_LENGTH = 4;
const RESEND_SECONDS = 45;

const inputClass =
  "mt-2.5 h-[52px] w-full rounded-xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 sm:h-[56px]";

export default function DetailsPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalCode, setNationalCode] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  const formattedTimer = `${toFa(0)}:${toFa(String(seconds).padStart(2, "0"))}`;

  const handleCodeChange = (index: number, raw: string) => {
    const digits = toEn(raw);

    if (!digits) {
      const next = [...code];
      next[index] = "";
      setCode(next);
      return;
    }

    const next = [...code];
    let cursor = index;

    for (const digit of digits) {
      if (cursor >= CODE_LENGTH) break;

      next[cursor] = digit;
      cursor += 1;
    }

    setCode(next);
    inputs.current[Math.min(cursor, CODE_LENGTH - 1)]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const resend = () => {
    setCode(Array(CODE_LENGTH).fill(""));
    setSeconds(RESEND_SECONDS);
    inputs.current[0]?.focus();
  };

  const phoneValid = /^09\d{9}$/.test(phone);
  const nationalCodeValid = isValidNationalCode(nationalCode);
  const nationalCodeError =
    nationalCode.length === 10 && !nationalCodeValid;

  const codeValid = code.every(Boolean);

  const canSubmit =
    name.trim().length > 1 &&
    phoneValid &&
    nationalCodeValid &&
    codeValid;

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col bg-[#f1f5f9] text-right"
    >
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
              مشخصات شما
            </h1>

            <p className="truncate text-xs text-slate-500 sm:text-sm">
              {doctor} · مرحله {toFa(2)} از {toFa(2)}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-[1096px] px-4">
          <section className="rounded-2xl border border-[#b9dcdf] bg-[#e1f0f1] px-4 py-4 sm:px-6 sm:py-5">
            <p className="text-xs text-slate-500 sm:text-sm">
              نوبت انتخابی
            </p>

            <p className="mt-1.5 text-base font-bold text-slate-900 sm:text-lg">
              {summary}
            </p>
          </section>

          <section className="mt-6 grid gap-5 sm:mt-8 md:grid-cols-3 md:gap-6">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-bold text-slate-900 sm:text-base"
              >
                نام و نام‌خانوادگی
              </label>

              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثلاً مریم احمدی"
                className={`${inputClass} border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20`}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="text-sm font-bold text-slate-900 sm:text-base"
              >
                شماره موبایل
              </label>

              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                dir="ltr"
                value={phone}
                onChange={(e) =>
                  setPhone(toEn(e.target.value).slice(0, 11))
                }
                placeholder="0912 000 0000"
                className={`${inputClass} border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20`}
              />
            </div>

            <div>
              <label
                htmlFor="national-code"
                className="text-sm font-bold text-slate-900 sm:text-base"
              >
                کد ملی
              </label>

              <input
                id="national-code"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                dir="ltr"
                value={nationalCode}
                onChange={(e) =>
                  setNationalCode(toEn(e.target.value).slice(0, 10))
                }
                placeholder="10 رقم کد ملی"
                aria-invalid={nationalCodeError}
                className={`${inputClass} ${
                  nationalCodeError
                    ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                    : "border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20"
                }`}
              />

              {nationalCodeError && (
                <p className="mt-2 text-xs text-red-600">
                  کد ملی وارد شده معتبر نیست
                </p>
              )}
            </div>
          </section>

          <section className="mx-auto mt-5 max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-center sm:mt-8 sm:p-6">
            <h2 className="text-base font-bold text-slate-900">
              کد تأیید پیامکی
            </h2>

            <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
              کد {toFa(CODE_LENGTH)} رقمی برای شماره شما ارسال شد
            </p>

            <div className="mt-5 flex justify-center gap-3" dir="ltr">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={CODE_LENGTH}
                  value={digit}
                  onChange={(e) =>
                    handleCodeChange(index, e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  aria-label={`رقم ${toFa(index + 1)}`}
                  className="size-[54px] rounded-xl border border-slate-300 bg-white text-center text-xl font-bold text-slate-900 outline-none transition focus:border-[#0b6e75] focus:ring-2 focus:ring-[#0b6e75]/20 sm:size-[60px] sm:text-2xl"
                />
              ))}
            </div>

            <div className="mt-4 text-sm text-slate-500">
              {seconds > 0 ? (
                <p>ارسال مجدد کد تا {formattedTimer}</p>
              ) : (
                <button
                  type="button"
                  onClick={resend}
                  className="font-bold text-[#0b6e75] transition hover:text-[#095a60]"
                >
                  ارسال مجدد کد
                </button>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1096px] p-4 sm:justify-end">
          <button
            type="button"
            disabled={!canSubmit}
            className="h-[52px] w-full rounded-2xl bg-[#0b6e75] text-base font-bold text-white transition hover:bg-[#095a60] disabled:cursor-not-allowed disabled:opacity-50 sm:w-60"
          >
            ثبت نوبت
          </button>
        </div>
      </footer>
    </div>
  );
}