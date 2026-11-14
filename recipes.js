/* Sizzle & Story - real recipe data.
   Amounts: us = [number, unit], m = [number, unit]. Numbers scale with servings.
   These are standard, widely published home recipes. */
window.RECIPES = [
{
  id: "pancakes",
  nvTips: ["Measure the flour with a tactile cup over a tray, then slide a knife across the top to level it.", "Melt the butter in the microwave in short 15-second bursts in a covered mug, and let it cool until the mug feels warm, not hot.", "Check the pan is hot by flicking in a few drops of water: a quick, lively sizzle means it is ready. A loud crackle means it is too hot.", "Pour batter with a 1/4 cup measuring cup or a squeeze bottle, holding it just above the pan and counting to 2.", "Use a talking timer: about 2 minutes on the first side. Listen as the sizzle softens, then slide a wide spatula under the edge. When it lifts easily and feels firm, flip.", "Doneness without looking: press the center gently with the back of the spatula. It should spring back. A toothpick pushed into the middle should come out feeling dry, with no wet batter."],
  jobs: ['K','K','T','K','K','G','G','G','T'], jobNotes: {2:'Grown-up melts the butter and cracks the egg. Kid whisks.', 8:'Grown-up takes pancakes off the stove. Kid adds toppings.'},
  name: "Fluffy Pancakes",
  img: "img/pancakes.jpg",
  alt: "A tall stack of three golden pancakes with melting butter, maple syrup, strawberries and blueberries",
  skill: "Measuring, gentle mixing, and reading heat",
  inStory: true,
  servings: 4, yieldNote: "about 8 pancakes, 4 inch (10 cm) each",
  prep: 5, cook: 15,
  equipment: ["2 mixing bowls", "Whisk and a spatula or spoon", "Measuring cups and spoons", "Large nonstick skillet or griddle", "Wide flipping spatula", "1/4 cup (60 ml) measure or ladle"],
  ingredients: [
    { us:[1.5,"cups"], m:[190,"g"], name:"all-purpose flour (spooned and leveled)", shop:"All-purpose flour" },
    { us:[3.5,"tsp"], m:[14,"g"], name:"baking powder", shop:"Baking powder" },
    { us:[1,"Tbsp"], m:[13,"g"], name:"granulated sugar", shop:"Sugar" },
    { us:[0.5,"tsp"], m:[3,"g"], name:"salt", shop:"Salt" },
    { us:[1.25,"cups"], m:[300,"ml"], name:"milk", shop:"Milk" },
    { us:[1,""], m:[1,""], name:"large egg", many:"large eggs", shop:"Eggs" },
    { us:[3,"Tbsp"], m:[42,"g"], name:"unsalted butter, melted and slightly cooled, plus a little for the pan", shop:"Unsalted butter" },
    { us:[null,""], m:[null,""], name:"To serve: butter, maple syrup, fresh berries (optional)", shop:"Maple syrup and berries (optional)" }
  ],
  steps: [
    "Wash your hands with soap for 20 seconds. You will be handling raw egg.",
    "In a large bowl, whisk together the flour, baking powder, sugar, and salt.",
    "In a second bowl, whisk the milk, egg, and slightly cooled melted butter.",
    "Make a well in the dry ingredients, pour in the wet ingredients, and stir gently just until no dry flour remains. Small lumps are fine. Do not overmix.",
    "Let the batter rest while the pan heats, about 5 minutes.",
    "Heat a skillet or griddle over medium heat (about 375°F / 190°C for an electric griddle). Lightly grease it with butter.",
    "Pour about 1/4 cup (60 ml) of batter per pancake. Cook until bubbles form on the surface and the edges look set, about 2 minutes.",
    "Flip and cook 1 to 2 minutes more, until golden and the center springs back when lightly pressed, with no wet batter inside.",
    "Keep cooked pancakes warm on a plate under a clean towel while you cook the rest. Serve warm with your toppings."
  ],
  safety: [
    "Do not taste raw batter. Raw egg and raw flour can carry bacteria such as Salmonella and E. coli.",
    "Wash hands, whisk, and counters after handling raw egg.",
    "Cook pancakes all the way through: the center should spring back and show no wet batter.",
    "Refrigerate leftovers within 2 hours. Eat within 3 to 4 days, or freeze up to 2 months."
  ],
  allergens: ["Wheat (gluten)", "Milk", "Egg"],
  subs: [
    { swap:"Buttermilk instead of milk", how:"Use 1 1/4 cups (300 ml) buttermilk, reduce baking powder to 2 tsp and add 1/2 tsp baking soda.", effect:"Changes the result: tangier, more tender, slightly thicker pancakes." },
    { swap:"Oat or soy milk instead of milk", how:"Swap 1 to 1.", effect:"Very close. Pancakes may brown a little less." },
    { swap:"Flax egg instead of egg", how:"Mix 1 Tbsp ground flaxseed with 3 Tbsp water, rest 5 minutes.", effect:"Changes the result: denser, less rise, slightly nutty." },
    { swap:"Gluten-free 1 to 1 flour blend (with xanthan gum)", how:"Swap by weight, 190 g. Rest batter 10 minutes.", effect:"Slightly more delicate. Check the blend label if you need certified gluten-free." },
    { swap:"Neutral oil instead of melted butter", how:"Swap 1 to 1.", effect:"Works well, with less buttery flavor." }
  ],
  tip: "Spoon flour into the cup and level it. Scooping packs in extra flour and makes pancakes tough.",
},
{
  id: "friedrice",
  nvTips: ["Frozen peas and carrots skip the knife work. Kitchen scissors are a safe way to snip green onions.", "Cook eggs until they feel firm and dry when pressed with the spatula. A talking thermometer pushed into a pile of scrambled egg should read 160°F (71°C).", "Listen for a steady, lively sizzle when the rice goes in. If it goes quiet, the pan has cooled, so wait a moment before stirring.", "Reheat leftover fried rice to 165°F (74°C), checked with a talking thermometer.", "Keep the wok handle pointing to one side you always use, and set the spatula on a spoon rest at a fixed spot."],
  jobs: ['G','T','G','G','G','G','T'], jobNotes: {1:'Kid washes hands. Grown-up does all the knife work. Kids can tear green onions by hand.', 6:'Kid measures the soy sauce and sesame oil into a little cup first. Grown-up adds them to the hot pan.'},
  name: "Vegetable Fried Rice",
  img: "img/friedrice.jpg",
  alt: "A steaming bowl of fried rice with peas, carrots, egg and green onions",
  skill: "Safe rice handling and high-heat stir-frying",
  inStory: false,
  servings: 4, yieldNote: "4 bowls",
  prep: 10, cook: 12,
  prepNote: "plus rice cooked and chilled ahead",
  equipment: ["Large skillet or wok", "Spatula", "Cutting board and knife", "Small bowl and fork", "Shallow container (for cooling rice the day before)"],
  ingredients: [
    { us:[4,"cups"], m:[600,"g"], name:"cooked long-grain white rice, cooled and refrigerated (ideally 1 day old)", shop:"Long-grain white rice" },
    { us:[2,"Tbsp"], m:[30,"ml"], name:"neutral oil, divided", shop:"Neutral cooking oil" },
    { us:[2,""], m:[2,""], name:"large eggs, beaten", one:"large egg, beaten", shop:"Eggs" },
    { us:[0.5,""], m:[0.5,""], name:"medium onion, diced", shop:"Onion" },
    { us:[2,"cloves"], m:[2,"cloves"], name:"garlic, minced", shop:"Garlic" },
    { us:[1,"cup"], m:[140,"g"], name:"frozen peas and carrots", shop:"Frozen peas and carrots" },
    { us:[3,""], m:[3,""], name:"green onions, sliced", one:"green onion, sliced", shop:"Green onions" },
    { us:[3,"Tbsp"], m:[45,"ml"], name:"soy sauce, or to taste", shop:"Soy sauce" },
    { us:[1,"tsp"], m:[5,"ml"], name:"toasted sesame oil", shop:"Toasted sesame oil" }
  ],
  steps: [
    "The day before (or at least several hours ahead): cook the rice, spread it in a shallow container so it cools quickly, cover, and refrigerate within 1 hour if you can, and never longer than 2 hours.",
    "Wash your hands. Dice the onion, mince the garlic, and slice the green onions.",
    "Heat 1 Tbsp oil in a large skillet or wok over medium-high heat. Add the beaten eggs and scramble until fully set with no liquid egg left. Move them to a plate.",
    "Add the remaining 1 Tbsp oil. Cook the onion 3 to 4 minutes, until soft and translucent. Softening the onion first lets it turn sweet before the rice goes in.",
    "Add the garlic and cook about 30 seconds, until fragrant. Add the peas and carrots and cook 2 to 3 minutes until hot.",
    "Add the cold rice. Break up clumps and spread it across the pan. Cook 3 to 5 minutes, stirring now and then, until every grain is hot and some are lightly toasted.",
    "Add the soy sauce and sesame oil and toss. Return the eggs, add the green onions, toss again, and serve hot."
  ],
  safety: [
    "Cooked rice can carry Bacillus cereus spores that survive cooking. Cool rice quickly in a shallow container and refrigerate within 2 hours (1 hour if the room is above 90°F / 32°C).",
    "Use refrigerated cooked rice within 3 to 4 days.",
    "Cook eggs until fully set, to 160°F (71°C).",
    "Reheat leftover fried rice to 165°F (74°C), checked with a food thermometer, and only reheat it once."
  ],
  allergens: ["Soy", "Wheat (in most soy sauce)", "Egg", "Sesame"],
  subs: [
    { swap:"Tamari labeled gluten-free instead of soy sauce", how:"Swap 1 to 1.", effect:"Very close, slightly richer. Still contains soy." },
    { swap:"Coconut aminos instead of soy sauce", how:"Swap 1 to 1, add salt to taste.", effect:"Changes the result: sweeter and less salty. Soy-free and wheat-free." },
    { swap:"Brown rice instead of white", how:"Use the same amount, cooked and chilled.", effect:"Changes the result: chewier and nuttier." },
    { swap:"Leave out the egg", how:"Add 1/2 cup extra vegetables or diced firm tofu.", effect:"Egg-free. Tofu adds soy." },
    { swap:"Freshly cooked rice", how:"Spread it on a tray to steam off for 15 minutes first.", effect:"Changes the result: softer and stickier than day-old rice." }
  ],
  tip: "Cold, day-old rice fries into separate grains. Fresh, warm rice turns mushy.",
},
{
  id: "pasta",
  nvTips: ["Use the back burner when you can, and turn handles inward.", "Listen for the rolling boil (a steady, loud bubbling) before adding pasta. Lower pasta in with tongs, close to the water.", "Instead of carrying boiling water to the sink, lift pasta out with tongs or use a pot with a built-in strainer insert.", "Set a talking timer for the package time. Taste one strand (cooled for a few seconds) to check it is tender but slightly firm.", "For the sauce, listen for a gentle bubbling. Loud spitting means the heat is too high.", "Garlic is ready when it smells fragrant, about 30 seconds. Use a timer so it does not burn."],
  jobs: ['G','G','G','G','G','G','T'], jobNotes: {6:'Kid tears the basil and sprinkles the cheese on the plates.'},
  name: "Tomato Basil Pasta",
  img: "img/pasta.jpg",
  alt: "A bowl of spaghetti in glossy red tomato sauce topped with basil and parmesan",
  skill: "Softening aromatics, simmering, and cooking pasta al dente",
  inStory: false,
  servings: 4, yieldNote: "4 plates",
  prep: 10, cook: 25,
  equipment: ["Large pot for pasta", "Medium saucepan or deep skillet", "Wooden spoon", "Colander", "Cutting board and knife", "Heatproof mug (to save pasta water)"],
  ingredients: [
    { us:[12,"oz"], m:[340,"g"], name:"spaghetti", shop:"Spaghetti" },
    { us:[2,"Tbsp"], m:[30,"ml"], name:"olive oil", shop:"Olive oil" },
    { us:[1,""], m:[1,""], name:"small onion, finely chopped", many:"small onions, finely chopped", shop:"Onion" },
    { us:[3,"cloves"], m:[3,"cloves"], name:"garlic, minced", shop:"Garlic" },
    { us:[28,"oz can"], m:[794,"g can"], name:"crushed tomatoes", shop:"Crushed tomatoes (28 oz / 794 g can)" },
    { us:[0.75,"tsp"], m:[4,"g"], name:"salt for the sauce, plus more for the pasta water", shop:"Salt" },
    { us:[0.5,"tsp"], m:[2,"g"], name:"sugar (optional, for very tart tomatoes)", shop:"Sugar" },
    { us:[0.25,"tsp"], m:[0.5,"g"], name:"red pepper flakes (optional)", shop:"Red pepper flakes (optional)" },
    { us:[0.25,"cup"], m:[6,"g"], name:"fresh basil leaves, torn", shop:"Fresh basil" },
    { us:[0.25,"cup"], m:[25,"g"], name:"grated Parmesan, to serve", shop:"Parmesan" }
  ],
  steps: [
    "Bring a large pot of water to a boil and salt it well.",
    "Heat the olive oil in a saucepan over medium heat. Cook the onion 5 to 7 minutes, stirring, until soft and translucent. Soft onion melts into the sauce; raw onion stays crunchy and sharp.",
    "Add the garlic and pepper flakes and cook 30 to 60 seconds, just until fragrant. Do not let garlic brown or it turns bitter.",
    "Add the crushed tomatoes, salt, and sugar if using. Simmer gently, stirring now and then, 15 to 20 minutes until slightly thickened.",
    "While the sauce simmers, cook the spaghetti according to the package until al dente, usually 9 to 11 minutes. Scoop out 1/2 cup (120 ml) of pasta water, then drain.",
    "Toss the spaghetti in the sauce over low heat, adding splashes of pasta water until the sauce is glossy and clings to the noodles.",
    "Tear in the basil and serve with Parmesan."
  ],
  safety: [
    "Turn pot handles inward and drain boiling pasta away from your body.",
    "Refrigerate leftovers within 2 hours. Eat within 3 to 5 days.",
    "Reheat leftovers to 165°F (74°C)."
  ],
  allergens: ["Wheat (gluten)", "Milk (Parmesan)"],
  subs: [
    { swap:"Gluten-free spaghetti", how:"Cook to package time, start tasting 2 minutes early.", effect:"Changes the result: softer and can break if overcooked." },
    { swap:"Skip the Parmesan or use nutritional yeast", how:"Use 1 to 2 Tbsp nutritional yeast.", effect:"Dairy-free. Less salty richness." },
    { swap:"Fresh tomatoes instead of canned", how:"Use about 2 1/2 lb (1.1 kg) ripe tomatoes, chopped. Simmer 25 to 30 minutes.", effect:"Changes the result: brighter, lighter sauce." },
    { swap:"Dried basil instead of fresh", how:"Use 1 tsp, added with the tomatoes.", effect:"Less fresh aroma." }
  ],
  tip: "Save a mug of starchy pasta water. A splash makes sauce glossy and helps it cling.",
},
{
  id: "omelet",
  nvTips: ["Crack each egg into a small bowl first, so you can feel for and remove any shell.", "Use medium-low heat: the butter should foam with a soft fizz, not crackle.", "An omelet is safe at 160°F (71°C). A talking instant-read thermometer slid into the thickest part tells you, so you never have to judge by color.", "Feel the top with a silicone spatula: it should be set, not runny, before you fold."],
  jobs: ['T','K','G','G','T','G','T'], jobNotes: {0:'Kid cracks eggs into a bowl with help. Everyone washes hands after.', 4:'Kid measures the cheese into a little bowl. Grown-up sprinkles it into the hot pan.', 6:'Grown-up slides it onto the plate. Kid sprinkles the chives.'},
  name: "Cheese and Chive Omelet",
  img: "img/omelet.jpg",
  alt: "A golden folded omelet with melted cheese and chives beside cherry tomatoes",
  skill: "Gentle heat control and cooking eggs to a safe temperature",
  inStory: false,
  servings: 1, yieldNote: "1 omelet",
  prep: 5, cook: 5,
  equipment: ["8 inch (20 cm) nonstick skillet", "Bowl and fork or whisk", "Silicone spatula", "Instant-read food thermometer (recommended)"],
  ingredients: [
    { us:[3,""], m:[3,""], name:"large eggs", one:"large egg", shop:"Eggs" },
    { us:[1,"Tbsp"], m:[15,"ml"], name:"milk or water (optional)", shop:"Milk" },
    { us:[0.125,"tsp"], m:[1,"g"], name:"salt, plus a pinch of black pepper", shop:"Salt and pepper" },
    { us:[1,"Tbsp"], m:[14,"g"], name:"butter", shop:"Butter" },
    { us:[0.25,"cup"], m:[28,"g"], name:"shredded cheddar", shop:"Cheddar cheese" },
    { us:[1,"tsp"], m:[1,"g"], name:"chopped fresh chives", shop:"Fresh chives" }
  ],
  steps: [
    "Crack the eggs into a bowl. Wash your hands after touching raw shells.",
    "Add the milk, salt, and pepper. Beat with a fork until no streaks of white remain.",
    "Heat the skillet over medium-low heat and melt the butter until it foams.",
    "Pour in the eggs. Let them sit 20 to 30 seconds, then push the cooked edges toward the center, tilting the pan so liquid egg flows underneath. Repeat for 1 to 2 minutes.",
    "When the top is nearly set, sprinkle the cheese over one half.",
    "Cook until the eggs are fully set with no visible liquid egg. For a food-safe omelet the eggs reach 160°F (71°C) on an instant-read thermometer.",
    "Fold the omelet in half, slide it onto a plate, and top with chives."
  ],
  safety: [
    "Keep eggs refrigerated at 40°F (4°C) or colder until you use them.",
    "Wash hands, utensils, and counters after touching raw egg.",
    "Cook egg dishes to 160°F (71°C). Color alone does not tell you eggs are safe.",
    "Do not leave cooked eggs out longer than 2 hours."
  ],
  allergens: ["Egg", "Milk"],
  subs: [
    { swap:"Pasteurized liquid egg", how:"Use 3/4 cup (180 ml) in place of 3 eggs.", effect:"Very close in taste and texture." },
    { swap:"Egg whites only", how:"Use 6 large egg whites.", effect:"Changes the result: lighter, firmer, less rich." },
    { swap:"Dairy-free cheese and oil", how:"Swap 1 to 1; use water instead of milk.", effect:"Dairy-free. Cheese melts less smoothly." }
  ],
  tip: "Low, gentle heat keeps an omelet tender. High heat makes it rubbery before the center cooks.",
},
{
  id: "onigiri",
  nvTips: ["Rinse rice by count: swirl, drain through a fine strainer, and repeat 4 times.", "A rice cooker that beeps when done makes timing easy. On the stove, use a talking timer for 15 minutes cooking and 10 minutes resting.", "Cook salmon to 145°F (63°C), checked with a talking thermometer.", "Before shaping, touch the rice with a clean fingertip: it should feel warm, not hot.", "Shaping inside plastic wrap keeps rice off your hands and makes a neat triangle by feel."],
  jobs: ['K','T','G','G','G','K','T','K','K'], jobNotes: {1:'Kid pours in the measured water. Grown-up carries the pot to the stove.', 6:'Grown-up checks the rice is cool enough to touch.'},
  name: "Salmon Rice Balls (Onigiri)",
  img: "img/onigiri.jpg",
  alt: "Three triangle rice balls wrapped in nori on a bamboo plate, one with salmon filling",
  skill: "Rinsing and steaming rice, and shaping by hand safely",
  inStory: false,
  servings: 6, yieldNote: "6 rice balls",
  prep: 40, cook: 25,
  prepNote: "includes 30 minutes soaking",
  equipment: ["Medium pot with a tight lid (or a rice cooker)", "Fine strainer", "Baking sheet or skillet for salmon", "Instant-read food thermometer", "Small bowl of water", "Plastic wrap (optional)"],
  ingredients: [
    { us:[2,"cups"], m:[400,"g"], name:"uncooked Japanese short-grain rice", shop:"Japanese short-grain rice" },
    { us:[2.25,"cups"], m:[540,"ml"], name:"cold water for cooking", shop:null },
    { us:[5,"oz"], m:[140,"g"], name:"salmon fillet, skin removed", shop:"Salmon fillet" },
    { us:[1,"tsp"], m:[6,"g"], name:"salt, divided (a pinch for the salmon, the rest for your hands)", shop:"Salt" },
    { us:[2,"sheets"], m:[2,"sheets"], name:"nori, each cut into 3 strips", shop:"Nori sheets" }
  ],
  steps: [
    "Rinse the rice in cold water: swirl, drain, and repeat 3 to 4 times until the water is mostly clear. This removes surface starch so the rice is sticky, not gummy.",
    "Put the rice and the measured water in the pot and let it soak 30 minutes.",
    "Bring to a boil over medium-high heat, cover, turn the heat to low, and cook 15 minutes without lifting the lid.",
    "Turn off the heat and let it rest, covered, 10 minutes. Fluff gently.",
    "Meanwhile, season the salmon with a pinch of salt and bake at 400°F (200°C) for 10 to 12 minutes, or pan-cook, until it reaches 145°F (63°C). Cool slightly and flake, removing any bones.",
    "Wash your hands well. Wet your hands and rub a small pinch of salt over your palms.",
    "Scoop about 1/2 cup (about 110 g) of warm rice. Press a dent in the middle, add about 1 Tbsp salmon, and cover with a little more rice.",
    "Cup your hands and press gently 3 or 4 times, turning the ball, to form a triangle. Repeat for all 6.",
    "Wrap each with a nori strip just before eating so the seaweed stays crisp."
  ],
  safety: [
    "You shape onigiri with your hands, so wash hands well first, or shape them inside plastic wrap or with food-safe gloves.",
    "Cook salmon to 145°F (63°C), checked with a food thermometer.",
    "Do not keep onigiri at room temperature longer than 2 hours (1 hour above 90°F / 32°C). Wrap and refrigerate leftovers and eat within 1 day.",
    "Cooked rice can carry Bacillus cereus spores, so cool and refrigerate leftover rice promptly."
  ],
  allergens: ["Fish (salmon)"],
  subs: [
    { swap:"Canned tuna with mayonnaise", how:"Mix one 5 oz (142 g) can tuna, drained, with 2 Tbsp mayonnaise.", effect:"Changes the result: creamy filling. Adds egg allergen. Keep chilled and eat soon." },
    { swap:"Umeboshi (pickled plum)", how:"Use 1/2 pitted plum per rice ball.", effect:"Vegetarian. Very sour and salty." },
    { swap:"Long-grain rice", how:"Not recommended.", effect:"Changes the result a lot: it is not sticky enough and the balls fall apart." },
    { swap:"Shape with plastic wrap", how:"Put rice on plastic wrap, gather and press.", effect:"Same result, cleaner hands, less sticking." }
  ],
  tip: "Wet, lightly salted hands stop rice from sticking and season the outside evenly.",
},
{
  id: "cookies",
  nvTips: ["A cookie scoop gives even cookies by feel. Push each scoop off onto the parchment at spaced spots, like dots on a dice face.", "Use long oven mitts. Pull the oven rack out toward you before lifting the tray, instead of reaching into the oven.", "Bake by time with a talking timer, 9 to 11 minutes. The edges feel set when touched gently with a spatula.", "Put the hot tray on a cooling rack at a fixed spot so everyone knows where it is."],
  jobs: ['G','K','T','T','T','K','G','G'], jobNotes: {2:'Grown-up runs the electric mixer. Kid can help hold the bowl.', 3:'Kid cracks eggs into a small bowl first with help.', 4:'Kid stirs in the chips. No tasting raw dough!', 7:'Grown-up moves the hot tray. Kid washes hands after touching raw dough.'},
  name: "Chocolate Chip Cookies",
  img: "img/cookies.jpg",
  alt: "A stack of chocolate chip cookies on a cooling rack with one broken open, next to a glass of milk",
  skill: "Creaming butter and sugar, and baking by time and temperature",
  inStory: false,
  servings: 48, servingLabel: "cookies", yieldNote: "about 48 cookies",
  prep: 15, cook: 30,
  cookNote: "9 to 11 minutes per tray, about 3 trays",
  equipment: ["Oven", "2 baking sheets, lined with parchment if you like", "Large bowl and medium bowl", "Electric mixer or sturdy spoon", "Measuring cups and spoons", "Cooling rack"],
  ingredients: [
    { us:[2.25,"cups"], m:[280,"g"], name:"all-purpose flour (spooned and leveled)", shop:"All-purpose flour" },
    { us:[1,"tsp"], m:[6,"g"], name:"baking soda", shop:"Baking soda" },
    { us:[1,"tsp"], m:[6,"g"], name:"salt", shop:"Salt" },
    { us:[1,"cup"], m:[227,"g"], name:"unsalted butter, softened", shop:"Unsalted butter" },
    { us:[0.75,"cup"], m:[150,"g"], name:"granulated sugar", shop:"Sugar" },
    { us:[0.75,"cup"], m:[165,"g"], name:"packed brown sugar", shop:"Brown sugar" },
    { us:[1,"tsp"], m:[5,"ml"], name:"vanilla extract", shop:"Vanilla extract" },
    { us:[2,""], m:[2,""], name:"large eggs", one:"large egg", shop:"Eggs" },
    { us:[2,"cups"], m:[340,"g"], name:"semisweet chocolate chips", shop:"Chocolate chips" }
  ],
  steps: [
    "Heat the oven to 375°F (190°C).",
    "Whisk the flour, baking soda, and salt in a medium bowl.",
    "In a large bowl, beat the butter, granulated sugar, and brown sugar until creamy, about 2 minutes. Creaming traps air that helps the cookies rise.",
    "Beat in the eggs one at a time, then the vanilla.",
    "Mix in the flour mixture on low speed just until combined, then stir in the chocolate chips.",
    "Drop rounded tablespoons of dough 2 inches (5 cm) apart on the baking sheets.",
    "Bake 9 to 11 minutes, until the edges are golden.",
    "Cool on the sheet 2 minutes, then move to a rack. Wash hands and tools that touched raw dough."
  ],
  safety: [
    "Do not eat raw cookie dough. Raw egg and raw flour can carry Salmonella and E. coli.",
    "Use oven mitts and keep baking sheets out of reach of kids while hot.",
    "Store cooled cookies airtight at room temperature up to 1 week."
  ],
  allergens: ["Wheat (gluten)", "Milk", "Egg", "Soy (often in chocolate chips, check the label)"],
  subs: [
    { swap:"Chill the dough 30 minutes", how:"Cover and refrigerate before scooping.", effect:"Changes the result: thicker cookies that spread less." },
    { swap:"Gluten-free 1 to 1 flour blend", how:"Swap by weight, 280 g.", effect:"Changes the result: a little more spread and slightly sandy." },
    { swap:"Dairy-free baking sticks instead of butter", how:"Swap 1 to 1.", effect:"Cookies may spread more. Use dairy-free chocolate too." },
    { swap:"All brown sugar", how:"Use 1 1/2 cups (330 g) packed brown sugar.", effect:"Changes the result: chewier with more caramel flavor." }
  ],
  tip: "Pull cookies when the edges are golden and the centers still look soft. They finish setting on the hot tray.",
}
];
