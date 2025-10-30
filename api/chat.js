import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Método no permitido" });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  const WORKFLOW_ID = process.env.WORKFLOW_ID;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      reply: "Falta OPENAI_API_KEY en el servidor (.env)."
    });
  }

  if (!WORKFLOW_ID) {
    return res.status(500).json({
      reply: "Falta WORKFLOW_ID en el servidor (.env)."
    });
  }

  try {
    const userMessage = req.body.message;

    const response = await fetch(
      `https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          input: {
            input_as_text: userMessage,
          },
        }),
      }
    );

    const data = await response.json();

    let reply =
      data.output_text ||
      data.final_output ||
      data.result ||
      JSON.stringify(data);

    if (!reply) {
      reply = "No recibí respuesta del agente.";
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Error llamando al workflow:", err);
    return res.status(500).json({
      reply: "Hubo un error hablando con el agente."
    });
  }
}
