export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Método não permitido" });

  const { nome, email, categoria, mensagem } = req.body;

  if (!nome || !email || !mensagem) {
    return res
      .status(400)
      .json({ error: "Preencha todos os campos obrigatórios." });
  }

  const categoriaLabel = {
    vaga: "Vaga/Recrutamento",
    comercial: "Projeto Freelance",
    suporte: "Networking",
    outros: "Outro",
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "portfolio <onboarding@resend.dev>",
        to: "otaviools13@gmail.com",
        subject: `[Portfolio] Nova mensagem de ${nome} — ${categoriaLabel[categoria] || categoria}`,
        html: `
          <h2>Nova mensagem do portfólio</h2>
          <table>
            <tr><td><strong>Nome:</strong></td><td>${nome}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
            <tr><td><strong>Categoria:</strong></td><td>${categoriaLabel[categoria] || categoria}</td></tr>
            <tr><td><strong>Mensagem:</strong></td><td>${mensagem}</td></tr>
          </table>
          <br/>
          <p>Responder para: <a href="mailto:${email}">${email}</a></p>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao enviar email." });
  }
}
