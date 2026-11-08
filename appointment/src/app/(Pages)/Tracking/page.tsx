"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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

const schema = yup.object({
  nationalCode: yup
    .string()
    .transform((value) => toEn(value ?? ""))
    .required("کد ملی را وارد کنید")
    .length(10, "کد ملی باید ۱۰ رقم باشد")
    .test(
      "national-code",
      "کد ملی وارد شده معتبر نیست",
      (value) => !value || value.length !== 10 || isValidNationalCode(value)
    ),
  trackingCode: yup
    .string()
    .transform((value) => toEn(value ?? ""))
    .required("کد پیگیری را وارد کنید")
    .matches(/^\d{6}$/, "کد پیگیری باید ۶ رقم باشد"),
});

type FormValues = yup.InferType<typeof schema>;

type Appointment = {
  patient: string;
  doctor: string;
  time: string;
  status: "confirmed" | "cancelled";
};

const fetchAppointment = (nationalCode: string, trackingCode: string) =>
  new Promise<Appointment | null>((resolve) => {
    setTimeout(() => {
      resolve({
        patient: "مریم احمدی",
        doctor: "دکتر سارا کریمی",
        time: "شنبه ۲ آبان، ۱۷:۰۰",
        status: "confirmed",
      });
    }, 700);
  });

const inputClass =
  "mt-2.5 h-[52px] w-full rounded-xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 sm:h-[56px]";

const okBorder = "border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20";
const errBorder = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

export default function TrackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, touchedFields, isValid },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { nationalCode: "", trackingCode: "" },
    mode: "onChange",
  });

  const nationalCodeValue = watch("nationalCode");
  const showNationalError =
    !!errors.nationalCode &&
    (!!touchedFields.nationalCode || nationalCodeValue.length === 10);
  const showTrackingError = !!errors.trackingCode && !!touchedFields.trackingCode;
  const canSubmit = isValid && !loading;

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setNotFound(false);
    setAppointment(null);
    setConfirmCancel(false);
    const result = await fetchAppointment(values.nationalCode, values.trackingCode);
    setLoading(false);
    if (result) {
      setAppointment(result);
    } else {
      setNotFound(true);
    }
  };

  const handleCancel = () => {
    setAppointment((current) =>
      current ? { ...current, status: "cancelled" } : current
    );
    setConfirmCancel(false);
  };

  const cancelled = appointment?.status === "cancelled";

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
          <h1 className="text-base font-bold text-slate-900 sm:text-lg">
            پیگیری نوبت
          </h1>
        </div>
      </header>

      <main className="flex-1 py-6 sm:py-10">
        <div className="mx-auto max-w-[1096px] px-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-start md:gap-6"
          >
            <div>
              <label
                htmlFor="national-code"
                className="text-sm font-bold text-slate-900 sm:text-base"
              >
                کد ملی
              </label>
              <Controller
                control={control}
                name="nationalCode"
                render={({ field }) => (
                  <input
                    {...field}
                    id="national-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="۱۰ رقم کد ملی"
                    aria-invalid={showNationalError}
                    onChange={(e) => field.onChange(toEn(e.target.value).slice(0, 10))}
                    className={`${inputClass} ${showNationalError ? errBorder : okBorder}`}
                  />
                )}
              />
              {showNationalError && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.nationalCode?.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="tracking-code"
                className="text-sm font-bold text-slate-900 sm:text-base"
              >
                کد پیگیری
              </label>
              <Controller
                control={control}
                name="trackingCode"
                render={({ field }) => (
                  <input
                    {...field}
                    id="tracking-code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="۶ رقم کد پیگیری"
                    aria-invalid={showTrackingError}
                    onChange={(e) => field.onChange(toEn(e.target.value).slice(0, 6))}
                    className={`${inputClass} ${showTrackingError ? errBorder : okBorder}`}
                  />
                )}
              />
              {showTrackingError && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.trackingCode?.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="h-[52px] w-full rounded-2xl bg-[#0b6e75] text-base font-bold text-white transition hover:bg-[#095a60] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[56px] md:mt-[34px] md:w-52"
            >
              {loading ? "در حال جست‌وجو..." : "نمایش نوبت"}
            </button>
          </form>

          {notFound && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-600 sm:mt-8 sm:p-6">
              نوبتی با این مشخصات پیدا نشد. کد ملی و کد پیگیری را بررسی کنید.
            </div>
          )}

          {appointment && (
            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 sm:mt-8 sm:p-6">
              <div className="flex items-center justify-between gap-3 pb-4">
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  {appointment.patient}
                </h2>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    cancelled
                      ? "bg-red-50 text-red-700"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {cancelled ? "لغوشده" : "تاییدشده"}
                </span>
              </div>

              <dl>
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 py-3.5 text-sm">
                  <dt className="text-slate-500">پزشک</dt>
                  <dd className="font-bold text-slate-900">
                    {appointment.doctor}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-slate-200 py-3.5 text-sm">
                  <dt className="text-slate-500">زمان</dt>
                  <dd className="font-bold text-slate-900">{appointment.time}</dd>
                </div>
              </dl>

              {!cancelled && (
                <div className="mt-3">
                  {confirmCancel ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                      <p className="text-sm font-bold text-red-800">
                        مطمئنید که می‌خواهید این نوبت را لغو کنید؟
                      </p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="h-11 rounded-xl bg-red-600 px-6 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                          بله، لغو شود
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmCancel(false)}
                          className="h-11 rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                        >
                          انصراف
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setConfirmCancel(true)}
                        className="h-[52px] w-full rounded-xl border border-red-300 bg-red-50 text-base font-bold text-red-700 transition hover:bg-red-100"
                      >
                        لغو نوبت
                      </button>
                      <p className="mt-3 text-center text-xs text-slate-500">
                        لغو نوبت تا {toFa(2)} ساعت قبل از زمان ویزیت امکان‌پذیر
                        است.
                      </p>
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}