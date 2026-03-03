const nodemailer = require("nodemailer");
const transporte = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nome, email, categoria, mensagem } = req.body;

  if (!nome || !email || !categoria || !mensagem) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const emailPortfolio = {
    from: process.env.EMAIL_USER,
    to: "otaviools13@gmail.com",
    subject: `Novo Contato do Portfólio - ${nome}`,
    html: `
      <h2>Portfólio Dev - Otávio Santos!</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Categoria:</strong> ${categoria}</p>
      <p><strong>Mensagem:</strong></p>
      <p>${mensagem}</p>
      <hr>
      <p><small>Enviado em: ${new Date().toLocaleString("pt-BR")}</small></p>
    `,
  };

  const emailCliente = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Olá, recebi seu email de contato do Portfólio Otávio Santos",
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Recebi sua mensagem e responderei em até <strong>24 horas</strong>.</p>
      <p><strong>Sua mensagem:</strong></p>
      <p>${mensagem}</p>
      <hr>
      <p>Atenciosamente,<br><strong>Otávio Santos</strong></p>
    `,
  };

  try {
    await transporte.sendMail(emailPortfolio);
    await transporte.sendMail(emailCliente);
    res
      .status(200)
      .json({ sucesso: true, mensagem: "Mensagem enviada com sucesso!" });
  } catch (erro) {
    console.error("Erro ao enviar email:", erro);
    res
      .status(500)
      .json({ error: "Erro ao enviar mensagem. Tente novamente!" });
  }
}
