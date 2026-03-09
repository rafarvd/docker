const express = require("express");
const app = express();

const WORKFLOW = "main.yml";
const GH_TOKEN = process.env.GH_TOKEN;
const PORT = process.env.PORT || 3000;

app.get("/run/:user/:repo/:min/:max", async (req, res) => {
  try {
    const user = req.params.user;
    const repoPrefix = req.params.repo;
    const min = Number(req.params.min);
    const max = Number(req.params.max);

    if (max - min > 50) {
      return res.send("Limite máximo 50 repos");
    }

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
      return res.send("min e max inválidos");
    }

    if (max < min) {
      return res.send("max precisa ser maior que min");
    }

    const jobs = [];

    for (let i = min; i <= max; i++) {
      const repo = `${repoPrefix}${i}`;

      jobs.push(
        fetch(
          `https://api.github.com/repos/${user}/${repo}/actions/workflows/${WORKFLOW}/dispatches`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${GH_TOKEN}`,
              Accept: "application/vnd.github+json",
            },
            body: JSON.stringify({ ref: "main" }),
          },
        ),
      );
    }

    await Promise.all(jobs);

    res.send(
      `✅ Workflows disparados ${user}/${repoPrefix}${min}-${repoPrefix}${max}`,
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("Erro");
  }
});

app.listen(PORT, () => {
  console.log("Servidor rodando...");
});
