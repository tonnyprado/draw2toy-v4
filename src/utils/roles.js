export function isAdmin(user) {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();
  if (email.includes("+admin")) return true;
  const list = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email);
}

export function isDigitalDesigner(user) {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();
  if (email.includes("+digital")) return true;
  const list = (import.meta.env.VITE_DESIGNERS_DIGITAL || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email);
}

export function isPatternDesigner(user) {
  if (!user?.email) return false;
  const email = user.email.toLowerCase();
  if (email.includes("+pattern")) return true;
  const list = (import.meta.env.VITE_DESIGNERS_PATTERN || "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  return list.includes(email);
}

export function isAnyDesigner(user) {
  return isDigitalDesigner(user) || isPatternDesigner(user);
}
