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
  isNoise?: boolean;
  systemOrigin?: string; // PS02 multi-system origin: 'Email' | 'Academic Portal' | 'Timetable' | 'Exam System'
}

const baseEmails: EmailData[] = [
  // 1. SOURCE 4: UNIVERSITY CLOSURE & COMPENSATORY WORKING DAY (CRITICAL)
  {
    id: "email-srm-001",
    sender: "registrar.office@srmap.edu.in",
    senderName: "Registrar Office, SRM University-AP",
    recipient: "demo.student@srmap.edu.in",
    cc: ["dean.seas@srmap.edu.in", "students.seas@srmap.edu.in"],
    subject: "CIRCULAR: University Closure on Sept 25 and Compensatory Working Day",
    body: `Dear Faculty, Staff, and Students of SRM University-AP,

In view of severe continuous rainfall and poor road conditions leading to the Neerukonda campus, the University remained closed on Friday, September 25, 2026. All academic lectures, laboratory sessions, and mid-semester evaluations scheduled for that day stand rescheduled.

COMPENSATORY WORKING DAY NOTIFICATION:
Saturday, October 10, 2026, will be observed as a compensatory working day. Friday's timetable will be strictly followed.

Students residing in campus hostels are requested to remain within their designated blocks during squally wind advisories. Emergency student helpline is accessible at Ext 100 / Security Desk.

By Order,
Dr. Prem Kumar
Registrar, SRM University-AP, Andhra Pradesh
Neerukonda, Mangalagiri Mandal, Guntur - 522240`,
    timestamp: "2026-09-25T07:30:00.000Z",
    dateFormatted: "Sep 25, 2026 · 7:30 AM",
    category: "ADMINISTRATION",
    priority: "CRITICAL",
    priorityScore: 98,
    priorityReason: "Official Registrar circular announcing emergency university closure and compensatory academic schedule on Oct 10.",
    categoryReason: "Official administrative circular detailing university operational closure and revised working days.",
    summary: "University closed Sept 25 due to heavy rainfall. Saturday Oct 10 declared compensatory working day following Friday timetable.",
    actionRequired: true,
    actionText: "Note compensatory working day on Saturday, October 10 (Friday timetable applies)",
    actionDeadline: "Oct 10, 2026",
    deadlineDate: "2026-10-10T08:30:00.000Z",
    location: "SRM University-AP, Neerukonda Campus",
    affectedGroup: "All SRM AP Students, Faculty & Staff",
    urgency: "CRITICAL",
    tags: ["circular", "closure", "compensatory-day", "registrar", "weather"],
    isRead: false,
    source: "demo",
    systemOrigin: "Administrative Portal",
    threadId: "thread-closure-schedule"
  },

  // 2. SOURCE 1: WORKSHOP ON ROBOTICS (TECHFEST IIT BOMBAY COLLABORATION)
  {
    id: "email-srm-002",
    sender: "communications@srmap.edu.in",
    senderName: "Directorate of Communications, SRM University-AP",
    recipient: "demo.student@srmap.edu.in",
    cc: ["dean.seas@srmap.edu.in"],
    subject: "Hands-On Workshop on Robotics in Collaboration with Techfest (IIT Bombay)",
    body: `Dear Students of School of Engineering and Sciences (SEAS),

SRM University-AP, in collaboration with Techfest (IIT Bombay), is organising an intensive, hands-on Workshop on Robotics for engineering scholars.

Event Details:
- Date: Wednesday, September 30, 2026
- Time: 10:00 AM – 4:00 PM
- Venue: Room S202, SR Block, SRM University-AP
- Key Topics: Autonomous Kinematics, ROS Integration, Sensor Fusion, Microcontroller Interfacing

Contact Person:
Dr. Teja Krishna Mamidi, Department of Mechanical Engineering (tejakrishna.m@srmap.edu.in)

Participants will receive official certification co-branded by SRM University-AP and Techfest, IIT Bombay. Please carry your personal laptop with Ubuntu or VirtualBox pre-installed.

Directorate of Communications,
SRM University-AP, Andhra Pradesh`,
    timestamp: "2026-09-29T08:00:00.000Z",
    dateFormatted: "Sep 29, 2026 · 8:00 AM",
    category: "EVENTS",
    priority: "HIGH",
    priorityScore: 84,
    priorityReason: "Co-branded IIT Bombay Techfest Robotics Workshop scheduled for tomorrow at S202, SR Block.",
    categoryReason: "Technical engineering hands-on workshop and institutional event announcement.",
    summary: "Hands-On Robotics Workshop in collaboration with Techfest (IIT Bombay) tomorrow, 10 AM - 4 PM at S202, SR Block.",
    actionRequired: true,
    actionText: "Report to Room S202 SR Block by 9:45 AM tomorrow with laptop",
    actionDeadline: "Tomorrow, 9:45 AM",
    deadlineDate: "2026-09-30T09:45:00.000Z",
    eventDate: "2026-09-30T10:00:00.000Z",
    location: "S202, SR Block",
    affectedGroup: "SEAS B.Tech Engineering Students",
    urgency: "HIGH",
    tags: ["workshop", "robotics", "techfest", "iit-bombay", "sr-block"],
    isRead: false,
    source: "demo",
    systemOrigin: "Student Activity",
    threadId: "thread-robotics-workshop"
  },

  // 3. SOURCE 7: EXAM VENUE RELOCATION FOR TOMORROW (CRITICAL PS02 SHOWCASE)
  {
    id: "email-srm-003",
    sender: "hod.cse@srmap.edu.in",
    senderName: "Department of Computer Science and Engineering",
    recipient: "demo.student@srmap.edu.in",
    cc: ["dean.seas@srmap.edu.in"],
    subject: "URGENT: Examination Venue Changed for Tomorrow – CSE 204",
    body: `Dear B.Tech CSE Semester 3 Students,

Please take urgent note that due to audio-visual infrastructure upgrades in the Central Complex, the Mid-Semester Examination for CSE 204 (Design and Analysis of Algorithms) scheduled for tomorrow, September 30, at 9:00 AM has been relocated:

- NEW VENUE: S202, SR Block (Second Floor)
- PREVIOUS VENUE: Central Lecture Hall A
- REPORTING TIME: 8:40 AM Sharp

All students must report to S202, SR Block with their physical SRM AP Student Identity Card and hall ticket barcode sheet. Calculators must adhere to standard SEAS proctorial norms.

Dr. Dinesh Reddy
Head of Department, CSE
School of Engineering and Sciences, SRM University-AP`,
    timestamp: "2026-09-29T08:30:00.000Z",
    dateFormatted: "Sep 29, 2026 · 8:30 AM",
    category: "EXAMS",
    priority: "CRITICAL",
    priorityScore: 98,
    priorityReason: "Tomorrow morning's CSE 204 examination venue relocated to S202, SR Block. Reporting required by 8:40 AM to prevent disqualification.",
    categoryReason: "Mid-semester examination hall reallocation notice directly altering student test logistics.",
    summary: "URGENT: Tomorrow's CSE 204 exam venue moved to S202, SR Block. Must report by 8:40 AM.",
    actionRequired: true,
    actionText: "Report to Room S202 SR Block by 8:40 AM for CSE 204 examination",
    actionDeadline: "Tomorrow, 8:40 AM",
    deadlineDate: "2026-09-30T08:40:00.000Z",
    eventDate: "2026-09-30T09:00:00.000Z",
    location: "S202, SR Block",
    affectedGroup: "B.Tech CSE Semester 3",
    urgency: "CRITICAL",
    tags: ["exam", "venue-change", "cse204", "sr-block", "algorithms"],
    isRead: false,
    source: "demo",
    systemOrigin: "Exam System",
    threadId: "thread-cse204-exam"
  },

  // 4. SOURCE 8: ATTENDANCE SHORTAGE NOTICE (HIGH PRIORITY)
  {
    id: "email-srm-004",
    sender: "dean.seas@srmap.edu.in",
    senderName: "Office of the Dean, School of Engineering and Sciences",
    recipient: "demo.student@srmap.edu.in",
    cc: ["hod.cse@srmap.edu.in"],
    subject: "Attendance Shortage Notice – CSE 204 & CSE 207 (Debarment Warning)",
    body: `Dear Muthu (B.Tech CSE - AI & ML, Semester 3),

This is an official communication from the Academic Monitoring Committee of the School of Engineering and Sciences (SEAS).

Your cumulative recorded attendance in the following courses has fallen below the mandatory 75.0% threshold:
1. CSE 204 (Design and Analysis of Algorithms): 68.2%
2. CSE 207 (Digital Electronics): 69.4%

Under SRM University-AP Academic Regulations, students with attendance below 75% are ineligible to sit for End-Semester Examinations unless an official medical/authorized condonation is filed and approved.

MANDATORY ACTION:
1. Download the Attendance Condonation Form from the student ERP portal.
2. Obtain endorsement from your Faculty Advisor.
3. Submit the signed physical copy to the SEAS Academic Cell (Room 114, Administrative Block) before Friday, October 2, 2026, 5:00 PM.

Failure to submit by this date will lead to immediate debarment.

Dean, School of Engineering and Sciences,
SRM University-AP, Andhra Pradesh`,
    timestamp: "2026-09-29T07:15:00.000Z",
    dateFormatted: "Sep 29, 2026 · 7:15 AM",
    category: "ATTENDANCE",
    priority: "HIGH",
    priorityScore: 92,
    priorityReason: "Attendance in CSE 204 and CSE 207 is below 75%. Signed condonation form must be submitted to Room 114 before Friday 5 PM.",
    categoryReason: "Formal attendance shortage warning carrying examination debarment consequences.",
    summary: "Attendance in CSE 204 & 207 is under 75%. Submit condonation form to Room 114 before Friday 5 PM.",
    actionRequired: true,
    actionText: "Submit signed attendance condonation form to Room 114 before Friday 5:00 PM",
    actionDeadline: "Friday, Oct 2, 2026 · 5:00 PM",
    deadlineDate: "2026-10-02T17:00:00.000Z",
    location: "Room 114, Administrative Block",
    affectedGroup: "Muthu (B.Tech CSE AI/ML)",
    urgency: "HIGH",
    tags: ["attendance", "debarment-risk", "condonation", "seas", "cse204"],
    isRead: false,
    source: "demo",
    systemOrigin: "Academic Portal",
    threadId: "thread-attendance-seas"
  },

  // 5. SOURCE 2: ACM STUDENT CHAPTER RECRUITMENT 2026 (MEDIUM PRIORITY)
  {
    id: "email-srm-005",
    sender: "acm.core@srmap.edu.in",
    senderName: "ACM Student Chapter, SRM AP",
    recipient: "demo.student@srmap.edu.in",
    subject: "ACM Student Chapter Recruitment 2026 – Applications Now Open!",
    body: `Hey Developers and Computing Enthusiasts! 🚀

The ACM (Association for Computing Machinery) Student Chapter at SRM University-AP is officially opening recruitment for the academic year 2026-27!

Open Sub-Teams:
1. Research & Development (Competitive Programming, Systems, ML)
2. Events & Hackathons Team
3. Social Media & Content
4. PR, Outreach and Corporate Sponsorship
5. Documentation & Technical Writing

Applications are open to students across all engineering disciplines and years in SEAS.

APPLICATION DEADLINE:
Wednesday, September 30, 2026, 11:59 PM.

Interviews will be conducted in the ACM Lab (SR Block) over the weekend.
Apply online: forms.srmap.edu.in/acm-recruitment-2026

ACM Core Committee,
SRM University-AP, Andhra Pradesh`,
    timestamp: "2026-09-28T14:30:00.000Z",
    dateFormatted: "Sep 28, 2026 · 2:30 PM",
    category: "STUDENT CLUBS",
    priority: "MEDIUM",
    priorityScore: 58,
    priorityReason: "Official ACM Student Chapter recruitment application deadline closing tomorrow night.",
    categoryReason: "Student club and technical chapter recruitment solicitation.",
    summary: "ACM Student Chapter recruitment applications open across R&D, Events, PR, and Docs. Closes Sept 30.",
    actionRequired: true,
    actionText: "Submit ACM Student Chapter online application form before Sept 30 11:59 PM",
    actionDeadline: "Sept 30, 2026 · 11:59 PM",
    deadlineDate: "2026-09-30T23:59:00.000Z",
    location: "ACM Lab, SR Block",
    affectedGroup: "All SRM AP Students",
    urgency: "MEDIUM",
    tags: ["acm", "student-clubs", "recruitment", "coding"],
    isRead: false,
    source: "demo",
    systemOrigin: "Student Activity",
    threadId: "thread-acm-recruitment"
  },

  // 6. SOURCE 3: STARTUP WARS (POSTPONED) (HIGH PRIORITY - WHAT CHANGED?)
  {
    id: "email-srm-006",
    sender: "ecell@srmap.edu.in",
    senderName: "Directorate of Entrepreneurship & Innovation, SRMAP",
    recipient: "demo.student@srmap.edu.in",
    subject: "IMPORTANT NOTICE: STARTUP WARS Event Postponed",
    body: `Dear Registered Participants and Student Entrepreneurs,

Please be informed that STARTUP WARS, originally scheduled for September 21, 2026, has been postponed due to technical stage enhancements and venue scheduling conflicts in the main auditorium.

The revised schedule and demo pitch slots will be formally notified through university communications by next week. Registered pitch decks remain secured on the incubation portal.

We appreciate your patience as we prepare a grander entrepreneurial platform.

Directorate of Entrepreneurship & Innovation,
SRM University-AP`,
    timestamp: "2026-09-21T11:00:00.000Z",
    dateFormatted: "Sep 21, 2026 · 11:00 AM",
    category: "ENTREPRENEURSHIP",
    priority: "HIGH",
    priorityScore: 78,
    priorityReason: "Previously scheduled STARTUP WARS pitching event postponed. Affects student team preparations.",
    categoryReason: "Entrepreneurship cell schedule change and postponement notice.",
    summary: "STARTUP WARS originally set for Sept 21 postponed; revised pitching dates to be notified shortly.",
    actionRequired: false,
    actionText: "Awaited revised pitching schedule from Entrepreneurship Cell",
    location: "SRM University AP Auditorium",
    affectedGroup: "Registered Startup Teams",
    urgency: "HIGH",
    tags: ["entrepreneurship", "ecell", "startup-wars", "postponed"],
    isRead: true,
    source: "demo",
    systemOrigin: "Student Activity",
    threadId: "thread-startup-wars"
  },

  // 7. SOURCE 5: CEL MENTOR REVIEW DEMO (HIGH PRIORITY ACTION)
  {
    id: "email-srm-007",
    sender: "cel@srmap.edu.in",
    senderName: "Center for Entrepreneurial Learning, SRM University-AP",
    recipient: "demo.student@srmap.edu.in",
    subject: "Presentation Submission Deadline & Mentor Review Schedule",
    body: `Dear Entrepreneurship Cohort Scholars,

Please adhere strictly to today's submission and evaluation timeline:

1. SUBMISSION DEADLINE:
Upload your updated business model and investor pitch deck to the CEL portal by 12:00 PM today without fail.

2. MENTOR REVIEW SLOTS:
- Rakesh Sir's Team: Report to the Directorate of Entrepreneurship by 3:50 PM. Evaluation session commences promptly at 4:00 PM.
- Thirumali Sir's Team: Remain seated in your regular classroom; the review panel will evaluate prototypes in sequence.

Late deck uploads will incur a 15% evaluation penalty.

Center for Entrepreneurial Learning (CEL),
SRM University-AP, Andhra Pradesh`,
    timestamp: "2026-09-29T06:45:00.000Z",
    dateFormatted: "Sep 29, 2026 · 6:45 AM",
    category: "ACADEMICS",
    priority: "HIGH",
    priorityScore: 90,
    priorityReason: "Presentation deck submission due at 12:00 PM today. Rakesh Sir's team must report to Directorate by 3:50 PM.",
    categoryReason: "Academic course project submission and scheduled mentor review.",
    summary: "CEL presentation deck due by 12:00 PM today. Rakesh Sir's team reports to Directorate at 3:50 PM.",
    actionRequired: true,
    actionText: "Upload pitch deck before 12:00 PM; report to Directorate by 3:50 PM for mentor review",
    actionDeadline: "Today, 12:00 PM",
    deadlineDate: "2026-09-29T12:00:00.000Z",
    location: "Directorate of Entrepreneurship, Admin Block",
    affectedGroup: "CEL Entrepreneurship Cohort",
    urgency: "HIGH",
    tags: ["cel", "mentor-review", "deck-submission", "academics"],
    isRead: false,
    source: "demo",
    systemOrigin: "Academic Portal",
    threadId: "thread-cel-mentor"
  },

  // 8. SOURCE 6: GDG ON CAMPUS — GOOGLE SOLUTION HUNT CHALLENGE 2026
  {
    id: "email-srm-008",
    sender: "communications@srmap.edu.in",
    senderName: "GDG on Campus — SRM University AP",
    recipient: "demo.student@srmap.edu.in",
    subject: "Google Solution Hunt Challenge 2026 – Think → Build → Present → Win!",
    body: `Greetings Technologists! 🌟

GDG on Campus — SRM University AP is thrilled to host the Google Solution Hunt Challenge 2026!

Experience a high-intensity, one-day technology hackathon tackling United Nations Sustainable Development Goals using Google Cloud, Vertex AI, and Flutter.

Event Details:
- Date: Saturday, October 10, 2026
- Timing: 9:00 AM – 6:00 PM
- Venue: X-Lab Auditorium, SRM University AP, Mangalagiri Neerukonda Tadikonda Road, Mangalagiri, AP, 522240

Exciting Google developer swags, cloud credits, and incubation fast-track vouchers for top 3 teams.
Team Registration: 2 to 4 members per squad.

Registrations close on October 4, 2026.

GDG on Campus Organising Core,
SRM University AP`,
    timestamp: "2026-09-28T10:00:00.000Z",
    dateFormatted: "Sep 28, 2026 · 10:00 AM",
    category: "HACKATHONS",
    priority: "MEDIUM",
    priorityScore: 62,
    priorityReason: "Google Solution Hunt Challenge hackathon registration open for X-Lab Auditorium event on Oct 10.",
    categoryReason: "Student developer hackathon and technical innovation competition.",
    summary: "Google Solution Hunt Challenge 2026 at X-Lab Auditorium on Oct 10. Team registration open until Oct 4.",
    actionRequired: true,
    actionText: "Register team for Google Solution Hunt Challenge before Oct 4",
    actionDeadline: "Oct 4, 2026 · 11:59 PM",
    deadlineDate: "2026-10-04T23:59:00.000Z",
    eventDate: "2026-10-10T09:00:00.000Z",
    location: "X-Lab Auditorium, Neerukonda Campus",
    affectedGroup: "All Engineering & Computing Students",
    urgency: "MEDIUM",
    tags: ["gdg", "hackathon", "google-solution-hunt", "x-lab", "cloud"],
    isRead: false,
    source: "demo",
    systemOrigin: "Student Activity",
    threadId: "thread-gdg-solution-hunt"
  },

  // 9. TRANSPORT ALERT: GUNTUR & VIJAYAWADA CAMPUS BUS REROUTE
  {
    id: "email-srm-009",
    sender: "communications@srmap.edu.in",
    senderName: "Campus Transit & Fleet Operations, SRM AP",
    recipient: "demo.student@srmap.edu.in",
    subject: "Transport Notice: Route 5 & 8 Delayed via Mangalagiri Bypass Tomorrow",
    body: `Notice to all day-scholar students commuting via University Bus Routes 5 (Vijayawada Benz Circle) and 8 (Guntur Bus Stand):

Due to scheduled culvert roadworks on the Tadikonda-Neerukonda approach road, buses will be diverted via Mangalagiri Highway.

Schedule Adjustments for Tomorrow:
- Morning departure from origin stops: 7:25 AM (15 minutes earlier than usual)
- Arrival at Neerukonda Campus: 8:40 AM
- Drop-off will occur strictly at Main Gate Bay 2 instead of Academic Quadrangle.

Students with 9:00 AM laboratory or mid-semester exams must board at the revised earlier timing to avoid arriving past the exam hall closure.

Transport Directorate,
SRM University-AP`,
    timestamp: "2026-09-29T06:15:00.000Z",
    dateFormatted: "Sep 29, 2026 · 6:15 AM",
    category: "TRANSPORT",
    priority: "HIGH",
    priorityScore: 86,
    priorityReason: "University Bus Routes 5 and 8 rerouted with 15m earlier departure; drop-off moved to Main Gate Bay 2.",
    categoryReason: "Campus transit route delay, roadwork diversion, and gate drop-off changes.",
    summary: "Bus Routes 5 & 8 departing 15 mins earlier tomorrow via Mangalagiri Bypass to reach campus by 8:40 AM.",
    actionRequired: true,
    actionText: "Board university bus at earlier 7:25 AM time to reach campus for 9 AM exams",
    actionDeadline: "Tomorrow, 7:25 AM",
    deadlineDate: "2026-09-30T07:25:00.000Z",
    location: "Main Gate Bay 2, Neerukonda",
    affectedGroup: "Routes 5 & 8 Commuters",
    urgency: "HIGH",
    tags: ["transport", "bus", "reroute", "mangalagiri", "gate-bay-2"],
    isRead: false,
    source: "demo",
    systemOrigin: "Campus Location",
    threadId: "thread-transport-transit"
  },

  // 10. TUITION FEE PAYMENT REMINDER (HIGH PRIORITY)
  {
    id: "email-srm-010",
    sender: "communications@srmap.edu.in",
    senderName: "Finance & Accounts Office, SRM University-AP",
    recipient: "demo.student@srmap.edu.in",
    subject: "Reminder: Fall Semester 2026 Tuition Fee Payment Deadline",
    body: `Dear Student,

This is a scheduled reminder that the Fall Semester 2026 Tuition Fee installment deadline concludes on Monday, October 5, 2026, 5:00 PM.

Key Details:
- Online payments can be completed through the Feepay Portal at fees.srmap.edu.in
- Payments processed after October 5 will attract a late surcharge of ₹3,000.
- Unsettled fee dues after October 12 will result in temporary suspension of LMS access and course registration credentials.

Finance & Accounts Division,
SRM University-AP, Andhra Pradesh`,
    timestamp: "2026-09-28T12:00:00.000Z",
    dateFormatted: "Sep 28, 2026 · 12:00 PM",
    category: "FEES",
    priority: "HIGH",
    priorityScore: 88,
    priorityReason: "Fall semester tuition balance due Oct 5. Late surcharge of ₹3,000 and LMS suspension apply after.",
    categoryReason: "Official financial accounts and tuition installment notice.",
    summary: "Fall tuition fee installment due by Monday, Oct 5. ₹3,000 surcharge applies after deadline.",
    actionRequired: true,
    actionText: "Pay semester fee balance on fees.srmap.edu.in before Oct 5",
    actionDeadline: "Monday, Oct 5, 2026 · 5:00 PM",
    deadlineDate: "2026-10-05T17:00:00.000Z",
    location: "Accounts Office, Admin Block",
    affectedGroup: "Students with Pending Fees",
    urgency: "HIGH",
    tags: ["fees", "tuition", "surcharge", "deadline"],
    isRead: false,
    source: "demo",
    systemOrigin: "Academic Portal",
    threadId: "thread-tuition-fees"
  },

  // 11. NOISE FILTER DEMONSTRATION 1 (COMMERCIAL SPAM FILTERED OUT)
  {
    id: "email-srm-011",
    sender: "ship-confirm@amazon.in",
    senderName: "Amazon.in",
    recipient: "demo.student@gmail.com",
    subject: "Your Amazon order for 'Logitech Wireless Presenter' has shipped",
    body: "Your parcel is in transit and will be delivered by ATS Logistics to Neerukonda, Guntur.",
    timestamp: "2026-09-29T08:10:00.000Z",
    dateFormatted: "Sep 29, 2026 · 8:10 AM",
    category: "GENERAL",
    priority: "LOW",
    priorityScore: 8,
    priorityReason: "Non-university commercial shipment update filtered out from academic feed.",
    categoryReason: "Commercial e-commerce delivery notification.",
    summary: "Amazon delivery dispatch notification.",
    actionRequired: false,
    urgency: "LOW",
    tags: ["noise", "amazon", "external"],
    isRead: false,
    source: "demo",
    isNoise: true
  },

  // 12. NOISE FILTER DEMONSTRATION 2 (SOCIAL MEDIA MARKETING FILTERED OUT)
  {
    id: "email-srm-012",
    sender: "notifications@instagram.com",
    senderName: "Instagram",
    recipient: "demo.student@gmail.com",
    subject: "srmap_confessions and 12 others shared new reels",
    body: "Catch up on new posts and reels from your campus friends on Instagram.",
    timestamp: "2026-09-29T07:40:00.000Z",
    dateFormatted: "Sep 29, 2026 · 7:40 AM",
    category: "GENERAL",
    priority: "LOW",
    priorityScore: 5,
    priorityReason: "External social media notification filtered out by University Domain Security Policy.",
    categoryReason: "Social media notification.",
    summary: "Instagram reel notification.",
    actionRequired: false,
    urgency: "LOW",
    tags: ["noise", "instagram", "external"],
    isRead: true,
    source: "demo",
    isNoise: true
  }
];

