
document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector('form');

  if (form) {
      form.addEventListener('submit', function (event) {
          event.preventDefault();
          const userNameInput = document.getElementById("userNameInput").value;
          loggedInUserName = userNameInput || "Anonymous"; // Set logged-in name
      });
  }
});
document.getElementById("registerBtn").addEventListener("click", function (event) {
  event.preventDefault(); // Prevents default anchor behavior
  window.location.href = "signup.html"; // Redirects to the signup page
});
