// src/utils/analytics.js

/* =====================================================
   SUCCESS SCORE
===================================================== */

export function calculateSuccessScore(student) {

  // Academic - 25%
  const academicScore =
    (student.cgpa * 10 * 0.6) +
    (student.internalMarks * 0.4);


  // Attendance - 15%
  const attendanceScore =
    student.attendance;


  // LMS - 10%
  const assignmentPercentage =
    student.assignmentsTotal > 0
      ? (student.assignmentsCompleted /
          student.assignmentsTotal) * 100
      : 0;

  const lmsScore =
    (student.lmsLoginFrequency * 0.5) +
    (assignmentPercentage * 0.5);


  // Engagement - 10%
  const engagementScore = Math.min(
    100,
    (student.events * 5) +
    (student.clubs * 10) +
    (student.hackathons * 15) +
    (student.certifications * 10)
  );


  // Placement - 15%
  const placementScore =
    (student.aptitudeScore * 0.3) +
    (student.codingScore * 0.4) +
    (student.mockInterviewScore * 0.3);


  // Skills - 15%
  const skillsScore =
    (student.technicalSkillScore * 0.6) +
    (student.softSkillScore * 0.4);


  // Feedback - 10%
  const feedbackScore =
    (student.studentSatisfaction * 0.5) +
    (student.facultyFeedback * 0.5);


  const finalScore =
    (academicScore * 0.25) +
    (attendanceScore * 0.15) +
    (lmsScore * 0.10) +
    (engagementScore * 0.10) +
    (placementScore * 0.15) +
    (skillsScore * 0.15) +
    (feedbackScore * 0.10);


  return Math.round(finalScore);
}


/* =====================================================
   RISK CALCULATION
===================================================== */

export function calculateRisk(student) {

  let points = 0;

  if (student.cgpa < 6) {
    points += 3;
  } else if (student.cgpa < 7) {
    points += 2;
  }

  if (student.attendance < 60) {
    points += 3;
  } else if (student.attendance < 75) {
    points += 2;
  }

  if (student.backlogs >= 3) {
    points += 3;
  } else if (student.backlogs >= 1) {
    points += 2;
  }

  if (student.codingScore < 50) {
    points += 2;
  }

  if (student.aptitudeScore < 50) {
    points += 2;
  }

  if (student.mockInterviewScore < 50) {
    points += 2;
  }

  if (student.lmsLoginFrequency < 50) {
    points += 2;
  }

  if (
    student.assignmentsCompleted <
    student.assignmentsTotal * 0.6
  ) {
    points += 2;
  }

  if (student.progress < 50) {
    points += 2;
  }


  if (points >= 8) {
    return "HIGH";
  }

  if (points >= 4) {
    return "MEDIUM";
  }

  return "LOW";
}


/* =====================================================
   SCORE DRIVERS
===================================================== */

export function getScoreDrivers(student) {

  const drivers = [];

  if (student.cgpa >= 8) {
    drivers.push({
      name: "Strong CGPA",
      value: student.cgpa,
      category: "Academic",
      type: "positive"
    });
  }

  if (student.internalMarks >= 75) {
    drivers.push({
      name: "Strong internal marks",
      value: student.internalMarks,
      category: "Academic",
      type: "positive"
    });
  }

  if (student.attendance >= 80) {
    drivers.push({
      name: "Good attendance",
      value: student.attendance,
      category: "Attendance",
      type: "positive"
    });
  }

  if (student.lmsLoginFrequency >= 80) {
    drivers.push({
      name: "Strong LMS activity",
      value: student.lmsLoginFrequency,
      category: "LMS",
      type: "positive"
    });
  }

  if (
    student.assignmentsCompleted >=
    student.assignmentsTotal * 0.8
  ) {
    drivers.push({
      name: "Strong assignment completion",
      value: Math.round(
        (student.assignmentsCompleted /
          student.assignmentsTotal) * 100
      ),
      category: "LMS",
      type: "positive"
    });
  }

  if (student.codingScore >= 75) {
    drivers.push({
      name: "Strong coding performance",
      value: student.codingScore,
      category: "Placement",
      type: "positive"
    });
  }

  if (student.aptitudeScore >= 75) {
    drivers.push({
      name: "Strong aptitude performance",
      value: student.aptitudeScore,
      category: "Placement",
      type: "positive"
    });
  }

  if (student.technicalSkillScore >= 75) {
    drivers.push({
      name: "Strong technical skills",
      value: student.technicalSkillScore,
      category: "Skills",
      type: "positive"
    });
  }

  if (student.hackathons >= 2) {
    drivers.push({
      name: "Good hackathon participation",
      value: student.hackathons,
      category: "Engagement",
      type: "positive"
    });
  }

  if (student.certifications >= 2) {
    drivers.push({
      name: "Good certification activity",
      value: student.certifications,
      category: "Engagement",
      type: "positive"
    });
  }

  return drivers;
}


/* =====================================================
   RISK DRIVERS
===================================================== */

