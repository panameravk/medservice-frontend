"use client";

export function AdminHeader() {
<<<<<<< Updated upstream
=======
  const router = useRouter();
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void adminAccountApi
      .getMe()
      .then(setAccount)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const handleAccount = () => {
    setOpen(false);
    router.push("/admin/account");
  };

  const handleLogout = () => {
    adminAuthApi.logout();
    authApi.logout();
    router.push("/login");
  };

>>>>>>> Stashed changes
  return (
    <div className="px-6 pt-5">
      <div className="relative">
        <div className="flex h-[56px] items-center rounded-[14px] border border-[#E6E6E6] bg-white px-4 text-[15px] text-[#2F2F37] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          Администраторский аккаунт
        </div>

<<<<<<< Updated upstream
        <div className="absolute right-[6px] top-[4px]">
=======
        <div ref={containerRef} className="absolute right-[6px] top-[4px]">
>>>>>>> Stashed changes
          <button
            type="button"
            className="h-[48px] w-[190px] rounded-[10px] border border-[#E5E7EB] bg-[#2B2E39] px-5 text-[14px] font-medium text-white shadow-[0_6px_18px_rgba(17,24,39,0.08)]"
          >
            Сергей П.
          </button>
        </div>
      </div>
    </div>
  );
}
