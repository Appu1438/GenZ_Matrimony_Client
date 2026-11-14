/* ==========================================================================
   Profile option data + small helpers
   Pure data / functions only — no React in this file.
   Option lists accept three shapes:
     "Plain string"                     -> { value, label } with the same text
     { value, label }                   -> used as is
     { group: "Name", items: [...] }    -> rendered as a group (optgroup / chip section)
   ========================================================================== */

export const OTHER = "Other";

/* ---- Object path helpers (re-exported by steps.jsx) ---- */
export function readPath(object, path) {
    return path.split(".").reduce((value, key) => value?.[key], object);
}

export function writePath(object, path, value) {
    const keys = path.split(".");
    const result = { ...object };
    let cursor = result;
    let source = object;

    keys.forEach((key, index) => {
        if (index === keys.length - 1) {
            cursor[key] = value;
        } else {
            const next =
                source?.[key] && typeof source[key] === "object" && !Array.isArray(source[key])
                    ? source[key]
                    : {};
            cursor[key] = { ...next };
            cursor = cursor[key];
            source = next;
        }
    });

    return result;
}

/* ---- Option normalisation ---- */
const toItem = (option) =>
    option !== null && typeof option === "object" ? option : { value: option, label: String(option) };

/** Normalises any supported option shape into [{ label, items: [{ value, label }] }]. */
export function toGroups(options = []) {
    if (!options.length) return [];
    if (options[0] && typeof options[0] === "object" && "items" in options[0]) {
        return options.map((group) => ({ label: group.group, items: group.items.map(toItem) }));
    }
    return [{ label: null, items: options.map(toItem) }];
}

/* ---- Basics ---- */
export const YES_NO = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
];

export const PROFILE_FOR_OPTIONS = ["Self", "Son", "Daughter", "Brother", "Sister", "Relative", "Friend"];

export const GENDER_BY_RELATION = { Son: "male", Brother: "male", Daughter: "female", Sister: "female" };

export const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];

export const MARITAL_STATUS_OPTIONS = ["Never married", "Divorced", "Widowed", "Awaiting divorce"];

export const LANGUAGE_OPTIONS = [
    "Malayalam", "Tamil", "Hindi", "English", "Kannada", "Telugu", "Tulu",
    "Bengali", "Marathi", "Gujarati", "Punjabi", "Urdu", "Odia", "Assamese",
    "Konkani", "Sanskrit", "Arabic",
];

/* ---- Religion & community ---- */
export const RELIGION_CHOICES = ["Hindu", "Muslim", "Christian", "Sikh", "Buddhist", "Jain", "Jewish"];
export const RELIGION_OPTIONS = [...RELIGION_CHOICES, "Prefer not to say"];

/** Communities depend on the religion that is selected. */
export const COMMUNITIES_BY_RELIGION = {
    Hindu: ["Nair", "Ezhava / Thiyya", "Namboodiri", "Vishwakarma", "Dheevara"],
    Christian: [
        "Latin Catholic", "Syro-Malabar Catholic", "Syro-Malankara Catholic",
        "Orthodox", "Jacobite", "Marthoma", "Pentecostal", "CSI",
    ],
    Muslim: ["Sunni", "Mujahid", "Jamaat-e-Islami"],
};

export const ALL_COMMUNITIES = Object.values(COMMUNITIES_BY_RELIGION).flat();

/** Grouped community options for the given religions (all groups when none selected). */
export function communityGroupsFor(religions = []) {
    const keys = religions.length
        ? religions.filter((religion) => COMMUNITIES_BY_RELIGION[religion])
        : Object.keys(COMMUNITIES_BY_RELIGION);
    return keys.map((religion) => ({ group: religion, items: COMMUNITIES_BY_RELIGION[religion] }));
}

/** Horoscope details are only asked for religions where they are commonly used. */
export const HOROSCOPE_RELIGIONS = ["Hindu", "Jain", "Sikh", "Buddhist"];

export const DOSHAM_OPTIONS = ["Yes", "No", "Not sure", "Prefer not to say"];

export const BIRTH_STARS = [
    "Aswathi", "Bharani", "Karthika", "Rohini", "Makayiram", "Thiruvathira", "Punartham",
    "Pooyam", "Ayilyam", "Makam", "Pooram", "Uthram", "Atham", "Chithira", "Chothi",
    "Visakham", "Anizham", "Thriketta", "Moolam", "Pooradam", "Uthradam", "Thiruvonam",
    "Avittam", "Chathayam", "Pooruruttathi", "Uthrattathi", "Revathi",
];

export const RASHIS = [
    "Mesham (Aries)", "Edavam (Taurus)", "Mithunam (Gemini)", "Karkidakam (Cancer)",
    "Chingam (Leo)", "Kanni (Virgo)", "Thulam (Libra)", "Vrischikam (Scorpio)",
    "Dhanu (Sagittarius)", "Makaram (Capricorn)", "Kumbham (Aquarius)", "Meenam (Pisces)",
];

