"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, getAccessToken } from "../lib/api";
import { useBranchesStore } from "../lib/branchesStore";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const resetBranchesStore = useBranchesStore((s) => s.reset);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const verifyAuth = async () => {
      const token = getAccessToken();

      if (!token) {
        authApi.logout();
        resetBranchesStore();
        router.replace("/login");
        return;
      }

      try {
        await authApi.me();

        if (cancelled) return;
        setReady(true);
      } catch {
        if (cancelled) return;

        authApi.logout();
        resetBranchesStore();
        router.replace("/login");
      }
    };

    void verifyAuth();

    return () => {
      cancelled = true;
    };
  }, [resetBranchesStore, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#6B7280]">
        Загрузка...
      </div>
    );
  }

  return <>{children}</>;
}
