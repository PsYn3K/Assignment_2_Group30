document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#registerForm");
  const errorBox = document.querySelector("#formErrors");

  form.addEventListener("submit", (event) => {
    const username = document.querySelector("#username").value.trim();
    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    let errors = [];

    if (username === "") {
      errors.push("Username is required.");
    }

    if (email === "") {
      errors.push("Email is required.");
    } else if (!email.includes("@")) {
      errors.push("Email must be valid.");
    }

    if (password === "") {
      errors.push("Password is required.");
    } else if (password.length < 6) {
      errors.push("Password must be at least 6 characters.");
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