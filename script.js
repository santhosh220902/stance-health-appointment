/*
  Stance Health recreation
  ---------------------------------------
  1. Replace GOOGLE_SCRIPT_URL with your
     deployed Google Apps Script Web App URL.
  2. The form sends JSON to that endpoint.
*/

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzrTGuoZSh9gub22MBxAheWTHv9jqeX6AvlEMhrXnOUR1M6q73Fg-Y-x7BSKyoyRFJk/exec"; // e.g. https://script.google.com/macros/s/XXXXXXXX/exec
const CALL_NUMBER = "+910000000000"; // Replace with the actual Stance Health number.

const form = document.getElementById("appointmentForm");
const verifyBtn = document.getElementById("verifyBtn");
const callBtn = document.getElementById("callBtn");
const statusBox = document.getElementById("formStatus");

document.querySelectorAll('input[name="gender"]').forEach((radio) => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".gender-option").forEach((item) => {
      item.classList.remove("selected");
    });
    radio.closest(".gender-option").classList.add("selected");
  });
});

document.getElementById("phone").addEventListener("input", (event) => {
  event.target.value = event.target.value.replace(/\D/g, "").slice(0, 10);
});

function clearErrors() {
  document.querySelectorAll(".error").forEach((el) => el.textContent = "");
  document.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  statusBox.textContent = "";
  statusBox.className = "form-status";
}

function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add("invalid");
  error.textContent = message;
}

function validateForm() {
  clearErrors();

  const phone = document.getElementById("phone");
  const firstName = document.getElementById("firstName");
  const email = document.getElementById("email");

  let valid = true;

  if (!/^[6-9]\d{9}$/.test(phone.value.trim())) {
    setError("phone", "phoneError", "Enter a valid 10-digit mobile number.");
    valid = false;
  }

  if (!firstName.value.trim()) {
    setError("firstName", "firstNameError", "First name is required.");
    valid = false;
  }

  if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    setError("email", "emailError", "Enter a valid email address.");
    valid = false;
  }

  return valid;
}

function getFormData() {
  const selectedGender = document.querySelector('input[name="gender"]:checked');

  return {
    timestamp: new Date().toISOString(),
    phone: document.getElementById("phone").value.trim(),
    firstName: document.getElementById("firstName").value.trim(),
    lastName: document.getElementById("lastName").value.trim(),
    email: document.getElementById("email").value.trim(),
    gender: selectedGender ? selectedGender.value : "",
    dob: document.getElementById("dob").value,
    notes: document.getElementById("notes").value.trim()
  };
}

async function submitToGoogleSheets(data) {
  if (!GOOGLE_SCRIPT_URL) {
    // Demo mode: keep the UI functional before the Apps Script URL is added.
    await new Promise(resolve => setTimeout(resolve, 500));
    return { demo: true };
  }

  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(data)
  });

  // no-cors gives an opaque response, but Apps Script receives the POST.
  return { submitted: true, response };
}

verifyBtn.addEventListener("click", async () => {
  if (!validateForm()) {
    statusBox.textContent = "Please correct the highlighted fields.";
    statusBox.className = "form-status error";
    return;
  }

  const data = getFormData();
  verifyBtn.disabled = true;
  verifyBtn.textContent = "Submitting...";

  try {
    await submitToGoogleSheets(data);

    statusBox.textContent = GOOGLE_SCRIPT_URL
      ? "Your details have been submitted successfully."
      : "Demo submission successful. Add the Google Apps Script URL to enable Sheets sync.";
    statusBox.className = "form-status success";
  } catch (error) {
    console.error(error);
    statusBox.textContent = "Unable to submit right now. Please try again.";
    statusBox.className = "form-status error";
  } finally {
    verifyBtn.disabled = false;
    verifyBtn.textContent = "Verify Number";
  }
});

callBtn.href = `tel:${CALL_NUMBER}`;
