/**
 * District dues — members confirmed paid per club.
 * Add more clubs as lists arrive; then run: npm run db:mark-dues-paid
 */

export type DuesPaidMemberEntry =
  | string
  | {
      name: string;
      riId?: string;
    };

export type ClubDuesPaidList = {
  /** Official club name (or unique substring). */
  clubName: string;
  /** RI / district charter id when known — preferred for matching. */
  clubCharterId?: string;
  members: DuesPaidMemberEntry[];
};

export function duesPaidEntryName(entry: DuesPaidMemberEntry) {
  return typeof entry === "string" ? entry : entry.name;
}

export function duesPaidEntryRiId(entry: DuesPaidMemberEntry) {
  return typeof entry === "string" ? undefined : entry.riId?.trim() || undefined;
}

export const DUES_PAID_LISTS: ClubDuesPaidList[] = [
  {
    clubName: "Rotaract Club of Aundh",
    clubCharterId: "91876",
    members: [
      "Omkar Gaikwad",
      "Liza Goyal",
      "Onkar Wagh",
      "Shivam Jayhind Mahabare",
      "Soham Sanjay Athavale",
      "Karan Agnani",
      "Soumitra Bhosale",
      "Akanksha Popat",
      "Arundhati Jadhav",
      "Riddhi Tanwar",
      "Trunal Chavan",
      "Ratanshi Puri",
      "Rounaak Shrivastava",
      "Kaustubh Kakade",
      "Jui Rahul Karkhele",
    ],
  },
  {
    clubName: "Rotaract Club of Sinhgad College of Pharmacy",
    clubCharterId: "8826281",
    members: [
      { name: "Arya Chavan", riId: "12367548" },
      { name: "Amruta Potdukhe", riId: "12366808" },
      { name: "Chaitrali Dave", riId: "12380216" },
      { name: "Prerna Bhilare", riId: "12022291" },
      { name: "Pragama Magotra", riId: "11996355" },
      { name: "Rajadnya Khandale", riId: "12609782" },
      { name: "Sushant Chavan", riId: "12374782" },
      { name: "Prayag Pokale", riId: "12143166" },
      { name: "Ameet Bhosale", riId: "12385238" },
      { name: "Yogiraj Aspingekar", riId: "12434377" },
      { name: "Shubham Pawar" },
      { name: "Geeta Wagh", riId: "12698868" },
      { name: "Aditi Gandhi", riId: "12345797" },
      { name: "Anushka Choudhari", riId: "12378801" },
      { name: "Dhanashri Choudhari", riId: "12374720" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Warje",
    clubCharterId: "91641",
    members: [
      { name: "Manas Jade", riId: "11943151" },
      { name: "Aditya Nimbalkar", riId: "12353538" },
      { name: "Rudra Ombase", riId: "12639359" },
      { name: "Sharvindu Jogdand", riId: "11207152" },
      { name: "Sudarshan Kolhe", riId: "12429964" },
      { name: "Aayushii Bhosaley", riId: "12407102" },
      { name: "Anshul Admane", riId: "12632229" },
      { name: "Mmahek Dudhediya", riId: "12633115" },
      { name: "Komal Naik", riId: "12633110" },
      { name: "Pranali Dhanve", riId: "12489166" },
      { name: "Rohan Bind", riId: "11683316" },
      { name: "Atharva Upasani", riId: "12643020" },
      { name: "Sanika Thete", riId: "12664446" },
      { name: "Devang Ingale", riId: "11565927" },
      { name: "Prem Satav", riId: "12633035" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Mideast",
    clubCharterId: "85530",
    members: [
      { name: "Anushka Sapatnekar", riId: "11501360" },
      { name: "Jay Bhujbal", riId: "12221604" },
      { name: "Vanshita Vaidya", riId: "12252460" },
      { name: "Shreyas Pathak", riId: "11007467" },
      { name: "Sai Awadhani", riId: "11863047" },
      { name: "Akshay Tangade", riId: "11311264" },
      { name: "Nitish Deshpande", riId: "12157571" },
      { name: "Shrinidhi Sankh", riId: "12052994" },
      { name: "Rohan Kokil", riId: "11547959" },
      { name: "Bhakti Makhwana", riId: "12384578" },
      { name: "Rujuta Khare", riId: "12706139" },
      { name: "Anushree Junnarkar", riId: "12391903" },
      { name: "Pranav Mode", riId: "11963146" },
      { name: "Saloni Deshmukh", riId: "11524084" },
      { name: "Unnati Kshatriya", riId: "12511353" },
      { name: "Darpan Jadhav", riId: "10428496" },
      { name: "Sharwari Bhagwat", riId: "12182266" },
      { name: "Arjun Gokhale", riId: "11895155" },
      { name: "Vedant Kherud", riId: "11524677" },
      { name: "Prateek Hanchate", riId: "11853942" },
      { name: "Aayush Sunil Bobade", riId: "12545712" },
      { name: "Vaishnavi Elekar", riId: "12726066" },
      { name: "Pratik Mundada", riId: "11545768" },
      { name: "Sahil Khedekar", riId: "12560197" },
    ],
  },
  {
    clubName: "Rotaract Club of Magarpatta TrendSetters",
    clubCharterId: "8824104",
    members: [
      { name: "Dharshani Satyanarayan", riId: "12271527" },
      { name: "Tashu Dhote", riId: "12271434" },
      { name: "Tanaya Deshpande", riId: "12276734" },
      { name: "Pranav Shikarkhane", riId: "12640492" },
      { name: "Karan Varghese", riId: "11974019" },
      { name: "Ayush Bhoj", riId: "12026594" },
      { name: "Ketan Khatavkar", riId: "12269587" },
      { name: "Advait Sathe", riId: "12269584" },
      { name: "Riya Inamdar", riId: "12303699" },
      { name: "Payas Pawar", riId: "12640802" },
      { name: "Omkar Bagul", riId: "12640131" },
      { name: "Shaunak Deshmukh", riId: "12647312" },
      { name: "Vaishnavi Bhosale", riId: "12640926" },
      { name: "Silky Bhore", riId: "12641146" },
      { name: "Niilee Bafna", riId: "12544887" },
      { name: "Rehan Shaikh", riId: "12671597" },
      { name: "Vageesha Karhadkar", riId: "12270852" },
      { name: "Shriya Kandge", riId: "12640485" },
      { name: "Umar Shaikh", riId: "12673727" },
      { name: "Prasad Waghulde", riId: "12684533" },
      { name: "Deetya Bunnan", riId: "12690295" },
      { name: "Niyati Jagtap", riId: "12670164" },
      { name: "Bhavani Krishnan", riId: "12683205" },
    ],
  },
  {
    clubName: "Rotaract Club of Sancheti Healthcare Academy",
    clubCharterId: "8825271",
    members: [
      { name: "Vaishnavi Katgube", riId: "12514100" },
      { name: "Aditi Jagtap", riId: "12514086" },
      { name: "Bhumika Arolkar", riId: "12514111" },
      { name: "Sarth Gotarne", riId: "12726359" },
      { name: "Sanishka Shetty", riId: "12514061" },
      { name: "Harshu Jaswal", riId: "12726360" },
      { name: "Shravani Kamble", riId: "12726363" },
      { name: "Jiya Parakh", riId: "12726365" },
      { name: "Rutuja Kale", riId: "12726368" },
      { name: "Siddhi Kasture", riId: "12726373" },
      { name: "Aarya Mapari", riId: "12514115" },
      { name: "Tanaya Patil", riId: "12514080" },
      { name: "Palak Galani", riId: "12726372" },
      { name: "Sanjana Sontakke", riId: "12726370" },
      { name: "Saie Mahesh Pawar", riId: "12726366" },
    ],
  },
  {
    clubName: "Rotaract Club of Daund College",
    clubCharterId: "215158",
    members: [
      { name: "Kartiki Palsande", riId: "12491801" },
      { name: "Dheeraj Shasam", riId: "12380247" },
      { name: "Shyam Pawar", riId: "10310079" },
      { name: "Pornima Mane", riId: "10551261" },
      { name: "Pooja Bidgar", riId: "10555463" },
      { name: "Trushna Thorat", riId: "12380244" },
      { name: "Akash Shinde", riId: "10767167" },
      { name: "Hrutukesh Hanchate", riId: "12097073" },
      { name: "Varsha Mallav", riId: "12688619" },
      { name: "Sakshi Jagtap", riId: "12173797" },
      { name: "Anurag Sarode", riId: "11819149" },
      { name: "Prajwal Bande", riId: "11093273" },
      { name: "Prem Bansode", riId: "10767145" },
      { name: "Shekhar Palekar", riId: "10766500" },
      { name: "Aman Lund", riId: "10797080" },
      { name: "Vaibhav Kurhade", riId: "12380240" },
      { name: "Abhishek Wable", riId: "11476489" },
      { name: "Hemangi Bamb", riId: "10036272" },
    ],
  },
  {
    clubName: "Rotaract Club of D. Y. Patil International University",
    clubCharterId: "216012",
    members: [
      { name: "Aarohi Gadpayle", riId: "12697640" },
      { name: "Pehal Vadehra", riId: "12463579" },
      { name: "Suryansh Srivastava", riId: "12685360" },
      { name: "Bhoomi Rastogi", riId: "12685600" },
      { name: "Archi Shankar", riId: "12685313" },
      { name: "Sanjana Pillay", riId: "12441185" },
      { name: "Atharva Jamdade", riId: "12685531" },
      { name: "Aarti", riId: "12686065" },
      { name: "Swarali Ghadge", riId: "12679310" },
      { name: "Gauri Diwan", riId: "12729455" },
      { name: "Suhani Roy", riId: "12685629" },
      { name: "Siddhant Shintre", riId: "12685452" },
      { name: "Vansh Singh Dang", riId: "12463284" },
      { name: "Tanish Shinde", riId: "12463685" },
      { name: "Sushant Pachbhai", riId: "12685356" },
      { name: "Manasvi Mawal", riId: "12706873" },
      { name: "Sahil Nelge", riId: "12685593" },
      { name: "Pawani Sharma", riId: "12685833" },
      { name: "Prathamesh Ugale Patil", riId: "12685826" },
    ],
  },
  {
    clubName: "Rotaract Club of Pimpri",
    clubCharterId: "7295",
    members: [
      { name: "Swasti Rai", riId: "11598813" },
      { name: "Resham Pachisia", riId: "12430870" },
      { name: "Amrutha Varshini", riId: "12185115" },
      { name: "Shruti Pagade", riId: "12186307" },
      { name: "Sahil Nahata", riId: "12483507" },
      { name: "Vansh Chawla", riId: "11283767" },
      { name: "Chandrashekhar Mahant", riId: "10843427" },
      { name: "Shreya Nayak", riId: "12483488" },
      { name: "Chaitanya Santosh Shelke", riId: "12476855" },
      { name: "Abha Chitale", riId: "12483492" },
      { name: "Prachi Mavani", riId: "12483497" },
      { name: "Dnyaneshwar Nagargoje", riId: "12186261" },
      { name: "Parineeta Bhattacharya", riId: "12476858" },
      { name: "Purva Kisan Nigade", riId: "12186661" },
      { name: "Shubham Raut", riId: "10843354" },
      { name: "Srijan", riId: "12185122" },
      { name: "Aryan Datta", riId: "12269221" },
      { name: "Vedant Chirmade", riId: "12159318" },
      { name: "Samika Kulkarni", riId: "12466212" },
      { name: "Sarthak Ambhore", riId: "12186196" },
      { name: "Shanayu Dinesh Patil", riId: "12731450" },
      { name: "Shreyas Lanke", riId: "12476859" },
      { name: "Mehul Ashok Solanki", riId: "11249128" },
      { name: "Shubham Singh", riId: "12731458" },
      { name: "Disha Uday Deshpande", riId: "11893322" },
      { name: "Rahul Chandran", riId: "11598806" },
      { name: "Aditi Abhay Joshi", riId: "9194432" },
      { name: "Aniket Dashrath Bhilare", riId: "11934314" },
      { name: "Pranav Vinayak Pisal", riId: "12159320" },
      { name: "Ashwin Achari", riId: "11726889" },
      { name: "Aditya Jadhav", riId: "11598812" },
      { name: "Rohit Madhusoothanan Poduwal", riId: "11818476" },
      { name: "Monalisha Biswal", riId: "12397017" },
      { name: "Palak Rawat", riId: "11893018" },
      { name: "Sheetal C", riId: "11893335" },
      { name: "Veerbhadra S Mahant", riId: "12731448" },
      { name: "Abhishek Fulwade", riId: "11598821" },
      { name: "Shraddha Jadhav", riId: "11598801" },
      { name: "Vedant Chaudhari", riId: "12159316" },
      { name: "Riddhi Manoj Sethia", riId: "12186567" },
      { name: "Gaurav Patel", riId: "12731446" },
      { name: "Abhishek Khandait", riId: "11818472" },
      { name: "Suraj Lawande", riId: "12731432" },
      { name: "Gunesh Pande", riId: "12731442" },
      { name: "Tanvi Kothawade", riId: "12483499" },
      { name: "Vinita Rana", riId: "12322957" },
      { name: "Shiv Bhushan Bhatele", riId: "12731436" },
      { name: "Sathvik Nayak", riId: "11932988" },
      { name: "Yash Mane", riId: "12250716" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Camp Next Gen",
    clubCharterId: "217270",
    members: [
      { name: "Prajwal Lamkhade", riId: "12137295" },
      { name: "Janhavi Khopade", riId: "12125804" },
      { name: "Romit Jain", riId: "11836266" },
      { name: "Jainam Jain", riId: "12144180" },
      { name: "Aaryan Musale", riId: "12412438" },
      { name: "Sakina Vora", riId: "12157887" },
      { name: "Abizer Poonawala", riId: "12157076" },
      { name: "Arham Bedmutha", riId: "12180121" },
      { name: "Amey Gojamgunde", riId: "12204550" },
      { name: "Tisha Sancheti", riId: "11836611" },
      { name: "Kedar Vinchurkar", riId: "12496487" },
      { name: "Sanyukta Waghmare", riId: "11308989" },
      { name: "Mohammad Choonawala", riId: "12146328" },
      { name: "Indraneil Sajjankar", riId: "12126538" },
      { name: "Gargi Sawashe", riId: "12482481" },
    ],
  },
  {
    clubName: "Rotaract Club of Rajarshi Shahu College of Engineering- Tathawade",
    clubCharterId: "215402",
    members: [
      { name: "Shrishail Shivprasad Chavan", riId: "12179934" },
      { name: "Vedika O Udhan", riId: "12333340" },
      { name: "Mayur Sandip Bharmal", riId: "12412238" },
      { name: "Shivam Anil Labhshetwar", riId: "12471619" },
      { name: "Soham Mohan Shinde", riId: "12630682" },
      { name: "Sarthak Suhas Bhosale", riId: "12471620" },
      { name: "Vedant Sharad Bhilare", riId: "12460688" },
      { name: "Kaustubh Digambar Patil", riId: "12179825" },
      { name: "Prajakta Atul Chaudhari", riId: "12636668" },
      { name: "Harsh Subodh Kantayan", riId: "12636684" },
      { name: "Atharv Navnath Gawate", riId: "12412265" },
      { name: "Santosh Ashok Sanap", riId: "12636985" },
      { name: "Dhruvika Vijay Kate", riId: "12463593" },
      { name: "Shreya Kailas Dhumal", riId: "12461146" },
      { name: "Ayush Gajanan Gaurkar", riId: "12461279" },
      { name: "Siddhesh Prashant Ladkat", riId: "12460985" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Aurora",
    clubCharterId: "8827500",
    members: [
      { name: "Pratham Pokharkar", riId: "11815224" },
      { name: "Rajveer Suryawanshi", riId: "11812968" },
      { name: "Hardik Sheth", riId: "11812951" },
      { name: "Wachas Pati", riId: "11812947" },
      { name: "Aakash Sable", riId: "12400728" },
      { name: "Shrushti Shirore", riId: "12223932" },
      { name: "Reet Jalori", riId: "12724462" },
      { name: "Jiya Bhandari", riId: "12724022" },
      { name: "Gaurav Patil", riId: "12724950" },
      { name: "Digivijay Chavan", riId: "12388780" },
      { name: "Aakanksha Patel", riId: "11812898" },
      { name: "Mansi Bochgire", riId: "11813099" },
      { name: "Salvin Padvi", riId: "12069414" },
      { name: "Pratik Kamthe", riId: "12399320" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Westside",
    clubCharterId: "8826885",
    members: [
      { name: "Afnan Shaikh", riId: "11059294" },
      { name: "Tanish Phade", riId: "12224090" },
      { name: "Aditi Gunda", riId: "12404524" },
      { name: "Triveni Phade", riId: "12648264" },
      { name: "Anushka Thombare", riId: "12444080" },
      { name: "Madhura Pethkar", riId: "12681975" },
      { name: "Tejas Sheth", riId: "12685834" },
      { name: "Gandharva Nagvekar", riId: "12445502" },
      { name: "Shashi Jayshette", riId: "12682408" },
      { name: "Anushka Shingade", riId: "12678232" },
      { name: "Moli", riId: "12677713" },
      { name: "Prachi Khaladkar", riId: "12677768" },
      { name: "Laksh Surana", riId: "12681919" },
      { name: "Diksha Mahmuni", riId: "12685565" },
      { name: "Shreya Deshpande", riId: "12536689" },
    ],
  },
  {
    clubName: "Rotaract Club of Roar NIBM",
    clubCharterId: "8827434",
    members: [
      { name: "Aditya Karad", riId: "11515727" },
      { name: "Krishi Agarwal", riId: "12556045" },
      { name: "Aditya Jain", riId: "12472224" },
      { name: "Vanshika Garodia", riId: "12684530" },
      { name: "Mansi Matur", riId: "12109707" },
      { name: "Ashi Agarwal", riId: "11763775" },
      { name: "Tanishk Agarwal" },
      { name: "Labdhi Jain", riId: "11829640" },
      { name: "Aryan Ajay Dhalpawar", riId: "12644371" },
      { name: "Omkar Mahajan", riId: "12396996" },
      { name: "Nasiruddin Sayyed", riId: "12397057" },
      { name: "Rohana Gupta", riId: "12684522" },
      { name: "Granth Kariya", riId: "12643980" },
      { name: "Zahra Bahrainwala", riId: "10526569" },
      { name: "Saurav Dhamdhere", riId: "12576477" },
      { name: "Aditi Jagdale", riId: "12730080" },
      { name: "Harshita Agarwal", riId: "12644032" },
      { name: "Yashashree Shinde", riId: "12709065" },
      { name: "Parth Gujarathi", riId: "11180781" },
      { name: "Ajay Phirke" },
    ],
  },
  {
    clubName: "Rotaract Club of Pune Heritage",
    clubCharterId: "213166",
    members: [
      { name: "Nupura Danait", riId: "12396101" },
      { name: "Soham Naik", riId: "12206307" },
      { name: "Riya Chandavale", riId: "12206302" },
      { name: "Archit Tathawadekar", riId: "12477318" },
      { name: "Ishita Chaubal", riId: "11998536" },
      { name: "Aneesh Ladkat", riId: "12206299" },
      { name: "Harshal Nikam", riId: "12346183" },
      { name: "Tanishka Patekar", riId: "12379204" },
      { name: "Ira Lad", riId: "12692818" },
      { name: "Aarya Godbole", riId: "11944083" },
      { name: "Nishtha Khare", riId: "12379306" },
      { name: "Shubham Deshpande", riId: "11218198" },
      { name: "Yashali Shirodkar", riId: "12421740" },
      { name: "Prathamesh Shejwadkar", riId: "12346163" },
      { name: "Shivani Kulkarni", riId: "12404472" },
      { name: "Geet Rasane", riId: "12703494" },
      { name: "Ashlesha Deshpande", riId: "11004224" },
      { name: "Saiee Belitkar", riId: "12206306" },
      { name: "Mihika Mehendale", riId: "12404463" },
      { name: "Sharvil Survey", riId: "12698172" },
      { name: "Soumitra Lokur", riId: "11217717" },
      { name: "Aarya Rawetkar", riId: "12700730" },
      { name: "Rutuja Tarkunde", riId: "12702285" },
      { name: "Rashee Behra", riId: "12732290" },
      { name: "Omkar Tonde", riId: "11218207" },
    ],
  },
  {
    clubName: "Rotaract Club of Viman Nagar",
    clubCharterId: "215996",
    members: [
      { name: "Ananya Sharma", riId: "12420798" },
      { name: "Siddhant Jaiswal", riId: "12420390" },
      { name: "Richelle Aranjo", riId: "12395653" },
      { name: "Vibhushan Gupta Komaraveli", riId: "11963332" },
      { name: "Rohtash Uday Garg", riId: "12176013" },
      { name: "Hypatia Gomes", riId: "12698907" },
      { name: "Aruna Suresh", riId: "12170441" },
      { name: "Aman Bin Riyaz", riId: "12698939" },
      { name: "Srikanth Pochiraju", riId: "12698902" },
      { name: "Ishani Manvi", riId: "12723412" },
      { name: "Nicole Dgama", riId: "12698889" },
      { name: "Vishaakh Iyer", riId: "12498418" },
      { name: "Chinmayee B", riId: "12170444" },
      { name: "Prerna Singamaneni", riId: "12709952" },
      // Sheet reused Rohtash's RI ID; match Srishti by name only.
      { name: "Srishti Garg" },
      { name: "Paras Dhuliya", riId: "12698917" },
      { name: "Maanav Shah", riId: "12698898" },
      { name: "Shaurya Talewar", riId: "12271301" },
      { name: "Pratik", riId: "12709969" },
      { name: "Shravani Kalidas Satav", riId: "12723358" },
    ],
  },
  {
    clubName: "Rotaract Club of Bibwewadi Pune",
    clubCharterId: "215167",
    members: [
      { name: "Anisha Shah", riId: "12481849" },
      { name: "Saee Mali", riId: "12467476" },
      { name: "Piyush Gadiya", riId: "12673964" },
      { name: "Raj Lodha", riId: "12674141" },
      { name: "Aditya Jagtap", riId: "12673968" },
      { name: "Anushka Jhawar", riId: "10993071" },
      { name: "Krishita Bafna", riId: "12488824" },
      { name: "Ayush Lunkad", riId: "12676588" },
      { name: "Moksha Shah", riId: "12256622" },
      { name: "Ansh Agarwal", riId: "12682518" },
      { name: "Hiral Bagai", riId: "12682876" },
      { name: "Siddhi Mundada", riId: "12683070" },
      { name: "Aishwarya Kotkar", riId: "12459224" },
      { name: "Rishabh Solanki", riId: "12685322" },
      { name: "Pritesh Gadiya", riId: "11480636" },
      { name: "Drishti Oswal", riId: "12685804" },
      { name: "Nitansh Porwal", riId: "12238715" },
      { name: "Nitesh Jaisinghani", riId: "12688530" },
      { name: "Pranav Gandhi", riId: "12224094" },
      { name: "Atharva Pardesi", riId: "12026471" },
      { name: "Sahil Oswal", riId: "11819634" },
      { name: "Ronak Parekh", riId: "12677922" },
      { name: "Akanksha Navale", riId: "12380621" },
      { name: "Ansh Gandhi", riId: "12353937" },
      { name: "Diya Shah", riId: "12675824" },
      { name: "Tanishq Bhandari", riId: "12688692" },
      { name: "Anay Jain", riId: "12688250" },
      { name: "Anura Ostwal", riId: "12683196" },
      { name: "Vandan Lalwani", riId: "12468559" },
      { name: "Utsav Sethiya", riId: "12458916" },
      { name: "Darshana Bora", riId: "12470259" },
      { name: "Vaibhav Bhandari", riId: "12685841" },
      { name: "Avantika Dhanashetti", riId: "12708290" },
      { name: "Vedika Bhutada", riId: "12704294" },
      { name: "Sachi Solanki", riId: "12469931" },
      { name: "Rohit Gundesha", riId: "12412032" },
      { name: "Vinit Katariya", riId: "12686625" },
      { name: "Viraj Soni", riId: "12365251" },
      { name: "Vansh Jain", riId: "12675059" },
      { name: "Devansh Mehta", riId: "12026465" },
      { name: "Aditya Pagariya", riId: "12688649" },
      { name: "Stuti Bhanushali", riId: "11834169" },
      { name: "Pratik Lalwani", riId: "12690860" },
      { name: "Dhairya Parekh", riId: "12707316" },
      { name: "Kashish Jain", riId: "11820283" },
      { name: "Nidhi Soni", riId: "12703061" },
      { name: "Lavish Lodha", riId: "12255463" },
      { name: "Siddhi Lunkad", riId: "12709090" },
      { name: "Sanjog Bora", riId: "12489859" },
      { name: "Krisha Rathod", riId: "12690355" },
      { name: "Kushal Shah", riId: "12630530" },
      { name: "Sneha Jain", riId: "11873767" },
      { name: "Disha Daga", riId: "11170853" },
      { name: "Juily Bhoite", riId: "12710451" },
      { name: "Roshni Rathod", riId: "12710094" },
      { name: "Jinay Jain", riId: "12710247" },
      { name: "Vardhaman Gugale", riId: "12710456" },
      { name: "Tanisha Jain", riId: "12715210" },
      { name: "Lavesh Punmiya", riId: "12690868" },
      { name: "Sujal Yadav", riId: "12193386" },
      { name: "Jainam Shah", riId: "12716013" },
      { name: "Yash Parmar", riId: "12026464" },
      { name: "Kabir Singh", riId: "12725880" },
      { name: "Sanket Jain", riId: "10577116" },
    ],
  },
  {
    clubName: "Rotaract Club of Panvel Industrial Town",
    clubCharterId: "213849",
    members: [
      { name: "Manaswi Baikar", riId: "11818621" },
      { name: "Sarthak Kawanpure", riId: "9936875" },
      { name: "Kanak Bhagat", riId: "12116799" },
      { name: "Shreeraj Nilkanth", riId: "12000502" },
      { name: "Shreya Bhide", riId: "12122745" },
      { name: "Trushank Arwel", riId: "12185126" },
      { name: "Hector Vohra", riId: "10108015" },
      { name: "Shefali Shinde", riId: "12000460" },
      { name: "Avehi Batale", riId: "11063433" },
      { name: "Divesh Dugar", riId: "12560355" },
      { name: "Raunak Dipak Jain", riId: "12697097" },
      { name: "Aditya Mukherjee", riId: "12576065" },
      { name: "Chirag Bhagat", riId: "9622602" },
      { name: "Mihika Bhagat", riId: "11262948" },
      { name: "Mustafa Golwala", riId: "10106621" },
      { name: "Yash Sanjay Jain", riId: "10093844" },
      { name: "Rhugved Kandpile", riId: "10106626" },
      { name: "Jyogprabha Panda", riId: "10108041" },
      { name: "Prem Pote", riId: "10107359" },
      { name: "Durva Nerkar", riId: "12398631" },
      { name: "Saket Sachin Joshi", riId: "10374959" },
      { name: "Anirudh Sawlekar", riId: "10108061" },
    ],
  },
  {
    clubName: "Rotaract Club of Nigdi-Pune",
    clubCharterId: "8825815",
    members: [
      { name: "Sailendra Betu", riId: "11860934" },
      { name: "Ajay Nehra", riId: "10999456" },
      { name: "Deeya Lasaria", riId: "12343800" },
      { name: "Onkar Salunke", riId: "11818697" },
      { name: "Advait Dalal", riId: "12344318" },
      { name: "Yash Mishra", riId: "11967048" },
      { name: "Ivan Joshua", riId: "11277124" },
      { name: "Divesh Panjabi", riId: "11829632" },
      { name: "Omkar Pawar", riId: "11584025" },
      { name: "Priya Bhagwani", riId: "12686491" },
      { name: "Gunjan Chaudhari", riId: "11018579" },
      { name: "Janya Chinappa", riId: "12423752" },
      { name: "Jannika Chinappa", riId: "12423751" },
      { name: "Sharwari Dashputre", riId: "11584597" },
      { name: "Arnav Datta", riId: "11126181" },
      { name: "Sandhyarani Kolnure", riId: "12424618" },
      { name: "Sagar Gaikwad", riId: "11583950" },
    ],
  },
  {
    clubName: "Rotaract Club of Bavdhan Pioneers",
    clubCharterId: "8827103",
    members: [
      { name: "Sahasra Koppala", riId: "12298125" },
      { name: "Khushi Malhotra", riId: "12298134" },
      { name: "Risha Mridha", riId: "12460364" },
      { name: "Arnav Tavargeri", riId: "12460837" },
      { name: "Devanshi Mitra", riId: "12298109" },
      { name: "Rohit Kumbhar", riId: "10964797" },
      { name: "Yosha Roy", riId: "12658295" },
      { name: "Mothukuri Sankara Shishir Vasista", riId: "12692343" },
      { name: "Sachi Saraf", riId: "12732759" },
      { name: "Aaishah Thameem", riId: "12732121" },
      { name: "Pratishtha Agarwal", riId: "12732752" },
      { name: "Aanya Garg", riId: "12732706" },
      // Sheet reused PRO RI ID; match Chetna by name only.
      { name: "Chetna Ramakhyani" },
      { name: "Manas Patil", riId: "12299143" },
      { name: "Nishika Pherwani", riId: "2298128" },
      { name: "Vennela M Chandra", riId: "12732672" },
      { name: "Shreya Sandbhor", riId: "12499840" },
      { name: "Harshvardhan Kale", riId: "10843281" },
      { name: "Riya Bhalerao", riId: "12338610" },
      { name: "Anishka Sachdev", riId: "12299127" },
      { name: "Bhavya Mimani" },
      { name: "Tanishka Narsaria" },
    ],
  },
];

/** Normalize person names for dues matching. */
export function normalizePersonName(name: string) {
  return name
    .toLowerCase()
    .replace(/^(phf\.|rtr\.|dr\.|adv\.|rtn\.)\s*/gi, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function memberDisplayName(firstName: string, lastName: string) {
  return normalizePersonName(`${firstName} ${lastName}`);
}

function tokensInOrder(needle: string[], haystack: string[]) {
  let from = 0;
  for (const token of needle) {
    const idx = haystack.indexOf(token, from);
    if (idx === -1) return false;
    from = idx + 1;
  }
  return true;
}

/** Tiny edit-distance for common spelling variants (Rounaak / Rounak). */
function almostEqual(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  const longer = a.length >= b.length ? a : b;
  const shorter = a.length >= b.length ? b : a;
  if (longer.includes(shorter) && longer.length - shorter.length <= 2) return true;

  let mismatches = 0;
  let i = 0;
  let j = 0;
  while (i < longer.length && j < shorter.length) {
    if (longer[i] === shorter[j]) {
      i += 1;
      j += 1;
      continue;
    }
    mismatches += 1;
    if (mismatches > 2) return false;
    if (longer.length > shorter.length) i += 1;
    else if (shorter.length > longer.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  mismatches += longer.length - i + (shorter.length - j);
  return mismatches <= 2;
}

/**
 * True when the paid-list name matches a roster member.
 * Allows middle-name differences when all paid tokens appear in order.
 */
export function namesMatch(paidName: string, firstName: string, lastName: string) {
  const paid = normalizePersonName(paidName);
  const full = memberDisplayName(firstName, lastName);
  if (!paid || !full) return false;
  if (paid === full) return true;

  const paidTokens = paid.split(" ").filter(Boolean);
  const fullTokens = full.split(" ").filter(Boolean);
  if (paidTokens.length === 0 || fullTokens.length === 0) return false;

  // Exact token multiset match (order-insensitive).
  if (
    paidTokens.length === fullTokens.length &&
    [...paidTokens].sort().join("|") === [...fullTokens].sort().join("|")
  ) {
    return true;
  }

  if (tokensInOrder(paidTokens, fullTokens)) return true;
  if (paidTokens.every((token) => fullTokens.includes(token))) return true;

  // First + last token match when member has middle name(s).
  if (paidTokens.length >= 2 && fullTokens.length >= 2) {
    const paidFirst = paidTokens[0];
    const paidLast = paidTokens[paidTokens.length - 1];
    const fullFirst = fullTokens[0];
    const fullLast = fullTokens[fullTokens.length - 1];
    if (paidFirst === fullFirst && paidLast === fullLast) return true;
    if (almostEqual(paidFirst, fullFirst) && almostEqual(paidLast, fullLast)) return true;
  }

  return false;
}
