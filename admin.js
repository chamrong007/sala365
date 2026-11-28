const STORAGE_KEY = "sala365-admin-content-v1";
const statusMessage = document.querySelector("#admin-status");
const technologyDrafts = document.querySelector("#technology-drafts");
const courseDrafts = document.querySelector("#course-drafts");
let content = { technology: [], courses: [] };

function setStatus(message) {
    statusMessage.textContent = message;
}

function isRecord(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isHttpsUrl(value) {
    if (!value) return true;
    try {
        return new URL(value).protocol === "https:";
    } catch {
        return false;
    }
}

function isValidDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function normalizeContent(value) {
    if (!isRecord(value) || !Array.isArray(value.technology) || !Array.isArray(value.courses)) {
        throw new Error("The file must contain technology and courses arrays.");
    }

    const technology = value.technology.map((item) => {
        if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim() ||
            typeof item.summary !== "string" || !item.summary.trim() ||
            typeof item.category !== "string" || !item.category.trim() ||
            (item.date && !isValidDate(item.date)) ||
            !isHttpsUrl(item.url)) {
            throw new Error("Each technology post needs a title, category, summary, and valid HTTPS link.");
        }
        return {
            id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
            title: item.title.trim(),
            category: item.category.trim(),
            summary: item.summary.trim(),
            url: item.url || "",
            date: typeof item.date === "string" ? item.date : ""
        };
    });

    const courses = value.courses.map((item) => {
        if (!isRecord(item) || typeof item.title !== "string" || !item.title.trim() ||
            typeof item.summary !== "string" || !item.summary.trim() ||
            typeof item.level !== "string" || !item.level.trim() ||
            !isValidDate(item.startsAt) ||
            !["upcoming", "open", "full"].includes(item.status) ||
            !isHttpsUrl(item.registrationUrl)) {
            throw new Error("Each course needs a title, level, summary, start date, status, and valid HTTPS link.");
        }
        return {
            id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
            title: item.title.trim(),
            level: item.level.trim(),
            summary: item.summary.trim(),
            startsAt: item.startsAt,
            status: item.status,
            registrationUrl: item.registrationUrl || ""
        };
    });

    return { technology, courses };
}

function saveDrafts(message = "Drafts saved in this browser.") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    renderDrafts();
    setStatus(message);
}

function renderList(container, entries, type) {
    container.replaceChildren();
    if (!entries.length) {
        const empty = document.createElement("p");
        empty.className = "admin-empty";
        empty.textContent = type === "technology" ? "No technology posts yet." : "No courses yet.";
        container.append(empty);
        return;
    }

    entries.forEach((entry) => {
        const item = document.createElement("article");
        item.className = "admin-list-item";
        const details = document.createElement("div");
        const title = document.createElement("h4");
        title.textContent = entry.title;
        const description = document.createElement("p");
        description.textContent = type === "technology"
            ? entry.category
            : `${entry.level} · ${entry.startsAt} · ${entry.status}`;
        details.append(title, description);
        const remove = document.createElement("button");
        remove.className = "admin-remove";
        remove.type = "button";
        remove.textContent = "Remove";
        remove.setAttribute("aria-label", `Remove ${entry.title}`);
        remove.addEventListener("click", () => {
            content[type] = content[type].filter((candidate) => candidate.id !== entry.id);
            saveDrafts("Draft removed.");
        });
        item.append(details, remove);
        container.append(item);
    });
}

function renderDrafts() {
    renderList(technologyDrafts, content.technology, "technology");
    renderList(courseDrafts, content.courses, "courses");
}

function optionalHttpsUrl(value, fieldName) {
    const trimmed = value.trim();
    if (trimmed && !isHttpsUrl(trimmed)) {
        throw new Error(`${fieldName} must use a valid HTTPS address.`);
    }
    return trimmed;
}

document.querySelector("#technology-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
        content.technology.unshift({
            id: crypto.randomUUID(),
            title: values.get("title").trim(),
            category: values.get("category").trim(),
            summary: values.get("summary").trim(),
            url: optionalHttpsUrl(values.get("url"), "Article link"),
            date: values.get("date")
        });
        saveDrafts("Technology post added to your drafts.");
        form.reset();
    } catch (error) {
        setStatus(error.message);
    }
});

document.querySelector("#course-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    try {
        content.courses.unshift({
            id: crypto.randomUUID(),
            title: values.get("title").trim(),
            level: values.get("level").trim(),
            summary: values.get("summary").trim(),
            startsAt: values.get("startsAt"),
            status: values.get("status"),
            registrationUrl: optionalHttpsUrl(values.get("registrationUrl"), "Registration link")
        });
        saveDrafts("Course added to your drafts.");
        form.reset();
    } catch (error) {
        setStatus(error.message);
    }
});

document.querySelector("#export-button").addEventListener("click", () => {
    const file = new Blob([`${JSON.stringify({ technology: content.technology, courses: content.courses }, null, 2)}\n`], {
        type: "application/json"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = "content.json";
    link.click();
    URL.revokeObjectURL(link.href);
    setStatus("content.json downloaded. Commit it to the website repository to publish.");
});

const importFile = document.querySelector("#import-file");
document.querySelector("#import-button").addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async () => {
    const [file] = importFile.files;
    if (!file) return;
    try {
        content = normalizeContent(JSON.parse(await file.text()));
        saveDrafts("Content imported and saved as browser drafts.");
    } catch (error) {
        setStatus(`Import failed: ${error.message}`);
    } finally {
        importFile.value = "";
    }
});

async function loadDrafts() {
    const savedDrafts = localStorage.getItem(STORAGE_KEY);
    if (savedDrafts) {
        content = normalizeContent(JSON.parse(savedDrafts));
        setStatus("Loaded saved drafts from this browser.");
        return;
    }

    const response = await fetch("/content.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(`Could not load content.json (${response.status}).`);
    content = normalizeContent(await response.json());
    setStatus("Loaded published content. New changes will be saved as browser drafts.");
}

loadDrafts()
    .then(renderDrafts)
    .catch((error) => {
        renderDrafts();
        setStatus(`Could not load content: ${error.message}`);
    });
