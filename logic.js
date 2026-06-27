const envelopeWrap = document.getElementById("envelopeWrap");
const invitation = document.getElementById("invitation");
const form = document.getElementById("rsvpForm");
const message = document.getElementById("message");
const submitButton = document.getElementById("submitBtn");
const btnLabel = submitButton.querySelector(".btn-label");

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxmWABM3GLs6q4QxJkZn3ANjHtg9QVZV3kDzQDeNohoJqFRqnV8yXsajyHIZL5FHcKd/exec";

let opened = false;

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const FLIP_DURATION = prefersReducedMotion ? 0 : 1000;   // matches .envelope-flip transition (rotateY)
const PAUSE_ON_SEAL = prefersReducedMotion ? 0 : 350;     // brief beat once the sealed side is facing the user
const OPEN_DURATION = prefersReducedMotion ? 0 : 1050;    // matches the flap/seal transition

function openEnvelope() {
  if (opened) return;
  opened = true;

  // Step 1: flip the card around to reveal the sealed envelope
  envelopeWrap.classList.add("flipping");

  setTimeout(() => {
    envelopeWrap.classList.remove("flipping");
    envelopeWrap.classList.add("flipped");

    // Step 2: after a short beat, crack the seal, open the flap,
    // and grow the envelope
    setTimeout(() => {
      envelopeWrap.classList.add("opening");

      // Step 3: envelope fades away, invitation fades in
      setTimeout(() => {
        envelopeWrap.classList.add("opened");
        envelopeWrap.setAttribute("tabindex", "-1");
        envelopeWrap.setAttribute("aria-hidden", "true");
        document.body.classList.add("invitation-open");

        invitation.classList.add("show");
        invitation.setAttribute("aria-hidden", "false");

        // move focus to the invitation heading for screen readers / keyboard users
        const heading = invitation.querySelector(".title");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }, OPEN_DURATION);
    }, PAUSE_ON_SEAL);
  }, FLIP_DURATION);
}

envelopeWrap.addEventListener("click", openEnvelope);
envelopeWrap.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openEnvelope();
  }
});

function setMessage(text, type) {
  message.textContent = text;
  message.classList.remove("error", "success");
  if (type) message.classList.add(type);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const familyNameField = document.getElementById("familyName");
  const peopleCountField = document.getElementById("peopleCount");

  const familyName = familyNameField.value.trim();
  const peopleCount = peopleCountField.value;

  if (!familyName || peopleCount < 1) {
    setMessage("Please enter a valid family name and number of people.", "error");
    return;
  }

  const data = {
    familyName: familyName,
    peopleCount: peopleCount
  };

  try {
    submitButton.disabled = true;
    btnLabel.textContent = "Submitting…";
    setMessage("", null);

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    setMessage("Thank you! Your RSVP has been received.", "success");
    btnLabel.textContent = "RSVP Submitted";

    familyNameField.disabled = true;
    peopleCountField.disabled = true;
  } catch (error) {
    setMessage("Something went wrong. Please try again.", "error");
    submitButton.disabled = false;
    btnLabel.textContent = "Submit RSVP";
  }
});