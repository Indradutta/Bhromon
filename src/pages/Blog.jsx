import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Search,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Compass,
  MapPin,
  Tag,
  Share2,
  Copy,
  Check,
  Heart,
  MessageSquare,
  Sparkles,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Send,
  Bookmark,
  ExternalLink,
  X
} from 'lucide-react';
import BhromonNav from '../components/BhromonNav';
import BhromonFooter from '../components/BhromonFooter';

gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// COMPREHENSIVE CURATED BLOG ARTICLES DATABASE
// Covering: Ladakh, Varanasi, Rajasthan, Kerala, Sikkim, Himachal, Goa, Andaman, Northeast India
// ============================================================================
const BLOG_ARTICLES = [
  {
    id: 1,
    slug: 'echoes-of-the-high-passes-ladakh',
    isFeatured: true,
    title: 'Echoes of the High Passes: Crossing the Silent Moonscapes of Ladakh',
    category: 'Adventure',
    destination: 'Ladakh',
    location: 'Nubra Valley & Zanskar, Ladakh',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80',
    midImage: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    readTime: '9 min read',
    date: 'October 20, 2026',
    author: {
      name: 'Tenzin Norbu',
      role: 'Himalayan Expedition Leader & Cultural Archivist',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      bio: 'Born in Leh, Tenzin has traversed Ladakh’s high mountain passes for over fifteen seasons, documenting oral histories and remote Buddhist monastic archives.'
    },
    excerpt: 'Above 14,000 feet, sound changes timbre. Between the ancient clay fortress of Basgo and the wind-scoured ridges of Nubra, Ladakh is less a destination than an initiation into cosmic silence, stone, and Tibetan Buddhist wisdom.',
    tags: ['#Ladakh', '#Himalayas', '#HighPasses', '#Monasteries'],
    views: 14200,
    likes: 832,
    bodyParagraphs: [
      "The ascent into Khardung La is heralded not by road signs, but by the gradual subtraction of the terrestrial world. First go the willow trees of the Indus Valley; then the mustard terraces; until finally, nothing remains except shattered shale, glacial moraine, and a sky so hyper-saturated in indigo that it seems to burn behind the corneas. Here, at 17,982 feet above sea level, breath becomes a conscious ritual, each inhalation a measured petition to the thin air.",
      "For centuries, these forbidding tracks were neither sports routes nor scenic bypasses; they formed the icy spine of the Central Asian Silk Route. Yarkandi caravans carrying raw silk, saffron, jade, and hashish spent months navigating the treacherous gorges connecting Kashgar with the royal palaces of Leh. Even today, if you stand near the windswept chortens of Basgo when the afternoon squalls whip up from the Indus, the wind carries a sound akin to bronze bells chiming in an empty cathedral.",
      "To truly understand Ladakh, one must sit inside the prayer hall of Diskit or Hemis Monastery at dawn. Before sunlight breaches the granite ridges, monks wrap their maroon wool robes tighter against the freezing draft. The deep resonant drone of the dungchen—the long brass Tibetan horns—reverberates through cedar pillars lacquered with centuries of yak-butter lamp soot. It is a vibration felt in the sternum before it reaches the ears, an unbroken lineage of contemplation anchored against the indifferent majesty of the Karakoram.",
      "Journeying south into the remote Zanskar Valley via the newly cut Shingo La link reveals a geography that defies human scale. Here, frozen rivers give way to emerald oasis villages clinging to sheer cliff faces, where solar arrays now share courtyards with ancient stone prayer wheels. Traveling here requires surrendering modern urgency: roads yield to landslide debris, river crossings demand patience, and hospitality is poured from soot-blackened kettles of steaming butter tea.",
      "When evening descends across the cold desert dunes of Hunder, double-humped Bactrian camels wander between sea-buckthorn thickets while shadows stretch across the white sand. As night falls, the celestial river of the Milky Way arcs from horizon to horizon with such crystalline clarity that stars appear three-dimensional. Ladakh leaves an indelible mark: it teaches the discerning traveler that true luxury is not excess, but unadorned space, deep silence, and the humility of being small amidst ancient mountains."
    ],
    pullQuote: "In the high passes of Ladakh, one does not conquer the terrain. One merely asks permission to breathe amidst its eternal silence.",
    subheading1: "The Monastic Dawn: Trumpets and Yak Butter Lamps",
    subheading2: "Navigating the Forgotten Silk Caravan Trails of Zanskar",
    curatorTip: "Travel between late May and early October. Acclimatize for a full 48 hours in Leh before crossing any passes above 13,000 feet. Always carry boiled water in insulated flasks and honor monastic guidelines by rotating prayer wheels clockwise."
  },
  {
    id: 2,
    slug: 'dawn-on-manikarnika-varanasi-ghats',
    isFeatured: false,
    title: 'Dawn on the Manikarnika: The Eternal Rhythm of Sacred Fire and Water',
    category: 'Culture',
    destination: 'Varanasi',
    location: 'Varanasi, Uttar Pradesh',
    coverImage: 'https://images.unsplash.com/photo-1562016928-9c038adf1fc3?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
    date: 'October 18, 2026',
    author: {
      name: 'Devika Banerji',
      role: 'Historian & Cultural Columnist',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=240&q=80',
      bio: 'Devika writes on Indian sacred geography and pre-colonial architectural traditions, with regular features in global cultural journals.'
    },
    excerpt: 'Before sunrise, the Ganga mirrors the faint violet hues of Kashi. Wooden oar strokes rhythmic in the mist, brass temple bells in the alleys, and thousands of clay lamps floating seaward—a timeless meditation on eternity.',
    tags: ['#Varanasi', '#Ghats', '#Spiritual', '#Heritage'],
    views: 18900,
    likes: 1240,
    bodyParagraphs: [
      "There is an hour in Varanasi, roughly forty-five minutes before the sun breaches the low horizon of the eastern sands, when the river loses all boundary. The water is neither green nor brown, but a luminous, pearlescent slate. From the wooden gunwale of a hand-rowed bajra boat, the eighty-four ghats curve in an amphitheater of stone, palaces, pavilions, and temples stacked like ancient geological strata.",
      "At Manikarnika, the sacred pyres never sleep. For over three thousand uninterrupted years, the dom community has kept the sacred fire burning, offering mortals their final release through Moksha. Far from macabre, there is a serene, dignified gravity to the riverfront: children bathe at Dashashwamedh, wrestlers practice in mud akharas at Tulsi Ghat, and sadhus in saffron loincloths offer Surya Namaskar to the waking sun.",
      "Slip into the maze of galis—the narrow, medieval alleyways behind the riverfront—and the sensory tapestry deepens. The air smells of crushed marigolds, wet stone, roasted cumin, and sweet rabri simmered in copper cauldrons. Every corner houses a miniature shrine coated in red vermilion, where neighborhood elders greet one another with folded hands and soft murmurings of 'Har Har Mahadev'.",
      "Experiencing the evening Ganga Aarti from the river is a pageant of cosmic proportions. Seven young priests, clad in silk dhotis, move in rhythmic syncopation, lifting multi-tiered brass oil lamps sending spirals of fire into the darkening sky. The river fills with thousands of handmade earthen diyas cradled in leaf bowls, bobbing down the currents like a flotilla of earthbound constellations."
    ],
    pullQuote: "Varanasi is older than history, older than tradition, older even than legend, and looks twice as old as all of them put together.",
    subheading1: "The Architecture of Salvation: Eighty-Four Stone Portals",
    subheading2: "Labyrinths of Kashi: Rabri, Brass Bells, and Whispering Galis",
    curatorTip: "Book a traditional wooden rowboat rather than a noisy motorboat for sunrise at 5:15 AM from Assi Ghat. Carry small change for boatmen and respectful attire when walking near cremation ghats."
  },
  {
    id: 3,
    slug: 'sandstone-citadels-and-crimson-skies-rajasthan',
    isFeatured: false,
    title: 'Sandstone Citadels & Crimson Skies: In Search of the Lost Caravans of the Thar',
    category: 'Destinations',
    destination: 'Rajasthan',
    location: 'Jaisalmer & Jodhpur, Rajasthan',
    coverImage: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    readTime: '8 min read',
    date: 'October 15, 2026',
    author: {
      name: 'Maharaja Vikramaditya Singh',
      role: 'Heritage Conservator & Writer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80',
      bio: 'Custodian of regional archival manuscripts and desert architecture, Vikramaditya works to restore abandoned desert outposts across Western Rajasthan.'
    },
    excerpt: 'Beyond the opulent havelis of Jaisalmer lies an ocean of golden sand where Rajasthani folk ballads linger in the twilight air. Discovering the living bastions and forgotten Silk Route outposts.',
    tags: ['#Rajasthan', '#Jaisalmer', '#Heritage', '#Desert'],
    views: 12100,
    likes: 710,
    bodyParagraphs: [
      "Rising abruptly from the undulating golden dunes of the Great Indian Desert, the Sonar Qila—Jaisalmer’s Golden Fort—appears less like a human creation and more like a sandcastle solidified by divine decree. Carved from local yellow Jurassic sandstone, the fortress changes color through the day: honey-pale at dawn, blazing ochre at midday, and molten copper as the desert sun dips toward Pakistan.",
      "Unlike the preserved museum-citadels of Europe, Jaisalmer is a living fort. A quarter of the city's populace still lives within its ninety-nine bastions. Tailors stitch mirror-embroidered quilts beside seven-hundred-year-old Jain temples whose delicate marble filigree resembles lace frozen in stone. In the quiet courtyard of Patwon Ki Haveli, latticed jharokhas once allowed merchant noblewomen to witness the arrival of Silk Route caravans without being seen.",
      "Leaving the fortified city behind, the desert reveals its quiet majesty. In the remote dunes of Khuri and Sam, night arrives with a sudden drop in temperature. As campfires of dried acacia wood crackle, Manganiyar and Langa musicians tune the wooden strings of the kamaicha. Their voices, carrying haunting melismatic laments handed down across forty generations, cut through the vast desert stillness."
    ],
    pullQuote: "In the Thar, stone breathes with the memory of kings, and every gust of sand whispers an unwritten ballad.",
    subheading1: "Sonar Qila: The Living Bastion of Yellow Sandstone",
    subheading2: "Songs of the Manganiyars Beneath Desert Starlight",
    curatorTip: "Opt for a desert camp in the more secluded dunes of Barna or Kanoi rather than commercial Sam dunes. Winter (November to February) offers crisp days and starlit nights ideal for stargazing."
  },
  {
    id: 4,
    slug: 'the-spice-route-by-water-kerala-backwaters',
    isFeatured: false,
    title: 'The Spice Route by Water: Navigating the Emerald Labyrinths of Kumarakom',
    category: 'Luxury',
    destination: 'Kerala',
    location: 'Vembanad Lake & Alleppey, Kerala',
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1609137144822-4463c271d798?auto=format&fit=crop&w=1200&q=80',
    readTime: '7 min read',
    date: 'October 12, 2026',
    author: {
      name: 'Ananya Pillai',
      role: 'Culinary Anthropologist & Naturalist',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=80',
      bio: 'Ananya traces indigenous spice cuisines along the Malabar coast and leads sustainable culinary foraging retreats in God’s Own Country.'
    },
    excerpt: 'Gliding through duckweed and coconut groves on a handcrafted kettuvallam, sipping cardamom-infused chai while toddy tappers ascend the palms. The slow romance of southern waterways.',
    tags: ['#Kerala', '#Backwaters', '#Ayurveda', '#Houseboat'],
    views: 15400,
    likes: 980,
    bodyParagraphs: [
      "Water in Kerala is not a barrier; it is the town square, the highway, the laundry, and the playground. Aboard a private kettuvallam—the traditional rice barge constructed entirely of anjili wood, coir ropes, and cashew-nut oil without a single metal nail—the world decelerates to the pace of drifting hyacinth blossoms.",
      "As the barge glides from the expanse of Vembanad Lake into the narrower canals of Kuttanad, life unfolds at water level. Women wash copper pots on stone steps; school children in pristine uniforms commute across canal banks in narrow wooden canoes; kingfishers with iridescent sapphire wings plunge into the reeds with surgical precision.",
      "Lunch aboard is a sensory triumph: pearl spot fish (karimeen) wrapped in charred banana leaves with shallots, crushed ginger, and bird's eye chilies; red matta rice harvested from paddy fields reclaimed below sea level; and sweet payasam perfumed with jaggery and fresh coconut milk."
    ],
    pullQuote: "Time in the backwaters does not tick; it flows like coconut milk down the side of a freshly cleaved shell.",
    subheading1: "Kettuvallam Craftsmanship: Vessels Tied with Coconut Coir",
    subheading2: "Kuttanad: The Low-Lying Breadbasket of the Malabar",
    curatorTip: "Request an eco-friendly solar-assisted barge that turns off its engine in shallow canals to avoid disturbing the birdlife of the Kumarakom sanctuary."
  },
  {
    id: 5,
    slug: 'in-the-shadow-of-kanchenjunga-sikkim-monastic-trails',
    isFeatured: false,
    title: 'In the Shadow of Kanchenjunga: Monastic Trails and Rhododendron Valleys',
    category: 'Travel Tips',
    destination: 'Sikkim',
    location: 'Yuksom, Pelling & Gangtok, Sikkim',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80',
    readTime: '8 min read',
    date: 'October 08, 2026',
    author: {
      name: 'Karan Gurung',
      role: 'High Altitude Botanist & Trek Guide',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80',
      bio: 'Guiding expeditions across the Singalila and Kanchenjunga national parks for twelve years, specializing in medicinal Himalayan flora.'
    },
    excerpt: 'A practical guide to crossing Yuksom, Pemayangtse, and Dzongri Ridge. When the morning mist clears to reveal the snows of Kangchenjunga painted in warm amber, all weariness dissolves.',
    tags: ['#Sikkim', '#Himalayas', '#Trekking', '#Monasteries'],
    views: 9800,
    likes: 640,
    bodyParagraphs: [
      "In the first hours after daybreak at Yuksom—the historic first capital of the Kingdom of Sikkim—the air smells of damp pine needles and juniper incense. When the dense cloud layers part, Kangchenjunga's five sacred summits soar into the sky like an altar of jagged silver and ice.",
      "The trail toward Pemayangtse and Rabdentse ruins leads through primeval forests dripping with moss and epiphytic orchids. In spring, over forty species of rhododendrons explode into crimson, mauve, and lemon-yellow blooms, carpeting the forest floor in petals.",
      "Visiting the seventeenth-century monastery of Tashiding feels like entering a sanctuary detached from the century. Prayer flags of five elements flap vigorously in the mountain breeze, dispersing blessings into the Teesta River valley below."
    ],
    pullQuote: "To gaze upon Kangchenjunga from Pemayangtse is to witness architecture sculpted directly by the gods.",
    subheading1: "The Sacred Grove of Norbugang and the Coronation Stone",
    subheading2: "Essential Permits and Trail Etiquette for High Sikkim",
    curatorTip: "All foreign and domestic travelers must obtain the Sikkim Inner Line Permit (ILP), easily processed online or at Rangpo checkpoint. Spring (April-May) is prime for flower blooms, while October brings crystalline skies."
  },
  {
    id: 6,
    slug: 'secret-valleys-of-himachal-tirthan-and-parvati',
    isFeatured: false,
    title: 'Secret Valleys of Himachal: Beyond the Crowds into Tirthan and Parvati',
    category: 'Budget Travel',
    destination: 'Himachal',
    location: 'Tirthan Valley & Great Himalayan National Park, HP',
    coverImage: 'https://images.unsplash.com/photo-1596761226589-9a259c636f01?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    date: 'October 04, 2026',
    author: {
      name: 'Rohan Kapoor',
      role: 'Wilderness Explorer & Slow Travel Advocate',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=240&q=80',
      bio: 'Rohan left corporate Bombay in 2018 to live in wooden Kathkuni homestays across Kullu, documenting indigenous agricultural rhythms.'
    },
    excerpt: 'Leave the crowded commercial highways behind. Wooden Kathkuni architecture, crystal-clear trout streams, and apple orchards where community homestays welcome wanderers with siddu and ghee.',
    tags: ['#Himachal', '#Tirthan', '#Backpacking', '#Rivers'],
    views: 11400,
    likes: 890,
    bodyParagraphs: [
      "While tourists queue bumper-to-bumper along the highways of Manali, turn southeast at Aut Tunnel and the world shifts entirely. Tirthan Valley unfolds as a sanctuary of cedar-scented valleys, turbulent glacial torrents, and villages where time is measured in apple harvests.",
      "The indigenous architecture here is a masterclass in seismic resilience: Kathkuni construction interlocks heavy deodar cedar logs with rough-hewn stone without using mortar or nails. These multi-story towers have stood for over three centuries against Himalayan earthquakes.",
      "Waking up in a traditional village homestay in Gushaini means breakfasting on hot siddu—steamed leavened wheat cakes stuffed with spiced walnut and poppy seed paste—drenched in clarified cow's butter, paired with freshly brewed rhododendron tea."
    ],
    pullQuote: "Himachal does not give up its secrets on the highways; it conceals them behind winding footpaths that end at wooden thresholds.",
    subheading1: "Kathkuni Architecture: Timber-Laced Seismic Wonders",
    subheading2: "Community Homestays and River Foraging in Gushaini",
    curatorTip: "Opt for public HRTC buses connecting Mandi to Banjar for an affordable, scenic journey. Support local forest guides when entering the Great Himalayan National Park buffer zone."
  },
  {
    id: 7,
    slug: 'the-scent-of-cinnamon-and-sea-salt-old-goa',
    isFeatured: false,
    title: 'The Scent of Cinnamon and Sea Salt: Portuguese Mansions and Old Goa Hinterlands',
    category: 'Food',
    destination: 'Goa',
    location: 'Fontainhas & Divar Island, Goa',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
    date: 'September 28, 2026',
    author: {
      name: 'Fernanda De Souza',
      role: 'Goan Culinary Historian',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=240&q=80',
      bio: 'Author of three heritage cookbooks celebrating the maritime confluence of Portuguese, Konkani, and Saraswat culinary traditions.'
    },
    excerpt: 'Beyond the commercial beaches lies Latin Goa—quaint whitewashed chapels, shaded cashew groves, clay-pot vindalho cooked over mangrove firewood, and the lingering spirit of susegad.',
    tags: ['#Goa', '#Culinary', '#Heritage', '#Coastal'],
    views: 13700,
    likes: 855,
    bodyParagraphs: [
      "Step past the neon signage of the north coast into the quiet pastel alleys of Fontainhas in Panaji, and the atmosphere recalibrates. Cobalt blue, burnt sienna, and mustard-yellow townhouses feature wrought-iron balconies and mother-of-pearl window panes that diffuse the harsh midday sun into a warm, pearly glow.",
      "Goan cuisine is an extraordinary culinary marriage born of the high seas. When Portuguese caravels brought peri-peri chilies, vinegar preservation, and potatoes from the New World, Goan cooks blended them with Konkani coconut milk, kokum, and freshly pounded spices. The authentic pork vindalho cooked in unglazed clay pots over wood embers possesses a depth far removed from modern restaurant renditions.",
      "Take the free flat-bottom car ferry across to Divar Island in the Mandovi River. Here, narrow asphalt lanes wind through emerald paddy fields, sleepy church squares, and sleepy village taverns where feni is served with pickled mackerel and laughter."
    ],
    pullQuote: "Susegad is not laziness; it is the profound wisdom of knowing when the world must wait for the afternoon breeze.",
    subheading1: "Fontainhas: Oyster Shell Windows and Azulejo Tiles",
    subheading2: "The Alchemy of Kokum and Toddy Vinegar",
    curatorTip: "Visit bakeries in Fontainhas before 8:00 AM to sample warm poee bread straight from wood-fired clay ovens."
  },
  {
    id: 8,
    slug: 'coral-gardens-and-ancient-sentinel-forests-andaman',
    isFeatured: false,
    title: 'Coral Gardens & Ancient Sentinel Forests: A Maritime Diary of Havelock and Neil',
    category: 'Destinations',
    destination: 'Andaman',
    location: 'Havelock (Swaraj Dweep) & Neil Island, Andaman',
    coverImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    readTime: '7 min read',
    date: 'September 22, 2026',
    author: {
      name: 'Dr. Alok Verma',
      role: 'Marine Biologist & Ocean Conservationist',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=240&q=80',
      bio: 'Researching coral regeneration across the Andaman Sea and documenting pelagic manta ray migration channels.'
    },
    excerpt: 'Twelve hundred kilometers out into the Bay of Bengal, turquoise lagoons crash into prehistoric primary rainforests. Diving the undersea pinnacles of Dixon’s Pinnacle alongside manta rays.',
    tags: ['#Andaman', '#Islands', '#Scuba', '#Beaches'],
    views: 16800,
    likes: 1040,
    bodyParagraphs: [
      "The Andaman archipelago sits like a strand of emerald jewels isolated in the Andaman Sea. At Radhanagar Beach on Havelock Island, often ranked among Asia's most pristine coastlines, colossal mahua and padauk trees fringe powder-fine white sands that curve gently into an ocean of impossible turquoise.",
      "Submerging thirty meters below at Dixon's Pinnacle, the underwater topography is staggering. Three massive volcanic rock columns rise from the sea floor, carpeted in soft yellow corals and anemones. Schools of barracuda circle in tight tornadoes while gentle sea turtles browse on seagrass meadows.",
      "At night in Neil Island, low tides expose natural limestone bridges and living tide pools teeming with bioluminescent plankton. Walking the shore under a canopy of stars untouched by urban light pollution is an unforgettable encounter with wild Earth."
    ],
    pullQuote: "Where the ancient rainforest dips its roots directly into the coral sea, the primeval world still reigns supreme.",
    subheading1: "Submerged Volcanoes: The Biodiversity of Dixon’s Pinnacle",
    subheading2: "Bioluminescent Tides along Neil Island's Natural Bridge",
    curatorTip: "Opt for Government ferries between Port Blair, Havelock, and Neil for steady sailing, and always book scuba dives with PADI/SSI certified dive centers adhering to green reef guidelines."
  },
  {
    id: 9,
    slug: 'the-living-bridges-of-cherrapunji-meghalaya',
    isFeatured: false,
    title: 'The Living Bridges of Cherrapunji: Crafting Architecture from Ficus Roots',
    category: 'Culture',
    destination: 'Northeast India',
    location: 'Nongriat, Meghalaya, Northeast India',
    coverImage: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    readTime: '10 min read',
    date: 'September 16, 2026',
    author: {
      name: 'Meban Lyndem',
      role: 'Khasi Cultural Ethnobotanist',
      avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=240&q=80',
      bio: 'Native of the East Khasi Hills, Meban has mapped over eighty living root structures and advocates for indigenous botanical knowledge.'
    },
    excerpt: 'Deep in the misty gorges of Meghalaya, indigenous Khasi elders train living tree roots across thundering rivers—monumental botanical engineering that grows stronger with every passing century.',
    tags: ['#Northeast', '#Meghalaya', '#LivingBridges', '#Culture'],
    views: 19500,
    likes: 1450,
    bodyParagraphs: [
      "To descend into the gorge of Nongriat is to step down 3,500 concrete and stone steps into a prehistoric realm where water dominates every sense. The roar of torrential cascades echoes off vertical sandstone cliffs shrouded in constant cloud mist.",
      "Centuries ago, the indigenous Khasi people recognized that wood bridges rot and steel spans rust in the wettest place on Earth. Instead, they allied with nature, training the aerial roots of the Ficus elastica tree through hollowed betel-nut trunks across raging monsoon rivers.",
      "Over fifty to eighty years, the roots intertwine and anchor into opposite riverbanks, petrifying into living cantilever spans capable of bearing fifty people simultaneously. The famous Double Decker living root bridge at Nongriat represents two and a half centuries of intergenerational patience.",
      "Reaching Rainbow Falls beyond Nongriat rewards the traveler with a sapphire lagoon where sunlight refracts through perpetual spray into permanent rainbows. It is living proof that true sustainability is not high technology, but deep symbiosis with the natural world."
    ],
    pullQuote: "A living root bridge is not built for oneself; it is planted for one's grandchildren.",
    subheading1: "Jingkieng Jri: Intergenerational Botanical Engineering",
    subheading2: "The Descent to Nongriat and Rainbow Falls",
    curatorTip: "Carry bamboo walking sticks sold by local villagers at Tyrna village. Stay overnight at a village homestay in Nongriat to experience the bridges in morning solitude."
  },
  {
    id: 10,
    slug: 'the-art-of-slow-travel-in-india-manifesto',
    isFeatured: false,
    title: 'The Art of Slow Travel in India: How to Leave the Itinerary Behind',
    category: 'Travel Tips',
    destination: 'Rajasthan',
    location: 'Across Pan-India Railways & Villages',
    coverImage: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80',
    midImage: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    readTime: '6 min read',
    date: 'September 10, 2026',
    author: {
      name: 'Priyanka Roy',
      role: 'Editorial Director, Bhromon',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
      bio: 'Travel essayist and curator of Bhromon’s flagship literary journeys, Priyanka has covered over 30,000 kilometers on Indian Railways.'
    },
    excerpt: 'Why rushing through the Golden Triangle misses the pulse of the country. A manifesto for staying longer, riding second-class trains, and allowing serendipity to script your finest memories.',
    tags: ['#SlowTravel', '#Mindfulness', '#IndiaTravel', '#Journeys'],
    views: 16100,
    likes: 1120,
    bodyParagraphs: [
      "The prevailing disease of modern tourism is the checklist: three days for Jaipur, one for Agra, forty-eight hours for Varanasi. Travelers return exhausted, having accumulated hundreds of digital snapshots while missing the soul of the places they crossed.",
      "Slow travel in India is an active act of rebellion. It means choosing the slow overnight train over a domestic budget flight, listening to the vendor sing 'Garam Chai!' as dawn breaks over the mustard fields of Uttar Pradesh.",
      "When you remain in a single village or neighborhood for a week, the dynamic shifts from observation to relationship. The corner chaiwala begins preparing your tea without having to ask; temple priests welcome you with nods of familiarity; and India opens its heart."
    ],
    pullQuote: "India does not reveal itself to those in a hurry. It yields only to those willing to sit still and listen.",
    subheading1: "The Philosophy of the Open Train Window",
    subheading2: "Replacing the Checklist with Curiosity",
    curatorTip: "Commit to cutting your planned destinations in half. Spend four days where you planned two, and leave at least one day completely unscheduled."
  }
];

