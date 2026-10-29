/**
* Static Bangladesh geographic hierarchy used to seed the location tables.
*
* Coverage: all 8 divisions and all 64 districts. Upazila lists are curated
* and intentionally not exhaustive — the store will happily accept more, but we
* do not invent upazilas that are not backed by a source.
*/
export type DivisionSeed = {
slug: string;
name: string;
capital: string;
districts: DistrictSeed[]; };
export type DistrictSeed = {
slug: string;
name: string;
upazilas: string[]; };
export const LOCATION_SEED: DivisionSeed[] = [
{
slug: "dhaka",
name: "Dhaka",
capital: "Dhaka",
districts: [
{ slug: "dhaka", name: "Dhaka", upazilas: ["Dhaka Sadar", "Dhamrai", "Dohar", "Keraniganj", "Nawabganj", "Savar", "Gulshan", "Mirpur", "Uttara"] },
{ slug: "faridpur", name: "Faridpur", upazilas: ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"] },
{ slug: "gazipur", name: "Gazipur", upazilas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur"] },
{ slug: "gopalganj", name: "Gopalganj", upazilas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"] },
{ slug: "kishoreganj", name: "Kishoreganj", upazilas: ["Kishoreganj Sadar", "Austagram", "Bajitpur", "Bhairab", "Hossainpur", "Itna", "Karimganj", "Katiadi", "Kuliarchar", "Mithamain", "Nikli", "Pakundia", "Tarail"] },
{ slug: "madaripur", name: "Madaripur", upazilas: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"] },
{ slug: "manikganj", name: "Manikganj", upazilas: ["Manikganj Sadar", "Daulatpur", "Ghior", "Harirampur", "Saturia", "Singair", "Shivalaya"] },
{ slug: "munshiganj", name: "Munshiganj", upazilas: ["Munshiganj Sadar", "Gazaria", "Lohajang", "Serajdikhan", "Sreenagar", "Tongibari"] },
{ slug: "narayanganj", name: "Narayanganj", upazilas: ["Narayanganj Sadar", "Bandar", "Araihazar", "Rupganj", "Sonargaon"] },
{ slug: "narsingdi", name: "Narsingdi", upazilas: ["Narsingdi Sadar", "Belabo", "Monohardi", "Palash", "Raipura", "Shibpur"] },
{ slug: "rajbari", name: "Rajbari", upazilas: ["Rajbari Sadar", "Baliakandi", "Goalandaghat", "Kalukhali", "Pangsha"] },
{ slug: "shariatpur", name: "Shariatpur", upazilas: ["Shariatpur Sadar", "Bhedarganj", "Damudya", "Gosairhat", "Naria", "Shakhipur", "Zajira"] },
{ slug: "tangail", name: "Tangail", upazilas: ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur"] },
],
},
{
slug: "chattogram",
name: "Chattogram",
capital: "Chattogram",
districts: [
{ slug: "bandarban", name: "Bandarban", upazilas: ["Bandarban Sadar", "Alikadam", "Lama", "Naikhongchhari", "Rowangchhari", "Ruma", "Thanchi"] },
{ slug: "brahmanbaria", name: "Brahmanbaria", upazilas: ["Brahmanbaria Sadar", "Akhaura", "Ashuganj", "Bancharampur", "Bijoynagar", "Kasba", "Nabinagar", "Nasirnagar", "Sarail"] },
{ slug: "chandpur", name: "Chandpur", upazilas: ["Chandpur Sadar", "Faridganj", "Haimchar", "Hajiganj", "Kachua", "Matlab Dakshin", "Matlab Uttar", "Shahrasti"] },
{ slug: "chattogram", name: "Chattogram", upazilas: ["Chattogram Sadar", "Anwara", "Banshkhali", "Boalkhali", "Chandanaish", "Fatikchhari", "Hathazari", "Lohagara", "Mirsharai", "Patiya", "Rangunia", "Raozan", "Sandwip", "Satkania", "Sitakunda"] },
{ slug: "cumilla", name: "Cumilla", upazilas: ["Cumilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Lalmai", "Meghna", "Monoharganj", "Muradnagar", "Nangalkot", "Titas"] },
{ slug: "coxs-bazar", name: "Cox's Bazar", upazilas: ["Cox's Bazar Sadar", "Chakaria", "Kutubdia", "Maheshkhali", "Pekua", "Ramu", "Teknaf", "Ukhia"] },
{ slug: "feni", name: "Feni", upazilas: ["Feni Sadar", "Chhagalnaiya", "Daganbhuiyan", "Fulgazi", "Parshuram", "Sonagazi"] },
{ slug: "khagrachhari", name: "Khagrachhari", upazilas: ["Khagrachhari Sadar", "Dighinala", "Guimara", "Lakshmichhari", "Mahalchhari", "Manikchhari", "Matiranga", "Panchhari", "Ramgarh"] },
{ slug: "lakshmipur", name: "Lakshmipur", upazilas: ["Lakshmipur Sadar", "Kamalnagar", "Raipur", "Ramganj", "Ramgati"] },
{ slug: "noakhali", name: "Noakhali", upazilas: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Kabirhat", "Senbagh", "Sonaimuri", "Subarnachar"] },
{ slug: "rangamati", name: "Rangamati", upazilas: ["Rangamati Sadar", "Baghaichhari", "Barkal", "Belaichhari", "Juraichhari", "Kaptai", "Kawkhali", "Langadu", "Naniarchar", "Rajasthali"] },
],
},
{
slug: "rajshahi",
name: "Rajshahi",
capital: "Rajshahi",
districts: [
{ slug: "bogura", name: "Bogura", upazilas: ["Bogura Sadar", "Adamdighi", "Dhunat", "Dhupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"] },
{ slug: "joypurhat", name: "Joypurhat", upazilas: ["Joypurhat Sadar", "Akkelpur", "Kalai", "Khetlal", "Panchbibi"] },
{ slug: "naogaon", name: "Naogaon", upazilas: ["Naogaon Sadar", "Atrai", "Badalgachhi", "Dhamoirhat", "Manda", "Mohadevpur", "Niamatpur", "Patnitala", "Porsha", "Raninagar", "Sapahar"] },
{ slug: "natore", name: "Natore", upazilas: ["Natore Sadar", "Bagatipara", "Baraigram", "Gurudaspur", "Lalpur", "Naldanga", "Singra"] },
{ slug: "chapai-nawabganj", name: "Chapai Nawabganj", upazilas: ["Chapai Nawabganj Sadar", "Bholahat", "Gomastapur", "Nachole", "Shibganj"] },
{ slug: "pabna", name: "Pabna", upazilas: ["Pabna Sadar", "Atgharia", "Bera", "Bhangura", "Chatmohar", "Faridpur", "Ishwardi", "Santhia", "Sujanagar"] },
{ slug: "rajshahi", name: "Rajshahi", upazilas: ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"] },
{ slug: "sirajganj", name: "Sirajganj", upazilas: ["Sirajganj Sadar", "Belkuchi", "Chauhali", "Kamarkhanda", "Kazipur", "Raiganj", "Shahjadpur", "Tarash", "Ullahpara"] },
],
},
{
slug: "khulna",
name: "Khulna",
capital: "Khulna",
districts: [
{ slug: "bagerhat", name: "Bagerhat", upazilas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"] },
{ slug: "chuadanga", name: "Chuadanga", upazilas: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"] },
{ slug: "jashore", name: "Jashore", upazilas: ["Jashore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"] },
{ slug: "jhenaidah", name: "Jhenaidah", upazilas: ["Jhenaidah Sadar", "Harinakunda", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa"] },
{ slug: "khulna", name: "Khulna", upazilas: ["Khulna Sadar", "Batiaghata", "Dacope", "Dighalia", "Dumuria", "Koira", "Paikgachha", "Phultala", "Rupsa", "Terokhada"] },
{ slug: "kushtia", name: "Kushtia", upazilas: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"] },
{ slug: "magura", name: "Magura", upazilas: ["Magura Sadar", "Mohammadpur", "Salikha", "Sreepur"] },
{ slug: "meherpur", name: "Meherpur", upazilas: ["Meherpur Sadar", "Gangni", "Mujibnagar"] },
{ slug: "narail", name: "Narail", upazilas: ["Narail Sadar", "Kalia", "Lohagara", "Naragati"] },
{ slug: "satkhira", name: "Satkhira", upazilas: ["Satkhira Sadar", "Assasuni", "Debhata", "Kalaroa", "Kaliganj", "Shyamnagar", "Tala"] },
],
},
{
slug: "barishal",
name: "Barishal",
capital: "Barishal",
districts: [
{ slug: "barguna", name: "Barguna", upazilas: ["Barguna Sadar", "Amtali", "Bamna", "Betagi", "Patharghata", "Taltali"] },
{ slug: "barishal", name: "Barishal", upazilas: ["Barishal Sadar", "Agailjhara", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"] },
{ slug: "bhola", name: "Bhola", upazilas: ["Bhola Sadar", "Burhanuddin", "Charfasson", "Daulatkhan", "Lalmohan", "Manpura", "Tazumuddin"] },
{ slug: "jhalokathi", name: "Jhalokathi", upazilas: ["Jhalokathi Sadar", "Kathalia", "Nalchity", "Rajapur"] },
{ slug: "patuakhali", name: "Patuakhali", upazilas: ["Patuakhali Sadar", "Bauphal", "Dashmina", "Dumki", "Galachipa", "Kalapara", "Mirzaganj", "Rangabali"] },
{ slug: "pirojpur", name: "Pirojpur", upazilas: ["Pirojpur Sadar", "Bhandaria", "Kawkhali", "Mathbaria", "Nazirpur", "Nesarabad", "Zianagar"] },
],
},
{
slug: "sylhet",
name: "Sylhet",
capital: "Sylhet",
districts: [
{ slug: "habiganj", name: "Habiganj", upazilas: ["Habiganj Sadar", "Ajmiriganj", "Bahubal", "Baniyachong", "Chunarughat", "Lakhai", "Madhabpur", "Nabiganj", "Sayestaganj"] },
{ slug: "moulvibazar", name: "Moulvibazar", upazilas: ["Moulvibazar Sadar", "Barlekha", "Juri", "Kamalganj", "Kulaura", "Rajnagar", "Sreemangal"] },
{ slug: "sunamganj", name: "Sunamganj", upazilas: ["Sunamganj Sadar", "Bishwamvarpur", "Chhatak", "Derai", "Dharampasha", "Dowarabazar", "Jagannathpur", "Jamalganj", "Sullah", "Tahirpur"] },
{ slug: "sylhet", name: "Sylhet", upazilas: ["Sylhet Sadar", "Balaganj", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Osmani Nagar", "South Surma", "Zakiganj"] },
],
},
{
slug: "rangpur",
name: "Rangpur",
capital: "Rangpur",
districts: [
{ slug: "dinajpur", name: "Dinajpur", upazilas: ["Dinajpur Sadar", "Birampur", "Birganj", "Biral", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"] },
{ slug: "gaibandha", name: "Gaibandha", upazilas: ["Gaibandha Sadar", "Fulchhari", "Gobindaganj", "Palashbari", "Sadullapur", "Sundarganj"] },
{ slug: "kurigram", name: "Kurigram", upazilas: ["Kurigram Sadar", "Bhurungamari", "Char Rajibpur", "Chilmari", "Nageshwari", "Phulbari", "Rajarhat", "Raomari", "Ulipur"] },
{ slug: "lalmonirhat", name: "Lalmonirhat", upazilas: ["Lalmonirhat Sadar", "Aditmari", "Hatibandha", "Kaliganj", "Patgram"] },
{ slug: "nilphamari", name: "Nilphamari", upazilas: ["Nilphamari Sadar", "Dimla", "Domar", "Jaldhaka", "Kishoreganj", "Saidpur"] },
{ slug: "panchagarh", name: "Panchagarh", upazilas: ["Panchagarh Sadar", "Atwari", "Boda", "Debiganj", "Tetulia"] },
{ slug: "rangpur", name: "Rangpur", upazilas: ["Rangpur Sadar", "Badarganj", "Gangachhara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"] },
{ slug: "thakurgaon", name: "Thakurgaon", upazilas: ["Thakurgaon Sadar", "Baliadangi", "Haripur", "Pirganj", "Ranisankail"] },
],
},
{
slug: "mymensingh",
name: "Mymensingh",
capital: "Mymensingh",
districts: [
{ slug: "jamalpur", name: "Jamalpur", upazilas: ["Jamalpur Sadar", "Bakshiganj", "Dewanganj", "Islampur", "Madarganj", "Melandaha", "Sarishabari"] },
{ slug: "mymensingh", name: "Mymensingh", upazilas: ["Mymensingh Sadar", "Bhaluka", "Dhobaura", "Fulbaria", "Gaffargaon", "Gauripur", "Haluaghat", "Ishwarganj", "Muktagachha", "Nandail", "Phulpur", "Trishal"] },
{ slug: "netrokona", name: "Netrokona", upazilas: ["Netrokona Sadar", "Atpara", "Barhatta", "Durgapur", "Kalmakanda", "Kendua", "Khaliajuri", "Madan", "Mohanganj", "Purbadhala"] },
{ slug: "sherpur", name: "Sherpur", upazilas: ["Sherpur Sadar", "Jhenaigati", "Nakla", "Nalitabari", "Sreebardi"] },
],
}, ];
/** All eight divisions, handy for ordered displays. */ export const DIVISION_NAMES = LOCATION_SEED.map((d) => d.name);
