document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#loginForm");
  const errorBox = document.querySelector("#formErrors");

  form.addEventListener("submit", (event) => {
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    let errors = [];

    if (email === "") {
      errors.push("Email is required.");
    } else if (!email.includes("@")) {
      errors.push("Email must be valid.");
    }

    if (password === "") {
      errors.push("Password is required.");
    }

    if (errors.length > 0) {
      event.preventDefault();

      let html = "<ul>";
      for (let error of errors) {
        html += `<li>${error}</li>`;
      }
      html += "</ul>";

      errorBox.innerHTML = html;
    } else {
      errorBox.innerHTML = "";
    }
  });
});