
import { Tour } from './types';

export const COLORS = {
  navy: '#001219',
  teal: '#005F73',
  gold: '#E9D8A6',
};

export const INITIAL_TOURS: Tour[] = [
  {
    id: 'scuba-diving',
    name: 'Scuba Diving',
    category: 'island',
    price: 116.25,
    description: 'Bespoke diving experiences for all skill levels, from Mexico Rocks to the barrier reef.',
    longDescription: 'Are you involved in the world of SCUBA diving, or are you interested in trying it out? Action Divers and Adventures offers Discover Scuba classes, full certification classes, refreshers, and reef diving. Belize has the second-largest barrier reef in the world and the island of Ambergris Caye offers easy access to a wide variety of spectacular dive sites. A short 5 – 10 minute boat ride, takes you to an array of dive sites. We offer one, two, or three-tank dives including night dives.',
    isAvailable: true,
    image: '/images/gallery/Scuba-Diver.png', // REAL Action Divers Belize image - SCUBA DIVING
    priceBreakdown: {
      base: 65.00,
      gear: 25.00,
      parkFee: 15.00,
      tax: 11.25,
      note: 'Pricing based on Single Dive Mexico Rocks. Two dives: $144.38. Night dives: $155.63.'
    },
    features: [
      'Daily Departures: Diving excursions start at 9:00 AM.',
      'Two Tank Dives: Available from 9:00 AM to 12:00 PM (noon).',
      'Certification and Classes: Discover SCUBA ($211.88), Open Water Certification ($564.38).',
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
    priceBreakdown: {
      base: 75.00,
      parkFee: 15.00,
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
    id: 'beach-bbq',
    name: 'Beach Bar-B-Q',
    category: 'island',
    price: 562.50,
    description: 'A fun-filled day of reef fishing, snorkeling, and a fresh beach-prepared BBQ.',
    longDescription: 'Enjoy a fun-filled day of reef fishing & snorkeling. Start your morning off by trolling & fishing along the barrier reef, keeping the fish for your lunch. During the trip, you will stop to snorkel and hunt for conchs and lobsters (depending on the season). Once you are back on the boat, we will bring you to the beach to enjoy some fresh ceviche and a delicious tour guide prepared BBQ.',
    isAvailable: true,
    image: '/images/gallery/beach-bbq-belize.webp', // HIGH-RES REAL Action Divers Belize image
    priceBreakdown: {
      base: 562.50,
      note: 'Total for groups of 1-4 people. Includes BBQ, gear, and drinks.'
    }
  },
  {
    id: 'fishing',
    name: 'Fishing',
    category: 'island',
    price: 309.38,
    description: 'Excellent reef and deep sea fishing adventures in the Belizean Barrier Reef.',
    longDescription: 'Fishing off Ambergris Caye is a great adventure! Ambergris Caye is located less than a mile away from the Barrier Reef where excellent reef and deep sea fishing occurs. Enjoy a calm day for bottom fishing & trolling for snappers, barracudas, and jacks. We also offer half-day and full-day fishing trips outside of the reef.',
    isAvailable: true,
    image: '/images/gallery/fishing-hero-highres.jpg', // HIGH-RES REAL Action Divers Belize image
    priceBreakdown: {
      base: 309.38,
      note: 'Reef Fishing (1-4 people): Half Day $309.38 | Full Day $562.50. Deep Sea (1-4 people): Half Day $900.00 | Full Day $1800.00. Flat Fishing (1-2 people): Half Day $393.75 | Full Day $600.00.'
    },
    features: [
      'Daily Departures: Fishing excursions start at 9:00 AM.',
      'Half Day Reef Fishing: 9:00 AM to 1:00 PM.',
      'Full Day Reef Fishing: 9:00 AM to 3:00 PM.',
      'Deep-Sea Fishing ($900.00+)',
      'Flat Fishing ($393.75+)'
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
    priceBreakdown: {
      base: 337.50,
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
    priceBreakdown: {
      base: 281.25,
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
    priceBreakdown: {
      base: 450.00,
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
