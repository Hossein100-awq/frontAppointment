"use client";

import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Sidebar from "./../../../component/SideBar";

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

const toFa = (value: string | number) =>
  String(value).replace(/\d/g, (d) => faDigits[Number(d)]);

const toEnTime = (value: string) =>
  value
    .replace(/[۰-۹]/g, (d) => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[^\d:]/g, "")
    .slice(0, 5);

const formatTime = (value: string) => {
  const digits = value.replace(/\D/g, "");

  if (!digits) return "";

  let hours: number;
  let minutes: number;

  if (digits.length <= 2) {
    hours = Number(digits);
    minutes = 0;
  } else if (digits.length === 3) {
    hours = Number(digits[0]);
    minutes = Number(digits.slice(1));
  } else {
    hours = Number(digits.slice(0, 2));
    minutes = Number(digits.slice(2, 4));
  }

  hours = Math.min(hours, 23);
  minutes = Math.min(minutes, 59);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const isTime = (value?: string) =>
  !!value && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);

type DaySchedule = {
  name: string;
  enabled: boolean;
  from: string;
  to: string;
};

type SettingsFormValues = {
  doctorName: string;
  phone: string;
  address: string;
  duration: number;
  deadline: number;
  days: DaySchedule[];
};

const initialDays: DaySchedule[] = [
  { name: "شنبه", enabled: true, from: "16:00", to: "21:00" },
  { name: "یکشنبه", enabled: true, from: "16:00", to: "21:00" },
  { name: "دوشنبه", enabled: true, from: "16:00", to: "21:00" },
  { name: "سه‌شنبه", enabled: true, from: "16:00", to: "21:00" },
  { name: "چهارشنبه", enabled: true, from: "09:00", to: "13:00" },
  { name: "پنجشنبه", enabled: false, from: "09:00", to: "13:00" },
  { name: "جمعه", enabled: false, from: "09:00", to: "13:00" },
];

const durations = [15, 20, 30, 45, 60];
const deadlines = [1, 2, 4, 12, 24];

const daySchema: yup.ObjectSchema<DaySchedule> = yup.object({
  name: yup.string().defined(),
  enabled: yup.boolean().defined(),

  from: yup
    .string()
    .defined()
    .test("required-if-enabled", "ساعت شروع را وارد کنید", function (value) {
      return !this.parent.enabled || Boolean(value?.trim());
    })
    .test("valid-time", "ساعت شروع معتبر نیست", function (value) {
      return !this.parent.enabled || !value || isTime(value);
    }),

  to: yup
    .string()
    .defined()
    .test("required-if-enabled", "ساعت پایان را وارد کنید", function (value) {
      return !this.parent.enabled || Boolean(value?.trim());
    })
    .test("valid-time", "ساعت پایان معتبر نیست", function (value) {
      return !this.parent.enabled || !value || isTime(value);
    })
    .test(
      "after-start",
      "ساعت پایان باید بعد از ساعت شروع باشد",
      function (value) {
        const day = this.parent as DaySchedule;

        return (
          !day.enabled ||
          !isTime(day.from) ||
          !isTime(value) ||
          value > day.from
        );
      }
    ),
});

const settingsSchema: yup.ObjectSchema<SettingsFormValues> = yup.object({
  doctorName: yup
    .string()
    .trim()
    .required("نام پزشک و تخصص را وارد کنید"),

  phone: yup
    .string()
    .trim()
    .defined()
    .matches(/^[0-9۰-۹٠-٩]+$/, {
      message: "فقط عدد وارد کنید",
      excludeEmptyString: true,
    })
    .test(
      "phone-length",
      "شماره تماس باید بین ۷ تا ۲۰ رقم باشد",
      (value) => !value || (value.length >= 7 && value.length <= 20)
    ),

  address: yup.string().trim().defined(),

  duration: yup
    .number()
    .oneOf(durations, "مدت نوبت معتبر نیست")
    .required("مدت هر نوبت را انتخاب کنید"),

  deadline: yup
    .number()
    .oneOf(deadlines, "مهلت لغو معتبر نیست")
    .required("مهلت لغو را انتخاب کنید"),

  days: yup.array().of(daySchema).required().min(7),
});

