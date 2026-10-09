const students = [
  {
    id: 1,

    // Basic information
    rollNumber: "22CS001",
    name: "Rahul",
    department: "CSE",
    semester: 6,
    staffMember: "Mr. Kumar",

    // Academic
    cgpa: 8.2,
    internalMarks: 78,
    backlogs: 0,

    // Attendance
    attendance: 82,

    // LMS
    lmsLoginFrequency: 85,
    assignmentsCompleted: 8,
    assignmentsTotal: 10,

    // Engagement
    events: 5,
    clubs: 2,
    hackathons: 2,
    certifications: 3,

    // Placement
    aptitudeScore: 82,
    codingScore: 78,
    mockInterviewScore: 75,

    // Skills
    technicalSkillScore: 80,
    softSkillScore: 76,

    // Feedback
    studentSatisfaction: 85,
    facultyFeedback: 82,

    // Overall progress
    progress: 85,

    // Calculated fields
    successScore: 0,
    riskLevel: "LOW",
    segment: "",
    riskDrivers: [],
    successDrivers: [],
  },

  {
    id: 2,

    rollNumber: "22CS002",
    name: "Priya",
    department: "CSE",
    semester: 6,
    staffMember: "Mr. Kumar",

    cgpa: 7.1,
    internalMarks: 61,
    backlogs: 1,

    attendance: 68,

    lmsLoginFrequency: 65,
    assignmentsCompleted: 6,
    assignmentsTotal: 10,

    events: 2,
    clubs: 1,
    hackathons: 0,
    certifications: 1,

    aptitudeScore: 58,
    codingScore: 52,
    mockInterviewScore: 60,

    technicalSkillScore: 62,
    softSkillScore: 68,

    studentSatisfaction: 70,
    facultyFeedback: 65,

    progress: 65,

    successScore: 0,
    riskLevel: "MEDIUM",
    segment: "",
    riskDrivers: [],
    successDrivers: [],
  },

  {
    id: 3,

    rollNumber: "22EC003",
    name: "Arun",
    department: "ECE",
    semester: 5,
    staffMember: "Ms. Anitha",

    cgpa: 5.8,
    internalMarks: 45,
    backlogs: 3,

    attendance: 52,

    lmsLoginFrequency: 40,
    assignmentsCompleted: 3,
    assignmentsTotal: 10,

    events: 1,
    clubs: 0,
    hackathons: 0,
    certifications: 0,

    aptitudeScore: 42,
    codingScore: 35,
    mockInterviewScore: 40,

    technicalSkillScore: 45,
    softSkillScore: 50,

    studentSatisfaction: 55,
    facultyFeedback: 48,

    progress: 40,

    successScore: 0,
    riskLevel: "HIGH",
    segment: "",
    riskDrivers: [],
    successDrivers: [],
  },

  {
    id: 4,

    rollNumber: "22IT004",
    name: "Sneha",
    department: "IT",
    semester: 7,
    staffMember: "Mr. Ravi",

    cgpa: 9.1,
    internalMarks: 88,
    backlogs: 0,

    attendance: 94,

    lmsLoginFrequency: 92,
    assignmentsCompleted: 10,
    assignmentsTotal: 10,

    events: 8,
    clubs: 3,
    hackathons: 4,
    certifications: 5,

    aptitudeScore: 90,
    codingScore: 92,
    mockInterviewScore: 88,

    technicalSkillScore: 94,
    softSkillScore: 91,

    studentSatisfaction: 92,
    facultyFeedback: 94,

    progress: 95,

    successScore: 0,
    riskLevel: "LOW",
    segment: "",
    riskDrivers: [],
    successDrivers: [],
  },
];

export default students;