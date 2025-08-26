document.addEventListener("DOMContentLoaded", function() {
    let slides = document.querySelectorAll(".hero-slider .slide");
    let texts = document.querySelectorAll(".hero-slider .slide-text");
    let dots = document.querySelectorAll(".dots-container .dot");
    let currentIndex = 0;
    const slideDuration = 3000; // 3 detik

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove("active"));
        texts.forEach(text => text.classList.remove("active"));
        dots.forEach(dot => dot.classList.remove("active"));

        slides[index].classList.add("active");
        texts[index].classList.add("active");
        dots[index].classList.add("active");

        let offset = -index * 100;
        document.querySelector(".slides").style.transform = `translateX(${offset}%)`;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    setInterval(nextSlide, slideDuration);

    // Hamburger toggle
    const hamburger = document.querySelector(".hamburger");
    const nav = document.querySelector("nav");

    hamburger.addEventListener("click", function() {
        nav.classList.toggle("active");
    });

    // Tambahkan kelas .loaded ke body setelah halaman dimuat
    document.body.classList.add("loaded");
});