"use client";

export function AdminHeader() {
  return (
    <div className="px-5 pt-5">
      <div className="relative">
        <div className="flex h-[56px] items-center rounded-[14px] border border-[#E6E6E6] bg-white px-4 text-[15px] text-[#2F2F37] shadow-[0_1px_0_rgba(0,0,0,0.02)]">
          Администраторский аккаунт
        </div>

        <div className="absolute right-[6px] top-[4px]">
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
