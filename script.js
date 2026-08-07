const themeToggle = document.querySelector("#theme-toggle");
const root = document.documentElement;
const liveRegion = document.querySelector("#live-region");
const promptLabel = document.querySelector("#prompt-label");
const promptText = document.querySelector("#prompt-text");
const promptCopy = document.querySelector("#prompt-copy");
const progressLine = document.querySelector("#progress-line");

const prompts = {
  scope: {
    label: "scope boundary",
    text: "แก้เฉพาะ scope นี้ ห้าม refactor นอกนั้น\nถ้าพบสิ่งที่ต้องขยาย scope ให้หยุด\nและสรุปผลกระทบก่อน",
  },
  evidence: {
    label: "evidence first",
    text: "ก่อนแก้ ให้ reproduce ปัญหา\nอ่าน fail path และระบุสมมติฐาน\nห้ามเดาจาก error message อย่างเดียว",
  },
  handoff: {
    label: "safe handoff",
    text: "รัน test ที่เกี่ยวข้องและ git diff --check\nสรุปไฟล์ที่เปลี่ยน วิธีตรวจ และความเสี่ยง\nอย่า commit หรือ push จนกว่าจะอนุมัติ",
  },
};

function announce(message) {
  if (!liveRegion) return;
  liveRegion.textContent = "";
  window.setTimeout(() => { liveRegion.textContent = message; }, 20);
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isLight = theme === "light";
  themeToggle?.setAttribute("aria-pressed", String(isLight));
  const label = themeToggle?.querySelector(".theme-label");
  if (label) label.textContent = isLight ? "Dark" : "Light";
  localStorage.setItem("cursor-guide-theme", theme);
}

const savedTheme = localStorage.getItem("cursor-guide-theme");
if (savedTheme === "light" || savedTheme === "dark") applyTheme(savedTheme);

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
  applyTheme(nextTheme);
  announce(`เปลี่ยนเป็นธีม${nextTheme === "light" ? "สว่าง" : "มืด"}`);
});

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const original = button.textContent;
    button.textContent = "คัดลอกแล้ว ✓";
    announce("คัดลอกข้อความแล้ว");
    window.setTimeout(() => { button.textContent = original; }, 1500);
  } catch {
    announce("คัดลอกไม่สำเร็จ กรุณาเลือกข้อความด้วยตัวเอง");
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => copyText(button.dataset.copy, button));
});

promptCopy?.addEventListener("click", () => copyText(promptText.textContent, promptCopy));

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const prompt = prompts[chip.dataset.prompt];
    if (!prompt) return;
    document.querySelectorAll(".prompt-chip").forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    promptLabel.textContent = prompt.label;
    promptText.textContent = prompt.text;
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const railLinks = [...document.querySelectorAll("[data-section]")];

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    railLinks.forEach((link) => {
      link.toggleAttribute("aria-current", link.dataset.section === entry.target.id);
    });
  });
}, { rootMargin: "-30% 0px -55% 0px", threshold: 0 });

sections.forEach((section) => observer.observe(section));

function updateProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percentage = scrollable > 0 ? Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100)) : 0;
  if (progressLine) progressLine.style.height = `${percentage}%`;
}

window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();
