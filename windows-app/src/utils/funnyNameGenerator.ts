const NAMES = [
  "Quantum Llama", "Sneaky Penguin", "Turbo Sloth", "Cosmic Cat",
  "Digital Dragon", "Ninja Narwhal", "Pixel Panda", "Rocket Raccoon",
  "Thunder Turtle", "Wizard Wombat", "Electric Eel", "Funky Falcon",
  "Galaxy Gopher", "Happy Hippo", "Jazzy Jaguar", "Laser Lemur",
  "Mystic Moose", "Neon Newt", "Psychic Puffin", "Quirky Quokka",
  "Rainbow Rhino", "Stellar Seahorse", "Techno Tiger", "Ultra Unicorn",
  "Vibrant Viper", "Wild Walrus", "Xenon Xerus", "Yolo Yak",
  "Zippy Zebra", "Awesome Axolotl",
];

export function getRandomName(excludeNames: string[]): string {
  const available = NAMES.filter((n) => !excludeNames.includes(n));
  if (available.length === 0) {
    return `Profile ${Math.floor(Math.random() * 9000) + 1000}`;
  }
  return available[Math.floor(Math.random() * available.length)]!;
}
