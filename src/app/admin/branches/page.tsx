"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminSearchInput } from "../../components/admin/AdminSearchInput";
import { AdminShellCard } from "../../components/admin/AdminShellCard";
import { AdminSwitch } from "../../components/admin/AdminSwitch";
import { adminBranchesApi } from "../../lib/admin/api";
import type { AdminBranch } from "../../types/admin";

function SortIcon() {
  return (
    <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
      <path
        d="M4 1v14M4 1L1 4M4 1l3 3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 15V1m0 14-3-3m3 3 3-3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminBranchesPage() {
  const [items, setItems] = useState<AdminBranch[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    void adminBranchesApi.getAll().then(setItems);
  }, []);

  useEffect(() => {
    void adminBranchesApi.getAll(query).then(setItems);
  }, [query]);

  const rows = useMemo(() => items, [items]);

  const toggleStatus = async (id: number) => {
    const updated = await adminBranchesApi.toggleStatus(id);
    setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold leading-[32px] text-black">
            Филиалы
          </h1>
          <p className="mt-1 text-[14px] leading-[18px] text-[#6E6E73]">
            Список всех филиалов
          </p>
        </div>

        <AdminSearchInput
          value={query}
          onChange={setQuery}
          placeholder="Поиск по названию или ID"
        />
      </div>

      <AdminShellCard>
        <div className="grid grid-cols-[1.9fr_0.45fr_0.8fr_1.25fr_0.7fr_0.7fr] items-center border-b border-[#E6E6E6] pb-4 text-[13px] font-medium text-[#222222]">
          <div className="flex items-center gap-2">
            <SortIcon />
            Филиал
          </div>
          <div className="flex items-center gap-2">
            <SortIcon />
            ID
          </div>
          <div>Активность</div>
          <div>Основной контакт</div>
          <div>Пользователей</div>
          <div className="flex items-center gap-2">
            <SortIcon />
            Оплачено до
          </div>
        </div>

        <div className="divide-y divide-[#ECECEC]">
          {rows.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[1.9fr_0.45fr_0.8fr_1.25fr_0.7fr_0.7fr] items-center py-[14px]"
            >
              <div className="truncate pr-6 text-[16px] text-[#3A3A46] underline decoration-dotted underline-offset-4">
                {item.name}
              </div>

              <div className="text-[16px] text-[#3A3A46]">{item.publicId}</div>

              <div>
                <AdminSwitch
                  checked={item.isActive}
                  onChange={() => {
                    void toggleStatus(item.id);
                  }}
                />
              </div>

              <div className="truncate pr-4 text-[16px] text-[#3A3A46]">
                {item.primaryContact}
              </div>

              <div className="text-[16px] text-[#3A3A46]">
                {item.usersCount}
              </div>

              <div>
                <span className="inline-flex h-[22px] items-center rounded-[6px] bg-[#F2E3E3] px-2 text-[14px] text-[#4A4A4A]">
                  {item.paidUntil}
                </span>
              </div>
            </div>
          ))}
        </div>
      </AdminShellCard>
    </div>
  );
}
