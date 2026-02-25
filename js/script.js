//Menu Mobile
const mobileMenu = document.querySelector(".mobile-menu");
const headerMenu = document.querySelector(".header-menu");

mobileMenu.addEventListener("click", () => {
  headerMenu.classList.toggle("active");
  mobileMenu.classList.toggle("active");
});