// Generate comprehensive dataset to reach 115+ synthetic SRM AP communications
export function generateFullDataset(): EmailData[] {
  const result: EmailData[] = [...baseEmails];

  const srmChannels = [
    { cat: "ACADEMICS", sender: "dean.seas@srmap.edu.in", name: "Dean, School of Engineering and Sciences" },
    { cat: "EXAMS", sender: "hod.cse@srmap.edu.in", name: "Department of Computer Science and Engineering" },
    { cat: "ATTENDANCE", sender: "dean.seas@srmap.edu.in", name: "SEAS Academic Monitoring Cell" },
    { cat: "ASSIGNMENTS", sender: "hod.cse@srmap.edu.in", name: "CSE Course Coordinator" },
    { cat: "TIMETABLE", sender: "dean.seas@srmap.edu.in", name: "SEAS Academic Timetable Committee" },
    { cat: "COURSE REGISTRATION", sender: "dean.seas@srmap.edu.in", name: "Office of the Dean, SEAS" },
    { cat: "EVENTS", sender: "communications@srmap.edu.in", name: "Directorate of Communications" },
    { cat: "TECH EVENTS", sender: "communications@srmap.edu.in", name: "Directorate of Communications" },
    { cat: "HACKATHONS", sender: "acm.core@srmap.edu.in", name: "ACM Student Chapter, SRM AP" },
    { cat: "STUDENT CLUBS", sender: "acm.core@srmap.edu.in", name: "ACM Student Chapter, SRM AP" },
    { cat: "ENTREPRENEURSHIP", sender: "ecell@srmap.edu.in", name: "Directorate of Entrepreneurship & Innovation" },
    { cat: "FEES", sender: "communications@srmap.edu.in", name: "Finance & Accounts Division" },
    { cat: "HOSTEL", sender: "registrar.office@srmap.edu.in", name: "Hostel Wardens Directorate" },
    { cat: "TRANSPORT", sender: "communications@srmap.edu.in", name: "Campus Fleet Operations" },
    { cat: "ADMINISTRATION", sender: "registrar.office@srmap.edu.in", name: "Registrar Office, SRM University-AP" },
    { cat: "EMERGENCY", sender: "registrar.office@srmap.edu.in", name: "Registrar Office, SRM University-AP" },
    { cat: "FACILITIES", sender: "communications@srmap.edu.in", name: "Campus Facilities & Estate Office" },
    { cat: "LIBRARY", sender: "communications@srmap.edu.in", name: "Central Library Administration" },
    { cat: "SCHOLARSHIPS", sender: "registrar.office@srmap.edu.in", name: "Financial Aid & Scholarship Cell" }
  ];

  const subjectsAndBodies = [
    {
      cat: "ACADEMICS",
      sub: "CSE 203 Discrete Mathematics Makeup Tutorial on Saturday",
      body: "A special problem-solving session on Graph Theory and Recurrence Relations will take place on Saturday at 10:00 AM in SR Block Room 304.",
      action: "Attend CSE 203 tutorial in SR Block Room 304",
      priority: "MEDIUM" as const,
      score: 55,
      deadlineDays: 4,
      loc: "SR Block Room 304",
      sys: "Academic Portal"
    },
    {
      cat: "ASSIGNMENTS",
      sub: "CSE 213 Advanced Java Programming Lab Record Submission",
      body: "All Semester 3 CSE students must submit their verified Java multithreading and JDBC lab exercise code sheets to their respective lab instructors.",
      action: "Submit Java lab record signed sheets before Friday 4 PM",
      priority: "HIGH" as const,
      score: 82,
      deadlineDays: 3,
      loc: "Computing Lab 4, SR Block",
      sys: "Academic Portal"
    },
    {
      cat: "EXAMS",
      sub: "MDS 250 AI Mid-Semester Question Pattern & Formula Sheet Guidelines",
      body: "For MDS 250 (Do Machines Think: Introduction to AI), approved non-programmable statistical sheets will be provided inside the examination hall.",
      action: "Review approved formula sheets on LMS",
      priority: "MEDIUM" as const,
      score: 50,
      deadlineDays: 6,
      loc: "S202, SR Block",
      sys: "Exam System"
    },
    {
      cat: "TIMETABLE",
      sub: "Revised Friday Timetable Allocation for Compensatory Working Day",
      body: "As notified by the Registrar, classes on Saturday, Oct 10 will follow Friday's timetable exactly. Section A & B timetable slots have been updated on the ERP.",
      action: "Check updated Friday course slot schedule on ERP portal",
      priority: "HIGH" as const,
      score: 75,
      deadlineDays: 11,
      loc: "Neerukonda Campus",
      sys: "Timetable"
    },
    {
      cat: "COURSE REGISTRATION",
      sub: "Spring 2027 Elective Preference Selection Window Opening Soon",
      body: "SEAS students entering Semester 4 can register preferences for AI/ML Track electives (Reinforcement Learning vs Deep Vision). Verify CGPA prerequisites on portal.",
      action: "Submit course elective preferences on student ERP",
      priority: "MEDIUM" as const,
      score: 64,
      deadlineDays: 14,
      loc: "ERP Portal",
      sys: "Academic Portal"
    },
    {
      cat: "TECH EVENTS",
      sub: "Guest Lecture on Edge Computing & TinyML by Intel AI Lab",
      body: "The Department of Electronics and Communication Engineering invites SEAS students to a distinguished guest lecture on TinyML deployment in X-Lab Auditorium.",
      action: "Register seat via Google Form QR code",
      priority: "MEDIUM" as const,
      score: 48,
      deadlineDays: 5,
      loc: "X-Lab Auditorium",
      sys: "Student Activity"
    },
    {
      cat: "HOSTEL",
      sub: "Hostel Maintenance & Water Tank Chlorination Window Notice",
      body: "Scheduled water pipe chlorination will occur in Ganga and Yamuna Hostel Blocks tomorrow between 1:30 PM and 4:30 PM. Water supply will be restricted.",
      action: "Store necessary water for personal use prior to 1:30 PM",
      priority: "MEDIUM" as const,
      score: 60,
      deadlineDays: 1,
      loc: "Ganga & Yamuna Hostel Blocks",
      sys: "Campus Location"
    },
    {
      cat: "LIBRARY",
      sub: "Central Library Extended 24/7 Reading Room Hours for Mid-Sem",
      body: "The Central Library has extended ground and first floor reading room hours to 24/7 through October 15. Student ID swipe required after 10:00 PM.",
      action: "Use student ID card for night reading hall entry",
      priority: "MEDIUM" as const,
      score: 45,
      deadlineDays: 15,
      loc: "Central Library, Neerukonda",
      sys: "Campus Location"
    },
    {
      cat: "SCHOLARSHIPS",
      sub: "SRM AP Merit Scholarship Renewal Verification – CGPA Cutoff 8.5",
      body: "Students with scholarship grants must submit their Semester 1 & 2 grade cards to the Financial Aid Cell (Admin Block) before October 8 to confirm renewal.",
      action: "Submit verified grade transcripts to Financial Aid Cell",
      priority: "HIGH" as const,
      score: 87,
      deadlineDays: 9,
      loc: "Financial Aid Cell, Admin Block",
      sys: "Academic Portal"
    },
    {
      cat: "FACILITIES",
      sub: "Campus Wi-Fi Core Router Firmware Upgrade Window",
      body: "IT Network Services will perform firmware upgrades on edge access points on Saturday midnight (12:00 AM - 3:00 AM). Temporary disconnects expected.",
      action: "Plan offline revisions during Saturday midnight window",
      priority: "LOW" as const,
      score: 25,
      deadlineDays: 4,
      loc: "Campus Wide Network",
      sys: "Campus Location"
    },
    {
      cat: "ENTREPRENEURSHIP",
      sub: "HatchLab Incubation Seed Funding Cohort 2026 Applications",
      body: "HatchLab at SRM University-AP invites student startup ideas for ₹5 Lakh proof-of-concept prototype grants. Applications open across all schools.",
      action: "Submit executive proposal deck on HatchLab portal",
      priority: "HIGH" as const,
      score: 80,
      deadlineDays: 12,
      loc: "HatchLab, Admin Block",
      sys: "Student Activity"
    }
  ];

  let currentId = 13;
  const baseDate = new Date("2026-09-29T10:00:00.000Z");

  for (let i = 0; i < 95; i++) {
    const template = subjectsAndBodies[i % subjectsAndBodies.length];
    const channel = srmChannels.find(c => c.cat === template.cat) || srmChannels[0];

    const daysAgo = Math.floor(i / 3) + 1;
    const emailDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000 + (i % 8) * 3600 * 1000);
    const deadlineDate = new Date(emailDate.getTime() + template.deadlineDays * 24 * 60 * 60 * 1000);

    const formattedDate = emailDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const formattedTime = emailDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

    const jitter = (i % 7) - 3;
    const finalScore = Math.max(15, Math.min(95, template.score + jitter));
    let calculatedPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (finalScore >= 90) calculatedPriority = 'CRITICAL';
    else if (finalScore >= 75) calculatedPriority = 'HIGH';
    else if (finalScore >= 45) calculatedPriority = 'MEDIUM';

    result.push({
      id: `email-srm-${String(currentId).padStart(3, '0')}`,
      sender: channel.sender,
      senderName: channel.name,
      recipient: "demo.student@srmap.edu.in",
      subject: `${template.sub} [Ref #SRM-${2000 + i}]`,
      body: `Dear Muthu (B.Tech CSE - AI & ML, Semester 3),\n\n${template.body}\n\nPlease take appropriate note and complete any required academic or administrative procedures within the prescribed timeline.\n\nWarm regards,\n${channel.name}\nSRM University-AP, Andhra Pradesh\nNeerukonda, Mangalagiri Mandal, Guntur - 522240`,
      timestamp: emailDate.toISOString(),
      dateFormatted: `${formattedDate} · ${formattedTime}`,
      category: template.cat,
      priority: calculatedPriority,
      priorityScore: finalScore,
      priorityReason: `Evaluated urgency based on ${template.cat.toLowerCase()} requirements at SRM AP, deadline proximity (${template.deadlineDays} days), and academic impact.`,
      categoryReason: `Classified under ${template.cat} based on verified SRM AP communication channel patterns.`,
      summary: template.body.slice(0, 115) + '...',
      actionRequired: template.priority === 'HIGH' || (i % 2 === 0),
      actionText: template.action,
      actionDeadline: deadlineDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      deadlineDate: deadlineDate.toISOString(),
      location: template.loc,
      affectedGroup: "B.Tech CSE Semester 3",
      urgency: calculatedPriority,
      tags: [template.cat.toLowerCase(), "srmap", "seas", "notice"],
      isRead: i > 20,
      isActionCompleted: i > 40 && (i % 3 === 0),
      source: "demo",
      systemOrigin: template.sys,
      threadId: `thread-srm-${template.cat.toLowerCase()}-${Math.floor(i / 5)}`
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

  console.log(`Successfully generated ${dataset.length} authentic SRM University-AP synthetic emails!`);
}

if (require.main === module) {
  writeDemoDataFiles();
}
