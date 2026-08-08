"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Branch changes intentionally reset and reload request data. */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getRequests,
  type ReviewRequest,
  type RequestStatus,
} from "../../../lib/api";
import { useBranchesStore } from "../../../lib/branchesStore";

const STATUS_TABS: { label: string; value: RequestStatus | undefined }[] = [
  { label: "Все запросы", value: undefined },
  { label: "Отзыв опубликован", value: "published" },
  { label: "Перешел на сайт отзывов", value: "visited" },
  { label: "Поставил оценку", value: "rated" },
  { label: "Открыл ссылку", value: "opened" },
  { label: "Запрос отправлен", value: "sent" },
  { label: "Жалоба", value: "complaint" },
];

const STATUS_META: Record<
  string,
  {
    label: string;
    color: string;
    progress: number;
  }
> = {
  published: {
    label: "Отзыв опубликован",
    color: "#1ED12F",
    progress: 1,
  },
  visited: {
    label: "Перешел на сайт отзывов",
    color: "#E6D100",
    progress: 0.78,
  },
  rated: {
    label: "Поставил оценку",
    color: "#FF8A2A",
    progress: 0.56,
  },
  opened: {
    label: "Открыл ссылку",
    color: "#9B9B9B",
    progress: 0.38,
  },
  sent: {
    label: "Запрос отправлен",
    color: "#D9D9D9",
    progress: 0,
  },
  complaint: {
    label: "Жалоба",
    color: "#FF1E1E",
    progress: 1,
  },
};

const PLATFORM_META: Record<
  string,
  {
    label: string;
    icon?: string;
  }
> = {
  yandex_maps: {
    label: "Яндекс.Карты",
    icon: "/Icons/platforms/yandex-maps-logo.svg",
  },
  google_maps: {
    label: "Google Maps",
    icon: "/Icons/platforms/google-maps-sign-logo.svg",
  },
  "2gis": {
    label: "2Gis",
    icon: "/Icons/platforms/2gis-icon-logo.svg",
  },
  prodoctorov: {
    label: "ПроДокторов",
    icon: "/Icons/platforms/prodoktorov.svg",
  },
  napopravku: {
    label: "НаПоправку",
    icon: "/Icons/platforms/napopravku.svg",
  },
};

function ProgressRing({
  color,
  progress,
  size = 18,
  stroke = 4,
}: {
  color: string;
  progress: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, progress));
  const dashOffset = circumference * (1 - clamped);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#E5E5E5"
        strokeWidth={stroke}
      />
      {clamped > 0 ? (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      ) : null}
    </svg>
  );
}

function StatusIndicator({
  status,
  rating,
}: {
  status: RequestStatus | null;
  rating?: number | null;
}) {
  if (!status) {
    return <span className="text-[#B8B8B8]">—</span>;
  }

  const meta = STATUS_META[status] ?? {
    label: status,
    color: "#D9D9D9",
    progress: 0,
  };

  const showScore =
    typeof rating === "number" &&
    status !== "sent" &&
    status !== "opened" &&
    rating > 0;

  return (
    <div className="flex items-center gap-[4px]">
      <ProgressRing color={meta.color} progress={meta.progress} />
      {showScore ? (
        <span className="inline-flex h-[16px] min-w-[16px] items-center justify-center rounded-[3px] border border-[#E7E7E7] bg-white px-[3px] text-[10px] leading-none text-[#B4B4B4]">
          {rating}
        </span>
      ) : null}
    </div>
  );
}

function PlatformBadge({ request }: { request: ReviewRequest }) {
  const reviewUrl = request.reviewUrl ?? "";

  if (request.platform === "complaint") {
    return (
      <Link
        href="/reviews-and-requests/intercepted-complaints"
        title="Открыть перехваченные жалобы"
        className="inline-flex h-[24px] items-center gap-[7px] rounded-[4px] bg-white px-[10px] text-[11px] font-medium text-[#111111] transition-colors hover:bg-[#F2F2F2]"
      >
        <span className="text-[#FF1E1E]">⚡</span>
        <span>Жалоба</span>
        <span aria-hidden>↗</span>
      </Link>
    );
  }

  if (!request.platform) {
    return <span className="text-[#B8B8B8]">—</span>;
  }

  const meta = PLATFORM_META[request.platform];
  if (!meta) {
    return <span className="text-[#B8B8B8]">—</span>;
  }

  // Отзыв опубликован и у нас есть ссылка на него в картах — явная кнопка,
  // ведёт прямо на отзыв на площадке.
  if (reviewUrl) {
    return (
      <a
        href={reviewUrl}
        target="_blank"
        rel="noreferrer"
        title={`Открыть отзыв на ${meta.label}`}
        className="inline-flex h-[24px] items-center gap-[6px] rounded-[4px] bg-white px-[10px] text-[11px] font-medium text-[#111111] transition-colors hover:bg-[#F2F2F2]"
      >
        {meta.icon ? (
          <img src={meta.icon} alt="" className="h-[14px] w-[14px] shrink-0" />
        ) : null}
        <span>Читать отзыв</span>
        <span aria-hidden>↗</span>
      </a>
    );
  }

  // Платформа известна, но ссылки на опубликованный отзыв ещё нет.
  return (
    <span className="inline-flex h-[24px] items-center gap-[7px] rounded-[4px] border border-[#E7E7E7] bg-white px-[10px] text-[11px] text-[#9B9B9B]">
      {meta.icon ? (
        <img src={meta.icon} alt="" className="h-[14px] w-[14px] shrink-0" />
      ) : null}
      <span>{meta.label}</span>
    </span>
  );
}

