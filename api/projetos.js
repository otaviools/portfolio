// Lista os repositórios do GitHub marcados com o tópico "portfolio".
// Cada repositório pode ter um arquivo portfolio.json na raiz com
// tipo, cores, fontes e logo para completar a ficha do projeto.

const USUARIO = process.env.GITHUB_USUARIO || "otaviools";
const TOPICO = "portfolio";
const HEX = /^#[0-9a-fA-F]{3,8}$/;
const NOME_FONTE = /^[A-Za-zÀ-ÿ0-9 ]{1,40}$/;
const PESOS = [100, 200, 300, 400, 500, 600, 700, 800, 900];

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

function urlArquivo(repo, caminho) {
  if (!caminho) return null;
  if (/^https:\/\//.test(caminho)) return caminho;

  const limpo = String(caminho).replace(/^\.?\//, "");
  return `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/${limpo}`;
}

async function lerConfig(repo) {
  try {
    const resposta = await fetch(urlArquivo(repo, "portfolio.json"));
    if (!resposta.ok) return {};
    return await resposta.json();
  } catch (erro) {
    return {};
  }
}

function texto(valor, limite) {
  return String(valor || "")
    .trim()
    .slice(0, limite);
}

function limparCores(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.filter((cor) => HEX.test(cor)).slice(0, 8);
}

function limparFontes(lista) {
  if (!Array.isArray(lista)) return [];

  return lista
    .slice(0, 4)
    .map((fonte) => ({
      nome: texto(fonte.nome, 40),
      peso: PESOS.includes(Number(fonte.peso)) ? Number(fonte.peso) : 400,
      amostra: texto(fonte.amostra || fonte.nome, 20),
    }))
    .filter((fonte) => NOME_FONTE.test(fonte.nome));
}

function linkSeguro(...opcoes) {
  return opcoes.find((url) => /^https:\/\//.test(url || "")) || null;
}

function montarProjeto(repo, config) {
  const stackPadrao = [repo.language, ...(repo.topics || [])].filter(
    (item) => item && item !== TOPICO,
  );
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
    cores: {
      principal: limparCores(config.cores && config.cores.principal),
      secundaria: limparCores(config.cores && config.cores.secundaria),
    },
    fontes: limparFontes(config.fontes),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const resposta = await fetch(
      `https://api.github.com/users/${USUARIO}/repos?per_page=100&sort=created`,
      { headers: cabecalhos() },
    );

    if (!resposta.ok) {
      throw new Error(`GitHub respondeu ${resposta.status}`);
    }

    const repos = (await resposta.json()).filter(
      (repo) => !repo.fork && (repo.topics || []).includes(TOPICO),
    );

    const projetos = await Promise.all(
      repos.map(async (repo) => montarProjeto(repo, await lerConfig(repo))),
    );

    projetos.sort((a, b) => b.ano - a.ano);

    res.setHeader(
      "Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400",
    );
    return res.status(200).json(projetos);
  } catch (erro) {
    console.error("Erro ao buscar projetos:", erro);
    return res
      .status(502)
      .json({ error: "Não foi possível carregar os projetos" });
  }
};
