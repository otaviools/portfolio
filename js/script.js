//Script Botao Tema
const btnTema = document.querySelector(".btn-tema");

const temaSalvo =
  localStorage.getItem("tema") ||
  (window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

aplicarTema(temaSalvo);

const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

btnTema.addEventListener("click", () => {
  const atual = document.documentElement.getAttribute("data-theme");
  const novo = atual === "dark" ? "light" : "dark";

  if (!document.startViewTransition || semMovimento.matches) {
    aplicarTema(novo);
    return;
  }

  const area = btnTema.getBoundingClientRect();
  const x = area.left + area.width / 2;
  const y = area.top + area.height / 2;
  const raio = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y),
  );

  document.documentElement.classList.add("sem-transicao");
  const transicao = document.startViewTransition(() => aplicarTema(novo));

  transicao.ready
    .then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${raio}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 700,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    })
    .catch(() => {});

  transicao.finished.then(() =>
    document.documentElement.classList.remove("sem-transicao"),
  );
});

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  localStorage.setItem("tema", tema);
  btnTema.setAttribute("aria-pressed", tema === "dark");

  document.querySelector('link[rel="icon"]').href =
    tema === "dark" ? "./img/favicon-dark.svg" : "./img/favicon-light.svg";

  document.querySelector(".logo img").src =
    tema === "dark"
      ? "./img/icones/logo-branca.svg"
      : "./img/icones/logo-sombra-preta.svg";
}

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

//Script Scroll Header
const header = document.querySelector(".header");
let lastScroll = 0;

window.addEventListener(
  "scroll",
  () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    lastScroll = currentScroll;
  },
  { passive: true },
);

//Script Seção Ativa
const linksMenu = document.querySelectorAll('.header-menu a[href^="#"]');
const secoes = document.querySelectorAll(
  ".introducao-bg, #sobre, #servicos, #estudos, #portfolio, #contato",
);

function marcarSecao(entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const id = "#" + entry.target.id;
      linksMenu.forEach((link) =>
        link.classList.toggle("ativo", link.getAttribute("href") === id),
      );
    }
  });
}

const observerSecao = new IntersectionObserver(marcarSecao, {
  rootMargin: "-50% 0px -50% 0px",
});
secoes.forEach((secao) => observerSecao.observe(secao));

//Script Copiar Email
const botaoCopiar = document.querySelector(".email-copiar");

async function copiarEmail() {
  const email = document.querySelector(".email").textContent.trim();

  try {
    await navigator.clipboard.writeText(email);
    botaoCopiar.textContent = "Copiado ✓";
  } catch (err) {
    const campo = document.createElement("textarea");
    campo.value = email;
    document.body.appendChild(campo);
    campo.select();
    const copiou = document.execCommand("copy");
    campo.remove();
    botaoCopiar.textContent = copiou ? "Copiado ✓" : "Erro ao copiar";
  }

  setTimeout(() => (botaoCopiar.textContent = "Copiar"), 2000);
}

if (botaoCopiar) {
  botaoCopiar.addEventListener("click", copiarEmail);
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
const hiddenElements = document.querySelectorAll(".hidden, .revelar");
hiddenElements.forEach((el) => observer.observe(el));

//Section Portfólio - Ficha
const fichas = document.querySelectorAll(".projeto-botao");

function ativarFicha(event) {
  const botao = event.currentTarget;
  const controls = botao.getAttribute("aria-controls");
  const ficha = document.getElementById(controls);

  ficha.classList.toggle("ativa");
  const ativa = ficha.classList.contains("ativa");
  botao.setAttribute("aria-expanded", ativa);
}

fichas.forEach((botao) => botao.addEventListener("click", ativarFicha));

//Section Portfólio - Preview
const projetos = document.querySelectorAll(".projeto");
const temCursor = window.matchMedia("(hover: hover) and (pointer: fine)");
let quadro = null;

function moverPreview(event) {
  const projeto = event.currentTarget;
  const { clientX, clientY } = event;

  if (quadro) cancelAnimationFrame(quadro);
  quadro = requestAnimationFrame(() => {
    const area = projeto.getBoundingClientRect();
    projeto.style.setProperty("--x", clientX - area.left + "px");
    projeto.style.setProperty("--y", clientY - area.top + "px");
  });
}

if (temCursor.matches) {
  projetos.forEach((projeto) =>
    projeto.addEventListener("mousemove", moverPreview),
  );
}

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
