# Digital It Move | Resume

A static resume information form made with HTML, CSS and vanilla JavaScript. CSS and JavaScript are embedded in `index.html`; the supplied logo image is in `assets/dim-logo.jpeg`.

## Publish on GitHub Pages

1. Upload `index.html` and the `assets` folder to the root of a GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select your default branch and `/ (root)`, then save.
4. GitHub will show the published website address in the Pages settings.

No build step, framework, server, separate stylesheet, or separate JavaScript file is required. Keep the `assets` folder beside `index.html` for the logo.

## Email behavior

There is no resume preview. The visitor enters their details in the guided form and selects **Send to Digital It Move**. This opens the visitor's email app with a message addressed to `avipatmase@gmail.com`; the visitor reviews and sends it. A plain GitHub Pages site cannot send email in the background by itself. The form draft is saved in that browser's local storage.

## Resume features

- Seven guided sections: personal, education, experience, skills, contact, preferences, and review/submit
- Education entries for qualification, course/degree, institution, passing year, and description
- A call or WhatsApp verification note below certifications
- Repeatable experience and education entries
- Draft autosave in the browser's local storage
- Responsive mobile layout

The header uses the original supplied JPEG logo from `assets/dim-logo.jpeg`.