/* ---- Location ---- */
export const COUNTRY_OPTIONS = [
    "India", "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain",
    "United States", "United Kingdom", "Canada", "Australia", "New Zealand", "Germany",
    "Singapore", "Malaysia",
];

export const STATE_OPTIONS = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
    "Lakshadweep", "Puducherry",
];

export const KERALA_DISTRICTS = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki",
    "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur",
    "Kasaragod",
];

const KERALA_CITIES = [
    "Thiruvananthapuram", "Kollam", "Alappuzha", "Kottayam", "Kochi", "Ernakulam", "Thrissur",
    "Palakkad", "Malappuram", "Kozhikode", "Kannur", "Kasaragod", "Pathanamthitta",
    "Thodupuzha", "Muvattupuzha", "Perumbavoor", "Angamaly", "Changanassery", "Kayamkulam",
    "Cherthala", "Guruvayur", "Irinjalakuda", "Kunnamkulam", "Ottapalam", "Manjeri",
    "Perinthalmanna", "Tirur", "Vadakara", "Koyilandi", "Kalpetta", "Taliparamba", "Payyannur",
];

const METRO_CITIES = [
    "Bengaluru", "Chennai", "Hyderabad", "Mumbai", "Pune", "Delhi", "Kolkata", "Ahmedabad",
    "Coimbatore", "Mangaluru", "Mysuru",
];

const CITY_BY_COUNTRY = {
    "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Al Ain"],
    "Saudi Arabia": ["Riyadh", "Jeddah", "Dammam", "Al Khobar", "Makkah", "Madinah"],
    Qatar: ["Doha", "Al Wakrah", "Al Khor"],
    Oman: ["Muscat", "Salalah", "Sohar"],
    Kuwait: ["Kuwait City", "Hawalli", "Salmiya"],
    Bahrain: ["Manama", "Muharraq", "Riffa"],
    "United States": ["New York", "San Francisco", "Seattle", "Dallas", "Houston", "Chicago"],
    "United Kingdom": ["London", "Manchester", "Birmingham", "Edinburgh"],
    Canada: ["Toronto", "Vancouver", "Calgary", "Montreal"],
    Australia: ["Sydney", "Melbourne", "Brisbane", "Perth"],
    "New Zealand": ["Auckland", "Wellington"],
    Germany: ["Berlin", "Munich", "Frankfurt"],
    Singapore: ["Singapore"],
    Malaysia: ["Kuala Lumpur", "Penang", "Johor Bahru"],
};

export const isIndia = (country) => !country || country === "India";

const unique = (list) => [...new Set(list)];

/** City suggestions that match the chosen country (and state, for India). */
export function citySuggestions(country, state) {
    if (isIndia(country)) {
        return state === "Kerala" ? KERALA_CITIES : unique([...KERALA_CITIES, ...METRO_CITIES]);
    }
    return CITY_BY_COUNTRY[country] ?? [];
}

/** City options for the partner preference picker, based on the countries/states chosen. */
export function preferredCityOptions(prefs = {}) {
    const countries = prefs.countries ?? [];
    const states = prefs.states ?? [];
    const options = [];

    if (!countries.length || countries.includes("India")) {
        options.push(...(states.length === 1 && states[0] === "Kerala"
            ? KERALA_CITIES
            : [...KERALA_CITIES, ...METRO_CITIES]));
    }
    countries.filter((country) => country !== "India").forEach((country) => {
        options.push(...(CITY_BY_COUNTRY[country] ?? []));
    });

    return unique(options);
}

export const NATIVE_PLACE_SUGGESTIONS = unique([...KERALA_CITIES, ...METRO_CITIES]);

/* ---- Education & career ---- */
export const EDUCATION_OPTIONS = ["High school", "Diploma", "Bachelor's", "Master's", "Doctorate", "Other"];
export const EDUCATION_PREFERENCE_OPTIONS = EDUCATION_OPTIONS.filter((level) => level !== "Other");

export const QUALIFICATIONS_BY_LEVEL = {
    "High school": ["SSLC / 10th", "Plus Two / 12th", "CBSE 12th", "ICSE / ISC 12th"],
    Diploma: ["Polytechnic Diploma", "ITI", "Diploma in Nursing (GNM)", "Diploma in Engineering", "DMLT"],
    "Bachelor's": [
        "B.Tech / B.E", "B.Sc", "B.Com", "BBA", "BCA", "BA", "MBBS", "BDS", "B.Pharm",
        "B.Sc Nursing", "B.Arch", "LLB", "B.Ed",
    ],
    "Master's": ["M.Tech / M.E", "M.Sc", "MBA", "MCA", "M.Com", "MA", "MD / MS", "M.Pharm", "LLM", "M.Ed", "M.Arch"],
    Doctorate: ["PhD", "DM", "MCh"],
};

export const ALL_QUALIFICATIONS = Object.values(QUALIFICATIONS_BY_LEVEL).flat();

