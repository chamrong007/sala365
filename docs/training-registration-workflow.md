# SALA365 training registration workflow

This workflow connects the website to Microsoft Forms, uses Telegram for
questions, and uses Power Automate to send registration emails. Website
registration links open the published form:

<https://forms.cloud.microsoft/r/iywsNMEwHw>

The website does not collect or store registration details. Microsoft Forms is
the system of record. Power Automate must be created and enabled in a SALA365
Microsoft 365 account before confirmation and administration emails will be
sent.

## 1. Configure the Microsoft Form

Create or update a form called **SALA365 Training Registration** and use these
questions (keep the question labels recognizable for the flow):

1. **Full name** — text, required.
2. **Email address** — text, required; validate it as an email address.
3. **Course** — choice, required:
   - Microsoft 365 for study
   - Azure fundamentals (AZ-900)
   - Security, identity & compliance (SC-900)
4. **Preferred schedule** — choice, required (add only dates/times SALA365 can
   actually offer).
5. **School or institution** — text, optional.
6. **Are you registering as a student?** — choice, required: Yes / No.
7. **Additional questions** — long text, optional.
8. **Privacy acknowledgement** — required choice or checkbox explaining that
   the details are used to respond to the training request.

Allow responses from the intended audience. If the form is open to anyone,
explain in the form description that applicants should use an email address
they can access. Do not request passwords, payment-card details, government
identifiers, or other unnecessary sensitive information.

The course-specific Telegram links use `/start` payloads
`student-m365`, `student-azure`, and `student-security`. Configure
`@Sala365Bot` to recognize these payloads and reply with the matching course
name, the registration form link, and a way to ask a person for help. Telegram
deep links only open the bot with a start payload; they do not submit a
registration or send student details.

## 2. Create the Power Automate flow

Create an **Automated cloud flow** named **SALA365 - Training registration
emails** in the Microsoft account that owns the form.

1. Trigger: Microsoft Forms **When a new response is submitted**. Select
   **SALA365 Training Registration**.
2. Add Microsoft Forms **Get response details**. Use the same Form Id and the
   **Response Id** from the trigger.
3. After Get response details, create two **parallel branches** so that a
   problem sending one email does not prevent the other branch from running.
   In the first branch, add Outlook **Send an email (V2)** for the student
   confirmation:
   - **To:** the **Email address** answer from Get response details.
   - **Subject:** `SALA365 received your training registration`
   - **Body:** use the student template below and replace bracketed labels
     with the matching dynamic-content answers.
4. In the second branch, add Outlook **Send an email (V2)** for the
   administration notification:
   - **To:** `admin@sala365.com`
   - **Subject:** `New SALA365 training registration — [Course]`
   - **Body:** use the admin template below and insert the matching dynamic
     content from Get response details.
5. Save the flow, submit a test response using an address you can access, and
   verify that both emails arrive with the expected course and contact details.
   Then turn the flow on.

### Failure handling and ownership

- Add a second owner to the flow so it is not dependent on one person's
  account. Enable Power Automate failure notifications for the flow owners and
  review run history regularly.
- Do not mark an application confirmed merely because the form was submitted;
  the student confirmation email is sent only after the flow action succeeds.
- Because the email actions run in parallel, a failed student confirmation
  does not prevent the admin notification. Review failed runs and follow up
  with the student using the email address in the response.
- If sending the admin notification fails, treat the run as failed and use
  Power Automate's owner notifications and run history to recover it.
- Restrict access to form responses and flow run history to staff who need it.

## 3. Student confirmation email template

**Subject:** SALA365 received your training registration

```text
Hello [Full name],

Thank you for registering your interest in SALA365 training.

Course: [Course]
Preferred schedule: [Preferred schedule]
School or institution: [School or institution, if provided]

Our team will review your request and contact you at [Email address] about
availability and next steps. Your place is not confirmed until SALA365 contacts
you.

Questions? Message @Sala365Bot on Telegram:
https://t.me/Sala365Bot

SALA365 Training & Consulting
```

## 4. Administration notification email template

**To:** `admin@sala365.com`

**Subject:** `New SALA365 training registration — [Course]`

```text
A new SALA365 training registration was submitted.

Student: [Full name]
Email: [Email address]
Course: [Course]
Preferred schedule: [Preferred schedule]
School or institution: [School or institution, if provided]
Student: [Are you registering as a student?]
Additional questions: [Additional questions, if provided]
Privacy acknowledgement: [Privacy acknowledgement]
Form response ID: [Response Id]

Review the response in Microsoft Forms and contact the applicant to confirm
availability. Do not treat this request as a confirmed seat until the schedule
and next steps have been agreed.
```

In the email action, replace every bracketed label with its matching dynamic
content token. Leave optional answers blank when not provided. Avoid inserting
untrusted free-text answers into HTML markup; use plain text email bodies or
encode values before using HTML.

## 5. End-to-end test checklist

- Website navigation, hero, and each student course open the published form.
- Each course-specific Telegram link opens `@Sala365Bot` with the expected
  `/start` payload.
- A valid test response appears in Microsoft Forms with the selected course.
- The student receives the confirmation email at the submitted address.
- `admin@sala365.com` receives the administration notification.
- If a student confirmation email fails to send, the admin notification still
  arrives so staff can contact the student and avoid claiming the registration
  is confirmed.
- Flow failures are visible in run history and delivered to the flow owners for
  follow-up.

Power Automate and bot configuration require access to SALA365's Microsoft 365
and Telegram bot accounts; these repository files document the setup but cannot
publish or activate those external services.
