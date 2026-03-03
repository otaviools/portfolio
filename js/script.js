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

//API form

const formulario = document.querySelector(".form");
formulario.addEventListener("submit", async function (e) {
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
    const resposta = await fetch("/api/contato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    const resultado = await resposta.json();

    if (resposta.ok) {
      botao.textContent = "Enviado ✓";
      botao.style.backgroundColor = "#1FC068";
      botao.style.border = "none";
      botao.style.color = "white";
      document.querySelector(".form").reset();

      setTimeout(() => {
        botao.textContent = "Enviar Mensagem";
        botao.style.backgroundColor = "";
        botao.style.color = "";
        botao.disabled = false;
      }, 1000);
    } else {
      alert("Erro: " + resultado.error);
      botao.textContent = "Enviar Mensagem";
      botao.style.backgroundColor = "";
      botao.disabled = false;
    }
  } catch (err) {
    alert("Erro de conexão. Tente novamente.");
    botao.textContent = "Enviar Mensagem";
    botao.disabled = false;
  }
});
