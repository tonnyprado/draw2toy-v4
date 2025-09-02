export default function Footer() {
  return (
    <footer className="footer">
        <div>© {new Date().getFullYear()} draw2toy</div>
        <div className="footer-links">
            <a href="#">Instagram</a><a href="#">TikTok</a><a href="#">YouTube</a><a href="#">Facebook</a>
        </div>
    </footer>
  );
}
