//Script SideBar Mobile

const sidebar = document.querySelector(".sideBar");
const menuOpen = document.querySelector(".icon-menu-open");
const menuClose = document.querySelector(".icon-menu-close");
const sideBarLinks = document.querySelectorAll(".sideBar a");

if (sidebar && menuOpen && menuClose) {
  menuOpen.addEventListener("click", () => sidebar.classList.add("active"));
  menuClose.addEventListener("click", () => sidebar.classList.remove("active"));
  sideBarLinks.forEach((link) =>
    link.addEventListener("click", () => sidebar.classList.remove("active")),
  );
}

//Script Animação Suave

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
});

//Section Estudos

const hiddenElements = document.querySelectorAll(".hidden");
hiddenElements.forEach((el) => observer.observe(el));

const estudos = document.querySelectorAll(".estudos button");

function ativarEstudo(event) {
  const estudo = event.currentTarget;
  const controls = estudo.getAttribute("aria-controls");
  const resposta = document.getElementById(controls);

  resposta.classList.toggle("ativa");
  const ativa = resposta.classList.contains("ativa");
  estudo.setAttribute("aria-expanded", ativa);
}

estudos.forEach((estudo) => estudo.addEventListener("click", ativarEstudo));

//API form

async function enviarFormulario(dados) {
  const resposta = await fetch("/api/contato", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });
  return resposta;
}

function resetarBotao(botao) {
  botao.textContent = "Enviar Mensagem";
  botao.classList.remove("botao-sucesso");
  botao.style.backgroundColor = "";
  botao.style.color = "";
  botao.disabled = false;
}

const formulario = document.querySelector(".form");

if (formulario) {
  formulario.addEventListener("submit", async function (e) {
    e.preventDefault();

    const botao = document.querySelector(".botao-form");
    botao.textContent = "Enviando...";
    botao.disabled = true;

    const dados = Object.fromEntries(new FormData(formulario));

    try {
      const resposta = await enviarFormulario(dados);
      const resultado = await resposta.json();

      if (resposta.ok) {
        botao.textContent = "Enviado ✓";
        botao.classList.add("botao-sucesso");
        formulario.reset();

        setTimeout(() => resetarBotao(botao), 3000);
      } else {
        alert("Erro: " + resultado.error);
        resetarBotao(botao);
      }
    } catch (err) {
      alert("Erro de conexão. Tente novamente.");
      resetarBotao(botao);
    }
  });
}
