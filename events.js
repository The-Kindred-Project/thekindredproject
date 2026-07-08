// ─────────────────────────────────────────────────────────────
//  KINDRED PROJECT EVENTS
//  To add a new event, copy the template below and paste it
//  inside the kindredEvents array, separated by a comma.
//
//  Template:
//  {
//    id: <unique number — increment from the last one>,
//    name: "<event title>",
//    date: "YYYY-MM-DD",          // e.g. "2026-11-15"
//    location: "<where it is>",   // city, venue, or "Online"
//    description: "<full description of the event>"
//  }
//
//  Rules:
//  - Each id must be a unique number (1, 2, 3 …)
//  - date must be in YYYY-MM-DD format
//  - Past events are shown greyed out automatically
//  - Events show on the calendar on their date
// ─────────────────────────────────────────────────────────────

const kindredEvents = [
  // Add events here — see the template above
];

function renderCalendar() {
  const container = document.getElementById("calendar-events");
  if (!container) return;

  const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();

  function eventsForMonth(year, month) {
    const map = {};
    kindredEvents.forEach(e => {
      const d = new Date(e.date + "T00:00:00");
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }

  function closeDetail() {
    const panel = document.getElementById("cal-detail");
    if (panel) panel.style.display = "none";
  }

  function openDetail(eventId) {
    const panel = document.getElementById("cal-detail");
    if (!panel) return;

    const alreadyOpen = panel.style.display !== "none" && panel.dataset.eventId === String(eventId);
    if (alreadyOpen) { closeDetail(); return; }

    const ev = kindredEvents.find(e => e.id === eventId);
    if (!ev) return;

    const d = new Date(ev.date + "T00:00:00");
    const fullDate = d.toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });

    panel.dataset.eventId = eventId;
    panel.style.display = "block";
    panel.innerHTML = `
      <button class="cal-detail-close" id="cal-detail-close">Close</button>
      <h4 class="cal-detail-title">${ev.name}</h4>
      <p class="cal-detail-meta">${fullDate}</p>
      <p class="cal-detail-meta">${ev.location}</p>
      <p class="cal-detail-desc">${ev.description}</p>
    `;
    document.getElementById("cal-detail-close").addEventListener("click", closeDetail);
  }

  function render() {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay  = new Date(viewYear, viewMonth + 1, 0);
    const startDOW = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const eventMap = eventsForMonth(viewYear, viewMonth);

    let html = `
      <div class="cal-nav">
        <button class="cal-nav-btn" id="cal-prev">&#8592; Prev</button>
        <h3 class="cal-month-title">${MONTH_NAMES[viewMonth]} ${viewYear}</h3>
        <button class="cal-nav-btn" id="cal-next">Next &#8594;</button>
      </div>
      <div class="cal-grid">
    `;

    DAY_NAMES.forEach(d => {
      html += `<div class="cal-day-header">${d}</div>`;
    });

    for (let i = 0; i < startDOW; i++) {
      html += `<div class="cal-cell cal-cell--empty"></div>`;
    }

    for (let day = 1; day <= totalDays; day++) {
      const cellDate = new Date(viewYear, viewMonth, day);
      const isToday = cellDate.getTime() === today.getTime();
      const isPastDay = cellDate < today && !isToday;
      const events = eventMap[day] || [];

      let classes = "cal-cell";
      if (isToday)  classes += " cal-cell--today";
      if (isPastDay) classes += " cal-cell--past";

      html += `<div class="${classes}">`;
      html += `<span class="cal-cell-num">${day}</span>`;

      events.forEach(ev => {
        const evDate = new Date(ev.date + "T00:00:00");
        const pillPast = evDate < today;
        html += `<div class="cal-event-pill${pillPast ? " cal-event-pill--past" : ""}" data-event-id="${ev.id}">${ev.name}</div>`;
      });

      html += `</div>`;
    }

    const filled = startDOW + totalDays;
    const remainder = filled % 7 === 0 ? 0 : 7 - (filled % 7);
    for (let i = 0; i < remainder; i++) {
      html += `<div class="cal-cell cal-cell--empty"></div>`;
    }

    html += `</div><div class="cal-detail" id="cal-detail" style="display:none;"></div>`;

    container.innerHTML = html;

    document.getElementById("cal-prev").addEventListener("click", () => {
      viewMonth--;
      if (viewMonth < 0) { viewMonth = 11; viewYear--; }
      render();
    });

    document.getElementById("cal-next").addEventListener("click", () => {
      viewMonth++;
      if (viewMonth > 11) { viewMonth = 0; viewYear++; }
      render();
    });

    container.querySelectorAll(".cal-event-pill").forEach(pill => {
      pill.addEventListener("click", () => {
        openDetail(parseInt(pill.dataset.eventId));
      });
    });
  }

  render();
}

document.addEventListener("DOMContentLoaded", renderCalendar);
