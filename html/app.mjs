const BACKEND_URL = "~";

document.addEventListener("DOMContentLoaded", function () {
  const track = document.querySelector(".carousel-track");
  const slides = Array.from(track.children);
  const nextButton = document.querySelector(".next");
  const prevButton = document.querySelector(".prev");

  let currentIndex = 0;
  const slideWidth = slides[0].getBoundingClientRect().width;

  const moveToSlide = (targetIndex) => {
    track.style.transform = "translateX(-" + slideWidth * targetIndex + "px)";
    currentIndex = targetIndex;
  };

  nextButton.addEventListener("click", (_) => {
    const nextIndex = (currentIndex + 1) % slides.length;
    moveToSlide(nextIndex);
  });

  prevButton.addEventListener("click", (_) => {
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = slides.length - 1;
    }
    moveToSlide(prevIndex);
  });

  window.addEventListener("resize", () => {
    const newSlideWidth = slides[0].getBoundingClientRect().width;
    track.style.transition = "none";
    track.style.transform =
      "translateX(-" + newSlideWidth * currentIndex + "px)";
    setTimeout(() => {
      track.style.transition = "transform 0.5s ease-in-out";
    }, 50);
  });

  const registerForm = document.getElementById("register-form");
  const modal = document.getElementById("modal");
  const closeModal = document.querySelector(".close-modal");

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      nombre: document.getElementById("nombre").value,
      email: document.getElementById("email").value,
      curso: document.getElementById("curso").value,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/alumnos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        modal.style.display = "block";
        registerForm.reset();
      } else {
        throw new Error("Error en el registro");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Hubo un problema con el registro. Por favor, intenta de nuevo.");
    }
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });
});
