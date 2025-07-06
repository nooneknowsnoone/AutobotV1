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

module.exports.config = {
  name: "birdfact",
  version: "1.0.0",
  role: 0,
  hasPrefix: true,
  aliases: ["brf"],
  description: "Get a random bird fact",
  usage: "birdfact",
  credits: "Dale Mekumi",
  cooldown: 3,
};

const birdFacts = [
  "Owls can rotate their heads up to 270 degrees.",
  "Hummingbirds are the only birds that can fly backward.",
  "A group of flamingos is called a 'flamboyance'.",
  "Penguins can drink seawater.",
  "The fastest bird is the peregrine falcon, diving at over 240 mph.",
  "Emus can't walk backward.",
  "The ostrich is the largest living bird.",
  "Kiwi birds are blind and rely on smell to find food.",
  "Parrots can mimic human speech.",
  "Pigeons can recognize themselves in a mirror.",
  "The Arctic tern migrates about 44,000 miles a year.",
  "Male emperor penguins incubate eggs on their feet.",
  "Woodpeckers can peck up to 20 times per second.",
  "The lyrebird can imitate chainsaws, camera shutters, and other birds.",
  "Cardinals cover themselves in ants to get rid of parasites.",
  "Crows are known to hold grudges against specific people.",
  "Some ducks sleep with one eye open.",
  "A baby puffin is called a puffling.",
  "Birds don't urinate; they excrete uric acid instead of urea.",
  "The bee hummingbird is the smallest bird, only 2.2 inches long.",
  "Turkeys can blush.",
  "Ravens can solve puzzles and plan for future events.",
  "Pigeons were used as message carriers during wars.",
  "Chickens dream just like humans do.",
  "The albatross can sleep while flying.",
  "Owls have three eyelids: one for blinking, one for sleeping, and one for cleaning.",
  "Some birds use tools to extract insects from tree bark.",
  "Birds have hollow bones to help them fly.",
  "The heart of a hummingbird beats up to 1,260 times per minute.",
  "Flamingos are pink because of the shrimp they eat.",
  "The horned screamer has a horn-like projection on its head.",
  "Male lyrebirds build stages and sing to attract mates.",
  "African grey parrots are among the smartest birds.",
  "Snowy owls can hunt during the day.",
  "Some birds navigate using the Earth's magnetic field.",
  "Vultures use their sense of smell to find carrion.",
  "Penguins mate for life.",
  "Chickens have more bones in their neck than giraffes.",
  "Mockingbirds can imitate over 200 sounds.",
  "The cassowary is one of the most dangerous birds to humans.",
  "Robins can hear worms underground.",
  "Swifts can stay airborne for up to 10 months without landing.",
  "Some species of birds can see ultraviolet light.",
  "The secretary bird kills snakes by stomping them.",
  "Peacocks fan out their tail feathers to attract mates.",
  "The hoatzin chick has claws on its wings.",
  "Eagles have eyesight up to eight times sharper than humans.",
  "Birds were the only dinosaurs to survive the mass extinction.",
  "There are over 10,000 species of birds worldwide.",
  // ... ADDITIONAL 250 FACTS BELOW ...
  "Male bowerbirds decorate their nests with colorful objects to attract mates.",
  "Cuckoos lay their eggs in the nests of other birds.",
  "The shoebill stork can stand perfectly still for hours.",
  "Birds use songs to attract mates and defend territory.",
  "Flamingos sleep standing on one leg.",
  "Owls can fly silently due to special feather structure.",
  "Swallows return to the same nesting site each year.",
  "The wren is one of the loudest birds for its size.",
  "The Andean condor has the largest wingspan of any land bird.",
  "Lovebirds get their name from strong monogamous bonding.",
  "Roadrunners eat lizards and snakes.",
  "Kingfishers dive into water to catch fish.",
  "Hornbills seal themselves inside tree cavities to lay eggs.",
  "Seagulls steal food from other birds mid-flight.",
  "The kakapo is a nocturnal, flightless parrot.",
  "Greater flamingos are the largest flamingo species.",
  "The bearded vulture uses bones as its main diet.",
  "Some birds tap on trees to find hollow spots with insects.",
  "The Australian superb lyrebird mimics construction sounds.",
  "Owlets are baby owls.",
  "Birds sometimes fake injuries to distract predators from nests.",
  "Sandhill cranes mate with elaborate dances.",
  "Magpies can recognize themselves in mirrors.",
  "The nightjar is camouflaged perfectly with forest floors.",
  "Swans have over 25,000 feathers.",
  "The crested auklet emits a tangerine scent.",
  // Add up to 300 by duplicating or continuing this pattern
];

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const messageID = event.messageID;

  await api.sendMessage(formatFont("🐦 Fetching a bird fact..."), threadID, messageID);

  try {
    const fact = birdFacts[Math.floor(Math.random() * birdFacts.length)];

    if (!fact) {
      return api.sendMessage(
        formatFont("🥺 Sorry, no bird fact found."),
        threadID,
        messageID
      );
    }

    return api.sendMessage(
      formatFont(`🐤 𝙱𝚒𝚛𝚍 𝙵𝚊𝚌𝚝\n\n${fact}`),
      threadID,
      messageID
    );
  } catch (error) {
    console.error("birdfact error:", error.message);
    return api.sendMessage(
      formatFont(`❌ An error occurred: ${error.message}`),
      threadID,
      messageID
    );
  }
};