const fieldClass =
  "mt-2 h-[46px] w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b6e75] focus:ring-2 focus:ring-[#0b6e75]/20";

function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute start-3 top-1/2 mt-1 -translate-y-1/2 text-slate-500"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SettingsFormValues>({
    resolver: yupResolver(settingsSchema),
    mode: "onChange",
    defaultValues: {
      doctorName: "",
      phone: "",
      address: "",
      duration: 30,
      deadline: 2,
      days: initialDays,
    },
  });

  const days = useWatch({
    control,
    name: "days",
  });

  const handleSave = async (data: SettingsFormValues) => {
    if (saving) return;

    setSaving(true);

    console.log(data);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setSaving(false);
    setSaved(true);

    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col bg-[#f1f5f9] text-right md:flex-row"
    >
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <form onSubmit={handleSubmit(handleSave)}>
          <div className="mx-auto max-w-[1100px]">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-[28px]">
                تنظیمات
              </h1>

              <button
                type="submit"
                disabled={!isValid || saving}
                className="h-[46px] min-w-[77px] rounded-xl bg-[#0b6e75] px-6 text-sm font-bold text-white transition hover:bg-[#095a60] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "در حال ذخیره..." : saved ? "ذخیره شد" : "ذخیره"}
              </button>
            </div>

            <div className="mt-6 grid items-start gap-5 lg:grid-cols-2 lg:gap-6">
              <div className="space-y-5 lg:space-y-6">
                <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    اطلاعات مطب
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div>
                      <label
                        htmlFor="doctor-name"
                        className="text-xs font-bold text-slate-900 sm:text-sm"
                      >
                        نام پزشک و تخصص
                      </label>

                      <input
                        id="doctor-name"
                        type="text"
                        placeholder="دکتر سارا کریمی، متخصص پوست و مو"
                        {...register("doctorName", {
                          onChange: () => setSaved(false),
                        })}
                        className={`${fieldClass} ${
                          errors.doctorName
                            ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                            : ""
                        }`}
                      />

                      {errors.doctorName && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.doctorName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="clinic-phone"
                        className="text-xs font-bold text-slate-900 sm:text-sm"
                      >
                        تلفن مطب
                      </label>

                      <Controller
                        name="phone"
                        control={control}
                        render={({ field }) => (
                          <input
                            id="clinic-phone"
                            type="tel"
                            inputMode="numeric"
                            value={field.value}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(
                                /[^0-9۰-۹٠-٩]/g,
                                ""
                              );

                              field.onChange(numericValue);
                              setSaved(false);
                            }}
                            onBlur={field.onBlur}
                            placeholder="۰۲۱۸۸۷۷۶۶۵۵"
                            className={`${fieldClass} ${
                              errors.phone
                                ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                                : ""
                            }`}
                          />
                        )}
                      />

                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="clinic-address"
                        className="text-xs font-bold text-slate-900 sm:text-sm"
                      >
                        آدرس
                      </label>

                      <input
                        id="clinic-address"
                        type="text"
                        placeholder="تهران، خیابان ولیعصر، پلاک ۱۲"
                        {...register("address", {
                          onChange: () => setSaved(false),
                        })}
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                  <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                    قوانین نوبت
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="duration"
                        className="text-xs font-bold text-slate-900 sm:text-sm"
                      >
                        مدت هر نوبت
                      </label>

                      <div className="relative">
                        <select
                          id="duration"
                          {...register("duration", {
                            valueAsNumber: true,
                            onChange: () => setSaved(false),
                          })}
                          className={`${fieldClass} appearance-none ps-9`}
                        >
                          {durations.map((item) => (
                            <option key={item} value={item}>
                              {toFa(item)} دقیقه
                            </option>
                          ))}
                        </select>

                        <Chevron />
                      </div>

                      {errors.duration && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.duration.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="deadline"
                        className="text-xs font-bold text-slate-900 sm:text-sm"
                      >
                        مهلت لغو
                      </label>

                      <div className="relative">
                        <select
                          id="deadline"
                          {...register("deadline", {
                            valueAsNumber: true,
                            onChange: () => setSaved(false),
                          })}
                          className={`${fieldClass} appearance-none ps-9`}
                        >
                          {deadlines.map((item) => (
                            <option key={item} value={item}>
                              {toFa(item)} ساعت قبل
                            </option>
                          ))}
                        </select>

                        <Chevron />
                      </div>

                      {errors.deadline && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.deadline.message}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              </div>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  ساعت کاری هفتگی
                </h2>

                <ul className="mt-4">
                  {days?.map((day, index) => (
                    <li
                      key={day.name}
                      className="flex items-center justify-between gap-3 border-t border-slate-200 py-3"
                    >
                      <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-900">
                        <Controller
                          name={`days.${index}.enabled`}
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => {
                                field.onChange(e.target.checked);
                                setSaved(false);
                              }}
                              className="size-5 cursor-pointer rounded accent-[#0b6e75]"
                            />
                          )}
                        />

                        {day.name}
                      </label>

                      <div
                        className={`flex items-center gap-2 transition ${
                          day.enabled ? "" : "opacity-50"
                        }`}
                      >
                        <Controller
                          name={`days.${index}.from`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <input
                              type="text"
                              inputMode="numeric"
                              dir="ltr"
                              disabled={!day.enabled}
                              value={toFa(field.value)}
                              onChange={(e) => {
                                field.onChange(toEnTime(e.target.value));
                                setSaved(false);
                              }}
                              onBlur={() => {
                                field.onChange(formatTime(field.value));
                                field.onBlur();
                              }}
                              aria-label={`ساعت شروع ${day.name}`}
                              aria-invalid={fieldState.invalid}
                              title={fieldState.error?.message}
                              className={`h-10 w-16 rounded-xl border bg-white text-center text-xs text-slate-900 outline-none transition focus:ring-2 sm:w-[72px] sm:text-sm ${
                                fieldState.invalid
                                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                                  : "border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20"
                              }`}
                            />
                          )}
                        />

                        <span className="text-sm text-slate-500">تا</span>

                        <Controller
                          name={`days.${index}.to`}
                          control={control}
                          render={({ field, fieldState }) => (
                            <input
                              type="text"
                              inputMode="numeric"
                              dir="ltr"
                              disabled={!day.enabled}
                              value={toFa(field.value)}
                              onChange={(e) => {
                                field.onChange(toEnTime(e.target.value));
                                setSaved(false);
                              }}
                              onBlur={() => {
                                field.onChange(formatTime(field.value));
                                field.onBlur();
                              }}
                              aria-label={`ساعت پایان ${day.name}`}
                              aria-invalid={fieldState.invalid}
                              title={fieldState.error?.message}
                              className={`h-10 w-16 rounded-xl border bg-white text-center text-xs text-slate-900 outline-none transition focus:ring-2 sm:w-[72px] sm:text-sm ${
                                fieldState.invalid
                                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                                  : "border-slate-300 focus:border-[#0b6e75] focus:ring-[#0b6e75]/20"
                              }`}
                            />
                          )}
                        />
                      </div>
                    </li>
                  ))}
                </ul>

                {errors.days && (
                  <p className="mt-3 text-xs text-red-600">
                    ساعت شروع و پایان روزهای فعال را صحیح وارد کنید. ساعت پایان
                    باید بعد از ساعت شروع باشد.
                  </p>
                )}
              </section>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}