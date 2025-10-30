import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// Para que Express pueda leer JSON del body
app.use(express.json());

// Para servir archivos estáticos (index.html, CSS interno, etc.)
app.use(express.static("."));

// Leemos variables privadas
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const WORKFLOW_ID = process.env.WORKFLOW_ID;

// Endpoint al que el frontend le va a pegar cuando el usuario envía mensaje
app.post("/api/chat", async (req, res) => {
  const userMessage = req.body.message;

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
    // Llamada al workflow publicado en tu Agent Builder
    const response = await fetch(`https://api.openai.com/v1/workflows/${WORKFLOW_ID}/runs`, {
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
});

    const data = await response.json();

    // Dependiendo de cómo regresa tu workflow,
    // puede venir en data.output_text o dentro de otra estructura.
    // Vamos a intentar varias rutas comunes:
    let reply =
      data.output_text ||
      data.final_output ||
      data.result ||
      JSON.stringify(data);

    if (!reply) {
      reply = "No recibí respuesta del agente.";
    }

    res.json({ reply });
  } catch (err) {
    console.error("Error llamando al workflow:", err);
    res.status(500).json({
      reply: "Hubo un error hablando con el agente."
    });
  }
});

// Arrancar servidor en localhost:3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
