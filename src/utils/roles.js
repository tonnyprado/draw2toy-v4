export function isAdmin(user) {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();

  // 1) truco rápido para dev
  if (email.includes("+admin")) return true;

  // 2) whitelist por ENV
  const list = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email);
}
