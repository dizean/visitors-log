export function VisitorAvatar({
  name,
  imagePath,
}: {
  name: string;
  imagePath: string | null;
}) {
  const initial = name
    ?.trim()
    .charAt(0)
    .toUpperCase();

  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={name}
        className="size-11 shrink-0 rounded-full border object-cover"
      />
    );
  }

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#0140b2]/10 text-sm font-bold text-[#0140b2]">
      {initial || "?"}
    </div>
  );
}