export function getRiskDrivers(student) {

  const drivers = [];

  if (student.attendance < 75) {
    drivers.push({
      name: "Low attendance",
      value: student.attendance,
      category: "Attendance",
      type: "negative"
    });
  }

  if (student.cgpa < 7) {
    drivers.push({
      name: "Low CGPA",
      value: student.cgpa,
      category: "Academic",
      type: "negative"
    });
  }

  if (student.backlogs > 0) {
    drivers.push({
      name: `${student.backlogs} backlog(s)`,
      value: student.backlogs,
      category: "Academic",
      type: "negative"
    });
  }

  if (student.codingScore < 60) {
    drivers.push({
      name: "Low coding score",
      value: student.codingScore,
      category: "Placement",
      type: "negative"
    });
  }

  if (student.aptitudeScore < 60) {
    drivers.push({
      name: "Low aptitude score",
      value: student.aptitudeScore,
      category: "Placement",
      type: "negative"
    });
  }

  if (student.mockInterviewScore < 60) {
    drivers.push({
      name: "Low mock interview score",
      value: student.mockInterviewScore,
      category: "Placement",
      type: "negative"
    });
  }

  if (student.lmsLoginFrequency < 60) {
    drivers.push({
      name: "Low LMS activity",
      value: student.lmsLoginFrequency,
      category: "LMS",
      type: "negative"
    });
  }

  if (
    student.assignmentsCompleted <
    student.assignmentsTotal * 0.6
  ) {
    drivers.push({
      name: "Low assignment completion",
      value: Math.round(
        (student.assignmentsCompleted /
          student.assignmentsTotal) * 100
      ),
      category: "LMS",
      type: "negative"
    });
  }

  if (student.technicalSkillScore < 60) {
    drivers.push({
      name: "Low technical skill",
      value: student.technicalSkillScore,
      category: "Skills",
      type: "negative"
    });
  }

  return drivers;
}


/* =====================================================
   STUDENT SEGMENTATION
===================================================== */

export function getStudentSegment(student) {

  const academicHigh =
    student.cgpa >= 8;

  const placementHigh =
    student.aptitudeScore >= 70 &&
    student.codingScore >= 70;

  const placementLow =
    student.aptitudeScore < 60 ||
    student.codingScore < 60;


  if (
    academicHigh &&
    placementLow
  ) {
    return "High Academic / Low Placement Readiness";
  }


  if (
    student.attendance < 60 &&
    student.cgpa < 7
  ) {
    return "Academic Intervention Required";
  }


  if (
    student.cgpa >= 8 &&
    placementHigh
  ) {
    return "High Performer";
  }


  if (
    student.hackathons >= 2 &&
    student.technicalSkillScore >= 75
  ) {
    return "Industry Ready";
  }


  if (
    student.cgpa >= 7 &&
    student.codingScore >= 70
  ) {
    return "Placement Potential";
  }


  return "Needs Continuous Monitoring";
}


/* =====================================================
   CATEGORY SCORES
===================================================== */

export function getCategoryScores(student) {

  const assignmentPercentage =
    student.assignmentsTotal > 0
      ? (
          student.assignmentsCompleted /
          student.assignmentsTotal
        ) * 100
      : 0;


  return {
    academic: Math.round(
      (student.cgpa * 10 * 0.6) +
      (student.internalMarks * 0.4)
    ),

    attendance:
      student.attendance,

    lms: Math.round(
      (student.lmsLoginFrequency * 0.5) +
      (assignmentPercentage * 0.5)
    ),

    engagement: Math.min(
      100,
      (student.events * 5) +
      (student.clubs * 10) +
      (student.hackathons * 15) +
      (student.certifications * 10)
    ),

    placement: Math.round(
      (student.aptitudeScore * 0.3) +
      (student.codingScore * 0.4) +
      (student.mockInterviewScore * 0.3)
    ),

    skills: Math.round(
      (student.technicalSkillScore * 0.6) +
      (student.softSkillScore * 0.4)
    ),

    feedback: Math.round(
      (student.studentSatisfaction * 0.5) +
      (student.facultyFeedback * 0.5)
    )
  };
}


/* =====================================================
   RECOMMENDED INTERVENTION
===================================================== */

export function getIntervention(student) {

  const actions = [];

  if (student.attendance < 75) {
    actions.push(
      "Schedule attendance counseling"
    );
  }

  if (student.cgpa < 7) {
    actions.push(
      "Assign academic mentor"
    );
  }

  if (student.backlogs > 0) {
    actions.push(
      "Create backlog recovery plan"
    );
  }

  if (student.codingScore < 60) {
    actions.push(
      "Enroll in coding practice program"
    );
  }

  if (student.aptitudeScore < 60) {
    actions.push(
      "Provide aptitude training"
    );
  }

  if (student.mockInterviewScore < 60) {
    actions.push(
      "Schedule mock interview sessions"
    );
  }

  if (student.lmsLoginFrequency < 60) {
    actions.push(
      "Monitor LMS engagement"
    );
  }

  if (
    student.technicalSkillScore < 60
  ) {
    actions.push(
      "Recommend technical skill training"
    );
  }

  if (actions.length === 0) {
    actions.push(
      "Continue current development plan"
    );
  }

  return actions;
}