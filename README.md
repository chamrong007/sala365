# sala365
Website Sala365

## Training registration

The student training registration journey and course outlines are in
`index.html`. The **Register Training** links open the SALA365 Microsoft Form;
course-specific Telegram links open `@Sala365Bot` for questions.

See [`docs/training-registration-workflow.md`](docs/training-registration-workflow.md)
for the Microsoft Forms fields, Power Automate email workflow, confirmation
email template, administration notification template, and deployment test
checklist. The flow and Telegram bot behavior must be configured in their
respective Microsoft and Telegram accounts.

## Technology posts and course updates

The public site reads technology posts and courses from `content.json`. Use
`/admin.html` to create or remove drafts, import an existing content file, and
download the updated JSON. Because this site is hosted as static files, changes
are published only after `content.json` is committed to the repository; the
editor has no sign-in or server-side access control, and drafts are stored in
the current browser.
