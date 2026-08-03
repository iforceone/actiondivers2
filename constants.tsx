
import { Tour } from './types';

export const COLORS = {
  navy: '#001219',
  ivory: '#F8F4E8',
  aqua: '#11C7D9',
  teal: '#008BA3',
  orange: '#FF5A00',
  sand: '#E9D8A6',
};

export const INITIAL_TOURS: Tour[] = [
  {
    id: 'scuba-diving',
    name: 'Scuba Diving',
    category: 'island',
    price: 116.25,
    description: 'Guided reef and night dives for certified divers who have dived within the previous year.',
    longDescription: 'Explore dive sites around Ambergris Caye on single-tank, two-tank, Hol Chan combo, and night-dive options. Recreational dive guests must be certified and have completed a dive within the previous year. New divers should choose Discover Scuba Diving, while certified divers returning after a longer break should request a Refresher through the Courses page.',
    isAvailable: true,
    image: '/images/gallery/Scuba-Diver.png', // REAL Action Divers Belize image - SCUBA DIVING
    duration: 'Single, two-tank, and night-dive options',
    departureTime: 'Daily from 9:00 AM',
    includes: ['Professional local dive guide', 'Boat transport to the dive site'],
    whatToBring: ['Certification card if certified', 'Swimsuit and towel', 'Reef-safe sunscreen'],
    priceBreakdown: {
      base: 65.00,
      gear: 25.00,
      parkFee: 15.00,
      tax: 11.25,
      note: 'Single Dive Mexico Rocks: $116.25. Hol Chan Combo: $133.13. Two dives: $144.38. Night dive: $155.63.'
    },
    features: [
      'Daily Departures: Diving excursions start at 9:00 AM.',
      'Two Tank Dives: Available from 9:00 AM to 12:00 PM (noon).',
      'Certification required; a Refresher is available through the Courses page when needed.',
      'The Love Tunnel: Perfect for underwater weddings and spotting Spotted Drums.',
      'Angel Flats: Home to Queen, Blue, and Gray Angel Fish among magnificent canyons.',
      'The Amigos Wreck: 40ft cargo ship sitting in 70ft of water with big grouper and nurse sharks.'
    ]
  },
  {
    id: 'snorkeling',
    name: 'Snorkeling',
    category: 'island',
    price: 90.00,
    description: 'Breathtaking snorkeling excursions including Hol Chan and Shark Ray Alley.',
    longDescription: 'There are a couple of popular snorkeling excursions that are a must-see when visiting Ambergris Caye. One excursion is Hol Chan and Shark-Ray Alley where you snorkel at the marine reserve through protected coral reefs with turtles, barracudas, spotted eagle rays, and more! After, feed the nurse sharks and rays at Shark-Ray Alley. Those who are brave enough can snorkel with them! Another great location is Mexico Rocks, located north of our shop.',
    isAvailable: true,
    image: '/images/gallery/Male-Snorkeler-OK-Sign.png', // REAL Action Divers Belize image - SNORKELING
    duration: 'Half-day and full-day options',
    departureTime: 'Daily from 9:00 AM',
    includes: ['Snorkeling gear', 'Marine park fee', 'Local guide'],
    whatToBring: ['Swimsuit and towel', 'Reef-safe sunscreen', 'Reusable water bottle'],
    priceBreakdown: {
      base: 61.67,
      gear: 5.00,
      parkFee: 15.00,
      tax: 8.33,
      note: 'Includes Park Fees. Hol Chan/Shark Ray: $90. Mexico Rocks: $75. Hol Chan/Caye Caulker/Manatee: $175. Sailing (Caye Caulker): $175 (Lunch extra).'
    },
    features: [
      'Daily Departures: Snorkeling excursions start at 9:00 AM.',
      'Hol Chan & Shark-Ray Alley: Snorkel with turtles and spotted eagle rays.',
      'Mexico Rocks: Aquarium-like clarity and northern secluded spots.',
      'Bacalar Chico: Full-day adventure ($175) including park fee.'
    ]
  },
  {
    id: 'hol-chan-shark-ray-alley',
    name: 'Hol Chan & Shark Ray Alley',
    category: 'island',
    subCategory: 'Reef Adventure',
    price: 90.00,
    description: 'Choose a snorkeling excursion or combo dive at one of Ambergris Caye’s best-known marine reserve areas.',
    longDescription: 'Hol Chan Marine Reserve and Shark Ray Alley combine protected reef scenery with the chance to encounter Belizean marine life. Action Divers currently offers this destination as a snorkeling excursion and as a combo dive, giving both snorkelers and certified divers a way to experience the area.',
    isAvailable: true,
    image: '/images/gallery/Group-of-Snorkelers-with-fish-768x432.png',
    duration: 'Confirm for your selected option',
    departureTime: 'Confirm when booking',
    includes: ['Local guide', 'Boat transport', 'Gear and park fees reflected in listed totals'],
    whatToBring: ['Swimsuit and towel', 'Reef-safe sunscreen', 'Certification card for the dive option'],
    features: [
      'Snorkeling and diving options',
      'Protected coral reef environment',
      'Shark Ray Alley experience',
      'Departures from the Action Divers tour desk'
    ],
    options: [
      { name: 'Hol Chan & Shark Ray Alley Snorkeling', description: 'A guided snorkeling excursion through Hol Chan and Shark Ray Alley.', price: 90.00 },
      { name: 'Hol Chan Combo Dive', description: 'The dive option for certified guests who want to experience Hol Chan below the surface.', price: 133.13 }
    ]
  },
  {
    id: 'mexico-rocks',
    name: 'Mexico Rocks',
    category: 'island',
    subCategory: 'Reef Adventure',
    price: 75.00,
    description: 'Explore the Mexico Rocks reef area north of the Action Divers shop by snorkel or scuba.',
    longDescription: 'Mexico Rocks is located north of the Action Divers shop and is offered for both snorkeling and diving. Choose the experience that matches your comfort and certification level, then confirm current conditions, timing, and availability with the team.',
    isAvailable: true,
    image: '/images/gallery/School-Fish.png',
    duration: 'Confirm for your selected option',
    departureTime: 'Confirm when booking',
    includes: ['Local guide', 'Boat transport', 'Gear and park fees reflected in listed totals'],
    whatToBring: ['Swimsuit and towel', 'Reef-safe sunscreen', 'Certification card for the dive option'],
    features: [
      'Snorkeling and single-dive options',
      'Reef location north of the shop',
      'A clear choice for mixed-interest groups',
      'Pricing shown by activity'
    ],
    options: [
      { name: 'Mexico Rocks Snorkeling', description: 'A guided snorkeling visit to the Mexico Rocks reef area.', price: 75.00 },
      { name: 'Single Dive: Mexico Rocks', description: 'A single guided dive for certified guests.', price: 116.25 }
    ]
  },
  {
    id: 'caye-caulker-manatee',
    name: 'Caye Caulker & Manatee Adventure',
    category: 'island',
    subCategory: 'Full-Day Island Tour',
    price: 175.00,
    description: 'Compare two Caye Caulker itineraries, including the manatee and tarpon-feeding option or a sailing day.',
    longDescription: 'Action Divers lists two ways to build a Caye Caulker day into your trip. One itinerary combines Hol Chan, Caye Caulker, manatee viewing, and tarpon feeding. The sailing option combines Hol Chan, Shark Ray Alley, and Caye Caulker. Ask the team to confirm the current itinerary and availability for your dates.',
    isAvailable: true,
    image: '/images/gallery/Three-of-a-Kind-boat-1.png',
    duration: 'Full-day options',
    departureTime: 'Confirm when booking',
    includes: ['Guided island itinerary', 'Gear and park fees reflected where applicable'],
    whatToBring: ['Swimsuit and towel', 'Reef-safe sunscreen', 'Money for lunch and personal purchases'],
    features: [
      'Two Caye Caulker itinerary choices',
      'Hol Chan included in both listed options',
      'Manatee and tarpon-feeding itinerary',
      'Sailing itinerary with Shark Ray Alley'
    ],
    options: [
      { name: 'Hol Chan, Caye Caulker, Manatee & Tarpon Feeding', description: 'The listed combination itinerary joining reef and island stops.', price: 175.00 },
      { name: 'Sailing: Hol Chan, Shark Ray Alley & Caye Caulker', description: 'A sailing-based alternative for the Caye Caulker day.', price: 175.00, note: 'Lunch is not included.' }
    ]
  },
  {
    id: 'bacalar-chico',
    name: 'Bacalar Chico',
    category: 'island',
    subCategory: 'Full-Day Reef Adventure',
    price: 175.00,
    description: 'A full-day snorkeling adventure to Bacalar Chico with gear and park fee included in the listed total.',
    longDescription: 'Bacalar Chico is offered as a full-day snorkeling adventure from Ambergris Caye. The published total includes snorkeling gear and the park fee. Contact Action Divers with your preferred date and group size to confirm the day’s route, departure time, and availability.',
    isAvailable: true,
    image: '/images/gallery/WhatsApp_Image_2026-03-08_at_9.57.19_AM.jpeg',
    duration: 'Full day',
    departureTime: 'Confirm when booking',
    includes: ['Snorkeling gear', 'Park fee', 'Local guide and boat transport'],
    whatToBring: ['Swimsuit and towel', 'Reef-safe sunscreen', 'Hat or sun shirt', 'Reusable water bottle'],
    features: [
      'Full-day snorkeling itinerary',
      'Bacalar Chico destination',
      'Snorkeling gear included',
      'Park fee included'
    ],
    options: [
      { name: 'Bacalar Chico Full-Day Adventure', description: 'The published Bacalar Chico snorkeling itinerary with gear and park fee included.', price: 175.00 }
    ]
  },
  {
    id: 'fishing',
    name: 'Fishing & Beach Bar-B-Q',
    category: 'island',
    price: 309.38,
    description: 'Reef, deep sea, and flat fishing options, plus a full-day Beach Bar-B-Q experience.',
    longDescription: 'Choose reef, deep sea, or flat fishing in half-day and full-day formats, or request the Beach Bar-B-Q option for a full day combining fishing, snorkeling, and a prepared meal. The barbecue location may vary with weather, water conditions, and the group’s accommodation setup; staff will confirm the final arrangement.',
    isAvailable: true,
    image: '/images/gallery/fishing-hero-highres.jpg', // HIGH-RES REAL Action Divers Belize image
    duration: 'Half-day and full-day options',
    departureTime: 'Daily from 9:00 AM',
    includes: ['Water and sodas', 'Tackle and bait', 'Local fishing guide'],
    whatToBring: ['Hat and sunglasses', 'Reef-safe sunscreen', 'Light long-sleeve shirt'],
    priceBreakdown: {
      base: 275.00,
      tax: 34.38,
      note: 'Reef Fishing (1-4 people): Half Day $309.38 | Full Day $562.50. Deep Sea (1-4 people): Half Day $900.00 | Full Day $1800.00. Flat Fishing (1-2 people): Half Day $393.75 | Full Day $600.00.'
    },
    features: [
      'Daily Departures: Fishing excursions start at 9:00 AM.',
      'Half Day Reef Fishing: 9:00 AM to 1:00 PM.',
      'Full Day Reef Fishing: 9:00 AM to 3:00 PM.',
      'Deep-Sea Fishing ($900.00+)',
      'Flat Fishing ($393.75+)',
      'Beach Bar-B-Q full-day option for groups of 1–4'
    ],
    options: [
      { name: 'Reef Fishing — Half Day', description: 'Group rate for 1–4 guests.', price: 309.38 },
      { name: 'Reef Fishing — Full Day', description: 'Group rate for 1–4 guests.', price: 562.50 },
      { name: 'Deep Sea Fishing — Half Day', description: 'Group rate for 1–4 guests.', price: 900.00 },
      { name: 'Deep Sea Fishing — Full Day', description: 'Group rate for 1–4 guests.', price: 1800.00 },
      { name: 'Flat Fishing — Half Day', description: 'Group rate for 1–2 guests.', price: 393.75 },
      { name: 'Flat Fishing — Full Day', description: 'Group rate for 1–2 guests.', price: 600.00 },
      { name: 'Beach Bar-B-Q', description: 'A full-day fishing, snorkeling, and barbecue option. Location is confirmed based on conditions and accommodation setup.', price: 562.50 }
    ]
  },
  {
    id: 'cave-tubing-ziplining',
    name: 'Cave Tubing & Zip-lining',
    category: 'mainland',
    price: 337.50,
    description: 'Experience the ancient Maya Underworld where the Mayas performed sacred rituals.',
    longDescription: 'Cave Tubing has been around since 1995 gaining popularity as a must-do tour when visiting Belize. Experience the ancient Maya Underworld where the Mayas once performed many sacred rituals and sacrifices to the gods. After reaching our destination, a trek through the rainforest will reveal medicinal plants. Your Zip Lining adventure begins after you complete your cave-tubing segment.',
    isAvailable: true,
    image: '/images/gallery/zipline-belize-01.webp', // UPGRADED REAL Action Divers Belize image
    duration: 'Full day',
    departureTime: 'Early morning; confirm when booking',
    includes: ['Park fee', 'Lunch', 'Water taxi and mainland van transport'],
    whatToBring: ['Closed-toe shoes', 'Change of clothes', 'Insect repellent'],
    priceBreakdown: {
      base: 300.00,
      tax: 37.50,
      note: 'Includes Park Fee and Lunch.'
    }
  },
  {
    id: 'altun-ha-cave-tubing',
    name: 'Altun Ha & Cave Tubing',
    category: 'mainland',
    price: 337.50,
    description: 'A perfect blend of Mayan history and natural wonder, featuring ruins and cave exploration.',
    longDescription: 'Experience the best of Belize’s mainland. Start your day by exploring the ancient Mayan city of Altun Ha, famous for the discovery of the Jade Head. Wander through its impressive plazas and climb the Temple of the Masonry Altars for a breathtaking view. Afterward, journey to the Nohoch Che’en Caves for a refreshing cave tubing tour. Drift through mystical limestone caves while learning about the sacred rituals of the ancient Maya.',
    isAvailable: true,
    image: '/images/gallery/web-maya-ruin.jpg', // REAL Action Divers Belize image
    duration: 'Full day',
    departureTime: 'Early morning; confirm when booking',
    includes: ['Park fee', 'Lunch', 'Water taxi and mainland van transport'],
    whatToBring: ['Comfortable walking shoes', 'Change of clothes', 'Insect repellent'],
    priceBreakdown: {
      base: 300.00,
      tax: 37.50,
      note: 'Includes Park Fee and Lunch. Water Taxi and Van transportation included.'
    },
    features: ['Altun Ha Mayan Ruins', 'Cave Tubing Adventure', 'Nohoch Che’en Caves', 'Includes Lunch & Park Fees']
  },
  {
    id: 'xunantunich-cave-tubing',
    name: 'Xunantunich & Cave Tubing',
    category: 'mainland',
    price: 337.50,
    description: 'Explore the majestic "Stone Maiden" ruins followed by a serene cave tubing journey.',
    longDescription: 'Explore Xunantunich, one of the most prominent Mayan sites, by crossing the Mopan River on a hand-cranked ferry. Climb El Castillo temple for panoramic views of the jungle and nearby Guatemala. Following your archaeological exploration, head to the caves for a serene tubing trip through the subterranean world of the Maya, where history and nature meet in an unforgettable adventure.',
    isAvailable: true,
    image: '/images/gallery/web-xunantunich02.jpg', // REAL Action Divers Belize image
    duration: 'Full day',
    departureTime: 'Early morning; confirm when booking',
    includes: ['Park fee', 'Lunch', 'Water taxi and mainland van transport'],
    whatToBring: ['Comfortable walking shoes', 'Change of clothes', 'Insect repellent'],
    priceBreakdown: {
      base: 300.00,
      tax: 37.50,
      note: 'Includes Park Fee and Lunch. Water Taxi and Van transportation included.'
    },
    features: ['Xunantunich "Stone Maiden" Ruins', 'El Castillo Temple Climb', 'Cave Tubing Adventure', 'Includes Lunch & Park Fees']
  },
  {
    id: 'lamanai',
    name: 'Lamanai',
    category: 'mainland',
    price: 281.25,
    description: 'Journey to the "Submerged Crocodile" archaeological site in the Orange Walk District.',
    longDescription: 'Lamanai "Submerged Crocodile", is the third largest archaeological site in Belize. Located in the Orange Walk District and surrounded by the majestic rainforest, Lamanai’s location on the New River allowed for easy trade of goods which impacted their long occupation of the site. On your journey you will be fascinated by all the birds and wild life you encounter.',
    isAvailable: true,
    image: '/images/gallery/web-lamani.jpg', // REAL Action Divers Belize image
    duration: 'Full day',
    departureTime: 'Early morning; confirm when booking',
    includes: ['Park fee', 'Lunch', 'Water taxi and mainland van transport'],
    whatToBring: ['Comfortable walking shoes', 'Hat and sunscreen', 'Insect repellent'],
    priceBreakdown: {
      base: 250.00,
      tax: 31.25,
      note: 'Includes Park Fee and Lunch.'
    }
  },
  {
    id: 'atm-caves',
    name: 'ATM Caves',
    category: 'mainland',
    price: 450.00,
    description: 'Actun Tunichil Muknal - a legendary Maya archaeological cave site.',
    longDescription: 'Actun Tunichil Muknal, also known locally as ATM, is a cave in Belize, near San Ignacio, Cayo District, notable as a Maya archaeological site that includes skeletons, ceramics, and stoneware. The ATM Caves is a full-day, intensive tour that leaves the island on the 6:00 am boat.',
    isAvailable: true,
    image: '/images/gallery/cave-exploration-real.jpg', // UPGRADED REAL Action Divers Belize image
    duration: 'Full day',
    departureTime: '6:00 AM water taxi',
    includes: ['Park fee', 'Lunch', 'Water taxi and mainland van transport'],
    whatToBring: ['Closed-toe water shoes', 'Change of clothes', 'Insect repellent'],
    priceBreakdown: {
      base: 400.00,
      tax: 50.00,
      note: 'Includes Park Fee and Lunch. Leaves island at 6:00 am.'
    }
  }
];

