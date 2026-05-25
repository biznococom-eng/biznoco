/**
 * Danh sách email có quyền admin.
 * Để thêm admin mới: thêm email vào array này và deploy.
 */
export const ADMIN_EMAILS = [
  "chuongchudu@gmail.com",
  "biznoco.com@gmail.com",
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
