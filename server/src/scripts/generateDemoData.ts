import fs from 'fs';
import path from 'path';

export interface EmailData {
  id: string;
  sender: string;
  senderName: string;
  recipient: string;
  cc?: string[];
  subject: string;
  body: string;
  timestamp: string; // ISO
  dateFormatted: string;
  category: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priorityScore: number;
  priorityReason: string;
  categoryReason: string;
  summary: string;
  actionRequired: boolean;
  actionText?: string;
  actionDeadline?: string;
  deadlineDate?: string;
  eventDate?: string;
  location?: string;
  affectedGroup?: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  tags: string[];
  isRead: boolean;
  isActionCompleted?: boolean;
  source: 'demo' | 'gmail';
  attachments?: { name: string; size: string; type: string }[];
  threadId?: string;
  isNoise?: boolean; // noise outside university domain
}

const baseEmails: EmailData[] = [
  // 1. SHOWCASE EMAIL 1 - CRITICAL
  {
    id: "email-001",
    sender: "examinations@northbridgeuniversity.edu",
    senderName: "Office of the Controller of Examinations",
    recipient: "muthu@northbridgeuniversity.edu",
    cc: ["hod.cse@northbridgeuniversity.edu"],
    subject: "URGENT: Examination Hall Changed for Tomorrow",
    body: `Dear Muthu and CSE Batch 2026 Students,

Please take urgent note that due to technical maintenance in the Block A server room, the venue for tomorrow's CSE302 (Database Management Systems) Mid-Semester Examination scheduled for 9:00 AM has been relocated.

New Venue: Block C, Hall 204 (Second Floor)
Previous Venue: Block A, Main Hall

All students must report to Block C, Hall 204 at least 20 minutes prior to commencement (by 8:40 AM) with their University Identity Card and Hall Ticket.

Seating arrangements will be posted outside Hall 204. Any student reporting to Block A will risk missing the exam commencement.

Regards,
Dr. A. R. Sharma
Controller of Examinations
Northbridge University`,
    timestamp: "2026-09-29T08:15:00.000Z",
    dateFormatted: "Sep 29, 2026 · 8:15 AM",
    category: "EXAMS",
    priority: "CRITICAL",
    priorityScore: 98,
    priorityReason: "Tomorrow morning's mid-semester examination venue has moved from Block A to Block C Hall 204. Missing this notice causes immediate exam disqualification.",
    categoryReason: "The email directly modifies examination logistics, scheduling, and venue requirements.",
    summary: "Tomorrow's CSE302 exam relocated from Block A to Block C, Hall 204. Must report by 8:40 AM.",
    actionRequired: true,
    actionText: "Report to Block C Hall 204 by 8:40 AM with ID card for CSE302 exam",
    actionDeadline: "Tomorrow, 8:40 AM",
    deadlineDate: "2026-09-30T08:40:00.000Z",
    eventDate: "2026-09-30T09:00:00.000Z",
    location: "Block C – Hall 204",
    affectedGroup: "CSE Semester 3 Students",
    urgency: "CRITICAL",
    tags: ["exam", "venue-change", "urgent", "cse302"],
    isRead: false,
    source: "demo",
    attachments: [
      { name: "CSE302_Hall_Seating_Plan.pdf", size: "340 KB", type: "application/pdf" }
    ],
    threadId: "thread-midsem-cse"
  },

  // 2. SHOWCASE EMAIL 2 - HIGH
  {
    id: "email-002",
    sender: "attendance@northbridgeuniversity.edu",
    senderName: "Attendance & Academic Monitoring Cell",
    recipient: "muthu@northbridgeuniversity.edu",
    cc: ["counselor.cse@northbridgeuniversity.edu"],
    subject: "Attendance Shortage Notice – CSE Students",
    body: `Dear Muthu (Reg No: 2024-CSE-0842),

This is an official intimation that your cumulative attendance in CS301 (Data Structures) and CS303 (Computer Architecture) has fallen to 68.4%, which is below the mandatory university threshold of 75.0%.

Under University Regulation Sec 4.2, students with attendance below 75% will be debarred from appearing in the End-Semester Laboratory and Theory examinations unless a formal medical certificate or authorized institutional duty letter is submitted.

REQUIRED ACTION:
1. Download the Attendance Condonation & Explanation Form from the student ERP portal.
2. Get it endorsed by your Faculty Counselor.
3. Submit the physical signed copy to Room 114, Administrative Block before Friday, October 2, 2026, 5:00 PM.

Failure to submit by this deadline will result in an immediate Exam Debarment Notice.

Academic Monitoring Committee,
Northbridge University`,
    timestamp: "2026-09-29T07:45:00.000Z",
    dateFormatted: "Sep 29, 2026 · 7:45 AM",
    category: "ATTENDANCE",
    priority: "HIGH",
    priorityScore: 92,
    priorityReason: "Current attendance is 68.4% (below mandatory 75%). An official condonation explanation must be submitted before Friday 5:00 PM to prevent exam debarment.",
    categoryReason: "The email is an official attendance shortage notice with academic debarment consequences.",
    summary: "Attendance is 68.4% (below 75%). Submit condonation explanation to Room 114 before Friday 5 PM.",
    actionRequired: true,
    actionText: "Submit attendance condonation form endorsed by faculty counselor before Friday 5 PM",
    actionDeadline: "Friday, Oct 2, 2026 · 5:00 PM",
    deadlineDate: "2026-10-02T17:00:00.000Z",
    location: "Room 114, Administrative Block",
    affectedGroup: "Muthu (Reg No: 2024-CSE-0842)",
    urgency: "HIGH",
    tags: ["attendance", "shortage", "condonation", "debarment-risk"],
    isRead: false,
    source: "demo",
    attachments: [
      { name: "Attendance_Explanation_Form_2026.pdf", size: "185 KB", type: "application/pdf" }
    ],
    threadId: "thread-attendance-shortage"
  },

  // 3. SHOWCASE EMAIL 3 - HIGH
  {
    id: "email-003",
    sender: "transport@northbridgeuniversity.edu",
    senderName: "Campus Fleet & Transport Services",
    recipient: "students@northbridgeuniversity.edu",
    subject: "Bus Route 4 Delayed Tomorrow Morning",
    body: `Notice to all students and faculty using Campus Route 4 (North Suburbs to Campus):

Due to emergency hydraulic repair and suspension maintenance on Bus Fleet #14, Bus Route 4 will operate with a 20-minute delay tomorrow morning (Wednesday, Sept 30).

Schedule adjustment:
- First pick-up point (Maple Cross): 7:35 AM (instead of 7:15 AM)
- Metro Station Junction: 7:55 AM (instead of 7:35 AM)
- Expected Campus Arrival: 8:45 AM

Drop-off & pick-up will strictly be at Gate 2 Bus Bay instead of the Main Administration Gate due to road resurfacing.

Students with 9:00 AM mid-semester exams residing along Route 4 are strongly advised to take Metro Line 2 or Campus Route 2B to prevent late arrival.

Transport Officer,
Northbridge Campus Transit`,
    timestamp: "2026-09-29T06:30:00.000Z",
    dateFormatted: "Sep 29, 2026 · 6:30 AM",
    category: "TRANSPORT",
    priority: "HIGH",
    priorityScore: 86,
    priorityReason: "Bus Route 4 delayed by 20 minutes tomorrow morning and relocated to Gate 2. Clashes directly with morning 9 AM examinations.",
    categoryReason: "The email contains transit route delays, revised pick-up times, and campus gate relocation.",
    summary: "Route 4 delayed by 20 mins tomorrow; drop-off moved to Gate 2. Exam students should use Route 2B or Metro.",
    actionRequired: true,
    actionText: "Board Route 4 at delayed time (7:35 AM) or use Metro Line 2 to arrive before 8:40 AM exam cutoff",
    actionDeadline: "Tomorrow, 7:35 AM",
    deadlineDate: "2026-09-30T07:35:00.000Z",
    location: "Gate 2 Bus Bay",
    affectedGroup: "Route 4 Commuters",
    urgency: "HIGH",
    tags: ["transport", "bus", "route-4", "delay", "gate-2"],
    isRead: false,
    source: "demo",
    threadId: "thread-transport-transit"
  },

  // 4. SHOWCASE EMAIL 4 - MEDIUM
  {
    id: "email-004",
    sender: "academics@northbridgeuniversity.edu",
    senderName: "Prof. Rajesh Kumar (Dept of CSE)",
    recipient: "cse-sem3@northbridgeuniversity.edu",
    subject: "Assignment Submission Deadline Extended – CS304 Machine Learning",
    body: `Dear Students of CS304,

In consideration of the ongoing Mid-Semester Examinations and multiple student requests received through your class representative, the submission deadline for Assignment 2 (Support Vector Machines & Neural Network implementation) has been extended.

- Original Deadline: Today, Sept 29, 11:59 PM
- New Revised Deadline: Sunday, October 4, 2026, 11:59 PM

Please ensure your Jupyter Notebook (.ipynb) and GitHub repository links are submitted via Google Classroom or the University LMS portal. Late submissions beyond Sunday will carry a 10% penalty per day.

Office hours remain Wednesday 3:00 PM – 5:00 PM in Tech Tower Room 408.

Best regards,
Prof. Rajesh Kumar
Associate Professor, AI & ML Division`,
    timestamp: "2026-09-29T05:00:00.000Z",
    dateFormatted: "Sep 29, 2026 · 5:00 AM",
    category: "ASSIGNMENTS",
    priority: "MEDIUM",
    priorityScore: 64,
    priorityReason: "Assignment 2 submission deadline has been postponed to Oct 4. Relieves immediate stress but requires action before Sunday.",
    categoryReason: "Relates to academic coursework, assignment deadlines, and submission requirements.",
    summary: "CS304 ML Assignment 2 deadline extended to Sunday, October 4, 11:59 PM via LMS.",
    actionRequired: true,
    actionText: "Submit CS304 Assignment 2 notebook and repo link on LMS before Oct 4",
    actionDeadline: "Sunday, Oct 4, 2026 · 11:59 PM",
    deadlineDate: "2026-10-04T23:59:00.000Z",
    location: "Tech Tower Room 408",
    affectedGroup: "CS304 Machine Learning Students",
    urgency: "MEDIUM",
    tags: ["assignment", "extension", "cs304", "deadline"],
    isRead: true,
    source: "demo",
    threadId: "thread-cs304-course"
  },

  // 5. SHOWCASE EMAIL 5 - LOW
  {
    id: "email-005",
    sender: "clubs@northbridgeuniversity.edu",
    senderName: "Aperture Photography Club",
    recipient: "all-students@northbridgeuniversity.edu",
    subject: "Photography Club Recruitment & Orientation 2026",
    body: `Hey Campus Photographers & Visual Storytellers! 📸

Aperture — The Official Northbridge University Photography and Media Club is recruiting new members for the academic year 2026-27!

Whether you shoot on a Sony Alpha, Canon DSLR, or just your smartphone with an eye for angles, we welcome all enthusiasts.

Orientation & Portfolio Review:
- Date: Saturday, October 3, 2026
- Time: 4:30 PM
- Venue: Student Activity Center (SAC) Room 102
- Refreshments provided!

Fill out the RSVP form at clubs.northbridgeuniversity.edu/aperture.

Cheers,
Aperture Core Team`,
    timestamp: "2026-09-28T16:20:00.000Z",
    dateFormatted: "Sep 28, 2026 · 4:20 PM",
    category: "CLUBS",
    priority: "LOW",
    priorityScore: 28,
    priorityReason: "Extracurricular club orientation and social recruitment. No academic or regulatory penalty for skipping.",
    categoryReason: "Student club event, social activity, and extracurricular recruitment.",
    summary: "Aperture Photography Club orientation and recruitment on Saturday Oct 3 at SAC Room 102.",
    actionRequired: false,
    actionText: "RSVP online if interested in joining Photography club",
    actionDeadline: "Oct 3, 2026 · 4:30 PM",
    eventDate: "2026-10-03T16:30:00.000Z",
    location: "Student Activity Center (SAC) Room 102",
    affectedGroup: "All Students",
    urgency: "LOW",
    tags: ["clubs", "photography", "orientation", "sac"],
    isRead: false,
    source: "demo",
    threadId: "thread-clubs-aperture"
  },

  // 6. SHOWCASE EMAIL 6 - HIGH
  {
    id: "email-006",
    sender: "fees@northbridgeuniversity.edu",
    senderName: "Office of the Finance Officer",
    recipient: "muthu@northbridgeuniversity.edu",
    subject: "Fee Payment Deadline Reminder – Fall Semester 2026",
    body: `Dear Muthu,

Our records indicate that the second installment of your Fall Semester 2026 Tuition and Laboratory Fee (Amount: $1,450.00 / INR 85,000) remains pending.

The final date for payment without late surcharge is Monday, October 5, 2026, 5:00 PM.

Key implications:
- Payments after Oct 5 will attract an institutional late fee of $100 / INR 5,000.
- Unpaid accounts after Oct 10 will have course registration and grade portal access temporarily frozen.

Please pay online via NetBanking, UPI, or Credit Card on the portal:
fees.northbridgeuniversity.edu/pay?ref=STU842

Finance & Accounts Division,
Northbridge University`,
    timestamp: "2026-09-28T14:10:00.000Z",
    dateFormatted: "Sep 28, 2026 · 2:10 PM",
    category: "FEES",
    priority: "HIGH",
    priorityScore: 89,
    priorityReason: "Unpaid tuition installment due Oct 5. Late surcharge of $100 applied after deadline, and course portal will be frozen if unpaid.",
    categoryReason: "Official financial notice regarding tuition fee payments, late penalties, and portal access.",
    summary: "Tuition fee second installment due by Monday, Oct 5. $100 penalty and portal lock apply after.",
    actionRequired: true,
    actionText: "Pay semester tuition fee balance via student finance portal before Oct 5",
    actionDeadline: "Monday, Oct 5, 2026 · 5:00 PM",
    deadlineDate: "2026-10-05T17:00:00.000Z",
    location: "Online Finance Portal / Accounts Office",
    affectedGroup: "Students with Pending Dues",
    urgency: "HIGH",
    tags: ["fees", "tuition", "deadline", "financial-penalty"],
    isRead: false,
    source: "demo",
    threadId: "thread-tuition-fees"
  },

  // 7. SHOWCASE EMAIL 7 - MEDIUM
  {
    id: "email-007",
    sender: "events@northbridgeuniversity.edu",
    senderName: "InnovateX Directorate",
    recipient: "students@northbridgeuniversity.edu",
    subject: "Technical Symposium Registration Open – InnovateX 2026",
    body: `Greetings Innovators!

Registration is officially open for InnovateX 2026 — Northbridge University's flagship annual Inter-University Technical Symposium & Hackathon, happening October 24–26, 2026.

Featured Tracks:
1. Agentic AI & Human-Centric Systems (Sponsored by Google Cloud)
2. Autonomous Robotics & Embedded IoT
3. Decentralized Protocols & Privacy Engineering

Prizes worth over $25,000 in seed grants, internship opportunities with premier tech firms, and cloud computing credits.

Early-bird team registration closes October 12, 2026.
Register your team at: innovatex.northbridgeuniversity.edu

Organizing Secretariat,
Dr. Maya Sundaram, Faculty Convenor`,
    timestamp: "2026-09-28T11:00:00.000Z",
    dateFormatted: "Sep 28, 2026 · 11:00 AM",
    category: "EVENTS",
    priority: "MEDIUM",
    priorityScore: 56,
    priorityReason: "Major annual university technical symposium registration is open until Oct 12 with significant prizes and internship tracks.",
    categoryReason: "University-wide technical event, hackathon, and symposium announcement.",
    summary: "InnovateX 2026 annual tech symposium and hackathon registration open until Oct 12.",
    actionRequired: true,
    actionText: "Register team for InnovateX 2026 hackathon track before Oct 12",
    actionDeadline: "Oct 12, 2026 · 11:59 PM",
    deadlineDate: "2026-10-12T23:59:00.000Z",
    eventDate: "2026-10-24T09:00:00.000Z",
    location: "Main University Auditorium & Innovation Labs",
    affectedGroup: "Engineering & Science Students",
    urgency: "MEDIUM",
    tags: ["events", "hackathon", "symposium", "innovatex"],
    isRead: false,
    source: "demo",
    threadId: "thread-events-innovatex"
  },

  // 8. SHOWCASE EMAIL 8 - CRITICAL
  {
    id: "email-008",
    sender: "emergency@northbridgeuniversity.edu",
    senderName: "Office of the Vice Chancellor & Campus Safety",
    recipient: "all-campus@northbridgeuniversity.edu",
    subject: "Campus Closed Tomorrow Due to Severe Weather",
    body: `CRITICAL SAFETY ADVISORY:

Following red-alert meteorological advisories issued by the State Disaster Management Authority regarding Cyclone Vayu / Severe Gale Force Windstorms, all physical academic classes, laboratory sessions, and extracurricular activities on the Northbridge campus are suspended tomorrow (Thursday, October 1, 2026).

SAFETY DIRECTIVES:
1. All residential students must remain inside hostel premises after 7:00 PM tonight.
2. Essential campus mess facilities and emergency health clinics in Block D will remain operational 24/7.
3. Mid-semester laboratory exams scheduled for Thursday are deferred; revised dates will be notified once weather subsides.
4. Emergency Campus Helpline: +1 (555) 019-9911 or internal ext 911.

Stay safe and stay indoors.

Prof. K. Venkatesh
Registrar & Head of Campus Emergency Response`,
    timestamp: "2026-09-27T19:30:00.000Z",
    dateFormatted: "Sep 27, 2026 · 7:30 PM",
    category: "EMERGENCY",
    priority: "CRITICAL",
    priorityScore: 99,
    priorityReason: "Severe weather red alert. Physical campus closed, exams suspended, mandatory indoor curfew in effect.",
    categoryReason: "Official crisis/safety alert suspending normal campus operations.",
    summary: "Campus closed tomorrow due to severe weather red alert. Exams deferred, remain indoors.",
    actionRequired: true,
    actionText: "Stay indoors in residential quarters; note deferred exam dates",
    actionDeadline: "Tonight by 7:00 PM",
    deadlineDate: "2026-09-27T19:00:00.000Z",
    location: "All Campus Facilities & Grounds",
    affectedGroup: "All Students, Faculty & Staff",
    urgency: "CRITICAL",
    tags: ["emergency", "weather", "campus-closed", "safety", "cyclone"],
    isRead: true,
    source: "demo",
    threadId: "thread-emergency-weather"
  },

  // 9. SHOWCASE EMAIL 9 - MEDIUM
  {
    id: "email-009",
    sender: "facilities@northbridgeuniversity.edu",
    senderName: "Central Library Administration",
    recipient: "students@northbridgeuniversity.edu",
    subject: "Library Timing Updated for Exam Season",
    body: `Dear Scholars,

To support students preparing for Mid-Semester and End-Semester examinations, the Central Library will operate on extended 24-hour study mode starting this Wednesday, September 30, through October 20.

Study Zones & Facilities:
- 1st & 2nd Floor Reading Halls: Open 24/7 (Access via Student ID swipe).
- Digital Resource & High-Performance Computing Lab: Open until 2:00 AM.
- Night Café (Ground Floor): Serving hot beverages and light snacks from 11:00 PM to 4:00 AM.

Please maintain silence and cooperate with security personnel. Group study rooms can be reserved on library.northbridgeuniversity.edu/rooms.

Dr. S. Mukherjee
Chief Librarian`,
    timestamp: "2026-09-27T13:45:00.000Z",
    dateFormatted: "Sep 27, 2026 · 1:45 PM",
    category: "FACILITIES",
    priority: "MEDIUM",
    priorityScore: 50,
    priorityReason: "Central Library extending to 24/7 hours for exam preparation with overnight café access.",
    categoryReason: "Information on campus academic facility hours and study room bookings.",
    summary: "Central Library open 24/7 with night café starting Sept 30 for exam preparation.",
    actionRequired: false,
    actionText: "Book study rooms on portal if organizing group revision sessions",
    location: "Central Library 24/7 Wing",
    affectedGroup: "All Students",
    urgency: "MEDIUM",
    tags: ["facilities", "library", "exam-prep", "study-hours"],
    isRead: true,
    source: "demo",
    threadId: "thread-facilities-library"
  },

  // 10. SHOWCASE EMAIL 10 - LOW
  {
    id: "email-010",
    sender: "admin@northbridgeuniversity.edu",
    senderName: "University Communications Office",
    recipient: "students@northbridgeuniversity.edu",
    subject: "Campus Newsletter – October Edition",
    body: `Dear Campus Community,

Welcome to the October 2026 Edition of The Northbridge Chronicle!

Highlights in this month's issue:
- Northbridge AI Robotics Lab secures $2M National Research Foundation grant.
- Alumni Spotlight: Priya Raman (Class of 2021), Forbes 30 Under 30.
- Glimpses from the Annual Inter-Hostel Cultural Fest.
- Tips from Student Wellness Counselors on managing exam stress and sleep hygiene.

Download the full digital issue or read online at media.northbridgeuniversity.edu/chronicle/oct-2026.

Warm regards,
Editorial Board, The Northbridge Chronicle`,
    timestamp: "2026-09-26T10:00:00.000Z",
    dateFormatted: "Sep 26, 2026 · 10:00 AM",
    category: "GENERAL",
    priority: "LOW",
    priorityScore: 20,
    priorityReason: "Monthly general newsletter with campus news highlights and feature stories. Informational only.",
    categoryReason: "General university-wide public relations and magazine bulletin.",
    summary: "October edition of Northbridge Chronicle newsletter published online.",
    actionRequired: false,
    affectedGroup: "Campus Community",
    urgency: "LOW",
    tags: ["newsletter", "general", "chronicle"],
    isRead: true,
    source: "demo",
    attachments: [
      { name: "Northbridge_Chronicle_Oct2026.pdf", size: "4.2 MB", type: "application/pdf" }
    ],
    threadId: "thread-general-newsletter"
  },

  // 11. RELATED EMAIL - CSE EXAM SCHEDULE (Part of Exam Series)
  {
    id: "email-011",
    sender: "examinations@northbridgeuniversity.edu",
    senderName: "Office of the Controller of Examinations",
    recipient: "cse-sem3@northbridgeuniversity.edu",
    subject: "Mid-Semester Examination Schedule – CSE Department",
    body: `Dear Students,

The Mid-Semester Examination schedule for CSE Semester 3 (Fall 2026) has been officially released.

Timetable:
- Sept 30: CS302 Database Management Systems (9:00 AM - 11:00 AM)
- Oct 2: CS301 Data Structures & Algorithms (9:00 AM - 11:00 AM)
- Oct 4: CS303 Computer Architecture (9:00 AM - 11:00 AM)
- Oct 7: CS304 Machine Learning Fundamentals (9:00 AM - 11:00 AM)

Admit cards are available for download on the examination portal. Students must produce their signed admit card at the exam hall.

Controller of Examinations`,
    timestamp: "2026-09-25T09:00:00.000Z",
    dateFormatted: "Sep 25, 2026 · 9:00 AM",
    category: "EXAMS",
    priority: "HIGH",
    priorityScore: 84,
    priorityReason: "Official midterm exam schedule published. Exams commence Sept 30. Admit cards must be downloaded.",
    categoryReason: "Examination timetable, subject dates, and hall ticket requirements.",
    summary: "CSE Sem 3 Mid-term exam schedule released. Exams start Sept 30 with CS302.",
    actionRequired: true,
    actionText: "Download and print exam admit card from portal before Sept 30",
    actionDeadline: "Sept 29, 2026 · 11:59 PM",
    deadlineDate: "2026-09-29T23:59:00.000Z",
    location: "Examination Halls (Check individual paper notice)",
    affectedGroup: "CSE Sem 3",
    urgency: "HIGH",
    tags: ["exams", "schedule", "cse", "admit-card"],
    isRead: true,
    source: "demo",
    threadId: "thread-midsem-cse"
  },

  // 12. RELATED EMAIL - CSE EXAM GUIDELINES (Part of Exam Series)
  {
    id: "email-012",
    sender: "examinations@northbridgeuniversity.edu",
    senderName: "Office of the Controller of Examinations",
    recipient: "cse-sem3@northbridgeuniversity.edu",
    subject: "RE: Mid-Semester Examination – Calculator & Admit Card Guidelines",
    body: `Dear Students,

Please review the approved stationery and device guidelines for the CSE Mid-Semester examinations:
- Only non-programmable scientific calculators (Casio fx-82MS, fx-991MS or equivalent) are permitted.
- Smartwatches, programmable devices, and smartphones must be deposited in the bag counters outside the hall.
- Tampered hall tickets will not be entertained.

Examination Proctorial Board`,
    timestamp: "2026-09-28T17:00:00.000Z",
    dateFormatted: "Sep 28, 2026 · 5:00 PM",
    category: "EXAMS",
    priority: "MEDIUM",
    priorityScore: 58,
    priorityReason: "Allowed calculator models and proctorial rules for midterm exams.",
    categoryReason: "Exam regulation guidelines and permissible equipment.",
    summary: "Only non-programmable calculators allowed in CSE exams. No smartwatches.",
    actionRequired: false,
    actionText: "Ensure your scientific calculator is an approved non-programmable model",
    location: "All Exam Halls",
    affectedGroup: "CSE Students",
    urgency: "MEDIUM",
    tags: ["exams", "guidelines", "calculators"],
    isRead: true,
    source: "demo",
    threadId: "thread-midsem-cse"
  },

  // 13. PLACEMENT & INTERNSHIP (High Priority)
  {
    id: "email-013",
    sender: "placements@northbridgeuniversity.edu",
    senderName: "University Career & Placement Centre",
    recipient: "prefinal-cse@northbridgeuniversity.edu",
    subject: "Google Cloud Campus Drive 2026 – Registration Deadline Approaching",
    body: `Dear Pre-Final Year CSE Students,

Google Cloud has announced its Summer Internship 2027 recruitment drive for Software Engineering and Cloud Solutions roles.

Eligibility:
- B.Tech CSE / AI & ML / Data Science
- CGPA 7.5 and above with no standing arrears

Selection Process:
1. Online Coding Assessment: October 10, 2026
2. Technical Interviews (Virtual): October 17–19, 2026
3. Stipend: $1,800/month + housing allowance

MANDATORY STEP:
Register on the Placement Portal and upload your standardized ATS-friendly PDF resume by October 3, 2026, 6:00 PM sharp. Late submissions cannot be accommodated as Google candidate rosters are finalized 7 days prior.

Placement Officer,
Northbridge Career Directorate`,
    timestamp: "2026-09-28T15:30:00.000Z",
    dateFormatted: "Sep 28, 2026 · 3:30 PM",
    category: "PLACEMENTS",
    priority: "HIGH",
    priorityScore: 90,
    priorityReason: "Google Cloud internship drive registration closes Oct 3. High financial and career impact for student.",
    categoryReason: "Career recruitment, corporate campus drive, and internship registration.",
    summary: "Google Cloud internship drive registration closes Oct 3 at 6 PM. Upload ATS resume on portal.",
    actionRequired: true,
    actionText: "Upload ATS-friendly resume to placement portal for Google Cloud drive",
    actionDeadline: "Oct 3, 2026 · 6:00 PM",
    deadlineDate: "2026-10-03T18:00:00.000Z",
    location: "Career Centre / Virtual Assessment",
    affectedGroup: "Pre-Final Year CSE / AI & ML",
    urgency: "HIGH",
    tags: ["placements", "google-cloud", "internship", "career"],
    isRead: false,
    source: "demo",
    threadId: "thread-placements-google"
  },

  // 14. HOSTEL & MESS (Medium Priority)
  {
    id: "email-014",
    sender: "hostel@northbridgeuniversity.edu",
    senderName: "Office of the Chief Warden (Hostels)",
    recipient: "hostel-residents@northbridgeuniversity.edu",
    subject: "Temporary Water Supply Interruption – Block B & C Hostels",
    body: `Dear Resident Scholars,

Please note that municipal pipe maintenance and overhead tank chlorination will take place tomorrow, Wednesday Sept 30, between 1:00 PM and 4:30 PM.

Water supply in Hostel Blocks B and C will remain restricted during this 3.5 hour window. Geyser power will also be paused for electrical safety.

Emergency backup water points are available on the Ground Floor utility bays.

We regret the temporary inconvenience.

Chief Warden & Estate Maintenance`,
    timestamp: "2026-09-29T07:00:00.000Z",
    dateFormatted: "Sep 29, 2026 · 7:00 AM",
    category: "HOSTEL",
    priority: "MEDIUM",
    priorityScore: 60,
    priorityReason: "Water supply cutoff in hostel blocks B & C tomorrow from 1:00 PM to 4:30 PM.",
    categoryReason: "Hostel living conditions, water maintenance, and residential notice.",
    summary: "Hostel Blocks B & C water supply interrupted tomorrow from 1:00 PM to 4:30 PM.",
    actionRequired: false,
    actionText: "Store necessary water for personal use prior to 1:00 PM tomorrow",
    location: "Hostel Blocks B & C",
    affectedGroup: "Hostel Blocks B & C Residents",
    urgency: "MEDIUM",
    tags: ["hostel", "maintenance", "water-supply"],
    isRead: false,
    source: "demo",
    threadId: "thread-hostel-maintenance"
  },

  // 15. SCHOLARSHIP (High Priority)
  {
    id: "email-015",
    sender: "scholarships@northbridgeuniversity.edu",
    senderName: "Dean of Student Affairs (Financial Aid)",
    recipient: "students@northbridgeuniversity.edu",
    subject: "Merit-cum-Means National Scholarship Portal Closes Oct 8",
    body: `Dear Eligible Scholars,

Applications for the National Merit-cum-Means Scholarship (providing 80% tuition grant + $500 textbook stipend) will close on October 8, 2026, 11:59 PM.

Required Supporting Documents:
1. Income Tax return / Revenue Tahsildar Income Certificate (< $6,000 / INR 5 LPA).
2. Semester 1 & 2 Mark Sheets (Min CGPA: 7.0).
3. Student Bank Account Passbook Copy (Aadhaar/National ID linked).

Please submit your verified dossier to the Financial Aid Desk (Room 202, Admin Block). Incomplete applications cannot be forwarded to the Ministry.

Financial Aid Committee`,
    timestamp: "2026-09-26T14:00:00.000Z",
    dateFormatted: "Sep 26, 2026 · 2:00 PM",
    category: "SCHOLARSHIPS",
    priority: "HIGH",
    priorityScore: 88,
    priorityReason: "80% tuition scholarship application closes Oct 8. Significant financial benefit requiring multiple documents.",
    categoryReason: "Financial aid, national scholarship, and tuition fee grant application.",
    summary: "National Merit-cum-Means Scholarship application closes Oct 8. Submit docs to Room 202.",
    actionRequired: true,
    actionText: "Submit income certificate and grade sheets to Financial Aid Desk Room 202",
    actionDeadline: "Oct 8, 2026 · 5:00 PM",
    deadlineDate: "2026-10-08T17:00:00.000Z",
    location: "Room 202, Administrative Block",
    affectedGroup: "Eligible Merit Students",
    urgency: "HIGH",
    tags: ["scholarship", "financial-aid", "tuition-grant"],
    isRead: true,
    source: "demo",
    threadId: "thread-scholarships-mcm"
  },

  // 16. NOISE / PROMOTIONAL EMAIL 1 (Demonstrates Filtering)
  {
    id: "email-016",
    sender: "ship-confirm@amazon.in",
    senderName: "Amazon.in",
    recipient: "muthu@gmail.com",
    subject: "Your Amazon.in order #402-8921841 has been dispatched",
    body: `Hello Muthu,

Your package containing 'Wireless Ergonomic Bluetooth Mouse' has been shipped via ATS Logistics and is expected to arrive tomorrow by 8 PM.

Track your package: amazon.in/track/402-8921841`,
    timestamp: "2026-09-29T08:00:00.000Z",
    dateFormatted: "Sep 29, 2026 · 8:00 AM",
    category: "GENERAL",
    priority: "LOW",
    priorityScore: 10,
    priorityReason: "Commercial e-commerce delivery update. Not a university communication.",
    categoryReason: "Commercial e-commerce external notification.",
    summary: "Amazon delivery dispatch notice.",
    actionRequired: false,
    urgency: "LOW",
    tags: ["noise", "external", "amazon"],
    isRead: false,
    source: "demo",
    isNoise: true
  },

  // 17. NOISE / SOCIAL EMAIL 2 (Demonstrates Filtering)
  {
    id: "email-017",
    sender: "updates@instagram.com",
    senderName: "Instagram",
    recipient: "muthu@gmail.com",
    subject: "alex_designs and 4 others shared new reels",
    body: `Catch up on the latest reels from accounts you follow on Instagram.`,
    timestamp: "2026-09-29T07:15:00.000Z",
    dateFormatted: "Sep 29, 2026 · 7:15 AM",
    category: "GENERAL",
    priority: "LOW",
    priorityScore: 5,
    priorityReason: "Social media marketing notification. Not relevant to university academic life.",
    categoryReason: "Social media alert.",
    summary: "Instagram reel activity notification.",
    actionRequired: false,
    urgency: "LOW",
    tags: ["noise", "external", "instagram"],
    isRead: true,
    source: "demo",
    isNoise: true
  },

  // 18. NOISE / COMMERCIAL EMAIL 3 (Demonstrates Filtering)
  {
    id: "email-018",
    sender: "promo@edutech-deals.com",
    senderName: "EduTech Deals & Prep",
    recipient: "muthu@gmail.com",
    subject: "Flat 50% Off on GRE & GATE Video Lectures — Limited Time",
    body: `Upgrade your competitive exam prep with masterclasses from top faculty. Coupon code: EXAM50.`,
    timestamp: "2026-09-28T18:00:00.000Z",
    dateFormatted: "Sep 28, 2026 · 6:00 PM",
    category: "GENERAL",
    priority: "LOW",
    priorityScore: 12,
    priorityReason: "Commercial test-prep marketing solicitation.",
    categoryReason: "Promotional spam.",
    summary: "Commercial GRE test prep promotion.",
    actionRequired: false,
    urgency: "LOW",
    tags: ["noise", "external", "promotional"],
    isRead: false,
    source: "demo",
    isNoise: true
  }
];

