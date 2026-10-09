import { useEffect, useState } from "react";

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const endpoint = API_BASE
    ? normalizedPath.replace(/^\/api(?=\/)/, "")
    : normalizedPath;
  return `${API_BASE}${endpoint}`;
}

function mapStudentProfile(profile) {
  const academic = profile.academics ?? {};
  const attendance = profile.attendance ?? {};
  const lms = profile.lms ?? {};
  const engagement = profile.engagement ?? {};
  const placement = profile.placement ?? {};
  const assignmentsCompleted = Math.round(lms.assignments_submitted_pct ?? 0);

  return {
    id: profile.student.student_id,
    rollNumber: profile.student.student_id,
    name: profile.student.name,
    department: profile.student.department,
    year: profile.student.year,
    semester: academic.semester,
    staffMember: "",
    cgpa: academic.cgpa ?? 0,
    internalMarks: academic.internal_marks_avg ?? 0,
    backlogs: academic.backlogs ?? 0,
    attendance: attendance.attendance_pct ?? 0,
    assignmentsCompleted,
    assignmentsTotal: 100,
    lmsLoginFrequency: lms.logins_per_week ?? 0,
    events: engagement.events_attended ?? 0,
    clubs: engagement.clubs_count ?? 0,
    hackathons: 0,
    certifications: 0,
    aptitudeScore: 0,
    codingScore: 0,
    mockInterviewScore: placement.mock_interview_score ?? 0,
    technicalSkillScore: 0,
    softSkillScore: 0,
    studentSatisfaction: 0,
    facultyFeedback: 0,
    progress: profile.success_score?.score ?? 0,
    successScore: profile.success_score?.score ?? 0,
    riskLevel: (profile.risk?.risk_level ?? "low").toUpperCase(),
    segment: profile.segment ?? "",
    riskDrivers: profile.risk?.flags ?? [],
    successDrivers: [],
  };
}

function mapStudentSummary(student) {
  return {
    id: student.student_id,
    rollNumber: student.student_id,
    name: student.name,
    department: student.department,
    year: student.year,
    semester: student.year * 2,
    staffMember: "",
    cgpa: student.cgpa ?? 0,
    internalMarks: 0,
    backlogs: 0,
    attendance: student.attendance_pct ?? 0,
    assignmentsCompleted: 0,
    assignmentsTotal: 100,
    lmsLoginFrequency: 0,
    events: 0,
    clubs: 0,
    hackathons: 0,
    certifications: 0,
    aptitudeScore: 0,
    codingScore: 0,
    mockInterviewScore: 0,
    technicalSkillScore: 0,
    softSkillScore: 0,
    studentSatisfaction: 0,
    facultyFeedback: 0,
    progress: student.success_score ?? 0,
    successScore: student.success_score ?? 0,
    riskLevel: (student.risk_level ?? "low").toUpperCase(),
    segment: student.segment ?? "",
    riskDrivers: [],
    successDrivers: [],
  };
}

export default function useBackendStudents(fallbackStudents) {
  const [students, setStudents] = useState(fallbackStudents);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const response = await fetch(apiUrl("/api/students?limit=500"));
        if (!response.ok) throw new Error("Could not load students");

        const result = await response.json();
        if (!active) return;
        setStudents(result.items.map(mapStudentSummary));
        setLoadError(false);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadStudents();
    return () => {
      active = false;
    };
  }, [fallbackStudents]);

  async function loadStudentProfile(studentId) {
    const response = await fetch(
      apiUrl(`/api/students/${encodeURIComponent(studentId)}/profile`)
    );
    if (!response.ok) throw new Error(`Could not load student profile (${response.status})`);
    return mapStudentProfile(await response.json());
  }

  return { students, setStudents, loadError, loading, loadStudentProfile };
}