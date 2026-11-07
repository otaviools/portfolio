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

//Section Trajetória
const trajetoria = document.querySelector(".trajetoria-linha");
const marcos = document.querySelectorAll(".marco");
const anosTrajetoria = document.querySelectorAll(".trajetoria-anos li");
let quadroTrajetoria = null;

function atualizarTrajetoria() {
  quadroTrajetoria = null;
  const area = trajetoria.getBoundingClientRect();
  const ponto = window.innerHeight * 0.6;
  const progresso = Math.min(Math.max((ponto - area.top) / area.height, 0), 1);
  trajetoria.style.setProperty("--progresso", progresso);

  let anoAtual = null;
  marcos.forEach((marco) => {
    const ativo = marco.getBoundingClientRect().top < ponto;
    marco.classList.toggle("ativo", ativo);
    if (ativo) anoAtual = marco.dataset.ano;
  });

  anosTrajetoria.forEach((ano) =>
    ano.classList.toggle("ativo", ano.dataset.ano === anoAtual),
  );
}

function agendarTrajetoria() {
  if (!quadroTrajetoria) {
    quadroTrajetoria = requestAnimationFrame(atualizarTrajetoria);
  }
}

if (trajetoria) {
  document.querySelector(".trajetoria-bg").classList.add("trajetoria-js");
  atualizarTrajetoria();
  window.addEventListener("scroll", agendarTrajetoria, { passive: true });
  window.addEventListener("resize", agendarTrajetoria);
}

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

//Section Portfólio - GitHub (repositórios com o tópico "portfolio")
const listaProjetos = document.querySelector(".portfolio-container");

function criar(tag, classe, texto) {
  const elemento = document.createElement(tag);
  if (classe) elemento.className = classe;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

function normalizarUrl(url) {
  return (url || "").replace(/\/+$/, "").toLowerCase();
}

function projetoJaExiste(projeto) {
  if (document.querySelector(".projeto-" + projeto.slug)) return true;
  if (document.querySelector(`.projeto[data-repo="${projeto.slug}"]`)) return true;

  const links = [...document.querySelectorAll(".projeto-nome a")].map((a) =>
    normalizarUrl(a.href),
  );
  return (
    links.includes(normalizarUrl(projeto.site)) ||
    links.includes(normalizarUrl(projeto.repositorio))
  );
}

function criarLink(classe, texto, url) {
  const link = criar("a", classe, texto);
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  return link;
}

// Identidade visual: paleta, tipografia e componentes reais do projeto
const FONTES_DO_SITE = ["Satoshi"];
const fontesCarregadas = new Set(FONTES_DO_SITE);

function carregarFonte(nome, pesos) {
  if (fontesCarregadas.has(nome)) return;
  fontesCarregadas.add(nome);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href =
    "https://fonts.googleapis.com/css2?family=" +
    encodeURIComponent(nome).replace(/%20/g, "+") +
    ":wght@" +
    pesos.join(";") +
    "&display=swap";
  document.head.appendChild(link);
}

function textoSobre(hex) {
  const valor = parseInt(hex.slice(1), 16);
  const r = (valor >> 16) & 255;
  const g = (valor >> 8) & 255;
  const b = valor & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#111111" : "#ffffff";
}

async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch (erro) {
    const campo = document.createElement("textarea");
    campo.value = texto;
    document.body.appendChild(campo);
    campo.select();
    const copiou = document.execCommand("copy");
    campo.remove();
    return copiou;
  }
}

function criarCor(hex) {
  const codigo = hex.toUpperCase();
  const cor = criar("button", "identidade-cor font-3-xs", codigo);
  cor.type = "button";
  cor.style.backgroundColor = hex;
  cor.style.color = textoSobre(hex);
  cor.setAttribute("aria-label", "Copiar cor " + codigo);

  cor.addEventListener("click", async () => {
    const copiou = await copiarTexto(codigo);
    cor.textContent = copiou ? "Copiado ✓" : codigo;
    setTimeout(() => (cor.textContent = codigo), 1500);
  });
  return cor;
}

function criarLinhaFicha(rotulo, conteudo) {
  const linha = criar("div", "ficha-linha");
  linha.append(criar("p", "ficha-rotulo font-3-xs cor-8", rotulo), conteudo);
  return linha;
}

