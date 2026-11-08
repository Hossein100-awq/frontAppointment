"use client";

import { useState } from "react";
import Sidebar from "./../../../component/SideBar";
import NumberModal, { NewPatient } from "./../../../component/NumberModal";

type Status = "done" | "waiting" | "cancelled";

type Appointment = {
  id: number;
  time: string;
  patient: string;
  phone: string;
  nationalCode?: string;
  status: Status;
};

const faDigits = "۰۱۲۳۴۵۶۷۸۹";

const toFa = (value: string | number) =>
  String(value).replace(/\d/g, (d) => faDigits[Number(d)]);

const formatPhone = (phone: string) =>
  `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;

const initialAppointments: Appointment[] = [
  { id: 1, time: "16:00", patient: "مریم احمدی", phone: "0912 000 0000", status: "done" },
  { id: 2, time: "16:30", patient: "علی رضوی", phone: "0912 000 0000", status: "done" },
  { id: 3, time: "17:00", patient: "نرگس حسینی", phone: "0912 000 0000", status: "waiting" },
  { id: 4, time: "17:30", patient: "رضا کاظمی", phone: "0912 000 0000", status: "waiting" },
  { id: 5, time: "19:00", patient: "حسین نوری", phone: "0912 000 0000", status: "cancelled" },
];

const statusConfig: Record<Status, { label: string; className: string }> = {
  done: { label: "ویزیت شد", className: "bg-slate-100 text-slate-600" },
  waiting: { label: "منتظر", className: "bg-[#e1f0f1] text-[#0b6e75]" },
  cancelled: { label: "لغو شد", className: "bg-red-100 text-red-700" },
};

function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

type ActionsProps = {
  appointment: Appointment;
  confirming: boolean;
  onAskCancel: () => void;
  onConfirm: () => void;
  onDismiss: () => void;
};

function Actions({
  appointment,
  confirming,
  onAskCancel,
  onConfirm,
  onDismiss,
}: ActionsProps) {
  if (appointment.status !== "waiting") return null;

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onConfirm}
          className="h-9 rounded-lg bg-red-600 px-3 text-xs font-bold text-white transition hover:bg-red-700"
        >
          بله، لغو
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          انصراف
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onAskCancel}
      className="h-10 min-w-[47px] rounded-xl border border-red-300 bg-white px-4 text-xs font-bold text-red-700 transition hover:bg-red-50"
    >
      لغو
    </button>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const cancelAppointment = (id: number) => {
    setAppointments((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "cancelled" } : item
      )
    );
    setConfirmId(null);
  };

  const addAppointment = (patient: NewPatient) => {
    setAppointments((current) => [
      ...current,
      {
        id: Date.now(),
        time: "—",
        patient: patient.name,
        phone: formatPhone(patient.phone),
        nationalCode: patient.nationalCode,
        status: "waiting",
      },
    ]);
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen flex-col bg-[#f1f5f9] text-right md:flex-row"
    >
      <Sidebar />

      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 sm:text-[28px]">
                نوبت‌های امروز
              </h1>
              <p className="mt-1.5 text-sm text-slate-500">
                شنبه {toFa(2)} آبان {toFa(1405)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="h-[46px] rounded-xl bg-[#0b6e75] px-6 text-sm font-bold text-white transition hover:bg-[#095a60]"
            >
              افزودن نوبت دستی
            </button>
          </div>

          <div className="mt-6 hidden overflow-hidden rounded-3xl border border-slate-200 bg-white md:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold text-slate-500">
                  <th className="px-6 py-3.5 text-start font-bold">ساعت</th>
                  <th className="px-6 py-3.5 text-start font-bold">بیمار</th>
                  <th className="px-6 py-3.5 text-start font-bold">موبایل</th>
                  <th className="px-6 py-3.5 text-start font-bold">وضعیت</th>
                  <th className="px-6 py-3.5 text-start font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((item) => (
                  <tr key={item.id} className="border-t border-slate-200">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {toFa(item.time)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {item.patient}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span dir="ltr" className="inline-block">
                        {toFa(item.phone)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="h-[62px] px-6 py-3">
                      <Actions
                        appointment={item}
                        confirming={confirmId === item.id}
                        onAskCancel={() => setConfirmId(item.id)}
                        onConfirm={() => cancelAppointment(item.id)}
                        onDismiss={() => setConfirmId(null)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {appointments.length === 0 && (
              <p className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
                امروز نوبتی ثبت نشده است.
              </p>
            )}
          </div>

          <ul className="mt-6 space-y-3 md:hidden">
            {appointments.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-900">
                      {toFa(item.time)}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.patient}
                    </span>
                  </div>
                  <StatusBadge status={item.status} />
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  <span dir="ltr" className="inline-block">
                    {toFa(item.phone)}
                  </span>
                </p>

                {item.status === "waiting" && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <Actions
                      appointment={item}
                      confirming={confirmId === item.id}
                      onAskCancel={() => setConfirmId(item.id)}
                      onConfirm={() => cancelAppointment(item.id)}
                      onDismiss={() => setConfirmId(null)}
                    />
                  </div>
                )}
              </li>
            ))}

            {appointments.length === 0 && (
              <li className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                امروز نوبتی ثبت نشده است.
              </li>
            )}
          </ul>
        </div>
      </main>

      <NumberModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addAppointment}
      />
    </div>
  );
}