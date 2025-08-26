export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div>© {new Date().getFullYear()} draw2toy</div>
      <div style={styles.links}>
        <a href="#" aria-label="Instagram">Instagram</a>
        <a href="#" aria-label="TikTok">TikTok</a>
        <a href="#" aria-label="YouTube">YouTube</a>
        <a href="#" aria-label="Facebook">Facebook</a>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    marginTop: 24,
    padding: "16px 12px",
    borderTop: "1px solid #eee",
    display: "flex",
    gap: 12,
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  links: { display: "flex", gap: 12 },
};
