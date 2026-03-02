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

//API

document.querySelector(".form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const botao = document.querySelector(".botao-form");
  botao.textContent = "Enviando...";
  botao.disabled = true;

  const dados = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    categoria: document.getElementById("categoria").value,
    mensagem: document.getElementById("mensagem").value,
  };

  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const resultado = await res.json();

    if (res.ok) {
      botao.textContent = "Mensagem Enviada ✓";
      botao.style.backgroundColor = "green";
      document.querySelector(".form").reset();
    } else {
      alert("Erro: " + resultado.error);
      botao.textContent = "Enviar Mensagem";
      botao.disabled = false;
    }
  } catch (err) {
    alert("Erro de conexão. Tente novamente.");
    botao.textContent = "Enviar Mensagem";
    botao.disabled = false;
  }
});
