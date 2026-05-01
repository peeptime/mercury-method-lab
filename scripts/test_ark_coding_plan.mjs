import { loadModelConfig } from "./model_config.mjs";

let modelConfig;
try {
  modelConfig = await loadModelConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json"
};

if (modelConfig.apiKey) {
  headers.Authorization = `Bearer ${modelConfig.apiKey}`;
}

const response = await fetch(modelConfig.chatUrl, {
  method: "POST",
  headers,
  body: JSON.stringify({
    model: modelConfig.model,
    messages: [
      {
        role: "user",
        content: "请只回复 OK"
      }
    ],
    temperature: 0
  })
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`HTTP ${response.status}`);
  console.error(errorText);
  process.exit(1);
}

const data = await response.json();
const text = data?.choices?.[0]?.message?.content?.trim() || "";

if (!text) {
  console.error("Empty response");
  process.exit(1);
}

console.log(text);
