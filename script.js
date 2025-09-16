document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".hero-slider .slide");
    const texts = document.querySelectorAll(".hero-slider .slide-text");
    const dots = document.querySelectorAll(".dots-container .dot");
    const slidesContainer = document.querySelector(".hero-slider .slides");
    const hasSlider = slides.length > 0 && slidesContainer;
    let currentIndex = 0;
    const slideDuration = 3000; // 3 detik

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        texts.forEach(text => text.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));

        if (slides[index]) {
            slides[index].classList.add("active");
        }
        if (texts[index]) {
            texts[index].classList.add("active");
        }
        if (dots[index]) {
            dots[index].classList.add("active");
        }

        if (slidesContainer) {
            const offset = -index * 100;
            slidesContainer.style.transform = `translateX(${offset}%)`;
        }
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    if (hasSlider) {
        showSlide(currentIndex);
        setInterval(nextSlide, slideDuration);
    }

    // Hamburger toggle
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector("nav");

    hamburger.addEventListener("click", function() {
        nav.classList.toggle("active");
    });

    // Tambahkan kelas .loaded ke body setelah halaman dimuat
    document.body.classList.add("loaded");
});