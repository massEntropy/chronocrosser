// js/config.js

// Contains data for procedural strain naming.
// This could also be moved into traits.json if desired for easier user modification without touching JS code.
export const NAME_PARTS = {
    ADJECTIVES: ['Cosmic', 'Galactic', 'Mystic', 'Electric', 'Frosty', 'Golden', 'Purple', 'Dank', 'Ancient', 'Sacred', 'Blazing', 'Crystal', 'Moonlit', 'Forbidden', 'Savage', 'Wicked', 'Atomic', 'Lethal', 'Mindbending'],
    NOUNS: ['Nebula', 'Comet', 'Dream', 'Haze', 'Kush', 'Skunk', 'Giggle', 'Nova', 'Wanderer', 'Elixir', 'Bloom', 'Funk', 'Spirit', 'Void', 'Oblivion', 'Nightmare', 'Ripper', 'Beast', 'Abyss', 'Scream', 'Phantom'],
    CONNECTORS: ['OG', 'Diesel', 'Cookies', 'Pie', 'Cake', 'Sorbet', 'Cheese', 'Glue', 'Wreck', 'Funk', 'Sauce'],

    // New Categories for Expanded Namer (from previous implementation)
    EDGY_ADJECTIVES: ['Forbidden', 'Savage', 'Wicked', 'Atomic', 'Lethal', 'Mindbending', 'Radioactive', 'Psycho', 'Twisted', 'Illegal', 'Weaponized', 'Cursed'],
    EDGY_NOUNS: ['Void', 'Oblivion', 'Nightmare', 'Ripper', 'Beast', 'Abyss', 'Scream', 'Phantom', 'Demon', 'Mutant', 'Terror', 'Doomsday', 'Zombie'],
    
    FUNNY_PREFIXES: ["Mom's", "Grandma's", "Alien", "Secret", "Captain's", "Doctor's", "Why Is This", "Don't Tell", "Oops All", "My Uncle's", "The Missing", "That One Time With The"],
    FUNNY_SUFFIXES: ["Special", "Delight", "Surprise", "Mistake", "Experiment", "Folly", "Sticky Stuff", "Good Time", "Headache", "Regret", "My Bad", "Situation", "Concoction", "Whoopsie"],
    
    BODY_PARTS_HUMOROUS: ["Face", "Mind", "Brain", "Eyeball", "Toe", "Soul", "Noodle", "Spleen", "Butt"],
    ACTIONS_HUMOROUS: ["F*cker", "Melter", "Bender", "Slammer", "Tickler", "Zapper", "Blaster", "Puncher", "Kicker", "Twister", "Shredder", "Obliterator"],

    EXCLAMATIONS_FULL_NAMES: ["High AF", "WTF Bud", "OMG Kush", "Mom Help Me", "Oh Lawd It's Potent", "Sweet Jesus Haze", "Brain Gone", "Where Am I OG", "Can't Feel My Face Diesel", "What Was I Saying Cookies"],
    
    SUBTLE_REFERENCES: ["Rocket Fuel", "Stardust", "Moonrocks", "Gas Giant", "Nebula Nectar", "Comet Candy", "Zero-G"],
    
    CONTROVERSIAL_NOUNS: ["Panic", "Frenzy", "Episode", "Incident", "Meltdown", "Mirage", "Illusion"], 
    CONTROVERSIAL_ADJECTIVES: ["Manic", "Loopy", "Unstable", "Chaotic", "Deranged"] 
};

// You could add other game-wide configuration constants here if they don't fit into traits.json
// For example:
// export const MAX_PLAYER_LEVEL = 100;
// export const UI_THEME_OPTIONS = ['dark_neon', 'light_botanical'];
// However, most of our dynamic configuration is intentionally in traits.json.