export const SPECIALIZATION_SUGGESTIONS = [
    "Computer Science", "Information Technology", "Electronics & Communication", "Electrical",
    "Mechanical", "Civil", "Chemical", "Finance", "Marketing", "Human Resources", "Nursing",
    "Pharmacy", "Medicine", "Law", "Education", "Arts & Humanities", "Commerce", "Mathematics",
    "Physics", "Chemistry", "Biology",
];

export const EMPLOYMENT_OPTIONS = [
    "Employed", "Self-employed", "Business", "Government", "Student", "Not working", "Other",
];
export const EMPLOYMENT_PREFERENCE_OPTIONS = EMPLOYMENT_OPTIONS.filter((type) => type !== "Other");

/** Employment types where job title / employer / work location don't apply. */
export const NOT_WORKING_TYPES = ["Student", "Not working"];

export const OCCUPATION_GROUPS = [
    { group: "Healthcare", items: ["Doctor", "Dentist", "Nurse", "Pharmacist", "Physiotherapist", "Healthcare professional"] },
    { group: "Engineering & technology", items: ["Engineer", "Software developer", "IT professional", "Data / AI professional", "Architect"] },
    { group: "Business & finance", items: ["Business owner", "Entrepreneur", "Chartered accountant", "Accountant", "Bank employee", "Sales & marketing"] },
    { group: "Education & research", items: ["Teacher", "Professor", "Scientist"] },
    { group: "Government & defence", items: ["Government employee", "Civil services", "Defence personnel", "Police"] },
    { group: "Law, media & design", items: ["Lawyer", "Designer", "Media professional", "Photographer"] },
    { group: "Aviation & marine", items: ["Pilot", "Cabin crew", "Merchant navy"] },
    { group: "Other roles", items: ["Farmer", "Skilled professional", "Homemaker", "Student"] },
];

export const PARENT_OCCUPATION_SUGGESTIONS = [
    "Business", "Self-employed", "Government employee", "Private sector employee", "Teacher",
    "Farmer", "Doctor", "Engineer", "Gulf / overseas employee", "Retired", "Homemaker", "Passed away",
];

/* ---- Family & lifestyle ---- */
export const FAMILY_TYPE_OPTIONS = ["Nuclear", "Joint", "Extended"];
export const FAMILY_VALUES_OPTIONS = ["Traditional", "Moderate", "Liberal", "Other"];
export const FAMILY_STATUS_OPTIONS = ["Middle class", "Upper middle class", "Affluent"];

export const DIET_OPTIONS = ["Vegetarian", "Non-vegetarian", "Eggetarian", "Vegan", "Other"];
export const DIET_PREFERENCE_OPTIONS = DIET_OPTIONS.filter((diet) => diet !== "Other");

export const SMOKING_OPTIONS = ["No", "Occasionally", "Yes", "Prefer not to say"];
export const DRINKING_OPTIONS = ["No", "Occasionally", "Yes", "Prefer not to say"];
export const HABIT_PREFERENCE_OPTIONS = ["No", "Occasionally", "Yes"];

export const RELOCATE_OPTIONS = ["Yes", "No", "Depends"];
export const PARTNER_RELOCATE_OPTIONS = ["Yes", "No", "Doesn't matter"];

/** Hobbies = things you do. */
export const HOBBY_GROUPS = [
    { group: "Creative", items: ["Reading", "Writing", "Drawing & painting", "Photography", "Music", "Singing", "Dancing", "Cooking", "Baking", "Crafts & DIY"] },
    { group: "Active & outdoors", items: ["Gym & fitness", "Running", "Yoga", "Cycling", "Swimming", "Trekking", "Badminton", "Cricket", "Football", "Travelling"] },
    { group: "Relax & unwind", items: ["Movies & series", "Gaming", "Gardening", "Meditation", "Podcasts", "Spending time with family", "Volunteering", "Pets"] },
];

/** Interests = topics you follow or care about. */
export const INTEREST_GROUPS = [
    { group: "Technology & business", items: ["Technology", "Startups", "Investing & finance", "Entrepreneurship", "Science"] },
    { group: "Culture & arts", items: ["Art & design", "Books & literature", "Film & cinema", "Fashion", "History", "Food & cuisines", "Travel & cultures"] },
    { group: "Life & values", items: ["Fitness & wellness", "Spirituality", "Family & parenting", "Social causes", "Environment", "Current affairs", "Sports", "Education"] },
];

/* ---- Display helpers ---- */
export function formatHeight(cm) {
    const value = Number(cm);
    if (!Number.isFinite(value) || value < 100 || value > 250) return "";

    const totalInches = value / 2.54;
    let feet = Math.floor(totalInches / 12);
    let inches = Math.round(totalInches - feet * 12);
    if (inches === 12) {
        feet += 1;
        inches = 0;
    }
    return `≈ ${feet}′${inches}″`;
}

const trimZeros = (number, digits = 2) => String(Number(number.toFixed(digits)));

export function formatIncome(amount) {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return "";
    if (value >= 1e7) return `₹${trimZeros(value / 1e7)} crore per year`;
    if (value >= 1e5) return `₹${trimZeros(value / 1e5)} lakh per year`;
    return `₹${value.toLocaleString("en-IN")} per year`;
}