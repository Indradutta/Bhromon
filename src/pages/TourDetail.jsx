import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MapPin,
  Clock,
  Calendar,
  Users,
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Share2,
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass,
  Bed,
  Utensils,
  Award,
  RotateCcw,
  Phone,
  MessageSquare,
  Info,
  Check,
  Camera,
  Coffee,
  Waves,
  Music,
  ShoppingBag,
  FileText
} from 'lucide-react';
import BhromonNav from '../components/BhromonNav';
import BhromonFooter from '../components/BhromonFooter';
import { TOURS_DATA } from '../data/tours';
import publicApi from '../api/publicApi';

gsap.registerPlugin(ScrollTrigger);

export default function TourDetail({ embedded = false, tourId }) {
  const params = useParams();
  const id = tourId ?? params.id ?? '1';

  // Active Tab State: 'overview' | 'itinerary' | 'hotels' | 'inclusions' | 'faqs'
  const [activeTab, setActiveTab] = useState('overview');

  // Itinerary Accordion State: Track open day indices (1 to 7)
  const [openDays, setOpenDays] = useState({ 1: true });

  // FAQs Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // Terms & Conditions Collapsible State
  const [termsOpen, setTermsOpen] = useState(false);

  // Wishlist & Share Feedback States
  const [isSaved, setIsSaved] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Live Tour Package State
  const [liveTour, setLiveTour] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadLivePackage() {
      try {
        const res = await publicApi.getPackage(id);
        if (isMounted && res?.data) {
          setLiveTour(res.data);
        }
      } catch (err) {
        // Silently use static fallback
      }
    }
    loadLivePackage();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // GSAP Animation Refs
  const pageRef = useRef(null);
  const heroContentRef = useRef(null);
  const breadcrumbRef = useRef(null);
  const mainGridRef = useRef(null);
  const galleryRef = useRef(null);
  const relatedRef = useRef(null);

  // Toggle Itinerary Day
  const toggleDay = (dayNum) => {
    setOpenDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const expandAllDays = () => {
    setOpenDays({ 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true });
  };

  const collapseAllDays = () => {
    setOpenDays({});
  };

  // Toggle FAQs
  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? -1 : index));
  };

  // Handle Share URL
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2600);
    }
  };

  // GSAP Entrance Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      gsap.fromTo(
        heroContentRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', delay: 0.2 }
      );

      // Breadcrumb & Main grid reveal
      gsap.fromTo(
        [breadcrumbRef.current, mainGridRef.current],
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mainGridRef.current,
            start: 'top 85%',
          },
        }
      );

      // Gallery entrance
      if (galleryRef.current) {
        gsap.fromTo(
          galleryRef.current.children,
          { opacity: 0, scale: 0.95, y: 25 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: galleryRef.current,
              start: 'top 80%',
            },
          }
        );
      }

      // Related tours entrance
      if (relatedRef.current) {
        gsap.fromTo(
          relatedRef.current.children,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: relatedRef.current,
              start: 'top 82%',
            },
          }
        );
      }
    }, pageRef);

    return () => ctx.revert();
  }, []);

  // Static Tour Data: Varanasi Spiritual Journey
  const tourData = {
    title: 'Varanasi: The Sacred Ganges & The City of Light',
    tagline: 'An intimate 7-day metaphysical exploration across immortal ghats, dawn boat odysseys, and ancient silk lanes.',
    destination: 'Varanasi & Sarnath, Uttar Pradesh',
    duration: '7 Days / 6 Nights',
    tourType: 'Spiritual & Heritage Odyssey',
    groupSize: 'Small Group (Max 12 Guests)',
    originalPrice: '₹58,000',
    price: '₹48,500',
    discount: '16% Off',
    nextDeparture: '14 Nov 2026',
    availableSeats: 4,
    rating: 4.96,
    reviewCount: 168,
    heroImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1400&q=80',
    highlights: [
      {
        icon: Waves,
        title: 'Dawn Hand-Rowed Boat Cruise',
        desc: 'Glide past 84 sacred ghats at misty sunrise while Vedic chants and temple bells echo over the golden Ganges.',
      },
      {
        icon: Sparkles,
        title: 'VIP Reserved Aarti Viewing',
        desc: 'Front-row rooftop terrace seats at Dashashwamedh Ghat for the spellbinding evening Maha Ganga Aarti.',
      },
      {
        icon: Compass,
        title: 'Sarnath & Ashokan Heritage',
        desc: 'Walk the sacred Deer Park where Lord Buddha preached his first sermon, and view the 3rd-century BCE Lion Capital.',
      },
      {
        icon: ShoppingBag,
        title: 'Master Silk Weavers Atelier',
        desc: 'Private audience in centuries-old Muslim weaver mohallas watching generational artisans weave royal Katan silk brocades.',
      },
      {
        icon: Music,
        title: 'Twilight Haveli Classical Raga',
        desc: 'An intimate live sitar and tabla performance by hereditary Benares Gharana musicians in a private Ganga-facing courtyard.',
      },
      {
        icon: Coffee,
        title: 'Labyrinthine Gali Food Safari',
        desc: 'Taste steaming Ram Bhandar kachoris, saffron-scented malaiyo foam, and authentic Banarasi paan guided by local culinary historians.',
      },
    ],
    itinerary: [
      {
        day: 1,
        title: 'Arrival in the City of Light & Evening Ghat Orientation',
        summary:
          'Arrive at Lal Bahadur Shastri Airport (VNS). Private transfer to your riverside heritage palace. Late afternoon orientation walking tour leading to Assi Ghat for your first sunset glimpse of the holy river.',
        activities: [
          'VIP Airport reception with floral garland and private AC transfer',
          'Traditional welcome drink and orientation at the heritage property',
          'Sunset leisurely stroll along the southern ghats (Assi to Tulsi Ghat)',
          'Evening introduction talk by tour scholar on the sacred topography of Kashi',
        ],
        meals: 'Welcome Dinner with Banarasi and Awadhi specialties',
        hotel: 'BrijRama Palace / Taj Ganges (Heritage Luxury)',
      },
      {
        day: 2,
        title: 'Dawn on Sacred Waters & The Kashi Vishwanath Corridor',
        summary:
          'Early 5:15 AM departure for an ethereal wooden boat voyage from Assi to Manikarnika Ghat. Witness morning snan (ritual dips) and Surya Namaskar. In the afternoon, visit the newly restored Kashi Vishwanath Temple corridor.',
        activities: [
          'Private silent dawn boat ride watching the sun rise above the eastern sandbars',
          'Disembark at Manikarnika Ghat with an ethical cultural explanation by our scholar',
          'Breakfast at the riverside terrace as the morning mist lifts',
          'Curated walking access through the golden Kashi Vishwanath corridor',
          'Evening temple bell ceremony at Annapurna Mandir',
        ],
        meals: 'Artisan Breakfast, Traditional Satvik Thali Lunch',
        hotel: 'BrijRama Palace / Taj Ganges',
      },
      {
        day: 3,
        title: 'Sarnath — In the Footsteps of the Buddha & Dhamek Stupa',
        summary:
          'A quiet morning pilgrimage 10 km northeast to Sarnath (Isipatana), where Gautama Buddha taught the Dhammacakkappavattana Sutta to five ascetics after attaining enlightenment.',
        activities: [
          'Circumbulate the massive 5th-century Dhamek Stupa and Dharmarajika ruins',
          'Guided visit to Sarnath Archaeological Museum housing the iconic polished sandstone Ashokan Lion Capital',
          'Mindful walking meditation under the sacred Bodhi Tree sapling',
          'Return to Varanasi for a quiet tea tasting session discussing Buddhist and Vedic philosophies',
        ],
        meals: 'Breakfast, Organic Garden Lunch in Sarnath, Dinner',
        hotel: 'BrijRama Palace / Taj Ganges',
      },
      {
        day: 4,
        title: 'Hidden Galis, Sacred Akharas & The Weavers of Peetambari Silk',
        summary:
          'Venture deep into the timeless, pedestrian-only alleys of northern Varanasi. Visit traditional mud-wrestling akharas and observe master weavers practicing centuries-old jacquard handloom techniques.',
        activities: [
          'Dawn visit to a 400-year-old traditional Akhara to watch Kushti wrestlers train',
          'Walk through Vishwanath Gali, Kachori Gali, and the aromatic spice bazaar',
          'Exclusive entry into master handloom workshops in the Madanpura weavers quarter',
          'Learn the intricate motifs of Mughal shikargah, jangla, and zari weaving',
          'Late afternoon leisure and Ayurvedic massage session at the palace spa',
        ],
        meals: 'Breakfast, Local Street Food Safari (Kachori & Lassi), Palace Dinner',
        hotel: 'BrijRama Palace / Taj Ganges',
      },
      {
        day: 5,
        title: 'Ramnagar Fort Across the River & Twilight Classical Music',
        summary:
          'Cross the Ganges by private motor boat to the 18th-century cream-sandstone fortress of the Maharaja of Kashi at Ramnagar. In the evening, gather for a private classical Indian musical soiree.',
        activities: [
          'Boat excursion to Ramnagar Fort, exploring vintage royal palanquins and astronomical clocks',
          'Taste the famous Shivprasad lassi served in handmade clay kulhads near the fort gates',
          'Return to the western ghats for golden hour photography',
          'Private sunset chamber recital: Sitar & Tabla performance by hereditary masters of Benares Gharana',
        ],
        meals: 'Breakfast, Royal Thali Lunch, Evening Hors d’oeuvres & Dinner',
        hotel: 'BrijRama Palace / Taj Ganges',
      },
      {
        day: 6,
        title: 'Subah-e-Banaras, Sacred Kunds & The Grand Maha Ganga Aarti',
        summary:
          'Experience the ethereal dawn cultural celebration Subah-e-Banaras at Assi Ghat. In the evening, enjoy VIP reserved front-row terrace seating for the world-renowned Dashashwamedh Ghat Aarti.',
        activities: [
          'Dawn classical flute recital and gentle riverside yoga with certified yoga master',
          'Visit holy hidden kunds (stepwells): Lolark Kund and Manikarnika Kund',
          'Afternoon lecture on Vedic astronomy and the sacred geometry of the riverfront',
          'VIP reserved front-row seating for the evening 7-priest brass lamp Aarti ceremony',
          'Release handmade eco-friendly earthen diya lamps into the Ganges waters',
        ],
        meals: 'Breakfast, Chef-curated Lunch, Farewell Gala Dinner on a Private Barge',
        hotel: 'BrijRama Palace / Taj Ganges',
      },
      {
        day: 7,
        title: 'Final Dawn Blessings & Homeward Journey',
        summary:
          'A peaceful final morning at your own pace. Optional visit to Sankat Mochan Temple and Bharat Mata Mandir before checking out and transferring to Varanasi Airport.',
        activities: [
          'Leisurely breakfast on the rooftop overlooking the serene sunrise river',
          'Visit the unique Bharat Mata Temple featuring a marble relief map of undivided India',
          'Assistance with authentic Banarasi silk and brassware souvenir purchases',
          'Private air-conditioned transfer to Lal Bahadur Shastri Airport for your onward flight',
        ],
        meals: 'Full Artisan Breakfast',
        hotel: 'Departure Transfer',
      },
    ],
    hotels: [
      {
        name: 'BrijRama Palace, Varanasi',
        category: 'Heritage Grand Palace (5-Star)',
        location: 'Darbhanga Ghat, Riverfront Varanasi',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
        desc: 'One of the oldest riverfront palaces in Varanasi, built in 1812 by the Royal House of Nagpur. Accessible exclusively by private boat, featuring sandstone corridors, live classical morning music, and exquisite satvik dining.',
        amenities: ['Direct Ghat Access', 'Boat Pick-up', 'Ayurvedic Spa', 'Rooftop River View', 'High-Speed Wi-Fi', '24/7 Butler Service'],
        tag: 'Primary Stay (Days 1–4)',
      },
      {
        name: 'Taj Ganges, Nadesar',
        category: 'Luxury Resort & Palace Grounds (5-Star)',
        location: 'Nadesar Palace Grounds, Varanasi',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
        desc: 'Nestled amidst 42 acres of verdant orchards and lush royal gardens once frequented by royalty and viceroys. Offers modern sanctuary, award-winning Jiva Spa, and fine Awadhi dining at Varuna.',
        amenities: ['42-Acre Heritage Gardens', 'Outdoor Pool', 'Jiva Spa & Wellness', 'Varuna Fine Dining', 'Fitness Center', 'Private Car Fleet'],
        tag: 'Alternate Luxury Option',
      },
      {
        name: 'Suryauday Haveli',
        category: 'Boutique Heritage Haveli (4-Star Heritage)',
        location: 'Shivala Ghat, Varanasi',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
        desc: 'A meticulously restored royal mansion on Shivala Ghat built in the 20th century by the Royal family of Nepal as a retreat for elderly royalty. Features open courtyard, rooftop river decks, and serene atmosphere.',
        amenities: ['Shivala Ghat Riverfront', 'Rooftop Yoga Deck', 'Vegetarian Dining', 'Library & Cultural Salons', 'Airport Shuttles'],
        tag: 'Boutique Heritage Choice',
      },
    ],
    inclusions: [
      '6 nights premium accommodation in handpicked heritage riverside palaces and 5-star properties',
      'Daily gourmet breakfast, 4 authentic regional lunches, and 3 special dinners including Farewell Barge Gala',
      'All airport arrivals and departures in private luxury air-conditioned vehicles with dedicated chauffeur',
      'Daily sunrise and twilight private wooden boat safaris with skilled local boatmen',
      'Exclusive VIP reserved rooftop terrace seating for Dashashwamedh Ghat Maha Ganga Aarti',
      'Accompaniment throughout by a renowned licensed Bhromon Historian and cultural specialist guide',
      'All entrance monuments fees, temple donations, archaeological permits, and boat landing tolls',
      'Special private masterclass visit to generational royal silk weaving ateliers in Madanpura',
      'Private classical Indian musical recital with tea and sweetmeat service in a heritage haveli courtyard',
      'All state and central taxes, road tolls, driver allowances, and bottled mineral water during all tours',
    ],
    exclusions: [
      'International or domestic airfares to/from Varanasi Airport (VNS)',
      'Personal expenses such as laundry, telephone calls, room service, or alcoholic beverages',
      'Professional camera and video tripods permits inside select archaeological monument zones',
      'Discretionary tipping/gratuities for tour scholar, drivers, boatmen, and hotel bellstaff',
      'Comprehensive travel and medical insurance (strongly recommended, available upon checkout)',
      'Any optional activities or personal excursions not explicitly outlined in the final itinerary',
    ],
    faqs: [
      {
        q: 'What is the best time of year to undertake the Varanasi Spiritual Journey?',
        a: 'The ideal window is from October through late March, when northern India experiences crisp, pleasant mornings (12°C–18°C) and warm, golden afternoons (22°C–28°C). October and November coincide with mesmerizing festivals like Dev Deepavali (when all 84 ghats are illuminated with millions of earthen lamps) and Diwali, offering unforgettable cultural grandeur.',
      },
      {
        q: 'How physically demanding is this tour, especially along the Ghats?',
        a: 'The physical activity level is gentle to moderate. Varanasi’s ghats and historic lanes feature stone staircases, cobblestone alleyways, and gentle inclinations. While walking is the only way to experience the ancient galis, we maintain an unhurried, reflective pace. Porters and gentle boat transfers are arranged to minimize steep climbing wherever possible.',
      },
      {
        q: 'What is the appropriate dress code for temples and ghat ceremonies?',
        a: 'Modest and respectful attire is appreciated throughout holy Varanasi. Shoulders and knees should be covered. Lightweight, breathable cotton or linen clothing in muted, earthy tones works best. Easily removable slip-on footwear is recommended, as shoes must be removed before entering temples and boarding certain sacred boats.',
      },
      {
        q: 'Can dietary preferences like pure vegetarian, vegan, or Jain meals be catered for?',
        a: 'Absolutely. Varanasi is renowned as one of India’s culinary capitals for sacred satvik and pure vegetarian cuisine. All our included dining venues are handpicked for impeccable hygiene and exceptional taste. We seamlessly accommodate strict vegetarian, vegan, Jain (no root vegetables), and gluten-free dietary requirements.',
      },
      {
        q: 'Is it ethical and respectful to witness ceremonies at Manikarnika Ghat?',
        a: 'Yes, when approached with reverence and cultural mindfulness. Manikarnika is an ancient sacred cremation ground where Hindus believe souls attain Moksha (liberation from the cycle of rebirth). We view the ghat from our private boat on the water at a respectful distance, guided by our historian who explains the profound philosophical significance. Photography at the burning ghat is strictly prohibited.',
      },
      {
        q: 'What is the size of the travel group and can this be customized privately?',
        a: 'Our signature journeys are strictly limited to an intimate group of no more than 12 discerning travelers to guarantee personal attention and quiet immersion. If you prefer to travel with your own family or companions, this exact itinerary can be arranged as a 100% private bespoke expedition on your preferred calendar dates.',
      },
    ],
    gallery: [
      {
        url: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
        caption: 'Maha Ganga Aarti at Dashashwamedh Ghat',
        location: 'Dashashwamedh Ghat',
      },
      {
        url: 'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80',
        caption: 'Silent sunrise over the misty riverbanks',
        location: 'Assi Ghat',
      },
      {
        url: 'https://images.unsplash.com/photo-1627894483216-2138af692e32?auto=format&fit=crop&w=800&q=80',
        caption: 'Timeless stone corridors of the ancient city',
        location: 'Vishwanath Gali',
      },
      {
        url: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
        caption: 'Dhamek Stupa rising in the Deer Park of Sarnath',
        location: 'Sarnath Sacred Site',
      },
      {
        url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        caption: 'Generational weavers on antique pit looms',
        location: 'Madanpura Weavers Quarter',
      },
      {
        url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        caption: 'Subah-e-Banaras morning prayers and morning raga',
        location: 'Kedar Ghat',
      },
    ],
    relatedTours: [
      {
        id: 'royal-rajasthan',
        title: 'Royal Rajasthan: Palaces, Forts & Desert Dunes',
        location: 'Jaipur • Jodhpur • Udaipur',
        duration: '10 Days / 9 Nights',
        price: '₹74,500',
        rating: 4.98,
        reviews: 210,
        image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80',
        tag: 'Heritage Grandeur',
      },
      {
        id: 'himalayan-rishikesh',
        title: 'Spiritual Rishikesh & Himalayas: Yoga by the Ganges',
        location: 'Haridwar • Rishikesh • Devprayag',
        duration: '6 Days / 5 Nights',
        price: '₹38,900',
        rating: 4.92,
        reviews: 94,
        image: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=600&q=80',
        tag: 'Mind & Wellness',
      },
      {
        id: 'temples-tamil-nadu',
        title: 'Temples of Tamil Nadu: Dravidian Splendours',
        location: 'Madurai • Thanjavur • Chettinad',
        duration: '8 Days / 7 Nights',
        price: '₹54,000',
        rating: 4.95,
        reviews: 132,
        image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80',
        tag: 'Architecture & Chants',
      },
    ],
  };

  const catalogueTour = liveTour
    ? {
        ...liveTour,
        id: liveTour.legacyId || liveTour.id,
        destination: liveTour.destinationText || liveTour.region || 'India',
        durationDays: liveTour.durationDays || 5,
        durationText: liveTour.durationText || `${liveTour.durationDays} Days`,
        region: liveTour.region || liveTour.destinationText || 'India',
        type: liveTour.category || liveTour.type || 'Cultural',
        price: liveTour.price,
        rating: liveTour.rating || 4.9,
        reviewsCount: liveTour.reviewsCount || 100,
        image: liveTour.image,
      }
    : TOURS_DATA.find((tour) => String(tour.id) === id);
  tourData.overviewTitle = 'Where Eternity Rests Upon the Water’s Edge';
  tourData.overviewParagraphs = [
    'Varanasi, or Kashi—the luminous city of Lord Shiva—is an intimate theatre of faith, timeless architecture, and daily life along the Ganges. Ancient chants, sandalwood incense, and temple bells shape the rhythm of the riverfront.',
    'This seven-day journey moves beyond a checklist of monuments. Accompanied by local cultural specialists, travel by boat at dawn, explore the old lanes, and meet the craftspeople who keep the city’s traditions alive.',
    'From the quiet of Sarnath to the evening Ganga Aarti, the itinerary is designed for travelers who want time to understand the place as well as see it.',
  ];
  tourData.tourCode = 'BHR-VNS-7D';
  tourData.startFinish = 'Varanasi (VNS)';
  tourData.activityLevel = 'Gentle–Moderate';
  tourData.atmosphere = 'Heritage & Soul';

  if (catalogueTour?.id === 1) {
    tourData.title = catalogueTour.title;
    tourData.destination = catalogueTour.destination;
    tourData.duration = catalogueTour.durationText;
    tourData.price = `₹${catalogueTour.price.toLocaleString('en-IN')}`;
    tourData.heroImage = catalogueTour.image;
  }

  // Keep every catalogue card connected to a matching detail view. The first
  // listing has its full editorial dossier above; other listings use the same
  // page structure with their own catalogue facts and an itinerary tailored to
  // the destination rather than showing Varanasi details under another title.
  if (catalogueTour && catalogueTour.id !== 1) {
    const days = Math.min(catalogueTour.durationDays, 5);
    const destinationName = catalogueTour.region;
    tourData.title = catalogueTour.title;
    tourData.tagline = catalogueTour.description;
    tourData.destination = catalogueTour.destination;
    tourData.duration = catalogueTour.durationText;
    tourData.tourType = catalogueTour.type;
    tourData.groupSize = 'Small Group (Max 12 Guests)';
    tourData.originalPrice = `₹${Math.round(catalogueTour.price * 1.12).toLocaleString('en-IN')}`;
    tourData.price = `₹${catalogueTour.price.toLocaleString('en-IN')}`;
    tourData.discount = 'Curated rate';
    tourData.rating = catalogueTour.rating;
    tourData.reviewCount = catalogueTour.reviewsCount;
    tourData.heroImage = catalogueTour.image;
    tourData.overviewTitle = `A closer look at ${destinationName}`;
    tourData.overviewParagraphs = [
      catalogueTour.description,
      `This ${catalogueTour.durationText.toLowerCase()} journey pairs the best-known sights of ${destinationName} with quieter stops and time to meet local hosts. A Bhromon curator can adjust the pace to suit your group.`,
      `Travel dates, stay options, and included experiences are confirmed with your personal itinerary before you book. Ask us about seasonal conditions and any access requirements for ${catalogueTour.destination}.`,
    ];
    tourData.tourCode = `BHR-IND-${catalogueTour.id}`;
    tourData.startFinish = destinationName;
    tourData.activityLevel = catalogueTour.type;
    tourData.atmosphere = `${catalogueTour.type} journey`;
    tourData.highlights = catalogueTour.tags.map((tag, index) => ({
      icon: [Compass, Sparkles, Camera][index % 3],
      title: tag,
      desc: `A signature ${catalogueTour.type.toLowerCase()} experience selected by our local curators for this ${destinationName} journey.`,
    }));
    tourData.hotels = [{
      name: `Handpicked stay in ${destinationName}`,
      category: 'Curated boutique accommodation',
      location: catalogueTour.destination,
      rating: catalogueTour.rating,
      image: catalogueTour.image,
      desc: `We select welcoming, well-located stays that complement the pace of your ${catalogueTour.title} itinerary. Your confirmed property details are shared before departure.`,
      amenities: ['Daily breakfast', 'Local character', 'Guest support', 'Comfortable rooms'],
      tag: 'Accommodation plan',
    }];
    tourData.inclusions = [
      'Accommodation for the duration shown, as confirmed in your final travel plan',
      'Daily breakfast and the meals specified in the itinerary',
      'Local guide and activities listed in the confirmed itinerary',
      'Ground transfers and sightseeing transport listed in the final plan',
      'Applicable taxes on included services',
    ];
    tourData.exclusions = [
      'Travel to and from the starting destination',
      'Meals not listed as included in your final itinerary',
      'Personal expenses, gratuities, and optional activities',
      'Travel insurance (recommended)',
    ];
    tourData.faqs = [
      { q: `When is the best time to visit ${destinationName}?`, a: `Seasonal conditions vary across ${catalogueTour.destination}. Contact our travel curator for the best departure window for your dates and preferred experiences.` },
      { q: 'Can this itinerary be customized?', a: 'Yes. We can adjust the pace, accommodation style, activities, and travel dates. Share your preferences in the enquiry form and a curator will prepare options.' },
      { q: 'What is included in the starting price?', a: 'The starting price is per person and reflects the core itinerary. Final pricing depends on travel dates, room configuration, and any requested customizations; the curator will confirm a full quote before booking.' },
    ];
    tourData.availableSeats = catalogueTour.availability === 'Sold Out' ? 0 : catalogueTour.availability === 'Limited' ? 4 : 12;
    tourData.nextDeparture = catalogueTour.availability === 'Sold Out' ? 'Join the waitlist' : 'Dates on request';
    tourData.itinerary = Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const isArrival = index === 0;
      const isDeparture = index === days - 1;
      return {
        day,
        title: isArrival
          ? `Arrive in ${destinationName} & settle in`
          : isDeparture
            ? `A final morning in ${destinationName}`
            : `Discover the character of ${destinationName}`,
        summary: isArrival
          ? `Meet your local host and transfer to your handpicked stay. Ease into ${destinationName} with a gentle orientation and time to rest after your journey.`
          : isDeparture
            ? `Enjoy a relaxed breakfast, then your host will arrange a transfer for your onward journey. Ask your curator about extending your stay.`
            : `Spend the day exploring ${destinationName} with a Bhromon local guide. The pace and stops are shaped around the ${catalogueTour.type.toLowerCase()} experiences in this journey, with time to pause, meet local hosts, and enjoy the landscape.`,
        activities: isArrival
          ? ['Arrival assistance and private transfer', 'Hotel check-in and trip briefing', 'Free time to settle in']
          : isDeparture
            ? ['Breakfast at your stay', 'Optional time for a final local walk', 'Departure transfer assistance']
            : ['Guided exploration with a local specialist', 'A locally rooted meal stop', 'Unhurried time for photography and discovery'],
        meals: isArrival ? 'Dinner (if arriving before the evening)' : isDeparture ? 'Breakfast' : 'Breakfast and a regional meal',
        hotel: 'Handpicked local accommodation (confirmed with your travel plan)',
      };
    });
    if (liveTour?.itinerary && liveTour.itinerary.length > 0) {
      tourData.itinerary = liveTour.itinerary.map((d) => ({
        day: d.dayNumber,
        title: d.title,
        summary: d.description || `Guided exploration for Day ${d.dayNumber}.`,
        activities: [d.description || 'Guided expedition exploration'],
        meals: 'Breakfast and regional meal',
        hotel: 'Handpicked local accommodation',
      }));
    }
    if (Array.isArray(liveTour?.inclusions) && liveTour.inclusions.length > 0) {
      tourData.inclusions = liveTour.inclusions;
    }
    if (Array.isArray(liveTour?.exclusions) && liveTour.exclusions.length > 0) {
      tourData.exclusions = liveTour.exclusions;
    }
    tourData.gallery = [
      { url: catalogueTour.image, caption: `${catalogueTour.title} in ${destinationName}`, location: destinationName },
    ];
  }

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-[#F4F1E8] text-[#111111] font-sans selection:bg-[#123C2A] selection:text-white"
    >
      {/* 
        ========================================================================
        NAVIGATION BAR
        ========================================================================
      */}
      {!embedded && <BhromonNav mode="solid" />}

      {/* 
        ========================================================================
        01. HERO SECTION
        ========================================================================
      */}
      <section className="relative w-full h-[68vh] min-h-[520px] max-h-[660px] overflow-hidden bg-stone-900">
        {/* Full-width Hero Image */}
        <img
          src={tourData.heroImage}
          alt={`${tourData.title} in ${tourData.destination}`}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
        />

        {/* Deep Multi-stop Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 pointer-events-none" />

        {/* Parchment Grain Texture Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
          style={{
            backgroundImage: 'radial-gradient(#FAF6F0 0.75px, transparent 0.75px)',
            backgroundSize: '22px 22px',
          }}
          aria-hidden="true"
        />

        {/* Hero Content Overlay */}
        <div className="absolute inset-0 z-10 max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 flex flex-col justify-end pb-12 sm:pb-16">
          <div ref={heroContentRef} className="max-w-4xl space-y-4">
            
            {/* Top Micro Badges / Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#123C2A]/90 backdrop-blur-md text-emerald-200 text-xs font-medium tracking-wide border border-emerald-500/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#D7A43A]" />
                <span>Signature Journey</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-medium tracking-wide border border-white/20">
                <Star className="w-3.5 h-3.5 fill-[#D7A43A] text-[#D7A43A]" />
                <span>{tourData.rating} ({tourData.reviewCount} reviews)</span>
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#B85C32]/90 backdrop-blur-md text-white text-xs font-medium tracking-wide border border-[#B85C32]/40">
                <span>Oct – Mar Best Season</span>
              </span>
            </div>

            {/* Tour Title in Playfair Display (White, Large, Editorial) */}
            <h1 className="font-editorial text-3xl sm:text-5xl lg:text-6xl text-white font-normal leading-[1.12] tracking-tight drop-shadow-md">
              {tourData.title}
            </h1>

            {/* Tagline */}
            <p className="text-stone-300 text-sm sm:text-base max-w-2xl font-light leading-relaxed">
              {tourData.tagline}
            </p>

            {/* Destination + Duration + Type Pills Over the Hero */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs sm:text-sm text-stone-200">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                <MapPin className="w-4 h-4 text-[#D7A43A]" />
                <span>{tourData.destination}</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                <Clock className="w-4 h-4 text-[#D7A43A]" />
                <span>{tourData.duration}</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                <Compass className="w-4 h-4 text-[#D7A43A]" />
                <span>{tourData.tourType}</span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                <Users className="w-4 h-4 text-[#D7A43A]" />
                <span>{tourData.groupSize}</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        02. BREADCRUMB BAR & SECONDARY METADATA
        ========================================================================
      */}
      <div
        ref={breadcrumbRef}
        className="w-full bg-[#FAF6F0] border-b border-stone-200/90 py-3.5 px-6 sm:px-12 lg:px-16"
      >
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          
          {/* Breadcrumb Links */}
          <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-stone-600">
            <Link to="/" className="hover:text-[#123C2A] transition-colors font-medium">
              Home
            </Link>
            <span className="text-stone-400">/</span>
            <Link to="/tours" className="hover:text-[#123C2A] transition-colors font-medium">
              Tour Packages
            </Link>
            <span className="text-stone-400">/</span>
            <span className="text-[#123C2A] font-semibold truncate max-w-xs sm:max-w-md">
              {tourData.title}
            </span>
          </nav>

          {/* Quick Info & Code */}
          <div className="flex items-center gap-4 text-stone-500 font-mono text-[11px]">
            <span className="tracking-wider uppercase">TOUR CODE: {tourData.tourCode}</span>
            <span className="hidden sm:inline text-stone-300">•</span>
            <span className="hidden sm:inline">GUARANTEED DEPARTURES</span>
          </div>

        </div>
      </div>

      {/* 
        ========================================================================
        03. MAIN TWO-COLUMN CONTAINER (Left 7/12, Sticky Sidebar Right 5/12)
        ========================================================================
      */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-10 sm:py-14">
        <div ref={mainGridRef} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================================================================== */}
          {/* LEFT CONTENT COLUMN (7 of 12)                                     */}
          {/* ================================================================== */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-10">
            
            {/* -------------------------------------------------------------- */}
            {/* TAB NAVIGATION HEADER                                          */}
            {/* -------------------------------------------------------------- */}
            <div className="sticky top-20 z-30 bg-[#F4F1E8]/95 backdrop-blur-md pt-2 pb-3 border-b border-stone-300">
              <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'itinerary', label: `Itinerary (${catalogueTour?.durationDays ?? 7} Days)` },
                  { key: 'hotels', label: 'Hotels' },
                  { key: 'inclusions', label: 'Inclusions' },
                  { key: 'faqs', label: 'FAQs' },
                ].map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#123C2A] text-white shadow-sm'
                          : 'bg-white/80 hover:bg-stone-200/70 text-stone-700 hover:text-stone-900 border border-stone-300/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* -------------------------------------------------------------- */}
            {/* TAB 1: OVERVIEW                                                */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fadeIn">
                
                {/* Section Eyebrow */}
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#B85C32]" />
                  <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                    JOURNEY NARRATIVE
                  </span>
                </div>

                {/* Editorial Heading */}
                <h2 className="font-display text-2xl sm:text-3xl text-stone-950 font-normal leading-tight">
                  {tourData.overviewTitle}
                </h2>

                {/* Narrative Paragraphs */}
                <div className="space-y-4 text-stone-800 text-sm sm:text-base leading-relaxed font-normal">
                  <p>
                    {tourData.overviewParagraphs[0]}
                  </p>
                  <p>
                    {tourData.overviewParagraphs[1]}
                  </p>
                  <p>
                    {tourData.overviewParagraphs[2]}
                  </p>
                </div>

                {/* Fast Facts / Specifications Grid */}
                <div className="bg-[#FAF6F0] rounded-2xl p-6 sm:p-7 border border-stone-300/80 shadow-xs">
                  <h3 className="font-editorial text-lg text-stone-900 font-semibold mb-4 flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#B85C32]" />
                    <span>Expedition Fast Facts</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
                    <div className="border-l-2 border-[#123C2A] pl-3 py-1">
                      <span className="text-stone-500 uppercase tracking-wider text-[10px] block">Start / Finish</span>
                      <strong className="text-stone-900 font-medium">{tourData.startFinish}</strong>
                    </div>
                    <div className="border-l-2 border-[#B85C32] pl-3 py-1">
                      <span className="text-stone-500 uppercase tracking-wider text-[10px] block">Activity Level</span>
                      <strong className="text-stone-900 font-medium">{tourData.activityLevel}</strong>
                    </div>
                    <div className="border-l-2 border-[#D7A43A] pl-3 py-1">
                      <span className="text-stone-500 uppercase tracking-wider text-[10px] block">Atmosphere</span>
                      <strong className="text-stone-900 font-medium">{tourData.atmosphere}</strong>
                    </div>
                    <div className="border-l-2 border-stone-400 pl-3 py-1">
                      <span className="text-stone-500 uppercase tracking-wider text-[10px] block">Language</span>
                      <strong className="text-stone-900 font-medium">English &amp; Hindi</strong>
                    </div>
                  </div>
                </div>

                {/* Highlights Grid (Icons + Text) */}
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                    <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                      JOURNEY HIGHLIGHTS
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    {tourData.highlights.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#123C2A]/10 text-[#123C2A] flex items-center justify-center mb-3 group-hover:bg-[#123C2A] group-hover:text-white transition-colors duration-300">
                            <IconComp className="w-5 h-5 stroke-[1.8]" />
                          </div>
                          <h4 className="font-sans font-bold text-stone-900 text-sm mb-1.5 leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs text-stone-600 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 2: ITINERARY (Day 1 through Day 7 Accordion)              */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'itinerary' && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Header with Expand / Collapse Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-300/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                      <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                        DAY-BY-DAY ITINERARY
                      </span>
                    </div>
                    <h3 className="font-display text-2xl text-stone-900 font-normal mt-1">
                      The 7-Day Sacred Passage
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-medium">
                    <button
                      onClick={expandAllDays}
                      className="text-[#123C2A] hover:underline cursor-pointer"
                    >
                      Expand All
                    </button>
                    <span className="text-stone-300">|</span>
                    <button
                      onClick={collapseAllDays}
                      className="text-stone-500 hover:text-stone-900 cursor-pointer"
                    >
                      Collapse All
                    </button>
                  </div>
                </div>

                {/* Day Accordion List */}
                <div className="space-y-4">
                  {tourData.itinerary.map((dayItem) => {
                    const isOpen = !!openDays[dayItem.day];
                    return (
                      <div
                        key={dayItem.day}
                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs ${
                          isOpen ? 'border-[#123C2A]/40 ring-1 ring-[#123C2A]/20' : 'border-stone-200/90 hover:border-stone-300'
                        }`}
                      >
                        {/* Day Accordion Header Button */}
                        <button
                          onClick={() => toggleDay(dayItem.day)}
                          className="w-full px-5 sm:px-6 py-4.5 flex items-center justify-between gap-4 text-left cursor-pointer bg-[#FAF6F0]/60 hover:bg-[#FAF6F0] transition-colors"
                        >
                          <div className="flex items-center gap-3 sm:gap-4">
                            <span className="w-10 h-10 rounded-xl bg-[#123C2A] text-white font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                              DAY {dayItem.day}
                            </span>
                            <div>
                              <h4 className="font-display text-base sm:text-lg font-normal text-stone-900 leading-snug">
                                {dayItem.title}
                              </h4>
                              <span className="text-[11px] font-sans text-stone-500 block mt-0.5">
                                Included: {dayItem.meals.split(',')[0]}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 stroke-[2]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 stroke-[2]" />
                            )}
                          </div>
                        </button>

                        {/* Collapsible Content */}
                        {isOpen && (
                          <div className="px-5 sm:px-6 pt-3 pb-6 border-t border-stone-100 space-y-4">
                            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-normal">
                              {dayItem.summary}
                            </p>

                            {/* Activities Timeline */}
                            <div className="space-y-2 pt-1">
                              <span className="text-[10px] tracking-[0.2em] font-bold text-stone-500 uppercase block">
                                KEY ACTIVITIES &amp; ENCOUNTERS
                              </span>
                              <ul className="space-y-2">
                                {dayItem.activities.map((act, i) => (
                                  <li key={i} className="flex items-start gap-2.5 text-xs text-stone-800">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#B85C32] mt-1.5 shrink-0" />
                                    <span>{act}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Meals & Accommodation Pills */}
                            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600 bg-stone-50/70 p-3 rounded-xl">
                              <div className="flex items-center gap-2">
                                <Utensils className="w-4 h-4 text-[#B85C32] shrink-0" />
                                <span><strong>Meals:</strong> {dayItem.meals}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Bed className="w-4 h-4 text-[#123C2A] shrink-0" />
                                <span><strong>Stay:</strong> {dayItem.hotel}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 3: HOTELS                                                  */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'hotels' && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                  <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                    CURATED HERITAGE ACCOMMODATIONS
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  {catalogueTour?.id === 1
                    ? 'Every stay on this journey has been selected for historic authenticity, reverent preservation, and world-class luxury on the sacred banks of the Ganges.'
                    : `Accommodation is selected to suit the route, location, and pace of your ${tourData.title} journey. Your confirmed property details are shared before departure.`}
                </p>

                <div className="space-y-6">
                  {tourData.hotels.map((hotel, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 md:grid-cols-12"
                    >
                      {/* Hotel Photo */}
                      <div className="md:col-span-5 relative h-56 md:h-auto min-h-[200px]">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wide">
                          {hotel.tag}
                        </div>
                      </div>

                      {/* Hotel Information */}
                      <div className="md:col-span-7 p-6 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-[#B85C32] uppercase tracking-wider">
                              {hotel.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-semibold text-stone-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Star className="w-3.5 h-3.5 fill-[#D7A43A] text-[#D7A43A]" />
                              <span>{hotel.rating} / 5</span>
                            </div>
                          </div>

                          <h3 className="font-display text-xl text-stone-900 font-normal">
                            {hotel.name}
                          </h3>

                          <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-1 mb-3">
                            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>{hotel.location}</span>
                          </div>

                          <p className="text-xs text-stone-700 leading-relaxed">
                            {hotel.desc}
                          </p>
                        </div>

                        {/* Amenities Tags */}
                        <div className="pt-3 border-t border-stone-100">
                          <span className="text-[10px] tracking-wider text-stone-400 font-bold uppercase block mb-2">
                            KEY AMENITIES
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {hotel.amenities.map((amenity, aIdx) => (
                              <span
                                key={aIdx}
                                className="text-[11px] px-2.5 py-1 rounded-md bg-[#FAF6F0] text-stone-700 border border-stone-200/80 font-medium"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 4: INCLUSIONS & EXCLUSIONS                                 */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'inclusions' && (
              <div className="space-y-8 animate-fadeIn">
                
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                  <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                    COMPREHENSIVE EXPEDITION SCOPE
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  
                  {/* What Is Included Column (Green) */}
                  <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-900/15 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-emerald-100">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <h3 className="font-display text-lg text-emerald-950 font-normal">
                        What’s Included
                      </h3>
                    </div>

                    <ul className="space-y-3">
                      {tourData.inclusions.map((inc, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-[13px] text-stone-800 leading-snug">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* What Is Excluded Column (Red) */}
                  <div className="bg-white rounded-2xl p-6 sm:p-7 border border-rose-900/15 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-rose-100">
                      <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center">
                        <XCircle className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <h3 className="font-display text-lg text-rose-950 font-normal">
                        What’s Excluded
                      </h3>
                    </div>

                    <ul className="space-y-3">
                      {tourData.exclusions.map((exc, i) => (
                        <li key={i} className="flex items-start gap-3 text-xs sm:text-[13px] text-stone-700 leading-snug">
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <span>{exc}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Notice on Add-ons */}
                    <div className="mt-6 pt-4 border-t border-stone-200 bg-[#FAF6F0] p-4 rounded-xl text-xs text-stone-600">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-[#B85C32] shrink-0 mt-0.5" />
                        <span>
                          Looking for domestic flights or private chartered transfers? Our travel architects can bundle domestic sectors into your reservation.
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* -------------------------------------------------------------- */}
            {/* TAB 5: FAQS ACCORDION                                          */}
            {/* -------------------------------------------------------------- */}
            {activeTab === 'faqs' && (
              <div className="space-y-6 animate-fadeIn">
                
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#123C2A]" />
                  <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                    FREQUENTLY ASKED QUESTIONS
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Answers to essential questions regarding holy traditions, weather, attire, and physical pacing on this sacred journey.
                </p>

                <div className="space-y-3">
                  {tourData.faqs.map((faq, idx) => {
                    const isOpen = openFaq === idx;
                    return (
                      <div
                        key={idx}
                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-xs ${
                          isOpen ? 'border-[#123C2A]/30 ring-1 ring-[#123C2A]/15' : 'border-stone-200/90'
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70 transition-colors"
                        >
                          <span className="font-sans font-semibold text-stone-900 text-sm sm:text-base leading-snug">
                            {faq.q}
                          </span>
                          <span className="shrink-0 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-700">
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-700 leading-relaxed border-t border-stone-100 bg-[#FAF6F0]/40">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>

          {/* ================================================================== */}
          {/* RIGHT SIDEBAR (5 of 12 — Sticky on Desktop)                       */}
          {/* ================================================================== */}
          <div className="lg:col-span-5 xl:col-span-5 sticky top-24 self-start space-y-6">
            
            {/* Main Booking Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-deckle relative overflow-hidden">
              
              {/* Subtle Decorative Vintage Corner Stamp */}
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-[#FAF6F0] rounded-bl-3xl border-b border-l border-stone-300/80 flex items-center justify-center pointer-events-none opacity-60">
                <Compass className="w-6 h-6 text-[#735F48]" />
              </div>

              {/* Price Banner */}
              <div className="border-b border-stone-200/80 pb-5">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] tracking-[0.2em] font-bold text-stone-500 uppercase">
                    STARTING FROM
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    {tourData.discount}
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="font-brand text-3xl sm:text-4xl font-bold text-[#111111]">
                    {tourData.price}
                  </span>
                  <span className="text-stone-400 line-through text-sm font-medium">
                    {tourData.originalPrice}
                  </span>
                  <span className="text-xs text-stone-600 font-medium">
                    / per person
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Twin sharing basis • Inclusive of all monument &amp; boat permits
                </span>
              </div>

              {/* Tour Key Details Grid */}
              <div className="py-5 space-y-3 border-b border-stone-200/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#B85C32]" />
                    <span>Duration:</span>
                  </span>
                  <strong className="text-stone-900 font-semibold">{tourData.duration}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#B85C32]" />
                    <span>Group Size:</span>
                  </span>
                  <strong className="text-stone-900 font-semibold">Max 12 Guests</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-stone-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#B85C32]" />
                    <span>Next Departure:</span>
                  </span>
                  <div className="text-right">
                    <strong className="text-stone-900 font-semibold block">{tourData.nextDeparture}</strong>
                    <span className="text-[10px] text-amber-700 font-medium">
                      Only {tourData.availableSeats} seats remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-5 space-y-3">
                {/* Gold Book Now Button */}
                <Link
                  to="/booking"
                  className="w-full bg-[#D7A43A] hover:bg-[#E5B248] text-[#111111] font-bold text-sm tracking-wider uppercase py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <span>Book This Journey</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                </Link>

                {/* Deep Green Send Enquiry Button */}
                <Link
                  to="/booking"
                  className="w-full bg-[#123C2A] hover:bg-[#184D36] text-white font-semibold text-xs tracking-wider uppercase py-3 px-6 rounded-full flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <span>Send Custom Enquiry</span>
                  <MessageSquare className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Mini Checklist: What's Included */}
              <div className="mt-6 pt-5 border-t border-stone-200/80">
                <span className="text-[10px] tracking-[0.2em] font-bold text-stone-500 uppercase block mb-3">
                  INCLUDED AT A GLANCE
                </span>
                <ul className="space-y-2 text-xs text-stone-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>6 Nights in 5-Star &amp; Riverfront Palaces</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Daily Dawn &amp; Twilight Wooden Boat Safaris</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dedicated Scholar &amp; Cultural Historian</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>VIP Rooftop Aarti Seating &amp; All Transfers</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons: Share & Save */}
              <div className="mt-6 pt-5 border-t border-stone-200/80 flex items-center justify-between text-xs">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-stone-100"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{shareCopied ? 'Link Copied!' : 'Share Tour'}</span>
                </button>

                <button
                  onClick={() => setIsSaved(!isSaved)}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                    isSaved ? 'text-rose-600 bg-rose-50' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
                  <span>{isSaved ? 'Saved to Wishlist' : 'Save Tour'}</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-5 border-t border-stone-200/80 space-y-2.5">
                <div className="flex items-center gap-3 text-xs text-stone-700">
                  <ShieldCheck className="w-4 h-4 text-[#123C2A] shrink-0" />
                  <span><strong>100% Verified Safe:</strong> Licensed guides &amp; private transit</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-700">
                  <Award className="w-4 h-4 text-[#D7A43A] shrink-0" />
                  <span><strong>Best Price Guarantee:</strong> Direct heritage guild contracts</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-700">
                  <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Free Cancellation:</strong> Up to 30 days prior with 100% refund</span>
                </div>
              </div>

            </div>

            {/* Specialist Card */}
            <div className="bg-[#FAF6F0] rounded-2xl p-5 border border-stone-300/80 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-stone-300">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                  alt="Devashish Roy — Specialist"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <span className="text-[10px] tracking-wider font-semibold text-stone-500 uppercase block">
                  CULTURAL SPECIALIST
                </span>
                <h4 className="font-sans font-bold text-stone-900 text-sm">
                  Devashish Roy
                </h4>
                <p className="text-[11px] text-stone-600 leading-tight mt-0.5">
                  {catalogueTour?.id === 1
                    ? '14 years guiding sacred Varanasi & Sarnath journeys.'
                    : `A local specialist for ${catalogueTour?.region ?? 'India'} journeys.`}
                </p>
              </div>
              <a
                href="tel:+919876543210"
                aria-label="Call Specialist"
                className="w-9 h-9 rounded-full bg-[#123C2A] text-white flex items-center justify-center hover:bg-[#184D36] transition-colors shrink-0"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

          </div>

        </div>
      </main>

      {/* 
        ========================================================================
        04. GALLERY GRID (6 Photos in Masonry-Like Layout)
        ========================================================================
      */}
      <section className="bg-[#FAF6F0] py-16 sm:py-20 border-t border-b border-stone-300/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          
          {/* Section Header */}
          <div className="max-w-2xl mb-10">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="w-4 h-4 text-[#B85C32]" />
              <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                PHOTOGRAPHIC CHRONICLES
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl text-stone-950 font-normal">
              {catalogueTour?.id === 1 ? 'Impressions of the Eternal Ghats' : `Impressions of ${catalogueTour?.region ?? 'the Journey'}`}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-2">
              {catalogueTour?.id === 1
                ? 'Visual glimpses from our previous expeditions capturing sunrise rituals, evening fire, and silent alleys.'
                : `A glimpse of ${catalogueTour?.region ?? 'India'} from the ${tourData.title} route.`}
            </p>
          </div>

          {/* 6-Photo Masonry Grid */}
          <div ref={galleryRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {tourData.gallery.map((photo, pIdx) => (
              <div
                key={pIdx}
                className="group relative bg-white p-3 pb-4 rounded-2xl shadow-photo-print border border-stone-200/90 hover:scale-[1.02] transition-all duration-500 overflow-hidden"
              >
                {/* Photo Frame */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-stone-100">
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Caption & Location */}
                <div className="mt-3 flex items-start justify-between gap-2 px-1">
                  <div>
                    <h4 className="font-handwriting text-lg sm:text-xl text-stone-900 leading-tight">
                      {photo.caption}
                    </h4>
                    <span className="text-[10px] text-stone-500 font-mono tracking-wider uppercase block mt-0.5">
                      {photo.location}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded-sm">
                    0{pIdx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        06. CANCELLATION POLICY SECTION
        ========================================================================
      */}
      <section className="py-14 sm:py-18 bg-[#F4F1E8] border-b border-stone-300/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl">
            
            <div className="flex items-center gap-2 mb-2">
              <RotateCcw className="w-4 h-4 text-[#123C2A]" />
              <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                FLEXIBLE BOOKING TERMS
              </span>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl text-stone-950 font-normal mb-4">
              Cancellation Policy &amp; Peace of Mind
            </h2>

            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-8">
              We understand that plans can change. Bhromon offers transparent, fair cancellation milestones designed to protect your investment while honoring our commitments to generational artisans and heritage accommodations.
            </p>

            {/* Visual Milestones Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-white rounded-2xl p-5 border-t-4 border-emerald-600 shadow-xs">
                <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider block mb-1">
                  30+ Days Prior
                </span>
                <span className="font-brand text-2xl font-bold text-stone-900 block mb-1">
                  100% Refund
                </span>
                <p className="text-xs text-stone-600 leading-normal">
                  Full reimbursement of paid deposit with zero deduction or penalty.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border-t-4 border-[#D7A43A] shadow-xs">
                <span className="text-amber-700 font-bold text-xs uppercase tracking-wider block mb-1">
                  15–29 Days Prior
                </span>
                <span className="font-brand text-2xl font-bold text-stone-900 block mb-1">
                  70% Refund
                </span>
                <p className="text-xs text-stone-600 leading-normal">
                  70% direct cash refund or 100% transferable future journey credit.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border-t-4 border-[#B85C32] shadow-xs">
                <span className="text-orange-700 font-bold text-xs uppercase tracking-wider block mb-1">
                  7–14 Days Prior
                </span>
                <span className="font-brand text-2xl font-bold text-stone-900 block mb-1">
                  50% Refund
                </span>
                <p className="text-xs text-stone-600 leading-normal">
                  50% refund to offset confirmed heritage palace room guarantees.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border-t-4 border-stone-400 shadow-xs">
                <span className="text-stone-600 font-bold text-xs uppercase tracking-wider block mb-1">
                  Less Than 7 Days
                </span>
                <span className="font-brand text-2xl font-bold text-stone-900 block mb-1">
                  Reschedule
                </span>
                <p className="text-xs text-stone-600 leading-normal">
                  Non-refundable; personal rescheduling assistance offered upon request.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        07. TERMS & CONDITIONS SECTION (COLLAPSIBLE)
        ========================================================================
      */}
      <section className="py-8 bg-[#FAF6F0] border-b border-stone-300/80">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          <div className="max-w-4xl bg-white rounded-2xl border border-stone-200/90 shadow-xs overflow-hidden">
            
            <button
              onClick={() => setTermsOpen(!termsOpen)}
              className="w-full px-6 py-4 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#B85C32]" />
                <div>
                  <h3 className="font-display text-base sm:text-lg text-stone-900 font-normal">
                    Expedition Terms &amp; Conditions
                  </h3>
                  <span className="text-[11px] text-stone-500 block">
                    Click to review booking policies, identification requirements, and travel guidelines
                  </span>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                {termsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {termsOpen && (
              <div className="px-6 pb-6 pt-2 border-t border-stone-100 space-y-4 text-xs text-stone-700 leading-relaxed bg-[#FAF6F0]/30">
                <div>
                  <strong className="text-stone-900 block mb-1">1. Booking &amp; Payment Schedules</strong>
                  <p>
                    A 30% advance deposit confirms your reservation. The remaining balance is due no later than 25 days before departure; your final itinerary will include the payment schedule and due dates.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-900 block mb-1">2. Identity Documentation &amp; River Permits</strong>
                  <p>
                    All domestic travelers must carry a valid government photo ID (Aadhaar / Passport / Voter ID). International guests must possess a valid Indian Visa or e-Visa and passport valid for at least 6 months beyond travel dates.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-900 block mb-1">3. Weather &amp; River Conditions</strong>
                  <p>
                    Weather and local operating conditions can affect transport and activities. If an experience is unavailable, your curator will arrange a suitable alternative and update you before departure or during the journey.
                  </p>
                </div>

                <div>
                  <strong className="text-stone-900 block mb-1">4. Temple Protocols &amp; Photography</strong>
                  <p>
                    Some places restrict photography or require specific visitor protocols. Please follow your guide’s advice and any instructions displayed at the site.
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* 
        ========================================================================
        05. RELATED TOURS ('You May Also Like')
        ========================================================================
      */}
      <section className="py-16 sm:py-22 bg-[#F4F1E8]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#D7A43A]" />
                <span className="text-[11px] tracking-[0.24em] font-semibold text-stone-600 uppercase">
                  SIMILAR EXPEDITIONS
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl text-stone-950 font-normal">
                You May Also Like
              </h2>
            </div>

            <Link
              to="/tours"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#123C2A] hover:underline"
            >
              <span>View All 24 Packages</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 3 Related Tour Cards */}
          <div ref={relatedRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {tourData.relatedTours.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Frame */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-medium tracking-wide">
                      {item.tag}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#B85C32]" />
                        <span>{item.location}</span>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-stone-800">
                        <Star className="w-3.5 h-3.5 fill-[#D7A43A] text-[#D7A43A]" />
                        <span>{item.rating}</span>
                      </span>
                    </div>

                    <h3 className="font-display text-xl text-stone-900 font-normal leading-snug group-hover:text-[#123C2A] transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-stone-600 mt-3 pt-3 border-t border-stone-100">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>{item.duration}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="p-6 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider block">From</span>
                    <span className="font-brand text-xl font-bold text-stone-900">{item.price}</span>
                  </div>

                  <Link
                    to={`/tours/${item.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#123C2A] text-white text-xs font-semibold tracking-wide hover:bg-[#184D36] transition-colors"
                  >
                    <span>View Tour</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 
        ========================================================================
        FOOTER
        ========================================================================
      */}
      {!embedded && <BhromonFooter />}
    </div>
  );
}