export const REVIEWS = [
  {
    id: 1,
    reviewerName: "Jenny \"J Bird\" H",
    starRating: 5,
    reviewText: "Wow what a great experience! James and Glenn took us out to the Mexican rocks and we had a wonderful, amazing, magical time. I struggled with my mask a few times, and Glenn was quick to help me and support me while I fixed my mask. Glenn took me to different areas to show me specific fish, eels, stingrays, eagle rays, and various other wildlife. He made sure to grab my hand when I was struggling with the waves so he could help support me and also so he could keep me with him to see the amazing life under the water. Towards the end of the trip I started having foot cramps and leg cramps, and Glenn made sure he immediately took me to the boat so I could rest for a bit. James what is my husbands guide and did an amazing job as well. Several times either James or Glenn took our GoPro and dove down to get better pictures of Wildlife that was hiding in the reef to ensure we had some amazing video. I can't say enough great things about Glenn and James. I will absolutely book with them again the next time we are back. Thank you Glenn and James for giving us such an amazing experience. This is my second time using this company and I won't hesitate to use them Every time we go to the island.",
    profileImageUrl: "https://lh3.googleusercontent.com/a-/ALV-UjXc8hlvn_CIcUwF95BahoQLd6XlsBzhh67DG72q3MFhIc0bHsAL5A=s64-c-rp-mo-ba5-br100"
  },
  {
    id: 2,
    reviewerName: "Brett Kramer",
    starRating: 5,
    reviewText: "My family of 9 spent 10 days at La Perla in June of 2023 and used Roberto & crew exclusively for diving, snorkeling, mainland tours (2), and water taxis. We had a bit of a rough start due to some confusion about what time high season actually starts, but Roberto fixed it quickly and made us feel like his only family of the week. My kids LOVED the crew and we all felt very safe and well taken care of. Positives: Always on time, friendly yet professional, knowledgeable of local spots, personalized service. Action Divers and Adventures was fantastic. We felt safe, well-taken care of, and well-advised. I can't recommend Action Divers more strongly to anyone visiting San Pedro.",
    profileImageUrl: "https://lh3.googleusercontent.com/a-/ALV-UjX9aK-RBr5cn8JQd0RRtp0F981YeojQs1x768OniM8FZLIP3Z_07g=s64-c-rp-mo-ba3-br100"
  },
  {
    id: 3,
    reviewerName: "Clifton Collins",
    starRating: 5,
    reviewText: "Just my style, easy going, total full service resort. Roberto and Chocolate provided great, fun filled outings to the reef and to shopping in town. The nicest guides we have ever had the pleasure to adventure with.",
    profileImageUrl: "https://lh3.googleusercontent.com/a-/ALV-UjU2B2R0MOgXu8DoOMGwqNCqgzfVPtkGVWiJWaB8PofO08mwOXNY=s64-c-rp-mo-ba5-br100"
  },
  {
    id: 4,
    reviewerName: "Valerie Schubert",
    starRating: 5,
    reviewText: "A highlight of our trips to San Pedro is always heading out with Roberto or Choco and team. I had a not so great experience on a \"trial\" dive before and really wasn't sure I'd ever try again but was so glad I did. Roberto was extremely patient with my 12 yr old daughter and I, never rushed us or pushed us to move forward a step we weren't ready for. I enjoyed myself so much that I actually certified with him the next trip I took. Snorkeling, diving, fishing, spear fishing... Friendly, accommodating, flexible and know all the best spots for any time of year.",
    profileImageUrl: "https://lh3.googleusercontent.com/a-/ALV-UjWXDmybeluQ_CuOev2w4Ed6mAdZHw3wSdDu1l8J-Zisj6D5P4Q=s64-c-rp-mo-ba4-br100"
  },
  {
    id: 5,
    reviewerName: "Joshua Keller",
    starRating: 5,
    reviewText: "We have used Action Divers multiple times. Roberto operates a great guide service. Mr. Choco and Mr. Brio are excellent guides. They are passionate about what they do. It's real simple, you tell them what you want to do and they make it a wonderful experience. Don't overthink the process, call Action Divers.",
    profileImageUrl: "https://lh3.googleusercontent.com/a-/ALV-UjVrTVURxhEAg8K0vy7Am-jYqg_5HDrs73-ctZIo_jgFC6V9PixY=s64-c-rp-mo-br100"
  },
  {
    id: 6,
    reviewerName: "Lori Nordt",
    starRating: 5,
    reviewText: "The absolute best. Roberto took great care to make sure our snorkeling experience was successful and enjoyable. We wish we would have pre-booked all of our excursions through him, but we didn't know. If you have water activities planned during your stay, we recommend that you let Action Divers handle them all.",
    profileImageUrl: "https://lh3.googleusercontent.com/a-/ALV-UjXc8hlvn_CIcUwF95BahoQLd6XlsBzhh67DG72q3MFhIc0bHsAL5A=s64-c-rp-mo-ba5-br100"
  }
];

export const INITIAL_LOGS: any[] = [];
