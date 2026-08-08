"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminAuthApi, getAccessToken } from "../lib/api";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verify = async () => {
      const token = getAccessToken("admin");

      if (!token) {
        adminAuthApi.logout();
        router.replace("/admin/login");
        return;
      }

      try {
        const user = await adminAuthApi.me();
        if (cancelled) return;

        if (!user.isSuperuser) {
          adminAuthApi.logout();
          router.replace("/admin/login");
          return;
        }

        setReady(true);
      } catch {
        if (cancelled) return;
        adminAuthApi.logout();
        router.replace("/admin/login");
      }
    };

    void verify();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#6B7280]">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
