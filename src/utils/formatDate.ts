export function formatDate(isoString: string | Date | null | undefined): string {
  if (!isoString) return "-"; // hoặc "" tuỳ bạn muốn hiển thị gì

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "-"; // check invalid date

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}