/**
* Static directory seed data. Locations are referenced by name and resolved to
* stable IDs by the seeder in src/data/seed.ts. Anything not listed is simply
* left out — the seeder never invents missing fields.
*/
export type SeedLocation = {
division?: string;
district?: string;
upazila?: string; };
export type SeedPlace = SeedLocation & {
slug: string;
name: string;
category: string;
summary: string;
description: string;
address: string;
latitude?: number;
longitude?: number;
image: string;
gallery?: string[];
rating: number;
reviewCount: number;
openingHours?: string;
entryFee?: string;
bestTime?: string;
verification: "unverified" | "verified" | "disputed";
source?: string; };
export type SeedInstitution = SeedLocation & {
slug: string;
name: string;
category: "school" | "college" | "madrasah" | "hospital" | "health-centre";
description: string;
address: string;
phone?: string;
email?: string;
website?: string;
emergencyPhone?: string;
latitude?: number;
longitude?: number;
image: string;
verification: "unverified" | "verified" | "disputed";
source?: string; };
export type SeedBusiness = SeedLocation & {
slug: string;
name: string;
category: "hotel" | "restaurant" | "transport" | "shop" | "service" | "other";
description: string;
address: string;
phone?: string;
website?: string;
image: string;
verification: "unverified" | "verified" | "disputed"; };
export type SeedService = SeedLocation & {
slug: string;
name: string;
category: "identity" | "land" | "health" | "education" | "transport" | "tax" | "other";
description: string;
officeAddress: string;
phone?: string;
emergencyPhone?: string;
website?: string;
hours?: string;
requiredDocuments?: string[];
verification: "unverified" | "verified" | "disputed"; };
export type SeedNews = {
slug: string;
title: string;
excerpt: string;
body: string;
image: string;
category: string;
authorUsername: string;
source?: string; };
export type SeedReview = {
placeSlug: string;
authorUsername: string;
rating: number;
title: string;
body: string; };
export const PLACE_SEED: SeedPlace[] = [
{
slug: "sajek-valley",
name: "Sajek Valley",
category: "hill",
summary: "A hilltop valley of clouds and indigenous villages on the Rangamati border.",
description:
"Sajek Valley sits at around 1,800 feet on the Kasalong mountain range in Rangamati. Visitors come for the sunrise over the clouds, the Ruilui indigenous community, and the winding Sajek road. Accommodation is in basic homestays and eco-resorts; a local guide is recommended for the trek to Konglak Hill.",
address: "Sajek, Baghaichhari, Rangamati, Chattogram",
latitude: 23.3785,
longitude: 92.2956,
image: "/images/places/p1.svg",
gallery: ["/images/places/p1.svg", "/images/places/p2.svg", "/images/places/p3.svg"],
rating: 4.6,
reviewCount: 184,
openingHours: "All day",
bestTime: "November to February",
verification: "verified",
source: "Bangladesh Tourism Board",
},
{
slug: "coxs-bazar-beach",
name: "Cox's Bazar Beach",
category: "beach",
summary: "The world's longest natural sea beach, stretching 120 km along the Bay of Bengal.",
description:
"Cox's Bazar is the longest unbroken natural sandy sea beach in the world. The main Laboni beach is popular with families, while Inani and Himchari offer quieter stretches and coral rocks. Swimming is only safe in guarded zones during calm weather; rip currents are common.",
address: "Laboni Beach Road, Cox's Bazar, Chattogram",
latitude: 21.4272,
longitude: 92.0058,
image: "/images/places/p2.svg",
gallery: ["/images/places/p2.svg", "/images/places/p4.svg", "/images/places/p5.svg"],
rating: 4.5,
reviewCount: 312,
openingHours: "All day",
bestTime: "November to February",
verification: "verified",
source: "Bangladesh Tourism Board",
},
{
slug: "saint-martins-island",
name: "Saint Martin's Island",
category: "beach",
summary: "Bangladesh's only coral island, in the northeast corner of the Bay of Bengal.",
description:
"Saint Martin's is the country's only coral island, about 9 km from the Teknaf peninsula. The western beach is the main settlement; the northeast is quieter. Coral viewing, snorkelling, and local fishing culture are the main draws. Boat services run from Teknaf and are subject to weather.",
address: "Saint Martin's Island, Teknaf, Cox's Bazar",
latitude: 20.6225,
longitude: 92.3194,
image: "/images/places/p3.svg",
gallery: ["/images/places/p3.svg", "/images/places/p6.svg"],
rating: 4.4,
reviewCount: 143,
openingHours: "All day",
bestTime: "November to March",
verification: "verified",
},
{
slug: "kuakata-beach",
name: "Kuakata Sea Beach",
category: "beach",
summary: "A rare beach where you can watch both sunrise and sunset over the Bay of Bengal.",
description:
"Kuakata is a wide sandy beach in Patuakhali where both sunrise and sunset are visible over the water. The Gangamati canal, the Buddhist temple, and the boat-filled harbour are popular side trips. The beach is accessed from Kalapara upazila.",
address: "Kuakata, Kalapara, Patuakhali, Barishal",
latitude: 21.8167,
longitude: 90.1167,
image: "/images/places/p4.svg",
gallery: ["/images/places/p4.svg", "/images/places/p1.svg"],
rating: 4.3,
reviewCount: 96,
openingHours: "All day",
bestTime: "October to February",
verification: "verified",
},
{
slug: "sundarbans",
name: "Sundarbans Mangrove Forest",
category: "forest",
summary: "The world's largest mangrove forest and a UNESCO World Heritage Site.",
description:
"The Sundarbans is the largest mangrove forest on earth, home to the Bengal tiger, spotted deer, crocodiles, and hundreds of bird species. Access is by permitted boat tours from Mongla or Satkhira ghats. Independent travel is not allowed inside the forest; licensed guides and permits are required.",
address: "Satkhira, Khulna",
latitude: 21.9497,
longitude: 89.1833,
image: "/images/places/p5.svg",
gallery: ["/images/places/p5.svg", "/images/places/p3.svg"],
rating: 4.7,
reviewCount: 207,
bestTime: "November to February",
verification: "verified",
source: "UNESCO",
},
{
slug: "ratargul-swamp-forest",
name: "Ratargul Swamp Forest",
category: "forest",
summary: "A freshwater swamp forest in Sylhet that floods in the monsoon.",
description:
"Ratargul is a freshwater swamp forest in Gowainghat, Sylhet. In the dry season the water is shallow and boats glide between tall koroch and hijal trees; in the monsoon the canopy is submerged. Boats are available from the Ratargul gate and require a local guide.",
address: "Gowainghat, Sylhet",
latitude: 25.0167,
longitude: 91.9,
image: "/images/places/p6.svg",
gallery: ["/images/places/p6.svg", "/images/places/p5.svg"],
rating: 4.4,
reviewCount: 88,
bestTime: "May to October",
verification: "verified",
},
{
slug: "jaflong",
name: "Jaflong",
category: "river",
summary: "A river and stone-collecting town at the foot of the Khasi hills.",
description:
"Jaflong sits where the Sari river enters Bangladesh from Meghalaya, India. The clear river, colourful stone beds, and the view of the Khasi hills make it a popular day trip from Sylhet. Boating and a short trip to the nearby tea gardens are common activities.",
address: "Jaintiapur, Sylhet",
latitude: 25.1536,
longitude: 92.0214,
image: "/images/places/p1.svg",
gallery: ["/images/places/p1.svg", "/images/places/p4.svg"],
rating: 4.2,
reviewCount: 74,
bestTime: "October to March",
verification: "verified",
},
{
slug: "bisnakandi",
name: "Bisnakandi",
category: "river",
summary: "A rock and river landscape near the India-Bangladesh border in Sylhet.",
description:
"Bisnakandi is a scenic stretch of the Sari river in Kanaighat, Sylhet, where water flows over exposed rock. It has become a popular day trip from Sylhet city. Care is advised on the rocks when water levels are high.",
address: "Kanaighat, Sylhet",
latitude: 25.055,
longitude: 92.096,
image: "/images/places/p2.svg",
gallery: ["/images/places/p2.svg", "/images/places/p6.svg"],
rating: 4.1,
reviewCount: 59,
bestTime: "October to March",
verification: "unverified",
},
{
slug: "lalbagh-fort",
name: "Lalbagh Fort",
category: "heritage",
summary: "An unfinished 17th-century Mughal fort complex in Old Dhaka.",
description:
"Lalbagh Fort is an incomplete Mughal fort complex built by Prince Muhammad Azam in 1678. The complex includes the Diwan-i-Aam, the tomb of Bibi Pari, a mosque, and the fortification walls. The site is a major archaeological landmark of Dhaka.",
address: "Lalbagh Road, Old Dhaka, Dhaka",
latitude: 23.7161,
longitude: 90.3882,
image: "/images/places/p4.svg",
gallery: ["/images/places/p4.svg", "/images/places/p1.svg"],
rating: 4.3,
reviewCount: 168,
openingHours: "Sat–Thu 10:00–17:00",
entryFee: "BDT 200 (adults)",
verification: "verified",
source: "Department of Archaeology",
},
{
slug: "ahsan-manzil",
name: "Ahsan Manzil",
category: "heritage",
summary: "The pink palace of the Dhaka Nawabs, now a national museum.",
description:
"Ahsan Manzil is the former palace of the Dhaka Nawab family on the Buriganga river. The Indo-Saracenic building is now a museum displaying portraits, furniture, and memorabilia from the family. It is one of the best-known heritage sites in the capital.",
address: "1/11 Islampur Road, Kumartoli, Dhaka",
latitude: 23.7086,
longitude: 90.4063,
image: "/images/places/p5.svg",
gallery: ["/images/places/p5.svg", "/images/places/p2.svg"],
rating: 4.4,
reviewCount: 201,
openingHours: "Sat–Thu 10:30–17:30",
entryFee: "BDT 100 (adults)",
verification: "verified",
source: "Bangladesh National Museum",
},
{
slug: "somapura-mahavihara",
name: "Somapura Mahavihara",
category: "heritage",
summary: "The grand 8th-century Buddhist monastery at Paharpur, a UNESCO World Heritage Site.",
description:
"Somapura Mahavihara at Paharpur is a large 8th-century Buddhist vihara and a UNESCO World Heritage Site. The central cruciform shrine is surrounded by 177 monastic cells. The site museum displays terracotta plaques, stone sculptures, and inscribed seals.",
address: "Paharpur, Badalgachhi, Naogaon, Rajshahi",
latitude: 25.0346,
longitude: 88.9797,
image: "/images/places/p6.svg",
gallery: ["/images/places/p6.svg", "/images/places/p3.svg"],
rating: 4.5,
reviewCount: 122,
openingHours: "Sat–Thu 10:00–18:00",
entryFee: "BDT 100 (adults)",
verification: "verified",
source: "UNESCO",
},
{
slug: "mahasthangarh",
name: "Mahasthangarh",
category: "heritage",
summary: "The oldest known city site in Bangladesh, dating to the 3rd century BCE.",
description:
"Mahasthangarh is the archaeological site of the ancient city of Pundranagara, occupied from the 3rd century BCE to the 13th century CE. The citadel, the Govinda Bhita temple, and the site museum are the main attractions. It is one of the most important historical sites in Bangladesh.",
address: "Mahasthangarh, Shibganj, Bogura, Rajshahi",
latitude: 24.9572,
longitude: 89.3444,
image: "/images/places/p1.svg",
gallery: ["/images/places/p1.svg", "/images/places/p5.svg"],
rating: 4.4,
reviewCount: 95,
openingHours: "Sat–Thu 09:00–17:00",
entryFee: "BDT 100 (adults)",
verification: "verified",
source: "Department of Archaeology",
},
{
slug: "shat-gambuj-mosque",
name: "Shat Gambuj Mosque",
category: "heritage",
summary: "The 15th-century Sixty Dome Mosque of Bagerhat, a UNESCO World Heritage Site.",
description:
"The Shat Gambuj (Sixty Dome) Mosque is a 15th-century mosque built by Khan Jahan Ali in Bagerhat. Despite the name it has 77 domes supported by 60 pillars. It is part of the Mosque City of Bagerhat, a UNESCO World Heritage Site.",
address: "Bagerhat Sadar, Bagerhat, Khulna",
latitude: 22.6597,
longitude: 89.7806,
image: "/images/places/p3.svg",
gallery: ["/images/places/p3.svg", "/images/places/p6.svg"],
rating: 4.6,
reviewCount: 134,
openingHours: "All day",
entryFee: "Free",
verification: "verified",
source: "UNESCO",
},
{
slug: "panam-city",
name: "Panam City",
category: "city",
summary: "A ruined 19th-century merchant town on the Shitalakshya river.",
description:
"Panam City (also Sonargaon) is the remains of a 19th-century trading town of Hindu merchants on the Shitalakshya river. Rows of colonial-era houses line narrow lanes. The Folk Art and Craft Museum is nearby. It is a popular half-day trip from Dhaka.",
address: "Sonargaon, Narayanganj, Dhaka",
latitude: 23.6614,
longitude: 90.5961,
image: "/images/places/p2.svg",
gallery: ["/images/places/p2.svg", "/images/places/p1.svg"],
rating: 4.1,
reviewCount: 67,
openingHours: "All day",
entryFee: "Free",
verification: "verified",
},
{
slug: "kaptai-lake",
name: "Kaptai Lake",
category: "river",
summary: "A large artificial lake in the Chittagong Hill Tracts, ringed by forest.",
description:
"Kaptai Lake is the largest lake in Bangladesh, formed by the Karnaphuli hydroelectric project. Boats run between Kaptai town, Rangamati, and the paper mill jetty. The lake is surrounded by hills and forest, with picnic spots along the shore.",
address: "Kaptai, Rangamati, Chattogram",
latitude: 22.5878,
longitude: 92.1742,
image: "/images/places/p4.svg",
gallery: ["/images/places/p4.svg", "/images/places/p6.svg"],
rating: 4.2,
reviewCount: 81,
bestTime: "October to March",
verification: "verified",
},
{
slug: "nilgiri",
name: "Nilgiri",
category: "hill",
summary: "A scenic hill resort near Bandarban with views over the clouds.",
description:
"Nilgiri is a hill resort in Bandarban district managed by the tourism authorities. It is a popular viewpoint for the sunrise and the cloud-filled valleys below. Accommodation is limited and should be booked in advance.",
address: "Nilgiri, Bandarban, Chattogram",
latitude: 21.8833,
longitude: 92.2833,
image: "/images/places/p5.svg",
gallery: ["/images/places/p5.svg", "/images/places/p3.svg"],
rating: 4.3,
reviewCount: 52,
bestTime: "November to February",
verification: "unverified",
},
{
slug: "madhabkunda-waterfall",
name: "Madhabkunda Waterfall",
category: "forest",
summary: "A broad forest waterfall in Moulvibazar, one of the largest in the country.",
description:
"Madhabkunda is a wide waterfall in Barlekha, Moulvibazar, surrounded by tea gardens and forest. A short walk leads from the parking area to the falls. It is busiest in the monsoon when the flow is strongest.",
address: "Barlekha, Moulvibazar, Sylhet",
latitude: 24.6333,
longitude: 92.1833,
image: "/images/places/p6.svg",
gallery: ["/images/places/p6.svg", "/images/places/p1.svg"],
rating: 4.4,
reviewCount: 91,
bestTime: "June to September",
verification: "verified",
},
{
slug: "nijhum-dwip",
name: "Nijhum Dwip",
category: "beach",
summary: "A flat island of mangroves and migratory birds in the Bay of Bengal.",
description:
"Nijhum Dwip is a small island off Hatiya, Noakhali. It is known for its mangrove plantations, spotted deer, and thousands of migratory birds in winter. Boats run from Hatiya and the island has basic guesthouses.",
address: "Hatiya, Noakhali, Chattogram",
latitude: 22.0833,
longitude: 91.0167,
image: "/images/places/p3.svg",
gallery: ["/images/places/p3.svg", "/images/places/p5.svg"],
rating: 4.0,
reviewCount: 44,
bestTime: "November to February",
verification: "unverified",
}, ];
export const INSTITUTION_SEED: SeedInstitution[] = [
{ slug: "dhaka-residential-model-college", name: "Dhaka Residential Model College", category: "college", description: "A prominent residential college for boys in Mohammadpur, Dhaka, founded in 1960.", address: "Mirpur Road, Mohammadpur, Dhaka", phone: "02-58153911", website: "https://drmc.edu.bd", image: "/images/institutions/i1.svg", verification: "verified" },
{ slug: "st-joseph-higher-secondary-school", name: "St. Joseph Higher Secondary School", category: "school", description: "An English-medium school in Mohammadpur, Dhaka, established in 1954.", address: "97 Asad Avenue, Mohammadpur, Dhaka", phone: "02-41070268", image: "/images/institutions/i2.svg", verification: "verified" },
{ slug: "viqarunnisa-noon-school-college", name: "Viqarunnisa Noon School & College", category: "college", description: "A large girls' school and college in Bailey Road, Dhaka.", address: "14/2, Iqbal Road, Mohammadpur, Dhaka", phone: "02-41070268", image: "/images/institutions/i3.svg", verification: "unverified" },
{ slug: "rajshahi-collegiate-school", name: "Rajshahi Collegiate School", category: "school", description: "One of the oldest schools in Bangladesh, established in 1828 in Rajshahi.", address: "Rajshahi Sadar, Rajshahi", phone: "0721-772344", image: "/images/institutions/i4.svg", verification: "verified" },
{ slug: "chattogram-collegiate-school", name: "Chattogram Collegiate School", category: "school", description: "A historic school in Chattogram city, established in 1836.", address: "Chattogram Sadar, Chattogram", phone: "031-650311", image: "/images/institutions/i5.svg", verification: "verified" },
{ slug: "khulna-zilla-school", name: "Khulna Zilla School", category: "school", description: "A well-known boys' school in Khulna city, founded in 1885.", address: "Khulna Sadar, Khulna", phone: "041-720214", image: "/images/institutions/i6.svg", verification: "verified" },
{ slug: "al-amin-madrasah", name: "Al-Amin Madrasah", category: "madrasah", description: "A recognised alim/fazil madrasah in Chattogram.", address: "Chattogram Sadar, Chattogram", phone: "031-650000", image: "/images/institutions/i7.svg", verification: "unverified" },
{ slug: "al-azhar-madrasah", name: "Al-Azhar Madrasah", category: "madrasah", description: "A private dakhil/alim madrasah in Dhaka.", address: "Dhanmondi, Dhaka", phone: "02-58153911", image: "/images/institutions/i8.svg", verification: "unverified" },
{ slug: "dhaka-medical-college-hospital", name: "Dhaka Medical College Hospital", category: "hospital", description: "A major tertiary teaching hospital in Dhaka.", address: "Dhaka Sadar, Dhaka", phone: "02-55165001", emergencyPhone: "10622", website: "https://dmch.gov.bd", latitude: 23.7253, longitude: 90.3967, image: "/images/institutions/i9.svg", verification: "verified", source: "Ministry of Health" },
{ slug: "bsmmu", name: "Bangabandhu Sheikh Mujib Medical University", category: "hospital", description: "A postgraduate medical university and hospital in Shahbag, Dhaka.", address: "Shahbag, Dhaka", phone: "02-55165001", emergencyPhone: "10622", image: "/images/institutions/i10.svg", verification: "verified" },
{ slug: "chittagong-medical-college-hospital", name: "Chittagong Medical College Hospital", category: "hospital", description: "The largest public hospital in the Chattogram division.", address: "Chattogram Sadar, Chattogram", phone: "031-650311", emergencyPhone: "10622", image: "/images/institutions/i11.svg", verification: "verified" },
{ slug: "sher-e-bangla-medical-college-hospital", name: "Sher-e-Bangla Medical College Hospital", category: "hospital", description: "A major public hospital serving Barishal division.", address: "Barishal Sadar, Barishal", phone: "0431-63502", emergencyPhone: "10622", image: "/images/institutions/i12.svg", verification: "verified" },
{ slug: "rangpur-medical-college-hospital", name: "Rangpur Medical College Hospital", category: "hospital", description: "The principal public hospital in Rangpur division.", address: "Rangpur Sadar, Rangpur", phone: "0521-62239", emergencyPhone: "10622", image: "/images/institutions/i13.svg", verification: "verified" },
{ slug: "savar-community-clinic", name: "Savar Community Clinic", category: "health-centre", description: "A local community clinic providing primary care in Savar.", address: "Savar, Dhaka", phone: "02-7710000", image: "/images/institutions/i14.svg", verification: "unverified" },
{ slug: "coxs-bazar-upazila-health-complex", name: "Cox's Bazar Upazila Health Complex", category: "health-centre", description: "An upazila health complex providing primary and secondary care.", address: "Cox's Bazar Sadar, Cox's Bazar", phone: "0341-62031", emergencyPhone: "10622", image: "/images/institutions/i15.svg", verification: "verified" },
{ slug: "sylhet-mag-osmani-medical-college-hospital", name: "MAG Osmani Medical College Hospital", category: "hospital", description: "A large teaching hospital in Sylhet city.", address: "Sylhet Sadar, Sylhet", phone: "0821-713216", emergencyPhone: "10622", image: "/images/institutions/i16.svg", verification: "verified" }, ];
export const BUSINESS_SEED: SeedBusiness[] = [
{ slug: "hotel-sea-palace", name: "Hotel Sea Palace", category: "hotel", description: "A beachfront hotel near Kolatoli, Cox's Bazar.", address: "Kolatoli Road, Cox's Bazar", phone: "0341-62000", website: "https://example.com", image: "/images/businesses/b1.svg", verification: "verified" },
{ slug: "hotel-peninsula-chittagong", name: "Hotel Peninsula Chittagong", category: "hotel", description: "A business hotel in the Agrabad commercial area.", address: "Agrabad, Chattogram", phone: "031-710340", image: "/images/businesses/b2.svg", verification: "verified" },
{ slug: "radisson-blu-dhaka", name: "Radisson Blu Dhaka Water Garden", category: "hotel", description: "A five-star hotel near Hazrat Shahjalal International Airport.", address: "Airport Road, Dhaka", phone: "02-8931234", image: "/images/businesses/b3.svg", verification: "verified" },
{ slug: "purbani-international-hotel", name: "Purbani International Hotel", category: "hotel", description: "A long-established hotel in the Motijheel business district.", address: "Motijheel, Dhaka", phone: "02-9566696", image: "/images/businesses/b4.svg", verification: "verified" },
{ slug: "star-kabab", name: "Star Kabab & Restaurant", category: "restaurant", description: "A popular Dhaka restaurant known for kabab and biryani.", address: "Dhanmondi, Dhaka", phone: "02-58153911", image: "/images/businesses/b5.svg", verification: "verified" },
{ slug: "kasturi-restaurant", name: "Kasturi Restaurant", category: "restaurant", description: "A traditional Bengali restaurant in Old Dhaka.", address: "Nawabpur, Dhaka", phone: "02-7110000", image: "/images/businesses/b6.svg", verification: "unverified" },
{ slug: "amin-sons-department-store", name: "Amin & Sons Department Store", category: "shop", description: "A general department store in Khulna city.", address: "Khulna Sadar, Khulna", phone: "041-720214", image: "/images/businesses/b1.svg", verification: "unverified" },
{ slug: "bestair", name: "Best Air", category: "transport", description: "A Bangladeshi private airline offering domestic and international flights.", address: "Banani, Dhaka", phone: "02-8901000", website: "https://example.com", image: "/images/businesses/b2.svg", verification: "unverified" },
{ slug: "bangladesh-parjatan-corporation", name: "Bangladesh Parjatan Corporation", category: "service", description: "The national tourism organisation, with offices and rest houses across the country.", address: "Dhaka Sadar, Dhaka", phone: "02-9551823", image: "/images/businesses/b3.svg", verification: "verified" },
{ slug: "cafe-noor", name: "Cafe Noor", category: "restaurant", description: "A popular cafe in Rangpur city.", address: "Rangpur Sadar, Rangpur", phone: "0521-62239", image: "/images/businesses/b4.svg", verification: "unverified" },
{ slug: "hotel-river-view", name: "Hotel River View", category: "hotel", description: "A riverside hotel in Barishal.", address: "Barishal Sadar, Barishal", phone: "0431-63502", image: "/images/businesses/b5.svg", verification: "unverified" },
{ slug: "sylhet-tea-garden-tours", name: "Sylhet Tea Garden Tours", category: "service", description: "Guided tours of the Sreemangal tea gardens.", address: "Sreemangal, Moulvibazar", phone: "08626-71000", image: "/images/businesses/b6.svg", verification: "unverified" }, ];
export const SERVICE_SEED: SeedService[] = [
{ slug: "dhaka-dc-office", name: "Dhaka Deputy Commissioner's Office", category: "land", description: "District administration office handling land records, certificates, and local governance.", officeAddress: "Dhaka Sadar, Dhaka", phone: "02-9553533", hours: "Sun–Thu 09:00–17:00", requiredDocuments: ["National ID", "Application form", "Supporting documents"], verification: "verified" },
{ slug: "bangladesh-national-parliament", name: "Bangladesh National Parliament Secretariat", category: "other", description: "Administrative office of the Jatiya Sangsad.", officeAddress: "Sher-e-Bangla Nagar, Dhaka", phone: "02-9561010", hours: "Sun–Thu 09:00–17:00", verification: "verified" },
{ slug: "passport-office-dhaka", name: "Dhaka Passport Office", category: "identity", description: "Issues passports and provides passport-related services.", officeAddress: "Agargaon, Dhaka", phone: "02-9101000", hours: "Sun–Thu 09:00–17:00", requiredDocuments: ["National ID", "Photographs", "Payment receipt"], verification: "verified" },
{ slug: "brta-dhaka", name: "BRTA Dhaka", category: "transport", description: "Vehicle registration, driving licence, and fitness testing.", officeAddress: "Dhaka Sadar, Dhaka", phone: "02-9100000", hours: "Sun–Thu 09:00–17:00", verification: "verified" },
{ slug: "khulna-dc-office", name: "Khulna Deputy Commissioner's Office", category: "land", description: "District administration and land office for Khulna.", officeAddress: "Khulna Sadar, Khulna", phone: "041-720000", verification: "verified" },
{ slug: "sylhet-dc-office", name: "Sylhet Deputy Commissioner's Office", category: "land", description: "District administration office for Sylhet.", officeAddress: "Sylhet Sadar, Sylhet", phone: "0821-713000", verification: "verified" },
{ slug: "chattogram-passport-office", name: "Chattogram Passport Office", category: "identity", description: "Regional passport office for the Chattogram division.", officeAddress: "Chattogram Sadar, Chattogram", phone: "031-650000", verification: "verified" },
{ slug: "election-commission-office", name: "Bangladesh Election Commission Secretariat", category: "identity", description: "National voter registration and election administration.", officeAddress: "Agargaon, Dhaka", phone: "02-9100000", verification: "verified" },
{ slug: "lged-dhaka", name: "Local Government Engineering Department", category: "other", description: "Engineering and infrastructure services for local government.", officeAddress: "Dhaka Sadar, Dhaka", phone: "02-9550000", verification: "verified" },
{ slug: "bangladesh-post-office", name: "Bangladesh Post Office", category: "other", description: "National postal service with branches across the country.", officeAddress: "Dhaka Sadar, Dhaka", phone: "02-9550000", website: "https://bangladeshpost.gov.bd", verification: "verified" },
{ slug: "weather-office", name: "Bangladesh Meteorological Department", category: "other", description: "Official weather forecasts and warnings for Bangladesh.", officeAddress: "Agargaon, Dhaka", phone: "02-9100000", website: "https://bmd.gov.bd", verification: "verified" },
{ slug: "fire-service-hq", name: "Bangladesh Fire Service & Civil Defence Headquarters", category: "other", description: "National emergency fire and rescue service.", officeAddress: "Dhaka Sadar, Dhaka", phone: "199", emergencyPhone: "199", verification: "verified" }, ];
export const NEWS_SEED: SeedNews[] = [
{ slug: "monsoon-preparedness-2026", title: "Authorities step up monsoon preparedness in the coastal belt", excerpt: "District administrations in the coastal belt have opened emergency shelters and strengthened cyclone readiness ahead of the monsoon.", body: "District administrations across the coastal belt have opened emergency shelters and strengthened cyclone readiness ahead of the monsoon season. Control rooms are staffed around the clock, and volunteer teams have been trained in early warning.\n\nThe Bangladesh Meteorological Department has issued updated guidance for fishermen and small craft. Local offices are coordinating with the Red Crescent and the Armed Forces Division on evacuation planning.\n\nOfficials reminded residents to keep documents, dry food, and drinking water ready, and to follow instructions from local authorities during a warning.", image: "/images/news/n1.svg", category: "national", authorUsername: "admin", source: "Prothom Alo" },
{ slug: "coxs-bazar-sea-wall-upgrade", title: "Cox's Bazar sea wall upgrade enters final phase", excerpt: "A coastal embankment project in Cox's Bazar is set to be completed before the winter tourist season.", body: "A coastal embankment project in Cox's Bazar is set to be completed before the winter tourist season. The work is intended to protect homes and businesses from erosion and storm surges.\n\nEngineers said the final stretch near the main beach road will be finished within weeks. Local traders welcomed the work but asked for better drainage in the market area.", image: "/images/news/n2.svg", category: "district", authorUsername: "moderator" },
{ slug: "blood-donation-camps-2026", title: "Voluntary blood donation camps expand across divisions", excerpt: "Hospitals and student groups are running a record number of voluntary blood donation camps this year.", body: "Hospitals and student groups are running a record number of voluntary blood donation camps this year. Organisers say demand rises during festivals and after road accidents.\n\nHealth officials urge healthy adults to donate regularly and to register with hospital blood banks. They emphasise that voluntary, non-remunerated donation remains the safest supply.", image: "/images/news/n3.svg", category: "health", authorUsername: "admin", source: "The Daily Star" },
{ slug: "sundarbans-tiger-count", title: "Camera-trap survey records a stable tiger count in the Sundarbans", excerpt: "The latest camera-trap survey recorded a broadly stable tiger population in the Sundarbans.", body: "The latest camera-trap survey recorded a broadly stable tiger population in the Sundarbans. Researchers said consistent monitoring, habitat protection, and reduced poaching have helped.\n\nConservationists cautioned that sea-level rise and salinity intrusion remain long-term threats to the forest and its wildlife.", image: "/images/news/n4.svg", category: "national", authorUsername: "admin" },
{ slug: "school-science-fair-2026", title: "Divisional science fair draws thousands of students", excerpt: "A divisional science fair drew thousands of students with projects on renewable energy and water safety.", body: "A divisional science fair drew thousands of students with projects on renewable energy, water safety, and robotics. Judges said the standard of work has improved markedly.\n\nWinners will represent the division at the national competition later in the year.", image: "/images/news/n5.svg", category: "education", authorUsername: "moderator" },
{ slug: "rural-health-centres-digital-records", title: "Rural health centres adopt digital patient records", excerpt: "Upazila health complexes are moving to digital patient records to improve continuity of care.", body: "Upazila health complexes are moving to digital patient records to improve continuity of care and medicine stock management. Training is being rolled out for nurses and health assistants.\n\nOfficials said the system will not be used for research without consent, and that access is limited to authorised health staff.", image: "/images/news/n6.svg", category: "health", authorUsername: "admin" },
{ slug: "inter-district-football-final", title: "Inter-district football final ends in a penalty shootout", excerpt: "The inter-district football final ended in a dramatic penalty shootout in front of a full house.", body: "The inter-district football final ended in a dramatic penalty shootout in front of a full house. The winning side conceded only once in open play.\n\nCoaches praised the standard of the tournament and called for more youth investment in smaller districts.", image: "/images/news/n7.svg", category: "sports", authorUsername: "moderator" },
{ slug: "community-clean-up-sylhet", title: "Volunteers lead a river clean-up in Sylhet", excerpt: "Hundreds of volunteers joined a river clean-up drive in Sylhet, collecting tonnes of waste.", body: "Hundreds of volunteers joined a river clean-up drive in Sylhet, collecting tonnes of waste from the Sari and Surma banks. Organisers said the effort was led by students and local clubs.\n\nParticipants called for better waste collection points and public awareness to keep the rivers clean.", image: "/images/news/n8.svg", category: "community", authorUsername: "admin" },
{ slug: "new-ferry-service-kuakata", title: "New ferry service shortens the Kuakata journey", excerpt: "A new ferry service has shortened the journey to Kuakata from Dhaka.", body: "A new ferry service has shortened the journey to Kuakata from Dhaka, with sailings connecting the capital to the beach town via the Patuakhali terminal.\n\nOperators said the route will run daily in the winter season and more frequently during holidays.", image: "/images/news/n9.svg", category: "district", authorUsername: "moderator" },
{ slug: "digital-literacy-drive", title: "Digital literacy drive reaches remote upazilas", excerpt: "A national digital literacy programme has reached remote upazilas with mobile training labs.", body: "A national digital literacy programme has reached remote upazilas with mobile training labs. Sessions cover online safety, government services, and basic device skills.\n\nOrganisers said demand from women and older learners has been especially strong.", image: "/images/news/n10.svg", category: "education", authorUsername: "admin" },
{ slug: "padma-bridge-rail-link-upgrade", title: "Padma Bridge rail link upgrade enters next stage", excerpt: "The rail link to the Padma Bridge is moving into its next stage, cutting travel times to the south-west.", body: "The rail link to the Padma Bridge is moving into its next stage, cutting travel times between Dhaka and the south-west. Officials said freight and passenger services will be added in phases.\n\nThe upgrade is part of a wider plan to connect the southern districts with the capital by rail.", image: "/images/news/n11.svg", category: "national", authorUsername: "admin" },
{ slug: "madrasah-curriculum-update", title: "Madrasah education board updates the science curriculum", excerpt: "The madrasah education board has updated its science curriculum to align with national standards.", body: "The madrasah education board has updated its science curriculum to align with national standards, adding more laboratory work and digital resources.\n\nTeachers welcomed the change and asked for additional training and equipment.", image: "/images/news/n12.svg", category: "education", authorUsername: "moderator" }, ];
/**
* Locations are supplied separately so the record list above stays readable.
* Keys are record slugs; values use division/district slugs plus the upazila
* display name (which is what the seed's upazila list stores).  */ export const PLACE_LOCATIONS: Record<string, SeedLocation> = {   "sajek-valley": { division: "chattogram", district: "rangamati", upazila: "Rangamati Sadar" },   "coxs-bazar-beach": { division: "chattogram", district: "coxs-bazar", upazila: "Cox's Bazar Sadar" },   "saint-martins-island": { division: "chattogram", district: "coxs-bazar", upazila: "Teknaf" },   "kuakata-beach": { division: "barishal", district: "patuakhali", upazila: "Kalapara" },   "sundarbans": { division: "khulna", district: "satkhira", upazila: "Satkhira Sadar" },   "ratargul-swamp-forest": { division: "sylhet", district: "sylhet", upazila: "Gowainghat" },   "jaflong": { division: "sylhet", district: "sylhet", upazila: "Jaintiapur" },   "bisnakandi": { division: "sylhet", district: "sylhet", upazila: "Kanaighat" },   "lalbagh-fort": { division: "dhaka", district: "dhaka", upazila: "Dhaka Sadar" },   "ahsan-manzil": { division: "dhaka", district: "dhaka", upazila: "Dhaka Sadar" },   "somapura-mahavihara": { division: "rajshahi", district: "naogaon", upazila: "Badalgachhi" },   "mahasthangarh": { division: "rajshahi", district: "bogura", upazila: "Shibganj" },   "shat-gambuj-mosque": { division: "khulna", district: "bagerhat", upazila: "Bagerhat Sadar" },   "panam-city": { division: "dhaka", district: "narayanganj", upazila: "Sonargaon" },   "kaptai-lake": { division: "chattogram", district: "rangamati", upazila: "Kaptai" },   "nilgiri": { division: "chattogram", district: "bandarban", upazila: "Bandarban Sadar" },   "madhabkunda-waterfall": { division: "sylhet", district: "moulvibazar", upazila: "Barlekha" },   "nijhum-dwip": { division: "chattogram", district: "noakhali", upazila: "Hatiya" }, };  export const INSTITUTION_LOCATIONS: Record<string, SeedLocation> = {   "dhaka-residential-model-college": { division: "dhaka", district: "dhaka" },   "st-joseph-higher-secondary-school": { division: "dhaka", district: "dhaka" },   "viqarunnisa-noon-school-college": { division: "dhaka", district: "dhaka" },   "rajshahi-collegiate-school": { division: "rajshahi", district: "rajshahi" },   "chattogram-collegiate-school": { division: "chattogram", district: "chattogram" },   "khulna-zilla-school": { division: "khulna", district: "khulna" },   "al-amin-madrasah": { division: "chattogram", district: "chattogram" },   "al-azhar-madrasah": { division: "dhaka", district: "dhaka" },   "dhaka-medical-college-hospital": { division: "dhaka", district: "dhaka" },   "bsmmu": { division: "dhaka", district: "dhaka" },   "chittagong-medical-college-hospital": { division: "chattogram", district: "chattogram" },   "sher-e-bangla-medical-college-hospital": { division: "barishal", district: "barishal" },   "rangpur-medical-college-hospital": { division: "rangpur", district: "rangpur" },   "savar-community-clinic": { division: "dhaka", district: "dhaka", upazila: "Savar" },   "coxs-bazar-upazila-health-complex": { division: "chattogram", district: "coxs-bazar" },   "sylhet-mag-osmani-medical-college-hospital": { division: "sylhet", district: "sylhet" }, };  export const BUSINESS_LOCATIONS: Record<string, SeedLocation> = {   "hotel-sea-palace": { division: "chattogram", district: "coxs-bazar" },   "hotel-peninsula-chittagong": { division: "chattogram", district: "chattogram" },   "radisson-blu-dhaka": { division: "dhaka", district: "dhaka" },   "purbani-international-hotel": { division: "dhaka", district: "dhaka" },   "star-kabab": { division: "dhaka", district: "dhaka" },   "kasturi-restaurant": { division: "dhaka", district: "dhaka" },   "amin-sons-department-store": { division: "khulna", district: "khulna" },   "bestair": { division: "dhaka", district: "dhaka" },   "bangladesh-parjatan-corporation": { division: "dhaka", district: "dhaka" },   "cafe-noor": { division: "rangpur", district: "rangpur" },   "hotel-river-view": { division: "barishal", district: "barishal" },   "sylhet-tea-garden-tours": { division: "sylhet", district: "moulvibazar", upazila: "Sreemangal" }, };  export const SERVICE_LOCATIONS: Record<string, SeedLocation> = {   "dhaka-dc-office": { division: "dhaka", district: "dhaka" },   "bangladesh-national-parliament": { division: "dhaka", district: "dhaka" },   "passport-office-dhaka": { division: "dhaka", district: "dhaka" },   "brta-dhaka": { division: "dhaka", district: "dhaka" },   "khulna-dc-office": { division: "khulna", district: "khulna" },   "sylhet-dc-office": { division: "sylhet", district: "sylhet" },   "chattogram-passport-office": { division: "chattogram", district: "chattogram" },   "election-commission-office": { division: "dhaka", district: "dhaka" },   "lged-dhaka": { division: "dhaka", district: "dhaka" },   "bangladesh-post-office": { division: "dhaka", district: "dhaka" },   "weather-office": { division: "dhaka", district: "dhaka" },   "fire-service-hq": { division: "dhaka", district: "dhaka" }, };  export const REVIEW_SEED: SeedReview[] = [   { placeSlug: "sajek-valley", authorUsername: "rahman", rating: 5, title: "Sunrise worth the drive", body: "The road is long but the sunrise over the clouds is unforgettable. Stayed in a homestay and the hosts were lovely." },   { placeSlug: "sajek-valley", authorUsername: "nusrat", rating: 4, title: "Beautiful but basic", body: "Stunning scenery. Book accommodation early and take warm clothes — it gets cold at night." },   { placeSlug: "coxs-bazar-beach", authorUsername: "tanvir", rating: 5, title: "Classic beach holiday", body: "Laboni was busy but Inani was quiet and lovely. Try the seafood at the beach stalls." },   { placeSlug: "coxs-bazar-beach", authorUsername: "maria", rating: 4, title: "Long and lovely", body: "Very long beach. Avoid swimming outside the guarded zones and check the weather." },   { placeSlug: "sundarbans", authorUsername: "rakib", rating: 5, title: "A world apart", body: "We saw deer, crocodiles and thousands of birds. A licensed guide is essential." },   { placeSlug: "somapura-mahavihara", authorUsername: "farhana", rating: 5, title: "Extraordinary history", body: "The scale of the vihara is remarkable. The site museum is well curated." },   { placeSlug: "lalbagh-fort", authorUsername: "shanto", rating: 4, title: "Great for a half day", body: "Interesting Mughal site in the middle of the city. Go early to avoid the heat." },   { placeSlug: "ratargul-swamp-forest", authorUsername: "mim", rating: 4, title: "Monsoon magic", body: "Best in the rainy season when the forest is flooded. Hire a boat at the gate." },   { placeSlug: "kuakata-beach", authorUsername: "arif", rating: 4, title: "Sunrise and sunset", body: "Nice beach, quieter than Cox's Bazar. The boat trip to the island is fun." },   { placeSlug: "madhabkunda-waterfall", authorUsername: "tania", rating: 5, title: "Powerful falls", body: "Went in August and the flow was strong. The tea gardens on the way are beautiful." },   { placeSlug: "jaflong", authorUsername: "mehedi", rating: 3, title: "Good day trip", body: "Scenic river and stones, though it can get crowded on weekends." },   { placeSlug: "shat-gambuj-mosque", authorUsername: "sadia", rating: 5, title: "Architectural gem", body: "A stunning 15th-century mosque. Visit the nearby shrine complex too." }, ];
