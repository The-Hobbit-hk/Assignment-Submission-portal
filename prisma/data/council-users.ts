import type { UserRole } from "../../src/generated/prisma/client";

export const COUNCIL_PASSWORD = "Rotaract@3131";

export type CouncilUserSeed = {
  name: string;
  email: string;
  title: string;
  role: UserRole;
};

/** District Council 25-26 — login email is the Gmail address from the roster */
export const COUNCIL_USERS: CouncilUserSeed[] = [
  {
    name: "PHF. Rtr. Dr. Karishma Awari",
    email: "rtr.dr.karishmaawari@gmail.com",
    title: "District Rotaract Representative",
    role: "DISTRICT_ADMIN",
  },
  {
    name: "PHF. PDRR. Rtr. Drishti Singh",
    email: "rtrdrishtisingh@gmail.com",
    title: "District Learning Facilitator",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "PHF. Rtr. Harshvardhan Kale",
    email: "rtr.harshvardhan3131@gmail.com",
    title: "District General Secretary",
    role: "DISTRICT_SECRETARY",
  },
  {
    name: "Rtr. Suraj Surkutla",
    email: "rtrsurajsurkutla@gmail.com",
    title: "District Secretary - Administration",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Hamid Shaikh",
    email: "rtn.rtr.hamids@gmail.com",
    title: "District Secretary - Events",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Disha Daga",
    email: "rtrdishadaga@gmail.com",
    title: "District Secretary - Protocols",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Dr. Aishwarya Patil",
    email: "rtr.dr.aishwaryapatil@gmail.com",
    title: "District Secretary - Reporting",
    role: "REPORTING_SECRETARY",
  },
  {
    name: "PHF. Rtr. Sharvindu Jogdand",
    email: "sharvindu@gmail.com",
    title: "District Treasurer",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Dr. Ashlesha Deshpande",
    email: "rtr.drashlesha3131@gmail.com",
    title: "District Club Advisor",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Rohan Puri",
    email: "rohanpuri777@gmail.com",
    title: "Zonal Advisor",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Aniket Sardar",
    email: "anisardar777@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Vedant Chirmade",
    email: "vedant.chirmade@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Vedant Chaudhari",
    email: "vedantpchaudhari41@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Tisha Sancheti",
    email: "tishasancheti2512@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Pratham Pokharkar",
    email: "prathampokharkar10@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Rajas Uchagaonkar",
    email: "an.artful.engineer@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Prem Bansode",
    email: "prembansode.7172@gmail.com",
    title: "District Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Prerna Bhilare",
    email: "prernabhilare11@gmail.com",
    title: "Assistant Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Aditya Verma",
    email: "rtr.adityaverma@gmail.com",
    title: "Assistant Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Shrushti Shirore",
    email: "shrushtishirore@gmail.com",
    title: "Assistant Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Sarthak Ambhore",
    email: "rtr.sarthak.ambhore@gmail.com",
    title: "Assistant Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Rohit Kumbhar",
    email: "rohitkumbhar98@gmail.com",
    title: "Assistant Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Sumedh Gite",
    email: "sumedhgite@gmail.com",
    title: "Assistant Zonal Representative",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Samrudhi Khade",
    email: "samrudhikhade26@gmail.com",
    title: "District Director - Professional Development",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Jayesh Chavan",
    email: "rtrjayeshchavan@gmail.com",
    title: "District Director - Club Service",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "PHF. Rtr. Aslam Dhanani",
    email: "aslam.dhanani20@gmail.com",
    title: "District Director - Community Service",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Vaishnavi Kedari",
    email: "rtr.vaishnavikedari@gmail.com",
    title: "District Co-Director - Community Service",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "PHF. Rtr. Ishan Malawade",
    email: "rtr.ishan.vibrants@gmail.com",
    title: "District Director - International Service",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Pranav Gandhi",
    email: "pranavsgandhi99@gmail.com",
    title: "District Co-Director - International Service",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Shreyas Pathak",
    email: "rtrshreyaspathak@gmail.com",
    title: "District Sergeant-at-Arms",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Snehal Jadhav",
    email: "rtrsnehaljadhav@gmail.com",
    title: "District Sergeant-at-Arms",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Janhavi Yeole",
    email: "janhaviyeole5@gmail.com",
    title: "District Officer - Public Relations",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Salvin Padvi",
    email: "salvinpadvi17@gmail.com",
    title: "District Officer - Public Relations",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Shreeraj Nilkanth",
    email: "sikowitzclicks@gmail.com",
    title: "District Officer - Public Relations",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Shrawani Shendkar",
    email: "shshendkar27@gmail.com",
    title: "District Director - Public Image",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Yash Surti",
    email: "surtiyash07@gmail.com",
    title: "District Editor-in-Chief",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Harshal Nikam",
    email: "a1harshalnikam@gmail.com",
    title: "District Editor",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Abhishek Dixit",
    email: "rtr.abhishekdixit@gmail.com",
    title: "District Editor",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Vageesha Karhadkar",
    email: "vageesha1603@gmail.com",
    title: "District Editor",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Chinmayee Bartakke",
    email: "chinmayee.bartakke14@gmail.com",
    title: "District Director - Diversity, Equity & Inclusion",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Pranav Pisal",
    email: "pranavpisal23@gmail.com",
    title: "District Coordinator - Grants & District Chairperson - RYLA",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Adhishree Thakar",
    email: "adhishree1997@gmail.com",
    title: "District Officer - Rotary Rotaract Relations",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Prajwal Bande",
    email: "prajwalrbande@gmail.com",
    title: "District Officer - Interact Rotaract Relations",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Omkar Patil",
    email: "omkarspatil0608@gmail.com",
    title: "District Director - Membership Development",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Gaurav Golecha",
    email: "rtrgauravgolecha@gmail.com",
    title: "District Officer - Professional Assistance",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Talha Shaikh",
    email: "rtr.talhashaikh@gmail.com",
    title: "District Officer - Professional Assistance",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "PHF. DRRE. Rtr. Sattyajeet Karale Patil",
    email: "sattyajeet.rotaract@gmail.com",
    title: "District Legal Advisor",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Devsharan Singh",
    email: "devsharan52@gmail.com",
    title: "District Coordinator - Website",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Ashi Agarwal",
    email: "ashiagarwal2001@gmail.com",
    title: "District Coordinator - Events",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Faizan Tamboli",
    email: "faijantamboli@gmail.com",
    title: "District Director - Communications",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Sanjana Pawar",
    email: "rtrsanjanapawar@gmail.com",
    title: "District Chairperson - World Rotaract Week",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Vedant Buge",
    email: "rtrvedantbuge@gmail.com",
    title: "District Officer - Without Portfolio",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "PHF. Rtr. Vansh Chawla",
    email: "vanshchawla101@gmail.com",
    title: "District Convenor - District Sports Meet",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Amruta Potdukhe",
    email: "amruta9106potdukhe@gmail.com",
    title: "District Convenor - DRR and Council Installation",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Digvijay Lad",
    email: "digvijayguddu@gmail.com",
    title: "District Convenor - District Trek",
    role: "COUNCIL_MEMBER",
  },
  {
    name: "Rtr. Vijeta Kulkarni",
    email: "vvkulkarni134@gmail.com",
    title: "District Convenor - District Culturals",
    role: "COUNCIL_MEMBER",
  },
];
