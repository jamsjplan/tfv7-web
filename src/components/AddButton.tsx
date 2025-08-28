"use client";
type Props = { onClick: () => void; disabled?: boolean };

export default function AddButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center justify-center rounded-xl h-20 w-full text-[#fc844f] cursor-pointer bg-white shadow border-2 border-transparent hover:border-[#fc844f] transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-3xl font-bold leading-none">＋</span>
      <span className="mt-1 text-xs">車両を追加</span>
    </button>
  );
}
