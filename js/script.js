//Script SideBar
const sidebar = document.querySelector(".sideBar");
const menuOpen = document.querySelector(".icon-menu-open");
const menuClose = document.querySelector(".icon-menu-close");
const sideBarLinks = document.querySelectorAll(".sideBar a");

menuOpen.addEventListener("click", function () {
  sidebar.classList.add("active");
});

menuClose.addEventListener("click", function () {
  sidebar.classList.remove("active");
});

sideBarLinks.forEach(function (link) {
  link.addEventListener("click", function () {
    sidebar.classList.remove("active");
  });
});

//Script Animação

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    console.log(entry);
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    } else {
      entry.target.classList.remove("show");
    }
  });
});

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

//Estudos

const estudos = document.querySelectorAll(".estudos button");

function ativarEstudo(event) {
  const estudo = event.currentTarget;
  const controls = estudo.getAttribute("aria-controls");
  const resposta = document.getElementById(controls);

  resposta.classList.toggle("ativa");
  const ativa = resposta.classList.contains("ativa");
  estudo.setAttribute("aria-expanded", ativa);
}

function eventosEstudos(estudo) {
  estudo.addEventListener("click", ativarEstudo);
}

estudos.forEach(eventosEstudos);

console.log(estudos);
