import { ChatGPTAPI } from "chatgpt";

const questions = [
  { type: `across`, number: 1, clue: "young cow", length: 6 },
  { type: `across`, number: 4, clue: "swag", length: 4 },
  { type: `across`, number: 9, clue: "hotel", length: 3 },
  { type: `across`, number: 10, clue: "voila", length: 8 },
  { type: `across`, number: 11, clue: "long-lasting", length: 7 },
  { type: `across`, number: 12, clue: "push", length: 5 },
  { type: `across`, number: 13, clue: "vacant", length: 5 },
  { type: `across`, number: 15, clue: "tall and thin", length: 5 },
  { type: `across`, number: 20, clue: "be of one mind", length: 5 },
  { type: `across`, number: 22, clue: "rice dish", length: 7 },
  { type: `across`, number: 24, clue: "crude", length: 9 },
  { type: `across`, number: 25, clue: "fool", length: 3 },
  { type: `across`, number: 26, clue: "twilight", length: 4 },
  { type: `across`, number: 27, clue: "clown", length: 6 },
  { type: `down`, number: 1, clue: "perm, e.g.", length: 6 },
  { type: `down`, number: 2, clue: "central", length: 5 },
  { type: `down`, number: 3, clue: "put on display", length: 7 },
  { type: `down`, number: 5, clue: "trolls", length: 5 },
  { type: `down`, number: 6, clue: "tuft", length: 7 },
  { type: `down`, number: 7, clue: "welsh county", length: 5 },
  { type: `down`, number: 8, clue: "bumpkin", length: 5 },
  { type: `down`, number: 14, clue: "wed", length: 7 },
  { type: `down`, number: 16, clue: "stern", length: 7 },
  { type: `down`, number: 17, clue: "pleased", length: 5 },
  { type: `down`, number: 18, clue: "lag", length: 5 },
  { type: `down`, number: 19, clue: "puma", length: 6 },
  { type: `down`, number: 21, clue: "spice (anag)", length: 5 },
  { type: `down`, number: 23, clue: "entice", length: 5 },
];

const withRetries = async (count, fn) => {
  let lastError;

  for (let i = 0; i < count; i++) {
    try {
      return await fn();
    } catch (e) {
      lastError = e;
      console.log(`Error: ${e.message}`);
    }
  }

  throw lastError;
};

const generateCode = (questionCandidates, type) => {
  return `new Map<number, string[]>([
${questions
  .map(({ number, clue, type: _type }, i) => {
    const candidates = questionCandidates[i];

    if (type !== _type) return null;
    return `  [${number}, ${JSON.stringify(candidates)}], // ${clue}`;
  })
  .filter(Boolean)
  .join(`\n`)}
])`;
};

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) throw new Error(`Missing api key`);

async function go() {
  const api = new ChatGPTAPI({
    apiKey: apiKey,
  });

  const questionCandidates = [];
  for (const { clue, length } of questions) {
    await withRetries(3, async () => {
      console.log(`Asking clue "${clue}"`);
      const outputJsonCommand = [
        `You are an assistant that only speaks valid JSON.`,
        `Do not output anything else.`,
        `The response you send must be parseable as JSON.`,
      ];
      const res = await api.sendMessage(
        [
          `I'm trying to solve a crossword puzzle.`,
          `It must be a ${length} letter word, meaning each word must have exactly ${length} characters, and the clue is "${clue}".`,
          `Provide as many answers as you can (max 30) that meet the condition above.`,
          `This must be formatted as a JSON array of strings. E.g. \`${[
            `word1`,
            `word2`,
            `word3`,
          ]}]\``,
          ...outputJsonCommand,
        ].join(`\n`),
        {
          systemMessage: outputJsonCommand.join(` `),
        }
      );
      console.log(`Got response: "${res.text}"`);
      const responseParsed = JSON.parse(res.text);
      questionCandidates.push(
        responseParsed
          .map((a) => a.trim().toLowerCase())
          .filter((a) => a.length === length && /^[a-z]+$/.test(a))
      );
    });
  }

  console.log(``);
  console.log(`=== Results ===`);
  console.log(questionCandidates);

  console.log(``);
  console.log(`=== Across Code snippet ===`);
  console.log(generateCode(questionCandidates, `across`));

  console.log(``);
  console.log(`=== Down Code snippet ===`);
  console.log(generateCode(questionCandidates, `down`));
}

go().catch((e) => {
  console.error(e);
  process.exit(1);
});
