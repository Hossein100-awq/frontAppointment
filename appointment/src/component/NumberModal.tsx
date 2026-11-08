"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

export type NewPatient = {
  name: string;
  phone: string;
  nationalCode: string;
};

type NumberModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (patient: NewPatient) => void;
};

const toEn = (value: string) =>
  value
    .replace(/[۰-۹٠-٩]/g, (digit) => {
      const code = digit.charCodeAt(0);
      return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
    })
    .replace(/[^0-9]/g, "");

const cleanName = (value: string) =>
  value
    .replace(/[^\p{L}\s\u200c]/gu, "")
    .replace(/^\s+/, "")
    .replace(/\s{2,}/g, " ");

const isValidNationalCode = (code: string) => {
  const normalized = toEn(code);

  if (!/^\d{10}$/.test(normalized)) return false;
  if (/^(\d)\1{9}$/.test(normalized)) return false;

  const digits = normalized.split("").map(Number);

  const sum = digits
    .slice(0, 9)
    .reduce((total, digit, index) => total + digit * (10 - index), 0);

  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;

  return digits[9] === checkDigit;
};

const inputClass =
  "mt-2 h-[50px] w-full rounded-xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2";

const okBorder =
  "border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20";

const badBorder = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

export default function NumberModal({
  open,
  onClose,
  onSubmit,
}: NumberModalProps) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalCode, setNationalCode] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const timer = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(timer);
    }

    setVisible(false);

    const timer = setTimeout(() => {
      setMounted(false);
      setName("");
      setPhone("");
      setNationalCode("");
    }, 300);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => nameRef.current?.focus(), 250);

    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);

    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!mounted) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [mounted]);

  if (!mounted) return null;

  const nameValid = name.trim().length >= 2;
  const phoneValid = /^09\d{9}$/.test(phone);
  const phoneError = phone.length === 11 && !phoneValid;

  const nationalCodeValid = isValidNationalCode(nationalCode);
  const nationalCodeError = nationalCode.length === 10 && !nationalCodeValid;

  const canSubmit = nameValid && phoneValid && nationalCodeValid;

  const reveal = (index: number) => ({
    className: `transition duration-300 ease-out motion-reduce:transition-none ${
      visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
    }`,
    style: {
      transitionDelay: visible ? `${120 + index * 60}ms` : "0ms",
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) return;

    onSubmit({
      name: name.trim(),
      phone,
      nationalCode,
    });

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-appointment-title"
    >
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] transition-opacity duration-300 motion-reduce:transition-none ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />

      <form
        dir="rtl"
        onSubmit={handleSubmit}
        className={`relative w-full max-w-md rounded-t-3xl bg-white p-5 text-right shadow-2xl transition duration-300 ease-out motion-reduce:transition-none sm:rounded-3xl sm:p-6 ${
          visible
            ? "translate-y-0 opacity-100 sm:scale-100"
            : "translate-y-full opacity-0 sm:translate-y-6 sm:scale-95"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="manual-appointment-title"
              className="text-lg font-extrabold text-slate-900 sm:text-xl"
            >
              افزودن نوبت دستی
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              مشخصات بیمار جدید را وارد کنید.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="grid size-10 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div {...reveal(0)}>
            <label
              htmlFor="manual-name"
              className="text-sm font-bold text-slate-900"
            >
              نام و نام‌خانوادگی
            </label>

            <input
              id="manual-name"
              ref={nameRef}
              type="text"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(cleanName(e.target.value))}
              placeholder="مریم احمدی"
              className={`${inputClass} ${okBorder}`}
            />
          </div>

          <div {...reveal(1)}>
            <label
              htmlFor="manual-phone"
              className="text-sm font-bold text-slate-900"
            >
              شماره موبایل
            </label>

            <input
              id="manual-phone"
              type="tel"
              inputMode="numeric"
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(toEn(e.target.value).slice(0, 11))}
              placeholder="09120000000"
              aria-invalid={phoneError}
              className={`${inputClass} ${phoneError ? badBorder : okBorder}`}
            />

            {phoneError && (
              <p className="mt-2 text-xs text-red-600">
                شماره موبایل باید با 09 شروع شود و 11 رقم باشد.
              </p>
            )}
          </div>

          <div {...reveal(2)}>
            <label
              htmlFor="manual-national-code"
              className="text-sm font-bold text-slate-900"
            >
              کد ملی
            </label>

            <input
              id="manual-national-code"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={nationalCode}
              onChange={(e) =>
                setNationalCode(toEn(e.target.value).slice(0, 10))
              }
              placeholder="10 رقم کد ملی"
              aria-invalid={nationalCodeError}
              className={`${inputClass} ${
                nationalCodeError ? badBorder : okBorder
              }`}
            />

            {nationalCodeError && (
              <p className="mt-2 text-xs text-red-600">
                کد ملی وارد شده معتبر نیست.
              </p>
            )}
          </div>
        </div>

        <div
          {...reveal(3)}
          className={`${reveal(3).className} mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-start`}
        >
          <button
            type="submit"
            disabled={!canSubmit}
            className="h-[50px] rounded-xl bg-[#0b6e75] px-8 text-sm font-bold text-white transition hover:bg-[#095a60] disabled:cursor-not-allowed disabled:opacity-50"
          >
            ثبت نوبت
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-[50px] rounded-xl border border-slate-300 bg-white px-8 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}