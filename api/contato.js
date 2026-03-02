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
    const responseOwner = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Portfolio <onboarding@resend.dev>",
        to: "otaviools13@gmail.com",
        subject: `[Portfolio] Nova mensagem de ${nome}`,
        html: `
          <h2>Nova mensagem do Portfólio</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Categoria:</strong> ${categoriaLabel[categoria] || categoria}</p>
          <p><strong>Mensagem:</strong> ${mensagem}</p>
        `,
      }),
    });

    if (!responseOwner.ok) {
      const err = await responseOwner.json();
      throw new Error(err.message);
    }

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Otávio Santos <onboarding@resend.dev>",
        to: email, // O e-reply vai para quem preencheu o formulário
        subject: "Recebi sua mensagem!",
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Olá, ${nome}!</h2>
            <p>Obrigado por entrar em contato através do meu portfólio.</p>
            <p>Confirmo que recebi sua mensagem sobre <strong>${categoriaLabel[categoria] || categoria}</strong> e responderei em até 24H !</p>
            <br/>
            <hr/>
            <p>Atenciosamente,<br/><strong>Otávio Santos</strong></p>
          </div>
        `,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao processar a solicitação." });
  }
}
