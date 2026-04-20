import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";
import fs from "fs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
    process.exit(1);
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log("\n=== Proposal Generator ===\n");

  let details;
  try {
    details = {
      clientName: await ask(rl, "Client name: "),
      businessType: await ask(rl, "Client business type: "),
      projectDescription: await ask(rl, "Project description (what they need): "),
      deliverables: await ask(rl, "Key deliverables (what you'll produce): "),
      timeline: await ask(rl, "Timeline: "),
      rate: await ask(rl, "Your rate or budget range: "),
      yourName: await ask(rl, "Your name / business name: "),
    };
  } finally {
    rl.close();
  }

  for (const [key, val] of Object.entries(details)) {
    if (!val) {
      console.error(`Error: "${key}" cannot be empty.`);
      process.exit(1);
    }
  }

  const prompt = `You are a professional business consultant writing a client proposal. Generate a polished, professional proposal in Markdown format based on the following details:

**Client:** ${details.clientName}
**Client Business Type:** ${details.businessType}
**Project Description:** ${details.projectDescription}
**Key Deliverables:** ${details.deliverables}
**Timeline:** ${details.timeline}
**Investment / Rate:** ${details.rate}
**Prepared By:** ${details.yourName}

Write a complete, professional proposal that includes:
1. A title and header with client name, date, and preparer
2. Executive Summary (2-3 paragraphs introducing the opportunity and proposed solution)
3. Scope of Work (bullet points covering all aspects of the project)
4. Deliverables & Timeline (clearly itemized with milestones)
5. Investment / Pricing section (present the rate/budget professionally)
6. What's Included (bullet list of what's covered)
7. What's Not Included (bullet list of explicitly out-of-scope items)
8. Next Steps / Call to Action (clear 3-step process for moving forward)
9. Professional sign-off

Use today's date. Keep the tone confident, professional, and client-focused. Format everything cleanly in Markdown.`;

  console.log("\nGenerating proposal...\n");

  let proposalText = "";

  try {
    const stream = client.messages.stream({
      model: "claude-sonnet-4-5",
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });

    process.stdout.write("Writing");
    let dotCount = 0;
    stream.on("text", (delta) => {
      proposalText += delta;
      dotCount++;
      if (dotCount % 50 === 0) process.stdout.write(".");
    });

    await stream.finalMessage();
    process.stdout.write("\n");
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Error: Invalid API key. Check your ANTHROPIC_API_KEY.");
    } else if (err instanceof Anthropic.RateLimitError) {
      console.error("Error: Rate limit exceeded. Please try again shortly.");
    } else if (err instanceof Anthropic.APIError) {
      console.error(`API error (${err.status}): ${err.message}`);
    } else {
      console.error("Unexpected error:", err.message);
    }
    process.exit(1);
  }

  const filename = `${slugify(details.clientName)}-proposal.md`;
  const filepath = `./${filename}`;

  try {
    fs.writeFileSync(filepath, proposalText, "utf-8");
  } catch (err) {
    console.error(`Error saving file: ${err.message}`);
    process.exit(1);
  }

  console.log(`\nProposal saved: ${filename}`);
}

main();
