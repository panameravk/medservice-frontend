"use client";

import Image from "next/image";
import { useState } from "react";
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

    const saved = JSON.parse(raw) as Array<{ id: string; enabled: boolean }>;

    return DEFAULT_CHANNELS.map((channel) => {
      const persisted = saved.find((item) => item.id === channel.id);
      return persisted ? { ...channel, enabled: persisted.enabled } : channel;
    });
  } catch {
    return DEFAULT_CHANNELS;
  }
}

function saveChannels(channels: Channel[]) {
  if (typeof window === "undefined") return;

  const minimal = channels.map(({ id, enabled }) => ({ id, enabled }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
}

export default function MailingsSettingsPage() {
  const [channels, setChannels] = useState<Channel[]>(() => loadChannels());

  const toggle = (id: string) => {
    const next = channels.map((channel) =>
      channel.id === id && !channel.comingSoon
        ? { ...channel, enabled: !channel.enabled }
        : channel
    );

    setChannels(next);
    saveChannels(next);
  };

  return (
    <div className="p-6">
      <div className="mb-4 grid grid-cols-[1fr_80px] text-[13px] font-medium text-[#6B7280]">
        <span>Канал</span>
        <span>Статус</span>
      </div>

      <div className="space-y-1">
        {channels.map((channel) => (
          <div
            key={channel.id}
            className="grid grid-cols-[1fr_80px] items-center py-3"
          >
            <div className="flex items-center gap-3">
              <Image
                src={channel.icon}
                alt={channel.label}
                width={22}
                height={22}
                className="shrink-0"
              />
              <span className="text-[14px] font-medium text-[#111827]">
                {channel.label}
              </span>
              {channel.comingSoon && (
                <span className="rounded-[6px] bg-[#F3F4F6] px-2 py-0.5 text-[11px] text-[#6B7280]">
                  скоро
                </span>
              )}
            </div>

            <Switch
              checked={channel.enabled}
              onChange={() => toggle(channel.id)}
              disabled={channel.comingSoon}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
