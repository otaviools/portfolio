const nodemailer = require("nodemailer");

const transporte = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { nome, email, categoria, mensagem } = req.body;

  if (!nome || !email || !categoria || !mensagem) {
    return res.status(400).json({ error: "Todos os campos são obrigatórios" });
  }

  const emailPortfolio = {
    from: process.env.EMAIL_USER,
    subject: `🚀 Novo Contato: ${nome} - ${categoria}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #2c3e50; color: #ffffff; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">Nova Mensagem do Portfólio</h2>
        </div>
        
        <div style="padding: 20px; color: #333;">
          <p style="font-size: 16px;">Você recebeu uma nova tentativa de contato através do seu site.</p>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Nome:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${nome}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-mail:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Categoria:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${categoria}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <strong>Mensagem:</strong><br>
            <p style="white-space: pre-wrap;">${mensagem}</p>
          </div>
        </div>

        <div style="background-color: #f4f4f4; padding: 10px; text-align: center; color: #777; font-size: 12px;">
          Enviado em: ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}
        </div>
      </div>
    `,
  };

  const emailCliente = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirmação de Contato - Portfólio Otávio Santos",
    html: `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
        <h2>Olá, ${nome}!</h2>
        <p>Recebi sua mensagem e responderei em até <strong>24 horas</strong>.</p>
        
        <div style="background-color: #f4f4f4; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <strong>Sua mensagem:</strong><br>
          <em>"${mensagem}"</em>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p>Atenciosamente,<br>
        <strong>Otávio Santos</strong><br>
        <small>Desenvolvedor Full Stack</small></p>
      </div>
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
};
