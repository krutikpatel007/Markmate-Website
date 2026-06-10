const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const buyerTabs = document.querySelectorAll(".buyer-tab");
const buyerPanels = document.querySelectorAll(".buyer-content");
const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector(".form-status");
const salesEmail = "krutiksojitra210@gmail.com";

function renderIcons() {
  if (!window.lucide) return;

  document.querySelectorAll("[data-icon]").forEach((element) => {
    if (element.querySelector("svg")) return;
    const iconName = element.getAttribute("data-icon");
    const icon = document.createElement("i");
    icon.setAttribute("data-lucide", iconName);
    icon.setAttribute("aria-hidden", "true");
    element.prepend(icon);
  });

  window.lucide.createIcons();
}

function closeMenu() {
  document.body.classList.remove("menu-open");
  if (header) header.classList.remove("menu-active");
  if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
}

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-active");
    document.body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

buyerTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetId = tab.dataset.target;

    buyerTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    buyerPanels.forEach((panel) => {
      const isActive = panel.id === targetId;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  });
});

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();

  const formFields = leadForm.querySelector(".form-fields");
  const formSuccess = leadForm.querySelector("#formSuccess");
  const submittedEmailEl = leadForm.querySelector("#submittedEmail");
  const submitBtn = leadForm.querySelector('button[type="submit"]');

  // Disable button and show sending status
  submitBtn.disabled = true;
  const originalBtnContent = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Sending...';
  formStatus.style.color = "var(--muted)";
  formStatus.textContent = "Sending your enquiry...";

  const data = new FormData(leadForm);
  const payload = {
    Name: data.get("name"),
    Email: data.get("email"),
    Phone: data.get("phone") || "Not provided",
    Organization: data.get("organization"),
    BuyerType: data.get("buyerType"),
    Interest: data.get("interest"),
    Message: data.get("message") || "No extra message added."
  };

  fetch(`https://formsubmit.co/ajax/${salesEmail}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload)
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to send enquiry. Please check your internet connection.");
      }
      return response.json();
    })
    .then((result) => {
      // Hide form fields and display beautiful success container
      leadForm.classList.add("submitted");
      if (formFields) formFields.style.display = "none";
      if (formSuccess) {
        formSuccess.hidden = false;
        if (submittedEmailEl) {
          submittedEmailEl.textContent = data.get("email");
        }
      }
      formStatus.textContent = "";
      
      // Re-trigger Lucide icons render for the success check icon
      if (window.lucide) {
        window.lucide.createIcons();
      }
    })
    .catch((error) => {
      console.error("FormSubmit Error:", error);
      formStatus.style.color = "var(--coral)";
      formStatus.textContent = "Something went wrong. Please try again or email us directly at krutiksojitra210@gmail.com.";
      
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    });
  });
}

renderIcons();
initScrollReveal();
initAttendanceSimulator();

/* Intersection Observer for Scroll Reveal */
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length === 0) return;

  const observerOptions = {
    root: null,
    threshold: 0.1,
    rootMargin: "0px 0px -20px 0px"
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  reveals.forEach((element) => observer.observe(element));
}

/* Attendance Simulator Logic */
function initAttendanceSimulator() {
  const countPresentEl = document.getElementById("countPresent");
  const countLateEl = document.getElementById("countLate");
  const countAbsentEl = document.getElementById("countAbsent");
  const attendanceRateEl = document.getElementById("attendanceRate");
  const liveChartBarEl = document.getElementById("liveChartBar");

  if (!countPresentEl || !countLateEl || !countAbsentEl || !attendanceRateEl) return;

  // Mock states matching HTML active indicators
  // 0: Present (AC), 1: Present (SJ), 2: Late (MV), 3: Present (PP)
  const userStates = ["p", "p", "l", "p"];

  // Baseline data representing a large active company/college
  const basePresent = 1281;
  const baseLate = 45;
  const baseAbsent = 107;

  function updateStats() {
    let simP = 0, simL = 0, simA = 0;
    userStates.forEach((status) => {
      if (status === "p") simP++;
      else if (status === "l") simL++;
      else if (status === "a") simA++;
    });

    const totalPresent = basePresent + simP;
    const totalLate = baseLate + simL;
    const totalAbsent = baseAbsent + simA;
    const totalCount = totalPresent + totalLate + totalAbsent;
    const attendanceRate = ((totalPresent + totalLate) / totalCount * 100).toFixed(1);

    // Update stats text with comma grouping formatting
    countPresentEl.textContent = totalPresent.toLocaleString();
    countLateEl.textContent = totalLate.toLocaleString();
    countAbsentEl.textContent = totalAbsent.toLocaleString();

    // Dynamically update attendance percentage
    attendanceRateEl.textContent = attendanceRate + "%";

    // Trigger height transition on the live chart bar
    if (liveChartBarEl) {
      liveChartBarEl.style.setProperty("--height", attendanceRate + "%");
    }
  }

  // Bind click event listeners to mock user status buttons
  const simRows = document.querySelectorAll(".sim-row");
  simRows.forEach((row) => {
    const userId = parseInt(row.getAttribute("data-user"), 10);
    const buttons = row.querySelectorAll(".sim-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const status = button.getAttribute("data-status");

        // Update state model
        userStates[userId] = status;

        // Toggle active visual class
        buttons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Update values and bar chart height
        updateStats();
      });
    });
  });

  // Initial calculation
  updateStats();
}

