// Set current year in the footer
document.getElementById("year").textContent = new Date().getFullYear();

// Highlight the nav link for the section currently in view
const links = document.querySelectorAll(".site-header nav a");
const sections = [...links].map((a) => document.querySelector(a.getAttribute("href")));

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => {
        a.style.color = a.getAttribute("href") === `#${entry.target.id}` ? "var(--text)" : "";
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((s) => s && observer.observe(s));
