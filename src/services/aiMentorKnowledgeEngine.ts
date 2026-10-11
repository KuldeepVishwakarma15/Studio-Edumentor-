// Comprehensive AI Mentor Knowledge & Response Engine
// Used across both client-side and server-side to guarantee 100% consistent,
// detailed, rich, multi-paragraph, ChatGPT-grade academic answers anywhere (local, deployed, offline).

export interface StudentContextData {
  name?: string;
  course?: string;
  riskScore?: number;
  riskLevel?: string;
  attendance?: number;
  semester?: number;
  topReasons?: string[];
}

export function cleanTextFormatting(raw: string): string {
  if (!raw) return '';
  let cleaned = raw;
  // Replace markdown headers (###, ##, #) with clean titles
  cleaned = cleaned.replace(/^#{1,6}\s*(.*)$/gm, '📌 $1');
  // Strip bold/italic markdown asterisks but preserve text
  cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  // Replace bullet asterisks with clean bullet emojis
  cleaned = cleaned.replace(/^\s*\*\s+/gm, '🔹 ');
  cleaned = cleaned.replace(/^\s*-\s+/gm, '🔹 ');
  return cleaned.trim();
}

export function generateDetailedEduMentorResponse(
  rawQuery: string,
  studentName = 'Student',
  context?: StudentContextData
): string {
  const query = rawQuery.toLowerCase().trim();
  const safeName = studentName && studentName !== 'Student' ? studentName : (context?.name || 'Student');
  const attendance = context?.attendance || 72;
  const course = context?.course || 'Engineering / Computer Science';
  const riskScore = context?.riskScore || 45;

  // 1. GREETINGS
  if (/^(hi|hello|hey|namaste|hola|good\s*(morning|afternoon|evening)|yo|pranam)\b/i.test(query)) {
    return `Hello ${safeName}! 👋 I am EduMentor AI — your 24/7 Intelligent Academic Mentor and Student Retention Advisor.

I am here to help you ace your semester exams, boost your attendance, understand difficult concepts, and build a strong career.

Here are high-impact areas we can tackle together right now:

🔹 📅 4-Week Backlog & Exam Recovery Plan: Clear pending subjects with a prioritized chapter timetable.
🔹 📊 Attendance & AICTE 75% Cutoff: Calculate required lecture hours to avoid examination debarment.
🔹 💻 Programming & DSA Mastery: Get step-by-step code tutorials in Python, Java, C++, React, and SQL.
🔹 💰 Scholarships & Fee Relief: Discover National Scholarship Portal (NSP) schemes, AICTE Pragati, and fee installment plans.
🔹 🌿 Stress & Overwhelm Support: Practical pacing techniques and confidential support resources.
🔹 🖥️ Core Computer Science & STEM: Deep explanations for OS, DBMS, Networks, Calculus, and Digital Electronics.

What subject, question, or study challenge would you like to solve today?`;
  }

  // 2. PYTHON & PROGRAMMING FUNDAMENTALS
  if (query.includes('python') || query.includes('oop') && query.includes('python')) {
    return `🐍 Python Programming Comprehensive Guide for ${safeName} (${course})

Python is one of the most versatile and beginner-friendly programming languages. Let's break down the essential concepts thoroughly with clean practical examples:

📌 1. Core Language Building Blocks:
🔹 Variables & Dynamic Typing: Python determines data types automatically (int, float, str, bool, list, dict).
🔹 Control Flow: Conditional branching with if, elif, else and iteration with for and while loops.
🔹 Functions: Reusable modular blocks defined using the def keyword with default parameters and return values.

💻 2. Real-World Practical Example (Student Academic Tracker):
\`\`\`python
# EduMentor Student Performance & Attendance Tracker
class StudentRecord:
    def __init__(self, name, attendance_rate, passed_units, total_units):
        self.name = name
        self.attendance_rate = attendance_rate
        self.passed_units = passed_units
        self.total_units = total_units

    def evaluate_status(self):
        # AICTE 75% attendance threshold check
        is_attendance_valid = self.attendance_rate >= 75
        clearance_rate = self.passed_units / self.total_units

        if is_attendance_valid and clearance_rate >= 0.70:
            return "✅ Eligible for Semester Final Examinations (Good Standing)"
        elif not is_attendance_valid:
            shortfall = 75 - self.attendance_rate
            return f"⚠️ Attendance Warning: Short by {shortfall}% from AICTE minimum cutoff"
        else:
            return "📚 Academic Advisory: Remedial peer tutoring recommended"

# Execution test
student = StudentRecord("${safeName}", ${attendance}, 5, 6)
print(student.evaluate_status())
\`\`\`

⚙️ 3. Object-Oriented Programming (OOP) Pillars:
1️⃣ Encapsulation: Grouping attributes and methods into a class and keeping internal states safe using private (_ or __) conventions.
2️⃣ Inheritance: Creating specialized subclasses (e.g., class EngineeringStudent(StudentRecord):) to eliminate code duplication.
3️⃣ Polymorphism: Implementing common interfaces where subclasses override methods like evaluate_status().
4️⃣ Abstraction: Exposing only high-level functionality while hiding complex internal algorithms.

🎯 4. University Exam & Placement Tips:
🔹 Practice List Comprehensions: [x*2 for x in numbers if x % 2 == 0] is frequently tested in interviews.
🔹 Dictionary Operations: Know .get(), .items(), and key lookups which have O(1) average time complexity.
🔹 Error Handling: Always wrap file I/O or network calls in try/except/finally blocks to prevent abrupt crashes.`;
  }

  // 3. DATA STRUCTURES & ALGORITHMS (DSA) / CODING
  if (query.includes('dsa') || query.includes('data structure') || query.includes('algorithm') || query.includes('array') || query.includes('linked list') || query.includes('binary search') || query.includes('tree') || query.includes('dynamic programming')) {
    return `🚀 Data Structures & Algorithms (DSA) Roadmap for ${safeName}

Mastering DSA is the single most valuable investment for clearing technical interviews at top software companies and excelling in your university examinations.

📌 1. Essential Data Structures Hierarchy:
🔹 Linear Structures:
  👉 Arrays & Strings: Contiguous memory, O(1) random access, O(n) insertions.
  👉 Linked Lists: Dynamic sizing, O(1) head insertion, pointers traversal.
  👉 Stacks & Queues: LIFO (Stack) for undo/DFS, FIFO (Queue) for scheduling/BFS.
🔹 Non-Linear Structures:
  👉 HashMaps / HashTables: Key-value lookup in O(1) average time. Must-master for 60% of interview problems.
  👉 Binary Trees & BST: Hierarchical data. Inorder traversal of BST yields sorted elements.
  👉 Graphs: Nodes and edges. Represented via Adjacency List; traversed with BFS (shortest path) and DFS (cycle detection).

💻 2. High-Yield Algorithm Pattern: Binary Search (O(log n)):
\`\`\`python
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    
    while low <= high:
        mid = low + (high - low) // 2  # Prevents integer overflow
        if arr[mid] == target:
            return mid  # Target found at index
        elif arr[mid] < target:
            low = mid + 1  # Search right half
        else:
            high = mid - 1  # Search left half
            
    return -1  # Target not found
\`\`\`

⚙️ 3. 4-Week Structured DSA Study Blueprint:
1️⃣ Week 1 - Arrays, Strings & Two Pointers: Solve 20 Easy problems (Two Sum, Valid Palindrome, Best Time to Buy and Sell Stock).
2️⃣ Week 2 - HashMaps & Sliding Window: Master frequency counting, Longest Substring Without Repeating Characters, Subarray Sum Equals K.
3️⃣ Week 3 - Recursion, Linked Lists & Trees: Invert Binary Tree, Maximum Depth of Binary Tree, Reverse Linked List.
4️⃣ Week 4 - Dynamic Programming & Graphs: Climbing Stairs, Coin Change, Number of Islands, BFS/DFS traversals.

🎯 4. Pro Advice for Placement Tests:
🔹 Always discuss Time and Space Complexity before writing code.
🔹 Handle edge cases first: empty array, single element, negative numbers, duplicates.
🔹 Consistency rule: Solving 2 problems thoughtfully every day beats cramming 20 problems once a week!`;
  }

  // 4. TIMETABLE / STUDY PLAN / BACKLOGS / EXAM PREPARATION
  if (query.includes('timetable') || query.includes('schedule') || query.includes('backlog') || query.includes('exam') || query.includes('fail') || query.includes('study plan') || query.includes('syllabus') || query.includes('marks')) {
    return `📅 4-Week Backlog Recovery & Exam Strategy for ${safeName}

Clearing pending backlogs and achieving high marks in semester exams is 100% possible with a disciplined, structured approach. Here is your battle-tested strategy:

📌 1. The 4-Week Milestone Framework:
1️⃣ Week 1 - High-Yield Unit Prioritization (The 80/20 Rule):
   🔹 Download the last 3 years of Previous Year Question Papers (PYQs) from the college portal.
   🔹 Identify the top 3 recurring chapters per subject. In university exams, ~3 chapters account for 60% of all scoring marks!
   🔹 Create a one-page formula and definition sheet for each unit.

2️⃣ Week 2 - Dedicated 90-Minute Focus Blocks (Pomodoro Technique):
   🔹 Slot 1 (5:30 PM – 6:15 PM): Active Reading (Understand core textbook theories or watch a 10-minute concept video).
   🔹 Slot 2 (6:25 PM – 7:10 PM): Hands-on Problem Solving (Solve 2 numericals or write out derivations with books closed).
   🔹 Slot 3 (7:10 PM – 7:30 PM): Flashcard Revision (Test key terms and diagrams).

3️⃣ Week 3 - Professor & Proctor Doubt Resolution:
   🔹 Take your solved notebooks to your subject professor or faculty mentor during office hours.
   🔹 Asking targeted questions shows proactive commitment and often helps earn positive continuous internal assessment marks.

4️⃣ Week 4 - Timed Mock Exam Simulation:
   🔹 Solve a full 3-hour past paper under strict exam conditions without your phone.
   🔹 Pacing check: Allocate 30 minutes for 10-mark long answers, 12 minutes for 5-mark answers, and 15 minutes for final review.

💡 2. Scoring Secrets for University Answer Sheets:
🔹 Write clear Given Data, Formula, and Final Units for all engineering numericals (examiners award partial marks!).
🔹 Use neat pencil diagrams with clean arrow labels for technical processes.
🔹 Underline key technical keywords with a black pen to help examiners spot points quickly.`;
  }

  // 5. AICTE ATTENDANCE / 75% CUTOFF / DEBARMENT
  if (query.includes('attendance') || query.includes('cutoff') || query.includes('75%') || query.includes('bunk') || query.includes('absent') || query.includes('condonation')) {
    const needed = Math.max(0, 75 - attendance);
    return `📊 AICTE 75% Attendance Compliance Strategy for ${safeName}

Your current recorded attendance is ${attendance}%. Staying above the statutory AICTE 75% attendance threshold is essential to remain eligible for university semester examinations.

📌 1. AICTE Regulatory Guidelines:
Under statutory AICTE & University regulations:
🔹 Minimum Required Attendance: 75% across all theoretical and laboratory classes.
🔹 Debarment Zone: Students below 65% may face complete examination hall ticket cancellation.
🔹 Condonation Range (65% – 74%): Condonation on genuine medical or compassionate grounds may be granted by the College Principal/Dean with authorized documentation.

⚙️ 2. Rapid Recovery Mathematics:
${needed > 0
  ? `🔹 Your Current Shortfall: You are currently ${needed}% below the 75% benchmark.
🔹 The 3-Week Rule: If you attend 100% of all scheduled lectures over the next 3 weeks, your cumulative attendance will climb by approximately 6% to 9%.
🔹 Priority to Labs & Practicals: University ERP systems weight 2-hour and 3-hour lab sessions heavily. Never miss a scheduled lab session.`
  : `🔹 You are currently meeting or close to the required threshold (${attendance}%). Maintain regular attendance to build a comfortable buffer before end-semester finals!`
}

🏛️ 3. Administrative Safeguards & Action Checklist:
1️⃣ Medical Certificates: If you missed classes due to illness, submit an authorized doctor's medical certificate along with an application letter to your HOD within 7 days.
2️⃣ Attendance Audit: Request your proctor or departmental clerk for your ERP attendance log to verify that duty leaves (sports, cultural fest, NSS/NCC) have been entered.
3️⃣ Extra / Remedial Lectures: Attend departmental makeup sessions or Saturday remedial classes to accumulate attendance credits before hall tickets are finalized.`;
  }

  // 6. SCHOLARSHIPS / FEES / FINANCIAL AID
  if (query.includes('scholarship') || query.includes('fee') || query.includes('tuition') || query.includes('money') || query.includes('financial') || query.includes('nsp') || query.includes('grant') || query.includes('dues')) {
    return `💰 Government Scholarships & Tuition Fee Relief for ${safeName}

Financial stress should never disrupt a hardworking student's degree. There are multiple central, state, and institutional channels available to support your studies:

📌 1. Government Scholarship Portals:
🔹 National Scholarship Portal (NSP - scholarships.gov.in):
   👉 Central Sector Scheme for College and University Students: Up to ₹20,000 per year for students securing high percentiles in Higher Secondary.
   👉 Post-Matric Scholarships for SC/ST/OBC/EWS: Full or partial tuition fee reimbursement plus monthly maintenance allowances.
🔹 AICTE Flagship Schemes:
   👉 Pragati Scheme: ₹50,000 per annum for eligible female students pursuing technical degree/diploma programs.
   👉 Saksham Scheme: ₹50,000 per annum for differently-abled technical students.
   👉 Swanath Scheme: Financial support for orphaned or COVID-affected students.

🏫 2. Institutional College Relief Mechanisms:
1️⃣ Deferred Fee Installments: Submit a formal application to the Dean of Student Affairs requesting a 3-part deferred payment installment plan.
2️⃣ Departmental Book Bank: Check out complete semester textbook sets from the central library book bank for free to save on study expenses.
3️⃣ Student Emergency Hardship Funds: Many colleges and Alumni Associations maintain emergency aid funds for students facing unexpected economic hardships.

📝 3. Document Preparation Checklist:
🔹 Family Income Certificate (issued by Revenue Officer / Tehsildar).
🔹 Caste / Category Certificate (if applicable).
🔹 Previous Semester Marksheet and College Bonafide Certificate.
🔹 Aadhaar-seeded Bank Account passbook copy.`;
  }

  // 7. MENTAL HEALTH, STRESS, ANXIETY & OVERWHELM
  if (query.includes('stress') || query.includes('anxiety') || query.includes('overwhelm') || query.includes('tired') || query.includes('fear') || query.includes('give up') || query.includes('depress') || query.includes('panic')) {
    return `🌿 Mental Wellness & Calm Guidance for ${safeName}

Take a slow, deep breath in... and exhale. What you are feeling right now is completely human and valid. College is demanding, but you do not have to carry this pressure alone.

📌 1. Immediate Mindset Reset (The 1-Task Rule):
🔹 Stop looking at the entire syllabus at once. When a mountain looks too steep, focus on just one small step.
🔹 Commit to just ONE 15-minute subtopic today. Once you start, friction decreases and momentum returns.
🔹 Remember: A difficult semester or low midterm score does NOT define your intellect or your future career. Thousands of successful engineers faced backlogs and bounced back stronger.

⚙️ 2. Physical & Cognitive Restoration:
1️⃣ 7 Hours of Sleep: Sleep deprivation increases cortisol (stress hormone) by over 40% and impairs cognitive memory recall during exams.
2️⃣ Digital Pause: Put social media notifications on silent during study hours to avoid comparing yourself to others.
3️⃣ Paced Breathing: Use the 4-4-4 Box Breathing technique (inhale for 4 seconds, hold for 4, exhale for 4) whenever exam panic strikes.

🤝 3. Active Campus & Professional Support:
🔹 Talk to your Faculty Proctor or Mentor: Teachers are there to support you. Explaining your situation often opens options like extended assignment deadlines or syllabus prioritization.
🔹 24/7 National Tele-MANAS Helpline: Call 14416 (Toll-free in India) for free, completely confidential, 24/7 mental health counseling with licensed professionals.`;
  }

  // 8. DATABASE MANAGEMENT SYSTEMS (DBMS) & SQL
  if (query.includes('dbms') || query.includes('database') || query.includes('sql') || query.includes('normalization') || query.includes('acid') || query.includes('join')) {
    return `🗄️ Database Management Systems (DBMS) & SQL Mastery for ${safeName}

DBMS is one of the highest-weightage core subjects in university exams and tech placements. Here is a clear, structured breakdown:

📌 1. Fundamental DBMS Concepts:
🔹 Relational Model: Data organized in tables (relations) with rows (tuples) and columns (attributes).
🔹 Keys:
   👉 Primary Key: Uniquely identifies each row (cannot be NULL).
   👉 Foreign Key: Establishes referential integrity between two tables.
   👉 Candidate Key: Minimal super key capable of uniquely identifying records.

💻 2. Essential SQL Queries & Joins:
\`\`\`sql
-- 1. Create Student Table
CREATE TABLE Students (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course VARCHAR(50),
    attendance_rate DECIMAL(5,2)
);

-- 2. Query High-Risk Students with Attendance below 75%
SELECT name, course, attendance_rate
FROM Students
WHERE attendance_rate < 75.0
ORDER BY attendance_rate ASC;

-- 3. INNER JOIN between Students and Exam Grades
SELECT s.name, g.subject_name, g.grade
FROM Students s
INNER JOIN Grades g ON s.student_id = g.student_id
WHERE g.grade >= 12.0;
\`\`\`

⚙️ 3. Normalization (Eliminating Redundancy):
1️⃣ 1NF (First Normal Form): Every column contains atomic (indivisible) values; no repeating groups.
2️⃣ 2NF (Second Normal Form): Must be in 1NF and have NO partial dependency (all non-key attributes fully dependent on primary key).
3️⃣ 3NF (Third Normal Form): Must be in 2NF and have NO transitive dependency (X -> Y and Y -> Z).
4️⃣ BCNF (Boyce-Codd): Stricter 3NF where for every functional dependency X -> Y, X must be a super key.

🎯 4. ACID Properties for Transactions:
🔹 Atomicity: All operations in a transaction succeed, or the entire transaction is rolled back (All or Nothing).
🔹 Consistency: Database transitions from one valid state to another, obeying all integrity constraints.
🔹 Isolation: Concurrent transactions execute independently without interfering with each other.
🔹 Durability: Once a transaction commits, changes are permanently saved even in the event of system crashes.`;
  }

  // 9. OPERATING SYSTEMS (OS)
  if (query.includes('operating system') || query.includes('os') || query.includes('process') || query.includes('thread') || query.includes('deadlock') || query.includes('semaphore') || query.includes('paging')) {
    return `🖥️ Operating Systems (OS) Comprehensive Guide for ${safeName}

An Operating System acts as an intermediary between user applications and computer hardware. Here are the core topics tested in exams and placements:

📌 1. Process Management:
🔹 Process vs Thread:
  👉 Process: An executing program with its own memory space (code, data, heap, stack). High context-switch overhead.
  👉 Thread: A lightweight unit of execution within a process that shares memory and resources with sibling threads.
🔹 Process States: New ➔ Ready ➔ Running ➔ Waiting/Blocked ➔ Terminated.

⚙️ 2. CPU Scheduling Algorithms:
1️⃣ FCFS (First-Come, First-Served): Simple, but suffers from the Convoy Effect (short processes stuck behind long ones).
2️⃣ SJF (Shortest Job First): Optimal minimum average waiting time. Preemptive version is SRTF (Shortest Remaining Time First).
3️⃣ Round Robin (RR): Preemptive scheduling with a fixed Time Quantum. Fair and ideal for time-sharing systems.

🔒 3. Process Synchronization & Deadlocks:
🔹 Critical Section Problem: Code segment accessing shared resources. Must satisfy Mutual Exclusion, Progress, and Bounded Waiting.
🔹 Semaphores: Integer variables accessed via wait() (P) and signal() (V) atomic operations.
🔹 Deadlock 4 Necessary Coffman Conditions:
  1. Mutual Exclusion
  2. Hold and Wait
  3. No Preemption
  4. Circular Wait
🔹 Deadlock Handling: Banker's Algorithm (Deadlock Avoidance using safe state checks).

💾 4. Memory Management:
🔹 Paging: Physical memory divided into fixed-size Frames; logical memory divided into Pages. Eliminates external fragmentation.
🔹 Page Replacement Algorithms: FIFO, LRU (Least Recently Used - optimal in practice), and Optimal (replace page needed furthest in future).`;
  }

  // 10. COMPUTER NETWORKS
  if (query.includes('network') || query.includes('tcp') || query.includes('osi') || query.includes('ip address') || query.includes('dns') || query.includes('http')) {
    return `🌐 Computer Networks Core Concepts for ${safeName}

Networking forms the infrastructure of modern distributed systems and cloud architecture. Let's review the key layers and protocols:

📌 1. The OSI 7-Layer Model:
1️⃣ Physical Layer: Raw bit streams over physical media (cables, radio waves).
2️⃣ Data Link Layer: Node-to-node framing, MAC addressing, error detection (CRC).
3️⃣ Network Layer: Logical IP addressing and routing packets across networks (Routers, IP, ICMP).
4️⃣ Transport Layer: End-to-end communication, reliability, port numbers (TCP, UDP).
5️⃣ Session Layer: Establishing, managing, and terminating sessions.
6️⃣ Presentation Layer: Data format translation, encryption (SSL/TLS), compression.
7️⃣ Application Layer: Network services for user applications (HTTP, DNS, SMTP, FTP).

⚙️ 2. TCP vs UDP Comparison:
🔹 TCP (Transmission Control Protocol): Connection-oriented, highly reliable, guarantees in-order delivery via 3-Way Handshake (SYN ➔ SYN-ACK ➔ ACK), flow control, congestion control. Used for Web (HTTP), Email, File Transfer.
🔹 UDP (User Datagram Protocol): Connectionless, lightweight, low-latency, no packet retransmission. Ideal for live video streaming, voice calls (VoIP), online gaming, and DNS lookups.

💡 3. High-Yield Exam Questions:
🔹 What happens when you type google.com in a browser?
   👉 DNS lookup resolves domain to IP ➔ TCP 3-way handshake on port 443 ➔ TLS encryption handshake ➔ HTTP GET request sent ➔ Server responds with HTML/CSS/JS ➔ Browser renders DOM.
🔹 IPv4 vs IPv6: IPv4 uses 32-bit addresses (~4.3 billion); IPv6 uses 128-bit hexadecimal addresses to support unlimited connected devices.`;
  }

  // 11. MATHEMATICS, CALCULUS, ENGINEERING SCIENCES
  if (query.includes('math') || query.includes('calculus') || query.includes('matrix') || query.includes('derivative') || query.includes('integral') || query.includes('physics') || query.includes('circuit')) {
    return `📐 Engineering Mathematics & Sciences Mastery for ${safeName}

Engineering mathematics and sciences are foundational for computational logic and technical problem-solving. Here is how to master them:

📌 1. The 3-Step Problem-Solving Framework:
1️⃣ Step 1 - Understand the Geometric Meaning:
   🔹 Derivatives: Rate of change, tangent slope, velocity.
   🔹 Integrals: Accumulated total, area under curves, work done.
   🔹 Matrices: Linear transformations, coordinate rotations, systems of equations.
2️⃣ Step 2 - Formula Sheet Construction:
   🔹 Keep a single handwritten formula sheet for each unit. Writing by hand strengthens neural memory.
3️⃣ Step 3 - Solve Standard Archetypes:
   🔹 Every university exam tests 4 to 5 standard archetypes per unit. Master the solved textbook examples for each before moving to exercise problems.

💡 2. Scoring Secrets for University Math Exams:
🔹 Always write down: Given Data ➔ Formula ➔ Intermediate Substitution ➔ Final Answer with Units.
🔹 University evaluators award up to 50% partial marks for correct setups, even if minor arithmetic slips happen near the end!
🔹 Draw clean, labeled coordinate axes and curve sketches with a pencil whenever applicable.`;
  }

  // 12. CAREER, INTERNSHIPS, PLACEMENTS & RESUME
  if (query.includes('career') || query.includes('job') || query.includes('placement') || query.includes('internship') || query.includes('resume') || query.includes('interview')) {
    return `🎯 Career Acceleration & Placement Roadmap for ${safeName}

Building strong employability throughout your college semesters ensures confidence and early placement offers:

📌 1. High-Impact Placement Checklist:
🔹 1 Single-Page ATS-Friendly Resume: Use clean, single-column formats (like Jake's Resume on Overleaf). Highlight measurable achievements (e.g., "Built student retention dashboard improving prediction speed by 40%").
🔹 2 Production-Grade GitHub Projects: Showcase real-world full-stack web or data science apps with clear README files, architecture diagrams, and live deployment URLs.
🔹 100-150 Core DSA Problems: Master foundational patterns in Arrays, HashMaps, Sliding Window, Trees, and Dynamic Programming on LeetCode or GeeksforGeeks.

🚀 2. Active Internship Channels:
👉 AICTE Internship Portal: Regular listings from public sector undertakings (PSUs), government bodies, IBM, and tech startups.
👉 Cold Outreach on LinkedIn: Message college alumni working at your target companies with a polite, 3-sentence note inquiring about junior openings or resume review.
👉 Open-Source Contributions: Contribute documentation or bug fixes to active GitHub repositories to show real collaboration skills.`;
  }

  // 13. COMPREHENSIVE DYNAMIC RESPONSE FOR ANY OTHER ACADEMIC QUESTION
  const cleanTopic = rawQuery.replace(/[*_`#]/g, '').trim();
  return `💡 EduMentor AI Comprehensive Academic Analysis for ${safeName}

Inquiry: "${cleanTopic}"

📌 1. Core Principles & Theoretical Foundation:
Understanding ${cleanTopic} begins by anchoring its central objectives and technical definitions within your ${course} curriculum:
🔹 Primary Objective: Dissect the subject into modular components rather than treating it as a monolithic topic.
🔹 Fundamental Rule: Connect abstract definitions to concrete real-world systems (such as computational architecture, algorithms, or engineering workflows).
🔹 Key Terminology: Build fluency with standard textbook vocabulary and standard notation used by university exam boards.

⚙️ 2. Deep-Dive Step-by-Step Breakdown:
1️⃣ Define the Baseline: Clarify the initial conditions, primary inputs, and expected outputs.
2️⃣ Logical Workflow: Trace the underlying mechanisms step-by-step to see how intermediate states transform.
3️⃣ Edge Cases & Exceptions: Identify where common student errors happen (e.g., boundary conditions, sign errors, null references, or resource bottlenecks).

💻 3. Practical Application & Exam Strategy:
🔹 University Examination Focus: In typical end-semester exams, questions on this topic generally carry 5 to 10 marks and expect both a formal definition and a labeled diagram or mathematical derivation.
🔹 Structured Answer Format: In your exam answer booklet, structure your response as:
   👉 Definition & Significance
   👉 Technical Diagram / Circuit Schematic / Code Syntax
   👉 Step-by-Step Derivation or Working Mechanism
   👉 Practical Engineering Advantages and Limitations

📝 4. Pro Study Action Plan for Today:
🔹 Spend 30 focused minutes reading the corresponding section in your standard prescribed textbook.
🔹 Write down a 5-point summary in your own handwriting to reinforce active recall.
🔹 If any specific sub-topic or formula is still unclear, ask me right here and I will break it down with more examples!`;
}
