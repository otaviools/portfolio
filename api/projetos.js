// Lista os repositórios do GitHub marcados com o tópico "portfolio" e
// extrai automaticamente a identidade visual (cores, fontes, pesos e
// arredondamento) a partir do CSS e do HTML de cada repositório.
//
// GET /api/projetos            -> todos os repositórios com o tópico
// GET /api/projetos?repo=nome  -> identidade de um repositório específico
//
// Um portfolio.json opcional na raiz do repositório sobrescreve qualquer
// campo extraído (nome, tipo, ano, stack, site, logo, cores, fontes).

const USUARIO = process.env.GITHUB_USUARIO || "otaviools";
const TOPICO = "portfolio";
const NOME_REPO = /^[A-Za-z0-9._-]{1,100}$/;
const HEX = /^#[0-9a-fA-F]{3,8}$/;
const NOME_FONTE = /^[A-Za-zÀ-ÿ0-9 ]{1,40}$/;
const PESOS = [100, 200, 300, 400, 500, 600, 700, 800, 900];
const LIMITE_ARQUIVOS = 25;
const PRIORIDADE = /(cor|color|var|token|tema|theme|global|tipografia|typography|font)/i;
const TAMANHO_MAXIMO = 300000;

const FONTES_GENERICAS = new Set([
  "sans-serif",
  "serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-sans-serif",
  "ui-serif",
  "ui-monospace",
  "inherit",
  "initial",
  "unset",
  "-apple-system",
  "blinkmacsystemfont",
  "segoe ui",
  "helvetica",
  "helvetica neue",
  "arial",
  "times new roman",
  "consolas",
  "courier new",
  "font awesome 5 free",
  "font awesome 6 free",
]);

/* ---------- GitHub ---------- */

function cabecalhos() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "portfolio-otavio",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

// Cache em memória: evita repetir consultas ao GitHub enquanto a função
// estiver ativa e, se o GitHub recusar (ex.: limite atingido), devolve a
// última resposta boa em vez de falhar.
const CACHE_MEMORIA = new Map();
const CACHE_VALIDADE = 10 * 60 * 1000;

async function buscarJson(url) {
  const guardado = CACHE_MEMORIA.get(url);
  if (guardado && Date.now() - guardado.quando < CACHE_VALIDADE) {
    return guardado.dados;
  }

  const resposta = await fetch(url, { headers: cabecalhos() });

  if (!resposta.ok) {
    if (guardado) return guardado.dados;

    const restante = resposta.headers.get("x-ratelimit-remaining");
    if ((resposta.status === 403 || resposta.status === 429) && restante === "0") {
      const libera = new Date(Number(resposta.headers.get("x-ratelimit-reset")) * 1000);
      throw new Error(
        `Limite da API do GitHub atingido (libera às ${libera.toLocaleTimeString("pt-BR")}). ` +
          "Configure GITHUB_TOKEN para aumentar o limite.",
      );
    }
    throw new Error(`GitHub respondeu ${resposta.status}`);
  }

  const dados = await resposta.json();
  CACHE_MEMORIA.set(url, { dados, quando: Date.now() });
  return dados;
}

function urlArquivo(repo, caminho) {
  if (!caminho) return null;
  if (/^https:\/\//.test(caminho)) return caminho;

  const limpo = String(caminho).replace(/^\.?\//, "");
  return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${limpo}`;
}

async function lerTexto(url) {
  try {
    const resposta = await fetch(url);
    if (!resposta.ok) return "";
    return await resposta.text();
  } catch (erro) {
    return "";
  }
}

async function lerConfig(repo) {
  try {
    const texto = await lerTexto(urlArquivo(repo, "portfolio.json"));
    return texto ? JSON.parse(texto) : {};
  } catch (erro) {
    return {};
  }
}

async function lerArquivosDeEstilo(repo) {
  try {
    const arvore = await buscarJson(
      `https://api.github.com/repos/${repo.full_name}/git/trees/${repo.default_branch}?recursive=1`,
    );

    const arquivos = (arvore.tree || []).filter(
      (item) =>
        item.type === "blob" &&
        item.size < TAMANHO_MAXIMO &&
        /\.(css|scss|html|vue)$/i.test(item.path) &&
        !/(^|\/)(node_modules|vendor|dist|\.nuxt|\.output)\//.test(item.path) &&
        !/\.min\.css$/i.test(item.path),
    );

    arquivos.sort(
      (a, b) =>
        Number(PRIORIDADE.test(b.path)) - Number(PRIORIDADE.test(a.path)) ||
        Number(/index\.html$/i.test(b.path)) - Number(/index\.html$/i.test(a.path)),
    );

    const conteudos = await Promise.all(
      arquivos
        .slice(0, LIMITE_ARQUIVOS)
        .map((item) => lerTexto(urlArquivo(repo, item.path))),
    );

    return conteudos.join("\n");
  } catch (erro) {
    return "";
  }
}

