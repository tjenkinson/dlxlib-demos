import { ChatGPTAPI } from "chatgpt";

const questions = [
  //   { type: `across`, number: 1, clue: "young cow", length: 6, answer: "heifer" },
  //   { type: `across`, number: 4, clue: "swag", length: 4, answer: "loot" },
  //   { type: `across`, number: 9, clue: "hotel", length: 3, answer: "inn" },
  //   { type: `across`, number: 10, clue: "voila", length: 9, answer: "heypresto" },
  //   {
  //     type: `across`,
  //     number: 11,
  //     clue: "long-lasting",
  //     length: 7,
  //     answer: "durable",
  //   },
  //   { type: `across`, number: 12, clue: "push", length: 5, answer: "shove" },
  //   { type: `across`, number: 13, clue: "vacant", length: 5, answer: "empty" },
  //   {
  //     type: `across`,
  //     number: 15,
  //     clue: "tall and thin",
  //     length: 5,
  //     answer: "lanky",
  //   },
  //   {
  //     type: `across`,
  //     number: 20,
  //     clue: "be of one mind",
  //     length: 5,
  //     answer: "agree",
  //   },
  //   {
  //     type: `across`,
  //     number: 22,
  //     clue: "rice dish",
  //     length: 7,
  //     answer: "risotto",
  //   },
  //   { type: `across`, number: 24, clue: "crude", length: 9, answer: "primitive" },
  //   { type: `across`, number: 25, clue: "fool", length: 3, answer: "mug" },
  //   { type: `across`, number: 26, clue: "twilight", length: 4, answer: "dusk" },
  //   { type: `across`, number: 27, clue: "clown", length: 6, answer: "jester" },
  //   { type: `down`, number: 1, clue: "perm, e.g.", length: 6, answer: "hairdo" },
  //   { type: `down`, number: 2, clue: "central", length: 5, answer: "inner" },
  //   {
  //     type: `down`,
  //     number: 3,
  //     clue: "put on display",
  //     length: 7,
  //     answer: "exhibit",
  //   },
  //   { type: `down`, number: 5, clue: "trolls", length: 5, answer: "ogres" },
  //   { type: `down`, number: 6, clue: "tuft", length: 7, answer: "tussock" },
  { type: `down`, number: 7, clue: "welsh county", length: 5, answer: "dyfed" },
  //   { type: `down`, number: 8, clue: "bumpkin", length: 5, answer: "yokel" },
  { type: `down`, number: 14, clue: "wed", length: 7, answer: "married" },
  //   { type: `down`, number: 16, clue: "stern", length: 7, answer: "austere" },
  //   { type: `down`, number: 17, clue: "pleased", length: 5, answer: "happy" },
  { type: `down`, number: 18, clue: "lag", length: 5, answer: "trail" },
  //   { type: `down`, number: 19, clue: "puma", length: 6, answer: "cougar" },
  //   //   { type: `down`, number: 21, clue: "spice (anag)", length: 5, answer: "epics" },
  //   { type: `down`, number: 23, clue: "entice", length: 5, answer: "tempt" },
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
    // debug: true,
  });

  const questionCandidates = [];
  for (const { clue, length, answer } of questions) {
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
          `The clue is "${clue}" and the answer contains exactly ${length} letters (e.g. the word "test" has length 4 and "testing" has length 7), which may be multiple words with the spaces removed (e.g. "heypresto").`,
          `It's in GB English.`,
          `Provide 50 correct answers that satisfy the conditions above.`,
          `This must be formatted as a JSON array of strings. E.g. \`${JSON.stringify(
            [`word1`, `word2`, `word3`]
          )}]\``,
          ...outputJsonCommand,
        ].join(`\n`),
        {
          systemMessage: outputJsonCommand.join(` `),
          completionParams: {
            model: "gpt-3.5-turbo",
            // model: "text-davinci-003",
            // temperature: 2,
            // n: 2,
            // top_p: 0.8,
          },
        }
      );
      console.log(`Got response: "${res.text}"`);
      const responseParsed = JSON.parse(res.text);
      const candidates = responseParsed
        .map((a) => a.trim().toLowerCase())
        .filter((a) => a.length === length && /^[a-z]+$/.test(a));

      if (!candidates.includes(answer)) {
        console.log("!!! FAILED");
      } else {
        console.log("Success!");
      }
      questionCandidates.push(candidates);
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
