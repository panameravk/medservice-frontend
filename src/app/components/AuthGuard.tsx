"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken, authApi } from "../lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    authApi
      .me()
      .then(() => {
        setReady(true);
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router, pathname]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-[#6B7280]">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