function criarIdentidade(identidade) {
  if (!identidade) return null;
  const { principal, secundaria } = identidade.cores;
  const cores = [...principal, ...secundaria];
  if (!cores.length && !identidade.fontes.length) return null;

  const pesos = identidade.pesos.length ? identidade.pesos : [400, 700];
  identidade.fontes.forEach((fonte) => carregarFonte(fonte, pesos));

  const bloco = criar("div", "identidade");

  if (cores.length) {
    const paleta = criar("div", "identidade-paleta");
    cores.forEach((hex) => paleta.appendChild(criarCor(hex)));
    bloco.appendChild(criarLinhaFicha("(Cores)", paleta));
  }

  if (identidade.fontes.length) {
    const fontes = criar("div", "identidade-fontes");
    identidade.fontes.forEach((fonte) => {
      const item = criar("div", "identidade-fonte");
      const amostra = criar("span", "identidade-aa", "Aa");
      amostra.style.fontFamily = `"${fonte}", sans-serif`;
      item.append(
        amostra,
        criar("p", "font-1-s cor-12", fonte),
        criar("p", "font-3-xs cor-8", pesos.join(" · ")),
      );
      fontes.appendChild(item);
    });
    bloco.appendChild(criarLinhaFicha("(Tipografia)", fontes));
  }

  return bloco;
}

function aplicarIdentidade(ficha, identidade) {
  const bloco = criarIdentidade(identidade);
  if (!bloco) return;

  const conteudo = ficha.querySelector(".projeto-ficha-conteudo");
  const antigo = conteudo.querySelector(".card-right, .identidade");
  if (antigo) antigo.replaceWith(bloco);
  else conteudo.appendChild(bloco);
}

function criarFicha(projeto) {
  const ficha = criar("div", "projeto-ficha");
  ficha.id = "ficha-" + projeto.slug;
  const conteudo = criar("div", "projeto-ficha-conteudo");

  const texto = criar("div", "projeto-texto");
  texto.append(
    criar("p", "ficha-rotulo font-3-xs cor-8", "(Descrição)"),
    criar("p", "font-2-m cor-9", projeto.descricao),
    criar("p", "font-3-xs cor-7", projeto.stack.join(" | ")),
  );
  const verProjeto = criarLink(
    "link-seta font-1-m-medium cor-12",
    "Ver projeto ",
    projeto.site,
  );
  verProjeto.appendChild(criar("span", "", "↗"));
  texto.appendChild(verProjeto);
  conteudo.appendChild(texto);
  ficha.appendChild(conteudo);

  aplicarIdentidade(ficha, projeto.identidade);
  return ficha;
}

function criarProjeto(projeto) {
  const item = criar("li", "projeto projeto-" + projeto.slug);

  const linha = criar("div", "projeto-linha");
  const nome = criar("h3", "projeto-nome font-1-xxl cor-12");
  nome.appendChild(criarLink("", projeto.nome, projeto.site));
  const botao = criar("button", "projeto-botao font-3-xs cor-12", "Ficha");
  botao.setAttribute("aria-controls", "ficha-" + projeto.slug);
  botao.setAttribute("aria-expanded", "false");
  botao.addEventListener("click", ativarFicha);
  const codigo = criar("span", "projeto-codigo font-3-xs cor-8");
  codigo.append(
    criar("span", "projeto-numero"),
    criar("span", "projeto-ano", String(projeto.ano)),
  );
  linha.append(
    codigo,
    nome,
    criar("span", "projeto-tipo font-3-xs cor-8", projeto.tipo),
    botao,
  );

  item.append(linha, criarFicha(projeto));
  return item;
}

function numerarProjetos() {
  document.querySelectorAll(".projeto-numero").forEach((numero, indice) => {
    numero.textContent = "OT-" + String(indice + 1).padStart(3, "0");
  });
}

async function carregarProjetosGithub() {
  try {
    const resposta = await fetch("/api/projetos");
    if (!resposta.ok) return;

    const novos = (await resposta.json()).filter(
      (projeto) => projeto.site && !projetoJaExiste(projeto),
    );
    if (!novos.length) return;

    const fragmento = document.createDocumentFragment();
    novos.forEach((projeto) => fragmento.appendChild(criarProjeto(projeto)));
    listaProjetos.prepend(fragmento);
    numerarProjetos();
  } catch (erro) {
    // Sem API (ex.: servidor local estático): mantém só os projetos do HTML.
  }
}

// Projetos escritos no HTML: busca a identidade ao abrir a ficha pela 1ª vez
async function carregarIdentidadeDoRepo(item) {
  if (item.dataset.identidade) return;
  item.dataset.identidade = "carregando";

  try {
    const resposta = await fetch(
      "/api/projetos?repo=" + encodeURIComponent(item.dataset.repo),
    );
    if (!resposta.ok) throw new Error("API indisponível");

    const projeto = await resposta.json();
    aplicarIdentidade(item.querySelector(".projeto-ficha"), projeto.identidade);
    item.dataset.identidade = "ok";
  } catch (erro) {
    item.dataset.identidade = "indisponivel";
  }
}

document.querySelectorAll(".projeto[data-repo]").forEach((item) => {
  item
    .querySelector(".projeto-botao")
    .addEventListener("click", () => carregarIdentidadeDoRepo(item));
});

if (listaProjetos) {
  carregarProjetosGithub();
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