// Helper to generate additional realistic synthetic university emails to reach 120+
export function generateFullDataset(): EmailData[] {
  const result: EmailData[] = [...baseEmails];

  const categories = [
    { cat: "ACADEMICS", sender: "academics@northbridgeuniversity.edu", name: "Dean of Academic Affairs" },
    { cat: "EXAMS", sender: "examinations@northbridgeuniversity.edu", name: "Controller of Examinations" },
    { cat: "ATTENDANCE", sender: "attendance@northbridgeuniversity.edu", name: "Attendance Cell" },
    { cat: "ASSIGNMENTS", sender: "faculty@northbridgeuniversity.edu", name: "Course Coordinator" },
    { cat: "TRANSPORT", sender: "transport@northbridgeuniversity.edu", name: "Campus Transport Dept" },
    { cat: "EVENTS", sender: "events@northbridgeuniversity.edu", name: "Student Activities Board" },
    { cat: "FEES", sender: "fees@northbridgeuniversity.edu", name: "Accounts & Finance" },
    { cat: "HOSTEL", sender: "hostel@northbridgeuniversity.edu", name: "Chief Hostel Warden" },
    { cat: "PLACEMENTS", sender: "placements@northbridgeuniversity.edu", name: "Placement Cell" },
    { cat: "ADMINISTRATION", sender: "admin@northbridgeuniversity.edu", name: "Registrar Office" },
    { cat: "FACILITIES", sender: "facilities@northbridgeuniversity.edu", name: "Campus Estate Office" },
    { cat: "CLUBS", sender: "clubs@northbridgeuniversity.edu", name: "Student Clubs Council" },
    { cat: "SCHOLARSHIPS", sender: "scholarships@northbridgeuniversity.edu", name: "Financial Aid Office" },
    { cat: "GENERAL", sender: "info@northbridgeuniversity.edu", name: "University Info Desk" }
  ];

  const subjectsAndBodies = [
    {
      cat: "ACADEMICS",
      sub: "Elective Subject Allotment for Semester 4 – Verify Portal",
      body: "Course registration for Spring electives (Cloud Architecture vs Quantum Computing) will be determined based on CGPA. Verify your preference rank on the portal.",
      action: "Review and reorder elective preferences on ERP portal",
      priority: "MEDIUM" as const,
      score: 65,
      deadlineDays: 7
    },
    {
      cat: "ACADEMICS",
      sub: "Special Makeup Class for CS303 Computer Architecture",
      body: "Due to the holiday last Monday, a makeup tutorial session is scheduled for Saturday 10:00 AM in Tech Block Room 302.",
      action: "Attend tutorial session in Room 302",
      priority: "MEDIUM" as const,
      score: 55,
      deadlineDays: 4
    },
    {
      cat: "EXAMS",
      sub: "Hall Ticket Barcode Verification at Central Counter",
      body: "All second and third year students must have their printed hall tickets stamped with security hologram by 4:00 PM today.",
      action: "Get hall ticket stamped with hologram at Block B counter",
      priority: "HIGH" as const,
      score: 87,
      deadlineDays: 1
    },
    {
      cat: "EXAMS",
      sub: "End-Semester Practical Exam Schedule Release Date",
      body: "Practical laboratory assessments will commence November 12. Final laboratory manuals must be signed by course in-charges.",
      action: "Get lab record signatures from instructor",
      priority: "MEDIUM" as const,
      score: 58,
      deadlineDays: 14
    },
    {
      cat: "ATTENDANCE",
      sub: "Biometric Attendance Kiosk Maintenance – Morning Shift",
      body: "Kiosks at Tech Park West entrance will undergo firmware upgrade from 8:00 AM to 10:00 AM. Use East Wing readers or manual sign-in sheets.",
      action: "Use East Wing biometric scanner during morning entry",
      priority: "LOW" as const,
      score: 35,
      deadlineDays: 2
    },
    {
      cat: "ASSIGNMENTS",
      sub: "Mini Project Synopsis Submission – Deadline Oct 7",
      body: "All teams in CS308 Software Engineering must submit their 2-page system architecture synopsis and wireframe links on GitHub Classroom.",
      action: "Submit 2-page project synopsis and wireframes on GitHub",
      priority: "HIGH" as const,
      score: 82,
      deadlineDays: 8
    },
    {
      cat: "TRANSPORT",
      sub: "Special Weekend Shuttle Service to Railway Station",
      body: "In view of the festive long weekend, three non-stop express buses will operate between Campus Gate 1 and Central Railway Station on Friday evening.",
      action: "Reserve express shuttle seat on transit app",
      priority: "LOW" as const,
      score: 32,
      deadlineDays: 3
    },
    {
      cat: "TRANSPORT",
      sub: "Parking Permit Sticker Renewal for Two-Wheelers",
      body: "All student motorcycles and electric scooters parked in Zone D must display the 2026-27 purple parking sticker by October 10.",
      action: "Collect parking sticker from Security Desk with vehicle registration copy",
      priority: "MEDIUM" as const,
      score: 52,
      deadlineDays: 11
    },
    {
      cat: "EVENTS",
      sub: "Distinguished Lecture: AI Frontiers by Dr. Arvind Narayanan",
      body: "The Department of Computer Science invites students to a keynote lecture on 'Generative Models and Safety' on Thursday at 3:00 PM in the Main Auditorium.",
      action: "Reserve auditorium seat via QR code RSVP",
      priority: "MEDIUM" as const,
      score: 45,
      deadlineDays: 2
    },
    {
      cat: "FEES",
      sub: "Hostel Mess Advance Adjustment for October",
      body: "Credit balances from September holidays will be adjusted in the upcoming mess billing. Check your student account statement.",
      action: "Verify mess rebate ledger online",
      priority: "LOW" as const,
      score: 30,
      deadlineDays: 6
    },
    {
      cat: "PLACEMENTS",
      sub: "Mock Technical Interview Slot Booking – CSE 3rd Year",
      body: "Alumni-led mock coding and system design interview slots are now open for third-year students. Slots are first-come first-served.",
      action: "Book 45-minute mock interview slot on Career portal",
      priority: "HIGH" as const,
      score: 85,
      deadlineDays: 3
    },
    {
      cat: "PLACEMENTS",
      sub: "Microsoft Imagine Cup Campus Hackathon Prelims",
      body: "Submit your 3-minute pitch video and repository link for the University chapter prelims of Microsoft Imagine Cup.",
      action: "Submit pitch video before deadline",
      priority: "MEDIUM" as const,
      score: 62,
      deadlineDays: 10
    },
    {
      cat: "HOSTEL",
      sub: "Mandatory Fire Safety Drill in Northbridge Towers",
      body: "A scheduled fire evacuation simulation will be conducted on Saturday at 10:00 AM. All resident students must assemble on Ground 2.",
      action: "Participate in evacuation drill Saturday 10:00 AM",
      priority: "MEDIUM" as const,
      score: 60,
      deadlineDays: 4
    },
    {
      cat: "ADMINISTRATION",
      sub: "National Identity Verification for Degree Certificate Database",
      body: "All enrolled students must confirm their legal name spelling and government ID number on the DigiLocker university sync module.",
      action: "Verify name and ID on university portal",
      priority: "MEDIUM" as const,
      score: 59,
      deadlineDays: 9
    },
    {
      cat: "FACILITIES",
      sub: "Campus High-Speed WiFi Network Upgrade Notice",
      body: "Campus IT will upgrade core edge routers on Saturday midnight (12:00 AM - 4:00 AM). Intermittent WiFi drops are expected.",
      action: "Plan offline work during router upgrade hours",
      priority: "LOW" as const,
      score: 25,
      deadlineDays: 4
    },
    {
      cat: "CLUBS",
      sub: "Robotics Club Arduino & ROS Hands-on Boot Camp",
      body: "RoboPulse club will conduct a 2-day workshop on Robot Operating System (ROS) and LiDAR mapping this weekend in Lab 3.",
      action: "Register for workshop on Club Portal",
      priority: "LOW" as const,
      score: 38,
      deadlineDays: 4
    }
  ];

  let currentId = 19;
  const baseDate = new Date("2026-09-29T10:00:00.000Z");

  // Generate varied synthetic emails across previous 30 days
  for (let i = 0; i < 90; i++) {
    const template = subjectsAndBodies[i % subjectsAndBodies.length];
    const catObj = categories.find(c => c.cat === template.cat) || categories[0];
    
    // Vary days backward from base date
    const daysAgo = Math.floor(i / 3) + 1;
    const emailDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000 + (i % 8) * 3600 * 1000);
    const deadlineDate = new Date(emailDate.getTime() + template.deadlineDays * 24 * 60 * 60 * 1000);
    
    const formattedDate = emailDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTime = emailDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    // Slight score jitter
    const scoreJitter = (i % 7) - 3;
    const finalScore = Math.max(15, Math.min(96, template.score + scoreJitter));
    let calculatedPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (finalScore >= 90) calculatedPriority = 'CRITICAL';
    else if (finalScore >= 75) calculatedPriority = 'HIGH';
    else if (finalScore >= 45) calculatedPriority = 'MEDIUM';

    result.push({
      id: `email-${String(currentId).padStart(3, '0')}`,
      sender: catObj.sender,
      senderName: catObj.name,
      recipient: "muthu@northbridgeuniversity.edu",
      subject: `${template.sub} [#${1000 + i}]`,
      body: `Dear Muthu,\n\n${template.body}\n\nPlease take appropriate action before the stated timeline.\n\nWarm regards,\n${catObj.name}\nNorthbridge University`,
      timestamp: emailDate.toISOString(),
      dateFormatted: `${formattedDate} · ${formattedTime}`,
      category: template.cat,
      priority: calculatedPriority,
      priorityScore: finalScore,
      priorityReason: `Evaluated urgency based on ${template.cat.toLowerCase()} requirements, deadline proximity (${template.deadlineDays} days), and academic impact.`,
      categoryReason: `Classified under ${template.cat} based on sender authority and contextual subject analysis.`,
      summary: template.body.slice(0, 110) + '...',
      actionRequired: template.priority === 'HIGH' || (i % 2 === 0),
      actionText: template.action,
      actionDeadline: deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      deadlineDate: deadlineDate.toISOString(),
      location: i % 3 === 0 ? "Tech Tower Room 302" : (i % 3 === 1 ? "Administrative Block" : "Campus Auditorium"),
      affectedGroup: "CSE Students",
      urgency: calculatedPriority,
      tags: [template.cat.toLowerCase(), "notice", "campus"],
      isRead: i > 25,
      isActionCompleted: i > 40 && (i % 3 === 0),
      source: "demo",
      threadId: `thread-${template.cat.toLowerCase()}-${Math.floor(i / 4)}`
    });

    currentId++;
  }

  return result;
}

export function writeDemoDataFiles() {
  const dataset = generateFullDataset();
  const rootDataDir = path.resolve(__dirname, '../../../data/demo-emails');
  const serverDataDir = path.resolve(__dirname, '../data');
  const clientDataDir = path.resolve(__dirname, '../../../client/src/data');

  [rootDataDir, serverDataDir, clientDataDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const jsonContent = JSON.stringify(dataset, null, 2);
  fs.writeFileSync(path.join(rootDataDir, 'university-emails.json'), jsonContent);
  fs.writeFileSync(path.join(serverDataDir, 'demo-emails.json'), jsonContent);
  fs.writeFileSync(path.join(clientDataDir, 'demo-emails.json'), jsonContent);

  console.log(`Generated ${dataset.length} synthetic emails successfully in all data directories!`);
}

if (require.main === module) {
  writeDemoDataFiles();
}
