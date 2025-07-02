const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const { OpenAI } = require("openai");
const cors = require("cors");

const app = express();
const upload = multer();
const openai = new OpenAI({ apiKey: "votre_clé_openai" });

app.use(cors());

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  try {
    const pdfData = await pdfParse(req.file.buffer);
    const content = pdfData.text.slice(0, 4000); // Tronquer si trop long

    const prompt = `
Voici un document professionnel. Merci de me fournir :
1. Un résumé structuré (3 à 5 phrases)
2. Une liste de points clés
3. Des suggestions d’actions concrètes

Document :
${content}
`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.4,
    });

    res.json({ summary: chatCompletion.choices[0].message.content });
  } catch (err) {
    console.error("Erreur :", err.message);
    res.status(500).json({ error: "Erreur lors de l’analyse du document." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));