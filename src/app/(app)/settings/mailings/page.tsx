"use client";

import { useState } from "react";
import { Switch } from "../../../components/ui/Switch";

type Channel = {
  key: string;
  label: string;
  icon: string;
  available: boolean; // false → «скоро», переключатель задизейблен
};

const CHANNELS: Channel[] = [
  { key: "email", label: "Email", icon: "✉️", available: true },
  { key: "sms", label: "SMS", icon: "💬", available: true },
  { key: "telegram", label: "Telegram Personal", icon: "✈️", available: false },
  { key: "max", label: "MAX", icon: "🟣", available: false },
  { key: "vk", label: "VK Messenger", icon: "🔵", available: false },
];

export default function MailingsPage() {
  // Каналы Email/SMS включены по умолчанию; переключатели — визуальные
  // (доставка запроса на отзыв сейчас идёт по кнопке «Запросить отзывы»).
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    email: true,
    sms: true,
  });

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-[12px] border border-[#E5E7EB]">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="text-left text-[12px] text-[#6B7280]">
              <th className="px-4 py-3">Канал</th>
              <th className="w-[120px] px-4 py-3">Статус</th>
            </tr>
          </thead>

          <tbody>
            {CHANNELS.map((channel) => (
              <tr key={channel.key} className="border-t border-[#E5E7EB]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 text-[14px] text-[#111827]">
                    <span aria-hidden className="text-[16px]">
                      {channel.icon}
                    </span>
                    <span>{channel.label}</span>
                    {!channel.available && (
                      <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#9CA3AF]">
                        скоро
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3">
                  <Switch
                    checked={channel.available ? !!enabled[channel.key] : false}
                    disabled={!channel.available}
                    onChange={(value) =>
                      setEnabled((prev) => ({ ...prev, [channel.key]: value }))
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
