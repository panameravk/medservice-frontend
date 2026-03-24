"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Switch } from "../../../components/ui/Switch";

interface Channel {
  id: string;
  label: string;
  icon: string;
  comingSoon: boolean;
  enabled: boolean;
}

const STORAGE_KEY = "mailing_channels";

const DEFAULT_CHANNELS: Channel[] = [
  {
    id: "email",
    label: "Email",
    icon: "/Icons/social-media/email.svg",
    comingSoon: false,
    enabled: true,
  },
  {
    id: "sms",
    label: "SMS",
    icon: "/Icons/social-media/sms.svg",
    comingSoon: false,
    enabled: true,
  },
  {
    id: "telegram",
    label: "Telegram Personal",
    icon: "/Icons/social-media/telegram.svg",
    comingSoon: true,
    enabled: false,
  },
  {
    id: "max",
    label: "MAX",
    icon: "/Icons/social-media/MAX.svg",
    comingSoon: true,
    enabled: false,
  },
  {
    id: "vk",
    label: "VK Messenger",
    icon: "/Icons/social-media/VK.svg",
    comingSoon: true,
    enabled: false,
  },
];

function loadChannels(): Channel[] {
  if (typeof window === "undefined") return DEFAULT_CHANNELS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CHANNELS;
    // Merge saved enabled state with current DEFAULT_CHANNELS
    // (so new channels or icon paths always come from DEFAULT_CHANNELS)
    const saved: { id: string; enabled: boolean }[] = JSON.parse(raw);
    return DEFAULT_CHANNELS.map((c) => {
      const s = saved.find((x) => x.id === c.id);
      return s ? { ...c, enabled: s.enabled } : c;
    });
  } catch {
    return DEFAULT_CHANNELS;
  }
}

function saveChannels(channels: Channel[]) {
  // Save only id + enabled — icon paths always come from DEFAULT_CHANNELS
  const minimal = channels.map(({ id, enabled }) => ({ id, enabled }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
}

export default function MailingsSettingsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    setChannels(loadChannels());
  }, []);

  const toggle = (id: string) => {
    const next = channels.map((c) =>
      c.id === id && !c.comingSoon ? { ...c, enabled: !c.enabled } : c
    );
    setChannels(next);
    saveChannels(next);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="grid grid-cols-[1fr_80px] mb-4 text-[13px] font-medium text-[#6B7280]">
        <span>Канал</span>
        <span>Статус</span>
      </div>

      <div className="space-y-1">
        {channels.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[1fr_80px] items-center py-3"
          >
            {/* Channel name + icon */}
            <div className="flex items-center gap-3">
              <Image
                src={c.icon}
                alt={c.label}
                width={22}
                height={22}
                className="shrink-0"
              />
              <span className="text-[14px] font-medium text-[#111827]">
                {c.label}
              </span>
              {c.comingSoon && (
                <span className="rounded-[6px] bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#6B7280]">
                  скоро
                </span>
              )}
            </div>

            {/* Toggle */}
            <Switch
              checked={c.enabled}
              onChange={() => toggle(c.id)}
              disabled={c.comingSoon}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