const CATEGORIES = [
  'All',
  'Destinations',
  'Travel Tips',
  'Culture',
  'Food',
  'Adventure',
  'Budget Travel',
  'Luxury'
];

const SIDEBAR_CATEGORIES = [
  { name: 'All', count: 24 },
  { name: 'Destinations', count: 8 },
  { name: 'Travel Tips', count: 5 },
  { name: 'Culture', count: 4 },
  { name: 'Adventure', count: 3 },
  { name: 'Food', count: 2 },
  { name: 'Budget Travel', count: 1 },
  { name: 'Luxury', count: 1 }
];

const TAG_CLOUD = [
  '#Rajasthan',
  '#Varanasi',
  '#Kerala',
  '#Backpacking',
  '#Himalayas',
  '#Ghats',
  '#Houseboat',
  '#Heritage',
  '#Spiritual',
  '#LivingBridges',
  '#HighPasses',
  '#SlowTravel'
];

export default function Blog({ embedded = false }) {
  // Navigation state: toggling between listing and detail view
  const [selectedArticle, setSelectedArticle] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Latest'); // Latest | Popular | Most Read
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;

  // Detail View Interactive States
  const [copiedLink, setCopiedLink] = useState(false);
  const [likedArticle, setLikedArticle] = useState(false);
  const [comments, setComments] = useState([
    {
      id: 101,
      author: 'Aarav Malhotra',
      date: '2 days ago',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      text: 'This writing transported me straight back to the ghats of Varanasi. The morning mist and the temple chimes are unforgettable.',
      likes: 14
    },
    {
      id: 102,
      author: 'Suniti Sen',
      date: '5 days ago',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
      text: 'The recommendation for homestays in Tirthan Valley was spot on! We stayed with a family in Gushaini last spring and the siddu was pure warmth.',
      likes: 9
    }
  ]);
  const [commentForm, setCommentForm] = useState({ name: '', email: '', text: '' });
  const [commentSubmitted, setCommentSubmitted] = useState(false);

  // Newsletter subscription state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Animation Refs
  const pageContainerRef = useRef(null);
  const gridSectionRef = useRef(null);

  // Scroll to top when view changes or page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedArticle, currentPage]);

  // Featured article (first item with isFeatured = true)
  const featuredArticle = useMemo(() => {
    return BLOG_ARTICLES.find(a => a.isFeatured) || BLOG_ARTICLES[0];
  }, []);

  // Filtered and Sorted Articles
  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((item) => {
      // Exclude featured article from standard listing grid so it doesn't duplicate
      if (item.id === featuredArticle.id && activeCategory === 'All' && !searchQuery) {
        return false;
      }
      // Category match
      const matchesCategory =
        activeCategory === 'All' || item.category.toLowerCase() === activeCategory.toLowerCase();

      // Search match
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.excerpt.toLowerCase().includes(query) ||
        item.destination.toLowerCase().includes(query) ||
        item.author.name.toLowerCase().includes(query) ||
        item.tags.some(t => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'Popular') {
        return b.views - a.views;
      }
      if (sortBy === 'Most Read') {
        return parseInt(b.readTime) - parseInt(a.readTime);
      }
      // Latest (default)
      return b.id - a.id;
    });
  }, [activeCategory, searchQuery, sortBy, featuredArticle]);

  // Paginated articles slice
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage) || 1;
  const currentArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * articlesPerPage;
    return filteredArticles.slice(startIndex, startIndex + articlesPerPage);
  }, [filteredArticles, currentPage, articlesPerPage]);

  // Popular Articles for Sidebar
  const popularArticles = useMemo(() => {
    return [...BLOG_ARTICLES].sort((a, b) => b.views - a.views).slice(0, 5);
  }, []);

  // Related Articles for Detail View (same category or others, excluding current)
  const relatedArticles = useMemo(() => {
    if (!selectedArticle) return [];
    const sameCategory = BLOG_ARTICLES.filter(
      a => a.id !== selectedArticle.id && a.category === selectedArticle.category
    );
    const others = BLOG_ARTICLES.filter(
      a => a.id !== selectedArticle.id && a.category !== selectedArticle.category
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [selectedArticle]);

  // Handle article select
  const handleSelectArticle = (article) => {
    setSelectedArticle(article);
    setCopiedLink(false);
    setLikedArticle(false);
    setCommentSubmitted(false);
  };

  // Copy link to clipboard
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Submit comment
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentForm.name.trim() || !commentForm.text.trim()) return;

    const newComment = {
      id: Date.now(),
      author: commentForm.name.trim(),
      date: 'Just now',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      text: commentForm.text.trim(),
      likes: 1
    };

    setComments([newComment, ...comments]);
    setCommentForm({ name: '', email: '', text: '' });
    setCommentSubmitted(true);
    setTimeout(() => setCommentSubmitted(false), 4000);
  };

  // Submit newsletter
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterEmail('');
      setNewsletterSubscribed(false);
    }, 4500);
  };

  // GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Hero Header
      gsap.fromTo(
        '.gsap-fade-in',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: 'power2.out' }
      );

      // Staggered card reveals in listing view
      if (!selectedArticle) {
        gsap.fromTo(
          '.blog-grid-card',
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: gridSectionRef.current,
              start: 'top 85%'
            }
          }
        );
      }
    }, pageContainerRef);

    return () => ctx.revert();
  }, [selectedArticle, currentPage, activeCategory, sortBy]);

  return (
    <div
      ref={pageContainerRef}
      className="min-h-screen bg-[#F4F1E8] text-[#111111] font-sans selection:bg-[#123C2A] selection:text-white relative"
    >
      {/* 
        ========================================================================
        TEXTURE BACKGROUND OVERLAYS
        ========================================================================
      */}
      {!embedded && <div
        className="fixed inset-0 pointer-events-none opacity-30 mix-blend-multiply z-0"
        style={{
          backgroundImage: 'radial-gradient(#9B8365 0.75px, transparent 0.75px)',
          backgroundSize: '22px 22px'
        }}
        aria-hidden="true"
      />}

      {/* Navigation Header */}
      {!embedded && <BhromonNav mode="solid" />}

      {/* ==================================================================== */}
      {/* CONDITIONAL RENDER: BLOG DETAIL VIEW OR LISTING VIEW                  */}
      {/* ==================================================================== */}
      {selectedArticle ? (
        // ====================================================================
        // DETAIL VIEW
        // ====================================================================
        <main className="relative z-10 pt-28 sm:pt-36 pb-24 sm:pb-32">
          {/* Breadcrumb & Back Navigation */}
          <div className="max-w-[1240px] mx-auto px-6 sm:px-12 lg:px-16 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-b border-stone-300/70">
              <button
                onClick={() => setSelectedArticle(null)}
                className="group inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-stone-700 hover:text-[#123C2A] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-stone-200/80 group-hover:bg-[#123C2A] group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
                <span>Back to Journal Articles</span>
              </button>

              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-xs text-stone-500 font-medium overflow-hidden">
                <Link to="/" className="hover:text-[#123C2A] transition-colors">Home</Link>
                <span>/</span>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="hover:text-[#123C2A] transition-colors cursor-pointer"
                >
                  Blog
                </button>
                <span>/</span>
                <span className="text-stone-900 font-semibold truncate max-w-[200px] sm:max-w-[320px]">
                  {selectedArticle.title}
                </span>
              </nav>
            </div>
          </div>

          {/* Article Header & Title */}
          <header className="max-w-[1000px] mx-auto px-6 sm:px-12 text-center pt-4 pb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#B85C32]" />
              <span className="text-[11px] tracking-[0.24em] font-bold text-[#B85C32] uppercase">
                {selectedArticle.category} • {selectedArticle.destination}
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl text-[#111111] font-normal leading-[1.12] tracking-tight mb-6">
              {selectedArticle.title}
            </h1>

            {/* Publication Metadata */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-stone-600 font-medium mb-8">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{selectedArticle.date}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{selectedArticle.readTime}</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-stone-300" />
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B85C32]" />
                <span>{selectedArticle.location}</span>
              </div>
            </div>

            {/* Author Profile Pill */}
            <div className="inline-flex items-center gap-3.5 bg-white/80 backdrop-blur-xs px-5 py-2.5 rounded-full border border-stone-200 shadow-xs">
              <img
                src={selectedArticle.author.avatar}
                alt={selectedArticle.author.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#123C2A]/20"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-stone-900 leading-tight">
                  {selectedArticle.author.name}
                </div>
                <div className="text-[10px] text-stone-500 font-medium">
                  {selectedArticle.author.role}
                </div>
              </div>
            </div>
          </header>

          {/* Full-width Hero Article Image with Deckle Frame */}
          <div className="max-w-[1240px] mx-auto px-6 sm:px-12 mb-12">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] sm:aspect-[21/9] border border-stone-300/80">
              <img
                src={selectedArticle.coverImage}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

              {/* Decorative Corner Postage Stamp */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-[#FAF6F0] p-2 rounded shadow-lg border border-dashed border-[#8E7963] rotate-3 hidden sm:flex flex-col items-center">
                <span className="text-[8px] font-bold text-stone-700 tracking-widest uppercase">BHROMON EXPEDITION</span>
                <span className="text-[10px] font-mono font-bold text-[#123C2A]">{selectedArticle.destination.toUpperCase()}</span>
                <span className="text-[7px] text-stone-500 tracking-wider">INDIA POST • 2026</span>
              </div>

              {/* Location Tag Bottom Left */}
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs">
                <MapPin className="w-3.5 h-3.5 text-[#D7A43A]" />
                <span className="font-medium tracking-wide">{selectedArticle.location}</span>
              </div>
            </div>
          </div>

          {/* Main Article Body Layout */}
          <div className="max-w-[820px] mx-auto px-6 sm:px-8">
            {/* Excerpt Lead In */}
            <p className="font-editorial text-lg sm:text-2xl text-stone-800 leading-relaxed italic mb-8 border-b border-stone-300 pb-8">
              "{selectedArticle.excerpt}"
            </p>

            {/* Paragraph 1 */}
            <div className="prose prose-stone max-w-none text-stone-800 text-[15px] sm:text-base leading-[1.8] space-y-6">
              <p>{selectedArticle.bodyParagraphs[0]}</p>

              {/* Subheading 1 */}
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#111111] pt-6 pb-1 border-b border-stone-200 inline-block">
                {selectedArticle.subheading1}
              </h2>

              <p>{selectedArticle.bodyParagraphs[1]}</p>

              {/* Pull Quote Editorial Callout */}
              <blockquote className="my-10 p-6 sm:p-8 bg-[#FAF6F0] rounded-2xl border-l-4 border-[#B85C32] shadow-sm relative overflow-hidden">
                <span className="font-editorial text-6xl text-[#B85C32]/20 absolute -top-4 left-3 select-none pointer-events-none">
                  “
                </span>
                <p className="font-editorial italic text-xl sm:text-2xl text-[#123C2A] leading-snug relative z-10 m-0">
                  {selectedArticle.pullQuote}
                </p>
                <cite className="block text-xs font-sans tracking-[0.2em] font-semibold text-stone-500 uppercase mt-4 not-italic">
                  — {selectedArticle.author.name}, Dispatch from {selectedArticle.destination}
                </cite>
              </blockquote>

              <p>{selectedArticle.bodyParagraphs[2]}</p>

              {/* Mid-Article Photographic Print */}
              <div className="my-10 bg-white p-3 sm:p-4 rounded-2xl shadow-photo-print border border-stone-200">
                <div className="rounded-xl overflow-hidden aspect-[16/10] relative">
                  <img
                    src={selectedArticle.midImage || selectedArticle.coverImage}
                    alt={`${selectedArticle.destination} travel journal visual`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 px-2 flex items-center justify-between text-xs text-stone-500">
                  <span className="font-handwriting text-lg text-stone-700">
                    Field photo record: {selectedArticle.destination} territory
                  </span>
                  <span className="font-mono text-[10px] tracking-wider uppercase">ARCHIVE REF: #{selectedArticle.id}04</span>
                </div>
              </div>

              {/* Subheading 2 */}
              <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#111111] pt-6 pb-1 border-b border-stone-200 inline-block">
                {selectedArticle.subheading2}
              </h2>

              <p>{selectedArticle.bodyParagraphs[3]}</p>

              {selectedArticle.bodyParagraphs[4] && (
                <p>{selectedArticle.bodyParagraphs[4]}</p>
              )}

              {/* Bhromon Curator's Dispatch Tip Box */}
              {selectedArticle.curatorTip && (
                <div className="my-10 p-6 sm:p-8 bg-[#123C2A] text-[#F4F1E8] rounded-2xl shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <Compass className="w-5 h-5 text-[#D7A43A]" />
                    <span className="text-[11px] tracking-[0.24em] font-bold text-[#D7A43A] uppercase">
                      Curator’s Field Dispatch
                    </span>
                  </div>
                  <h4 className="font-editorial text-lg text-white mb-2">
                    Essential Guidance for {selectedArticle.destination}
                  </h4>
                  <p className="text-stone-300 text-sm leading-relaxed m-0">
                    {selectedArticle.curatorTip}
                  </p>
                </div>
              )}
            </div>

            {/* Tags Row */}
            <div className="mt-12 pt-6 border-t border-stone-300 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider text-stone-500 uppercase mr-2">
                Filed under:
              </span>
              {selectedArticle.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-white text-stone-700 hover:text-[#123C2A] text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Social Share & Engagement Row */}
            <div className="mt-8 py-5 border-y border-stone-300 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLikedArticle(!likedArticle)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    likedArticle
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${likedArticle ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{selectedArticle.likes + (likedArticle ? 1 : 0)} Applauds</span>
                </button>

                <div className="text-xs text-stone-500">
                  {selectedArticle.views.toLocaleString()} reads
                </div>
              </div>

              {/* Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-stone-500 uppercase mr-1">
                  Share:
                </span>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedArticle.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on X"
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#123C2A] hover:text-white text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on Facebook"
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#123C2A] hover:text-white text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.667 5H18V0h-3.889C10.833 0 9 1.667 9 4.667V8z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(selectedArticle.title + ' ' + window.location.href)}`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Share on WhatsApp"
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#25D366] hover:text-white text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </a>

                {/* Copy Link Button */}
                <button
                  onClick={handleCopyLink}
                  aria-label="Copy Article Link"
                  className="relative w-8 h-8 rounded-full bg-white hover:bg-[#123C2A] hover:text-white text-stone-700 border border-stone-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink && (
                    <span className="absolute -top-8 right-0 bg-[#123C2A] text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap shadow-md">
                      Copied!
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Author Biography Box */}
            <div className="mt-12 p-6 sm:p-8 bg-[#FAF6F0] rounded-2xl border border-stone-300/80 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <img
                src={selectedArticle.author.avatar}
                alt={selectedArticle.author.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 ring-4 ring-white shadow-md"
              />
              <div className="text-center sm:text-left">
                <span className="text-[10px] font-sans tracking-[0.24em] font-bold text-stone-500 uppercase block mb-1">
                  ABOUT THE WRITER
                </span>
                <h3 className="font-editorial text-xl font-bold text-[#111111] mb-2">
                  {selectedArticle.author.name}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed mb-4">
                  {selectedArticle.author.bio}
                </p>
                <div className="text-xs text-[#123C2A] font-semibold flex items-center justify-center sm:justify-start gap-1">
                  <span>Explore more dispatches by {selectedArticle.author.name.split(' ')[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Comments & Reflections Section */}
            <section className="mt-16 pt-12 border-t border-stone-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[#111111]">
                    Reader Reflections
                  </h3>
                  <p className="text-stone-600 text-xs mt-1">
                    Join the conversation with fellow travelers & historians
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 bg-white px-3 py-1.5 rounded-full border border-stone-200">
                  <MessageSquare className="w-3.5 h-3.5 text-[#B85C32]" />
                  <span>{comments.length} Thoughts</span>
                </div>
              </div>

              {/* Leave a Comment Form */}
              <form onSubmit={handleCommentSubmit} className="mb-12 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm">
                <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-4">
                  Leave a Thoughtful Reflection
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Suman Chattopadhyay"
                      value={commentForm.name}
                      onChange={e => setCommentForm({ ...commentForm, name: e.target.value })}
                      className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#123C2A] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (kept private) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={commentForm.email}
                      onChange={e => setCommentForm({ ...commentForm, email: e.target.value })}
                      className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#123C2A] transition-colors"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Reflection or Story *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Share your personal encounters, field observations, or questions about this journey…"
                    value={commentForm.text}
                    onChange={e => setCommentForm({ ...commentForm, text: e.target.value })}
                    className="w-full bg-[#FAF6F0] border border-stone-300 rounded-xl p-4 text-sm text-stone-900 focus:outline-none focus:border-[#123C2A] transition-colors resize-y"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Respectful discourse only. Submissions reviewed periodically.
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 bg-[#123C2A] hover:bg-[#184D36] text-white text-xs font-bold tracking-wider uppercase px-6 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer"
                  >
                    <span>Post Reflection</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>

                {commentSubmitted && (
                  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Thank you for your reflection! Your contribution has been added below.</span>
                  </div>
                )}
              </form>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(c => (
                  <div key={c.id} className="bg-[#FAF6F0] p-5 sm:p-6 rounded-2xl border border-stone-200/90">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar}
                          alt={c.author}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-stone-900">{c.author}</div>
                          <div className="text-[10px] text-stone-500">{c.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Heart className="w-3.5 h-3.5 text-stone-400" />
                        <span>{c.likes}</span>
                      </div>
                    </div>
                    <p className="text-sm text-stone-700 leading-relaxed pl-12">
                      {c.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Related Articles Carousel / Grid */}
          <section className="max-w-[1240px] mx-auto px-6 sm:px-12 mt-20 pt-16 border-t border-stone-300">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#123C2A]" />
                  <span className="text-[10px] font-sans tracking-[0.24em] font-semibold text-stone-600 uppercase">
                    MORE EDITORIAL DISPATCHES
                  </span>
                </div>
                <h3 className="font-editorial text-2xl sm:text-3xl text-[#111111]">
                  Continue Your Literary Journey
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-xs font-bold text-[#123C2A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedArticles.map(rel => (
                <div
                  key={rel.id}
                  onClick={() => handleSelectArticle(rel)}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-200/80 cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={rel.coverImage}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {rel.category}
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mb-2">
                        <span>{rel.destination}</span>
                        <span>•</span>
                        <span>{rel.readTime}</span>
                      </div>
                      <h4 className="font-editorial text-lg text-stone-900 group-hover:text-[#123C2A] transition-colors leading-snug line-clamp-2 mb-3">
                        {rel.title}
                      </h4>
                      <p className="text-stone-600 text-xs line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-[#123C2A]">
                      <span>Read Dispatch</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      ) : (
        // ====================================================================
        // LISTING VIEW (DEFAULT)
        // ====================================================================
        <main className="relative z-10">
          {/* 
            ====================================================================
            1. FEATURED ARTICLE HERO CARD
            ====================================================================
          */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 pt-28 sm:pt-36 mb-12">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-deckle border border-stone-300/80 min-h-[460px] sm:min-h-[540px] lg:min-h-[600px] flex items-end">
              {/* Background Image */}
              <img
                src={featuredArticle.coverImage}
                alt={featuredArticle.title}
                className="absolute inset-0 w-full h-full object-cover object-center transform scale-100 hover:scale-105 transition-transform duration-1000 ease-out"
              />

              {/* Multi-tier Dark Dramatic Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />

              {/* Cartographic Compass Watermark */}
              <div className="absolute top-8 right-8 text-white/20 hidden md:block pointer-events-none">
                <Compass className="w-32 h-32 stroke-[0.8]" />
              </div>

              {/* Top Editorial Eyebrow & Stamp */}
              <div className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center gap-3">
                <span className="bg-[#B85C32] text-white text-[10px] tracking-[0.24em] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                  FEATURED DISPATCH
                </span>
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-mono tracking-widest px-3 py-1 rounded-full hidden sm:inline-block">
                  VOL. IV • {featuredArticle.destination.toUpperCase()}
                </span>
              </div>

              {/* Hero Content Container */}
              <div className="relative z-10 p-6 sm:p-12 lg:p-16 max-w-[960px]">
                <div className="flex items-center gap-3 text-xs text-stone-300 font-medium mb-3">
                  <span className="text-[#D7A43A] font-bold tracking-wider uppercase">
                    {featuredArticle.category}
                  </span>
                  <span>•</span>
                  <span>{featuredArticle.location}</span>
                  <span>•</span>
                  <span>{featuredArticle.readTime}</span>
                </div>

                <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-normal leading-[1.12] tracking-tight mb-4 drop-shadow-md">
                  {featuredArticle.title}
                </h1>

                <p className="text-stone-200 text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-[800px] font-light">
                  {featuredArticle.excerpt}
                </p>

                {/* Author Info + Read CTA */}
                <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-white/20">
                  <div className="flex items-center gap-3">
                    <img
                      src={featuredArticle.author.avatar}
                      alt={featuredArticle.author.name}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white/60"
                    />
                    <div>
                      <div className="text-sm font-bold text-white leading-tight">
                        {featuredArticle.author.name}
                      </div>
                      <div className="text-xs text-stone-300">
                        {featuredArticle.date}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectArticle(featuredArticle)}
                    className="inline-flex items-center gap-2.5 bg-[#123C2A] hover:bg-[#184D36] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase px-7 py-3 rounded-full transition-all shadow-lg hover:shadow-2xl hover:translate-x-1 cursor-pointer border border-emerald-500/30"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 
            ====================================================================
            2. SEARCH + CATEGORY FILTER ROW
            ====================================================================
          */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 mb-10">
            <div className="bg-[#FAF6F0] rounded-2xl p-4 sm:p-6 border border-stone-300/80 shadow-sm flex flex-col gap-5">
              {/* Search Bar + Sort Header */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-xl">
                  <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by destination, title, tags, or author…"
                    className="w-full bg-white border border-stone-200 rounded-full pl-11 pr-10 py-2.5 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#123C2A] transition-colors shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Sort By Selector */}
                <div className="flex items-center gap-2 justify-end text-xs">
                  <div className="flex items-center gap-1.5 text-stone-600 font-semibold tracking-wider uppercase text-[11px]">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#B85C32]" />
                    <span>Sort by:</span>
                  </div>
                  <div className="inline-flex rounded-full bg-white p-1 border border-stone-200 shadow-xs">
                    {['Latest', 'Popular', 'Most Read'].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSortBy(option);
                          setCurrentPage(1);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          sortBy === option
                            ? 'bg-[#123C2A] text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-stone-200/80">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 mr-1">
                  Topics:
                </span>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeCategory === cat
                        ? 'bg-[#123C2A] text-white shadow-sm'
                        : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* 
            ====================================================================
            3. TWO-COLUMN MAIN LAYOUT (Article Grid Left + Sidebar Right)
            ====================================================================
          */}
          <section
            ref={gridSectionRef}
            className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-14 pb-16 sm:pb-24"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* ------------------------------------------------------------ */}
              {/* LEFT COLUMN: 3/4 WIDTH (lg:col-span-8 or xl:col-span-9)      */}
              {/* ------------------------------------------------------------ */}
              <div className="lg:col-span-8 xl:col-span-9">
                {/* Result Status Counter */}
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-stone-300/80">
                  <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#123C2A]" />
                    <span>
                      Showing <strong className="text-stone-900 font-bold">{filteredArticles.length}</strong> dispatches
                      {activeCategory !== 'All' && <span> in <strong className="text-stone-900">{activeCategory}</strong></span>}
                      {searchQuery && <span> matching "<strong className="text-stone-900">{searchQuery}</strong>"</span>}
                    </span>
                  </div>

                  {(activeCategory !== 'All' || searchQuery) && (
                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setSearchQuery('');
                        setCurrentPage(1);
                      }}
                      className="text-xs text-[#B85C32] hover:underline font-semibold"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>

                {/* Article Grid: 3 columns on desktop, 2 on tablet, 1 on mobile */}
                {currentArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-7">
                    {currentArticles.map((article) => (
                      <article
                        key={article.id}
                        className="blog-grid-card group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-stone-200/90 flex flex-col justify-between"
                      >
                        <div>
                          {/* Card Thumbnail */}
                          <div className="aspect-[16/10] overflow-hidden relative cursor-pointer" onClick={() => handleSelectArticle(article)}>
                            <img
                              src={article.coverImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute top-3 left-3 bg-[#123C2A] text-white text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase shadow-xs">
                              {article.category}
                            </div>
                            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D7A43A]" />
                              <span>{article.destination}</span>
                            </div>
                          </div>

                          {/* Card Details */}
                          <div className="p-5 sm:p-6">
                            {/* Read Time & Date */}
                            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium mb-2.5">
                              <span>{article.date}</span>
                              <span className="w-1 h-1 rounded-full bg-stone-300" />
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{article.readTime}</span>
                              </div>
                            </div>

                            {/* Title (2 lines clamped) */}
                            <h3
                              onClick={() => handleSelectArticle(article)}
                              className="font-editorial text-lg sm:text-[19px] font-semibold text-[#111111] group-hover:text-[#123C2A] transition-colors leading-snug line-clamp-2 mb-2.5 cursor-pointer"
                            >
                              {article.title}
                            </h3>

                            {/* Excerpt (2-3 lines clamped) */}
                            <p className="text-stone-600 text-xs sm:text-[13px] leading-relaxed line-clamp-3 mb-4 font-normal">
                              {article.excerpt}
                            </p>

                            {/* Tag Pills */}
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {article.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSearchQuery(tag.replace('#', ''));
                                  }}
                                  className="text-[10px] bg-[#FAF6F0] hover:bg-stone-200 text-stone-600 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Card Footer: Author + Read More */}
                        <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={article.author.avatar}
                              alt={article.author.name}
                              className="w-7 h-7 rounded-full object-cover ring-1 ring-stone-200"
                            />
                            <span className="text-xs font-semibold text-stone-800 truncate max-w-[110px]">
                              {article.author.name}
                            </span>
                          </div>

                          <button
                            onClick={() => handleSelectArticle(article)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#123C2A] hover:text-[#B85C32] transition-colors cursor-pointer group-hover:translate-x-0.5"
                          >
                            <span>Read More</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
                    <Compass className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="font-editorial text-xl font-bold text-stone-800 mb-2">
                      No travel articles found
                    </h3>
                    <p className="text-stone-500 text-xs mb-6 max-w-md mx-auto">
                      We couldn't find any articles matching your search criteria. Try a different keyword or browse through our primary categories.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory('All');
                        setSearchQuery('');
                      }}
                      className="bg-[#123C2A] text-white text-xs font-semibold px-5 py-2.5 rounded-full"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* 
                  ==============================================================
                  4. PAGINATION
                  ==============================================================
                */}
                {totalPages > 1 && (
                  <nav className="mt-12 pt-8 border-t border-stone-300/80 flex items-center justify-between">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        currentPage === 1
                          ? 'opacity-40 cursor-not-allowed text-stone-400'
                          : 'bg-white hover:bg-[#123C2A] hover:text-white text-stone-700 shadow-xs border border-stone-200 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                        <button
                          key={pg}
                          onClick={() => setCurrentPage(pg)}
                          className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            currentPage === pg
                              ? 'bg-[#123C2A] text-white shadow-sm'
                              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
                          }`}
                        >
                          {pg}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        currentPage === totalPages
                          ? 'opacity-40 cursor-not-allowed text-stone-400'
                          : 'bg-white hover:bg-[#123C2A] hover:text-white text-stone-700 shadow-xs border border-stone-200 cursor-pointer'
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </nav>
                )}
              </div>

              {/* ------------------------------------------------------------ */}
              {/* RIGHT SIDEBAR: 1/4 WIDTH (lg:col-span-4 or xl:col-span-3)    */}
              {/* ------------------------------------------------------------ */}
              <aside className="lg:col-span-4 xl:col-span-3 space-y-8">
                {/* 1. Popular Articles List Widget */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                    <Sparkles className="w-4 h-4 text-[#D7A43A]" />
                    <h3 className="font-editorial text-lg font-bold text-[#111111]">
                      Most Read Dispatches
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {popularArticles.map((pop, idx) => (
                      <div
                        key={pop.id}
                        onClick={() => handleSelectArticle(pop)}
                        className="group flex items-start gap-3.5 cursor-pointer pb-3.5 border-b border-stone-100 last:border-0 last:pb-0"
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative">
                          <img
                            src={pop.coverImage}
                            alt={pop.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute bottom-0 right-0 bg-[#123C2A] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl">
                            #{idx + 1}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-editorial text-xs sm:text-[13px] font-semibold text-stone-900 group-hover:text-[#123C2A] transition-colors leading-snug line-clamp-2 mb-1">
                            {pop.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-stone-500">
                            <span>{pop.destination}</span>
                            <span>•</span>
                            <span>{pop.readTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Categories with Count Widget */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
                    <Tag className="w-4 h-4 text-[#B85C32]" />
                    <h3 className="font-editorial text-lg font-bold text-[#111111]">
                      Article Categories
                    </h3>
                  </div>

                  <ul className="space-y-2">
                    {SIDEBAR_CATEGORIES.map(catItem => (
                      <li key={catItem.name}>
                        <button
                          onClick={() => {
                            setActiveCategory(catItem.name);
                            setCurrentPage(1);
                            window.scrollTo({ top: 400, behavior: 'smooth' });
                          }}
                          className={`w-full flex items-center justify-between text-xs py-2 px-3 rounded-xl transition-all cursor-pointer ${
                            activeCategory === catItem.name
                              ? 'bg-[#123C2A] text-white font-bold'
                              : 'text-stone-700 hover:bg-[#FAF6F0] hover:text-[#123C2A]'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${activeCategory === catItem.name ? 'bg-[#D7A43A]' : 'bg-stone-300'}`} />
                            <span>{catItem.name}</span>
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            activeCategory === catItem.name
                              ? 'bg-white/20 text-white'
                              : 'bg-stone-100 text-stone-500'
                          }`}>
                            {catItem.count}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Tags Cloud Widget */}
                <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-sm">
                  <h3 className="font-editorial text-lg font-bold text-[#111111] mb-4 pb-3 border-b border-stone-100">
                    Destinations & Themes
                  </h3>

                  <div className="flex flex-wrap gap-2">
                    {TAG_CLOUD.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag.replace('#', ''));
                          setCurrentPage(1);
                          window.scrollTo({ top: 400, behavior: 'smooth' });
                        }}
                        className="bg-[#FAF6F0] hover:bg-[#123C2A] text-stone-700 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-stone-200/80 transition-all cursor-pointer shadow-2xs hover:scale-105"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Newsletter Signup Mini Box (Deckle Editorial Style) */}
                <div
                  className="bg-[#123C2A] text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden"
                  style={{
                    backgroundImage: 'radial-gradient(rgba(255,255,255,0.08) 0.75px, transparent 0.75px)',
                    backgroundSize: '16px 16px'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#D7A43A]" />
                    <span className="text-[10px] tracking-[0.24em] font-bold text-emerald-300 uppercase">
                      WEEKLY DISPATCH
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl sm:text-2xl font-normal text-white mb-2 leading-snug">
                    Stories from the Road, <br />
                    <span className="italic text-[#D7A43A]">Direct to your inbox.</span>
                  </h3>

                  <p className="text-stone-300 text-xs leading-relaxed mb-5">
                    Curated travel essays, secret route maps, and seasonal festivals across India.
                  </p>

                  <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={newsletterEmail}
                      onChange={e => setNewsletterEmail(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-[#D7A43A] transition-colors"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#D7A43A] hover:bg-[#E8B84B] text-[#111111] text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Join The Journal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>

                  {newsletterSubscribed && (
                    <div className="mt-3 p-2.5 bg-emerald-900/60 border border-emerald-400/40 text-emerald-200 rounded-lg text-[11px] text-center">
                      ✓ Welcome aboard! Check your inbox for our India dispatch.
                    </div>
                  )}

                  <div className="mt-4 text-[10px] text-stone-400 text-center">
                    No spam ever. Unsubscribe at any time.
                  </div>
                </div>

                {/* 5. Vintage Indian Postal Badge / Stamp Ornament */}
                <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-dashed border-[#8E7963] flex items-center gap-4 rotate-0.5">
                  <div className="w-12 h-12 rounded-full border border-stone-400 p-1 flex items-center justify-center shrink-0 text-stone-700">
                    <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <circle cx="16" cy="16" r="14" strokeDasharray="2 3" />
                      <path d="M16 6 C14 10 11 15 16 20 C21 15 18 10 16 6 Z" fill="currentColor" fillOpacity="0.15" />
                      <circle cx="16" cy="20" r="1.5" fill="currentColor" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-sans text-[10px] tracking-[0.2em] font-bold text-stone-900 uppercase block">
                      BHROMON JOURNAL
                    </span>
                    <span className="text-[11px] text-stone-500 font-handwriting">
                      Stories curated with local custodians
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </main>
      )}

      {/* Footer */}
      {!embedded && <BhromonFooter />}
    </div>
  );
}
