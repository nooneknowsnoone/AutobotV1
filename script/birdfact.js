const axios = require("axios");

let fontEnabled = true;

function formatFont(text) {
  const fontMapping = {
    a: "𝖺", b: "𝖻", c: "𝖼", d: "𝖽", e: "𝖾", f: "𝖿", g: "𝗀", h: "𝗁", i: "𝗂", j: "𝗃", k: "𝗄", l: "𝗅", m: "𝗆",
    n: "𝗇", o: "𝗈", p: "𝗉", q: "𝗊", r: "𝗋", s: "𝗌", t: "𝗍", u: "𝗎", v: "𝗏", w: "𝗐", x: "𝗑", y: "𝗒", z: "𝗓",
    A: "𝖠", B: "𝖡", C: "𝖢", D: "𝖣", E: "𝖤", F: "𝖥", G: "𝖦", H: "𝖧", I: "𝖨", J: "𝖩", K: "𝖪", L: "𝖫", M: "𝖬",
    N: "𝖭", O: "𝖮", P: "𝖯", Q: "𝖰", R: "𝖱", S: "𝖲", T: "𝖳", U: "𝖴", V: "𝖵", W: "𝖶", X: "𝖷", Y: "𝖸", Z: "𝖹"
  };

  let formattedText = "";
  for (const char of text) {
    formattedText += fontEnabled && fontMapping[char] ? fontMapping[char] : char;
  }
  return formattedText;
}

const birdFacts = [
  "Owls can rotate their necks 270 degrees.",
  "Hummingbirds are the only birds that can fly backwards.",
  "A group of flamingos is called a flamboyance.",
  "Penguins propose to their mates with a pebble.",
  "Some ducks sleep with one eye open.",
  "Pigeons can recognize themselves in mirrors.",
  "The fastest bird is the peregrine falcon, reaching speeds over 240 mph.",
  "Male emperor penguins incubate eggs by balancing them on their feet.",
  "Woodpeckers can peck up to 20 times per second.",
  "Parrots can live for over 60 years.",
  "Birds are descendants of dinosaurs.",
  "Kiwi birds are blind and hunt by smell.",
  "Birds have hollow bones to help them fly.",
  "The lyrebird can mimic almost any sound it hears.",
  "Crows are highly intelligent and can solve complex puzzles.",
  "Seagulls can drink seawater.",
  "Some bird species mate for life.",
  "The smallest bird is the bee hummingbird.",
  "Ostriches have the largest eyes of any land animal.",
  "The albatross can sleep while flying.",
  "Chickens can remember over 100 faces.",
  "Cardinals like to cover themselves in ants.",
  "Eagles have vision up to 8 times stronger than humans.",
  "Robins are territorial and aggressive to other robins.",
  "Roadrunners can sprint up to 20 mph.",
  "Swifts can stay airborne for 10 months without landing.",
  "Puffins use their beaks to carry up to 10 fish at once.",
  "Birds don't urinate — they excrete uric acid.",
  "Some birds like ravens can play games.",
  "The Arctic tern migrates over 40,000 miles each year.",
  "Birds can see ultraviolet light.",
  "Many birds use stars to navigate.",
  "Peacocks fan their tail feathers to impress females.",
  "Chickadees store food in hundreds of hiding spots.",
  "The hoatzin bird ferments food like a cow.",
  "Flamingos get their pink color from their diet.",
  "Some birds sleep while perched without falling.",
  "Vultures can eat rotting meat without getting sick.",
  "Male birds often sing to attract mates.",
  "Birds preen to maintain their feathers.",
  "The secretary bird kills snakes by stomping on them.",
  "Hornbills seal themselves in tree cavities when nesting.",
  "The shoebill stork has a terrifying stare.",
  "Ducks have waterproof feathers.",
  "Birds have excellent color vision.",
  "The kakapo is a flightless nocturnal parrot.",
  "Swans can break a human’s arm with their wings.",
  "Macaws can crack nuts with 500 psi of pressure.",
  "The nightjar’s camouflage makes it nearly invisible.",
  "Birds communicate with songs, dances, and calls."
];

module.exports.config = {
  name: "birdfact",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: [],
  description: "Get a random bird fact",
  usage: "birdfact",
  credits: "Developer",
  cooldown: 3,
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  const fact = birdFacts[Math.floor(Math.random() * birdFacts.length)];
  const message = `🐦 𝖱𝖺𝗇𝖽𝗈𝗆 𝖡𝗂𝗋𝖽 𝖥𝖺𝖼𝗍\n\n${fact}`;

  return api.sendMessage(formatFont(message), threadID, messageID);
};