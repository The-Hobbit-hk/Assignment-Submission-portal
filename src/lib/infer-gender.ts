/** Infer Male/Female from a given name for CSV export only (not shown in UI). */

const FEMALE = new Set([
  "aanchal", "aarti", "aarya", "abha", "aditi", "aishwarya", "akanksha", "akshata",
  "alisha", "amisha", "amruta", "amrisha", "ananya", "anjali", "ankita", "anushka",
  "anvi", "aparna", "archana", "ariana", "arushi", "asawari", "ashwini", "avani",
  "ayana", "bhakti", "bhavana", "bhavya", "bhumika", "chaitali", "chandni", "charvi",
  "deepa", "deepika", "deepti", "devika", "dhanashree", "diksha", "divya", "drishti",
  "ekta", "fatima", "gauri", "gayatri", "geeta", "gargi", "harshada", "hema", "isha",
  "ishani", "ishita", "janhvi", "janhavi", "jaya", "jyoti", "kajal", "kalpana",
  "kamini", "karishma", "kashish", "kavita", "kavya", "khushi", "kirti", "komal",
  "krisha", "kriti", "kshama", "lakshmi", "lavanya", "madhuri", "mahi", "maithili",
  "manasi", "manisha", "mansi", "meera", "megha", "mitali", "mohini", "monika",
  "mukta", "nandini", "neha", "nikita", "nisha", "nishita", "pallavi", "payal",
  "pooja", "poonam", "prajakta", "pranita", "pratiksha", "pratima", "preeti", "priya",
  "priyanka", "rachana", "radhika", "rajashree", "rakhi", "rani", "rashmi", "reena",
  "renuka", "richa", "riddhi", "riya", "rohini", "rucha", "rujuta", "rupali", "sakina",
  "sakshi", "samruddhi", "sanjana", "sapna", "sarika", "savitri", "sejal", "shamal",
  "shilpa", "shivani", "shreya", "shruti", "shweta", "simran", "sneha", "sonali",
  "sonam", "sonal", "srushti", "stuti", "suchita", "sujata", "sukanya", "sunita",
  "supriya", "surabhi", "swara", "swati", "tanvi", "tanisha", "tanishka", "tanushree",
  "tejaswini", "trisha", "trupti", "usha", "vaishali", "vaishnavi", "vandana",
  "varsha", "vedika", "vennela", "vidya", "vinita", "vrunda", "yashashree", "yogita",
  "zainab", "zoya",
]);

const MALE = new Set([
  "aakash", "aayan", "abhay", "abhijeet", "abhijit", "abhinav", "aditya", "ajay",
  "akash", "akshay", "amit", "amol", "aniket", "ankesh", "ankit", "anuj", "anup",
  "anurag", "arjun", "arnav", "aryan", "ashish", "ashok", "atharv", "atul", "ayaan",
  "bhavesh", "bhushan", "charan", "chetan", "chirag", "darshan", "deepak", "dhruv",
  "durvesh", "gaurav", "gaurang", "girish", "harsh", "harshad", "harshvardhan",
  "harkesh", "hemant", "hrithik", "ishaan", "jayesh", "karan", "kartik", "kaustubh",
  "ketan", "krish", "krishna", "kunal", "laksh", "manav", "manish", "mayur", "milind",
  "mohit", "mukul", "nayan", "nikhil", "nilesh", "nitin", "om", "omkar", "parth",
  "pranav", "prasad", "prassana", "prassanna", "pratham", "pratik", "rahul", "raj",
  "rajan", "rajat", "rakesh", "ram", "ramesh", "rohan", "rohit", "ronak", "sachin",
  "sagar", "sahil", "sameer", "samrudh", "sanjay", "sarthak", "saurabh", "shantanu",
  "sharad", "shivam", "shreyas", "siddharth", "soham", "sumit", "suresh", "swapnil",
  "tanmay", "tejas", "tushar", "uday", "umesh", "varun", "vedant", "vikas", "vikram",
  "vinay", "vineet", "vishal", "vivek", "yash", "yashodhana", "yogesh", "anilkumar",
]);

/** Given names that are commonly used for more than one gender. */
const AMBIGUOUS = new Set(["arya", "kiran", "jordan", "alex", "sam", "dev", "jay"]);

function firstToken(name: string) {
  return name
    .toLowerCase()
    .replace(/^(phf\.|rtr\.|dr\.|adv\.|rtn\.)\s*/i, "")
    .replace(/[^a-z\s]/g, " ")
    .trim()
    .split(/\s+/)[0] ?? "";
}

/**
 * Returns "Male", "Female", or "" when the first name cannot be classified.
 * Used only when building member CSV exports.
 */
export function inferGenderFromName(firstName: string, lastName = ""): string {
  const token = firstToken(firstName) || firstToken(lastName);
  if (!token || AMBIGUOUS.has(token)) return "";

  if (FEMALE.has(token)) return "Female";
  if (MALE.has(token)) return "Male";

  if (/(ita|ika|isha|ini|ani|ali|eya|shi|tia)$/.test(token)) return "Female";
  if (/(esh|ith|ant|endra|eet|jit|deep|raj|vir|jeet)$/.test(token)) return "Male";

  return "";
}
