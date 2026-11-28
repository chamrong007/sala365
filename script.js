const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#primary-navigation");

if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
        const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
        menuButton.setAttribute("aria-expanded", String(!isExpanded));
        menuButton.setAttribute("aria-label", isExpanded ? "Open navigation menu" : "Close navigation menu");
        navigation.classList.toggle("is-open", !isExpanded);
    });

    navigation.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open navigation menu");
            navigation.classList.remove("is-open");
        }
    });
}

const themeButtons = document.querySelectorAll("[data-theme-toggle]");

function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sala365-theme", theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
        button.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
    });
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
        themeColor.content = theme === "dark" ? "#101713" : "#f7f9f7";
    }
}

themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });
});
setTheme(document.documentElement.dataset.theme || "light");

const currentYear = document.querySelector("#current-year");
if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

function createTextElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    element.textContent = text;
    return element;
}

function safeHttpsUrl(value) {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? url.href : null;
    } catch {
        return null;
    }
}

function addUpdateCard(container, { title, summary, category, url, date, badge, actionLabel }) {
    const card = createTextElement("article", "update-card");
    const meta = createTextElement("div", "update-meta");
    if (badge) meta.append(createTextElement("span", "update-badge", badge));
    if (category) meta.append(createTextElement("span", "update-category", category));
    if (date) meta.append(createTextElement("span", "update-date", date));
    if (meta.childElementCount) card.append(meta);
    card.append(createTextElement("h4", "", title));
    card.append(createTextElement("p", "", summary));

    const safeUrl = safeHttpsUrl(url);
    if (safeUrl) {
        const link = createTextElement("a", "button button-secondary", actionLabel);
        link.href = safeUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(link);
    }
    container.append(card);
}

function formatCourseDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return "";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

async function loadPublishedContent() {
    const section = document.querySelector("#updates");
    if (!section) return;

    try {
        const response = await fetch("/content.json", { cache: "no-cache" });
        if (!response.ok) throw new Error(`Content request failed (${response.status})`);
        const content = await response.json();
        const technology = Array.isArray(content.technology) ? content.technology : [];
        const courses = Array.isArray(content.courses) ? content.courses : [];
        const technologyList = document.querySelector("#technology-list");
        const courseList = document.querySelector("#course-list");
        let validItems = 0;

        technology.forEach((item) => {
            if (!item || typeof item !== "object" ||
                typeof item.title !== "string" || typeof item.summary !== "string") return;
            addUpdateCard(technologyList, {
                title: item.title,
                summary: item.summary,
                category: typeof item.category === "string" ? item.category : "",
                url: item.url,
                date: formatCourseDate(item.date),
                actionLabel: "Read more"
            });
            validItems += 1;
        });

        courses.forEach((item) => {
            if (!item || typeof item !== "object" ||
                typeof item.title !== "string" || typeof item.summary !== "string") return;
            const status = ["upcoming", "open", "full"].includes(item.status) ? item.status : "upcoming";
            addUpdateCard(courseList, {
                title: item.title,
                summary: item.summary,
                category: typeof item.level === "string" ? item.level : "",
                url: status === "full" ? "" : item.registrationUrl,
                date: formatCourseDate(item.startsAt),
                badge: status === "open" ? "Registration open" : status === "full" ? "Full" : "Upcoming",
                actionLabel: "Register"
            });
            validItems += 1;
        });

        document.querySelector("#technology-updates").hidden = technologyList.childElementCount === 0;
        document.querySelector("#course-updates").hidden = courseList.childElementCount === 0;
        section.hidden = validItems === 0;
    } catch (error) {
        console.error("Could not load SALA365 updates:", error);
    }
}

loadPublishedContent();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
            .catch((error) => {
                console.error("Service worker registration failed:", error);
            });
    });
}
