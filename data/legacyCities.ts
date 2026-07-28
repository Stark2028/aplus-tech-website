// The 95 legacy city hub slugs, harvested from the old WordPress site's live
// sitemaps before shutdown. These are INDEXED, ranking URLs. Two consumers:
// data/cities.test.ts guards that every one still exists as a live hub page,
// and lib/legacySitemaps.ts uses them to enumerate legacy city×product URLs.
// NEVER add net-new cities here — this list is a historical record, not the
// live city roster (that's data/cities.ts).
export const LEGACY_CITY_SLUGS: readonly string[] = [
  "agra","ahmedabad","ajmer","aligarh","allahabad","ambattur","amravati","amritsar","asansol","aurangabad",
  "bangalore","bareilly","belgaum","bhavnagar","bhilai-nagar","bhiwandi","bhopal","bhubaneswar","bikaner",
  "chandigarh","chennai","coimbatore","cuttack","dehradun","delhi","dhanbad","durgapur","faridabad","firozabad",
  "gaya","ghaziabad","gorakhpur","greater-noida","gulbarga","guntur","gurgaon","guwahati","gwalior","haora",
  "hyderabad","indore","jabalpur","jaipur","jalandhar","jalgaon","jammu","jamnagar","jamshedpur","jhansi","jodhpur",
  "kalyan","kanpur","kochi","kolapur","kolkata","kota","lucknow","ludhiana","madurai","maheshtala","mangalore",
  "meerut","mira-and-bhayander","moradabad","mumbai","nagpur","nanded-waghala","nashik","navi-mumbai","nellore",
  "noida","patna","pimpri-and-chinchwad","pune","raipur","rajkot","ranchi","saharanpur","salem","sangli","siliguri",
  "solapur","srinagar","surat","thane","thiruvananthapuram","tiruchirappalli","udaipur","ujjain","ulhasnagar",
  "vadodara","varanasi","vijayawada","visakhapatnam","warangal",
];