function FilterChip({
  label,
  active,
  status,
  onClick,
}: {
  label: string;
  active: boolean;
  status?: RequestStatus;
  onClick: () => void;
}) {
  const meta = status ? STATUS_META[status] : null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-[28px] items-center gap-[6px] rounded-[6px] border px-[9px] text-[11px] transition-colors",
        active
          ? "border-[#111111] bg-[#111111] text-white"
          : "border-[#E7E7E7] bg-white text-[#B7B7B7] hover:bg-[#FAFAFA]",
      ].join(" ")}
    >
      {meta ? (
        <ProgressRing
          color={meta.color}
          progress={meta.progress}
          size={16}
          stroke={4}
        />
      ) : null}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
}

export default function RequestStatusPage() {
  const selectedBranchId = useBranchesStore((s) => s.selectedBranchId);

  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | undefined>(
    undefined
  );

  const isLoading = loading || !selectedBranchId;

  useEffect(() => {
    if (!selectedBranchId) {
      setRequests([]);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadRequests = async () => {
      try {
        setError(null);
        setLoading(true);

        const response = await getRequests({
          branchId: selectedBranchId,
          status: statusFilter,
        });

        if (cancelled) return;
        setRequests(response.requests);
      } catch {
        if (cancelled) return;
        // Не очищаем список при смене фильтра — так контейнер/строки не "прыгают"
        setError("Не удалось загрузить запросы");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRequests();

    return () => {
      cancelled = true;
    };
  }, [selectedBranchId, statusFilter]);

  return (
    <div className="min-h-[420px] p-4">
      <div className="border-b border-[#E5E5E5] pb-3">
        <div className="text-[12px] font-medium text-[#111111]">
          Статус запроса
        </div>

        <div className="mt-2 flex items-center gap-[6px] overflow-x-auto whitespace-nowrap">
          {STATUS_TABS.map((tab) => (
            <FilterChip
              key={tab.label}
              label={tab.label}
              status={tab.value}
              active={statusFilter === tab.value}
              onClick={() => setStatusFilter(tab.value)}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-[12px] border border-[#E5E5E5] bg-white">
        <div className="grid grid-cols-[64px_1.5fr_170px_150px_210px] gap-3 px-4 py-3 text-[12px] font-medium text-[#111111]">
          <div>Статус</div>
          <div>Имя</div>
          <div>Телефон</div>
          <div>Дата запроса</div>
          <div>Читать отзыв</div>
        </div>

        <div className="relative">
          {loading && requests.length > 0 && (
            <div className="absolute inset-0 z-10 bg-white/55 backdrop-blur-[1px]" />
          )}

          <div className="divide-y divide-[#EEEEEE]">
            {isLoading && requests.length === 0 ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div
                key={index}
                className="grid grid-cols-[64px_1.5fr_170px_150px_210px] gap-3 px-4 py-3"
              >
                <div className="h-4 w-8 rounded bg-black/5" />
                <div className="h-4 w-40 rounded bg-black/5" />
                <div className="h-4 w-28 rounded bg-black/5" />
                <div className="h-4 w-20 rounded bg-black/5" />
                <div className="h-6 w-24 rounded bg-black/5" />
              </div>
            ))
            ) : error ? (
            <div className="px-4 py-6 text-sm text-red-500">{error}</div>
            ) : requests.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#9CA3AF]">
              Нет запросов по выбранному фильтру
            </div>
            ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="grid grid-cols-[64px_1.5fr_170px_150px_210px] gap-3 px-4 py-3 text-[12px] text-[#3D3D3D]"
              >
                <div className="flex items-center">
                  <StatusIndicator
                    status={request.status}
                    rating={request.rating ?? null}
                  />
                </div>

                <div className="flex items-center">{request.clientName}</div>

                <div className="flex items-center">{request.clientPhone}</div>

                <div className="flex items-center text-[#9D9D9D]">
                  {new Date(request.sentAt).toLocaleDateString("ru-RU", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </div>

                <div className="flex items-center">
                  <PlatformBadge request={request} />
                </div>
              </div>
            ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
