const workingHours = [
  { day: "شنبه تا سه‌شنبه", time: "۱۶:۰۰ تا ۲۱:۰۰" },
  { day: "چهارشنبه", time: "۰۹:۰۰ تا ۱۳:۰۰" },
  { day: "پنجشنبه و جمعه", time: "تعطیل" },
];

export default function DoctorPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-white text-right">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1096px] items-center justify-between gap-3 px-4 sm:h-[70px]">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-6 text-slate-900 sm:text-base">
              دکتر سارا کریمی
            </p>
            <p className="truncate text-xs text-slate-500">
              متخصص پوست، مو و زیبایی
            </p>
          </div>
          <button
            type="button"
            className="h-10 shrink-0 rounded-xl border border-slate-300 bg-white px-4 text-xs font-bold text-slate-900 transition hover:bg-slate-50 sm:h-[46px] sm:px-5 sm:text-sm"
          >
            پیگیری نوبت
          </button>
        </div>
      </header>

      <main className="bg-[#f1f5f9] py-10 sm:py-14 md:py-[60px]">
        <div className="mx-auto max-w-[1096px] px-4">
          <section>
            <h1 className="text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              دکتر سارا کریمی
            </h1>
            <h2 className="mt-3 text-lg font-bold text-slate-600 sm:mt-4 sm:text-xl md:text-2xl">
              متخصص پوست، مو و زیبایی
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 sm:mt-5 sm:text-base sm:leading-8">
              نوبت خود را آنلاین و بدون تماس تلفنی رزرو کنید. تأیید نوبت با
              پیامک برایتان ارسال می‌شود.
            </p>
            <button
              type="button"
              className="mt-6 h-12 w-full rounded-2xl bg-[#0b6e75] px-9 text-base font-bold text-white transition hover:bg-[#095a60] sm:mt-8 sm:h-[54px] sm:w-auto"
            >
              دریافت نوبت
            </button>
          </section>

          <section className="mt-10 grid gap-4 sm:mt-12 sm:gap-5 md:grid-cols-[1.1fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                ساعت کاری
              </h3>
              <ul className="mt-4 sm:mt-5">
                {workingHours.map((item) => (
                  <li
                    key={item.day}
                    className="flex items-center justify-between gap-3 border-t border-slate-200 py-3 text-sm sm:py-3.5"
                  >
                    <span className="text-slate-500">{item.day}</span>
                    <span className="font-bold text-slate-900">
                      {item.time}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6">
              <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                آدرس و تماس
              </h3>
              <p className="mt-4 text-base font-bold text-slate-900 sm:mt-5">
                [آدرس کامل مطب]
              </p>
              <p className="mt-2 text-sm text-slate-500">[شماره تماس مطب]</p>
              <button
                type="button"
                className="mt-5 h-11 w-full rounded-xl border border-slate-300 bg-white px-6 text-sm font-bold text-slate-900 transition hover:bg-slate-50 sm:h-[46px] sm:w-auto"
              >
                مسیریابی
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}