/* ---------- Cores ---------- */

function paraHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((valor) => Math.max(0, Math.min(255, valor)).toString(16).padStart(2, "0"))
      .join("")
  );
}

function expandirHex(hex) {
  const valor = hex.slice(1).toLowerCase();
  if (valor.length === 3) return "#" + [...valor].map((c) => c + c).join("");
  return "#" + valor.slice(0, 6);
}

function paraRgb(hex) {
  const valor = parseInt(hex.slice(1), 16);
  return [(valor >> 16) & 255, (valor >> 8) & 255, valor & 255];
}

function croma([r, g, b]) {
  return (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
}

function luminosidade([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function distancia(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function extrairCores(codigo) {
  const contagem = new Map();

  function somar(hex, peso) {
    contagem.set(hex, (contagem.get(hex) || 0) + peso);
  }

  for (const linha of codigo.split("\n")) {
    const peso = /--[\w-]+\s*:/.test(linha) ? 3 : 1;

    for (const [encontrado] of linha.matchAll(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g)) {
      somar(expandirHex(encontrado), peso);
    }

    for (const [, r, g, b, alfa] of linha.matchAll(
      /rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})(?:[\s,/]+([\d.]+%?))?\s*\)/g,
    )) {
      const opacidade = alfa === undefined ? 1 : parseFloat(alfa) / (alfa.endsWith("%") ? 100 : 1);
      if (opacidade >= 0.6) somar(paraHex(+r, +g, +b), peso);
    }
  }

  const agrupadas = [];
  [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .forEach(([hex, total]) => {
      const rgb = paraRgb(hex);
      const parecida = agrupadas.find((cor) => distancia(cor.rgb, rgb) < 28);
      if (parecida) parecida.total += total;
      else agrupadas.push({ hex, rgb, total });
    });

  const marca = agrupadas.filter((cor) => croma(cor.rgb) >= 0.15).slice(0, 5);
  const neutras = agrupadas
    .filter((cor) => croma(cor.rgb) < 0.15)
    .slice(0, 4)
    .sort((a, b) => luminosidade(b.rgb) - luminosidade(a.rgb));

  return {
    principal: marca.map((cor) => cor.hex),
    secundaria: neutras.map((cor) => cor.hex),
  };
}

/* ---------- Tipografia ---------- */

function limparNomeFonte(nome) {
  return nome
    .replace(/["']/g, "")
    .replace(/\+/g, " ")
    .replace(
      /[\s-]+(thin|extralight|extra light|light|regular|book|medium|semibold|semi bold|bold|extrabold|extra bold|black|heavy|italic)$/i,
      "",
    )
    .trim();
}

function fonteValida(nome) {
  return (
    nome &&
    !nome.startsWith("var(") &&
    !FONTES_GENERICAS.has(nome.toLowerCase()) &&
    NOME_FONTE.test(nome)
  );
}

function extrairFontes(codigo) {
  const contagem = new Map();

  function somar(nome, peso) {
    const limpo = limparNomeFonte(nome);
    if (fonteValida(limpo)) contagem.set(limpo, (contagem.get(limpo) || 0) + peso);
  }

  for (const [, valor] of codigo.matchAll(/font-family\s*:\s*([^;}{]+)/gi)) {
    somar(valor.split(",")[0], 1);
  }

  for (const [, valor] of codigo.matchAll(/font\s*:\s*[^;}{]*?(["'][^"']+["'])/gi)) {
    somar(valor, 1);
  }

  for (const [, familias] of codigo.matchAll(/fonts\.googleapis\.com\/css2?\?([^"')\s>]+)/gi)) {
    for (const [, nome] of familias.matchAll(/family=([^&:;]+)/g)) {
      somar(decodeURIComponent(nome), 3);
    }
  }

  const pesos = new Map();
  for (const [, peso] of codigo.matchAll(/font-weight\s*:\s*(\d{3})/gi)) {
    pesos.set(+peso, (pesos.get(+peso) || 0) + 1);
  }
  for (const [, peso] of codigo.matchAll(/font\s*:\s*(\d{3})\s/gi)) {
    pesos.set(+peso, (pesos.get(+peso) || 0) + 1);
  }

  const pesosUsados = [...pesos.entries()]
    .filter(([peso]) => PESOS.includes(peso))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([peso]) => peso)
    .sort((a, b) => a - b);

  const fontes = [...contagem.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nome]) => nome);

  return { fontes, pesos: pesosUsados.length ? pesosUsados : [400, 700] };
}

function extrairRaio(codigo) {
  const contagem = new Map();
  for (const [, valor] of codigo.matchAll(/border-radius\s*:\s*(\d{1,3})px/gi)) {
    const raio = Math.min(+valor, 40);
    if (raio > 0) contagem.set(raio, (contagem.get(raio) || 0) + 1);
  }
  const maisUsado = [...contagem.entries()].sort((a, b) => b[1] - a[1])[0];
  return maisUsado ? maisUsado[0] : 0;
}

/* ---------- Montagem ---------- */

function texto(valor, limite) {
  return String(valor || "")
    .trim()
    .slice(0, limite);
}

function limparCores(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.filter((cor) => HEX.test(cor)).map(expandirHex).slice(0, 8);
}

function linkSeguro(...opcoes) {
  return opcoes.find((url) => /^https:\/\//.test(url || "")) || null;
}

function montarIdentidade(codigo, config) {
  const cores = extrairCores(codigo);
  const tipografia = extrairFontes(codigo);

  const manual = config.cores || {};
  const fontesManuais = Array.isArray(config.fontes)
    ? config.fontes.map((fonte) => texto(fonte.nome, 40)).filter(fonteValida)
    : [];

  return {
    cores: {
      principal: limparCores(manual.principal).length
        ? limparCores(manual.principal)
        : cores.principal,
      secundaria: limparCores(manual.secundaria).length
        ? limparCores(manual.secundaria)
        : cores.secundaria,
    },
    fontes: fontesManuais.length ? fontesManuais.slice(0, 3) : tipografia.fontes,
    pesos: tipografia.pesos,
    raio: Number.isInteger(config.raio) ? Math.min(config.raio, 40) : extrairRaio(codigo),
  };
}

// Linguagens da barra "Languages" do GitHub, da mais usada para a menos usada.
// Ignora as que somam menos de 1% do código.
async function lerLinguagens(repo) {
  try {
    const linguagens = await buscarJson(
      `https://api.github.com/repos/${repo.full_name}/languages`,
    );
    const total = Object.values(linguagens).reduce((soma, bytes) => soma + bytes, 0);

    return Object.entries(linguagens)
      .sort((a, b) => b[1] - a[1])
      .filter(([, bytes]) => total && bytes / total >= 0.01)
      .map(([nome]) => nome);
  } catch (erro) {
    return repo.language ? [repo.language] : [];
  }
}

function juntarSemRepetir(...listas) {
  const vistos = new Set();
  return listas.flat().filter((item) => {
    const chave = String(item || "").toLowerCase();
    if (!chave || chave === TOPICO || vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

async function montarProjeto(repo) {
  const [config, codigo, linguagens] = await Promise.all([
    lerConfig(repo),
    lerArquivosDeEstilo(repo),
    lerLinguagens(repo),
  ]);

  const stackPadrao = juntarSemRepetir(linguagens, repo.topics || []);
  const stack = Array.isArray(config.stack) ? config.stack : stackPadrao;

  return {
    slug: repo.name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
    nome: texto(config.nome || repo.name, 40),
    ano: Number(config.ano) || new Date(repo.created_at).getFullYear(),
    tipo: texto(config.tipo || "Projeto", 30),
    descricao: texto(config.descricao || repo.description, 400),
    stack: stack.slice(0, 8).map((item) => texto(item, 30)),
    site: linkSeguro(config.site, repo.homepage, repo.html_url),
    repositorio: repo.html_url,
    logo: urlArquivo(repo, config.logo),
    identidade: montarIdentidade(codigo, config),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const nomeRepo = req.query && req.query.repo;

    if (nomeRepo !== undefined) {
      if (!NOME_REPO.test(nomeRepo)) {
        return res.status(400).json({ error: "Repositório inválido" });
      }
      const repo = await buscarJson(`https://api.github.com/repos/${USUARIO}/${nomeRepo}`);
      const projeto = await montarProjeto(repo);
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).json(projeto);
    }

    const repos = (
      await buscarJson(`https://api.github.com/users/${USUARIO}/repos?per_page=100&sort=created`)
    ).filter((repo) => !repo.fork && (repo.topics || []).includes(TOPICO));

    const projetos = await Promise.all(repos.map(montarProjeto));
    projetos.sort((a, b) => b.ano - a.ano);

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(projetos);
  } catch (erro) {
    console.error("Erro ao buscar projetos:", erro);
    return res.status(502).json({ error: "Não foi possível carregar os projetos" });
  }
};
