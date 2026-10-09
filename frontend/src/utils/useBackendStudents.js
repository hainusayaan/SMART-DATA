import { useEffect, useState } from "react";

export default function useBackendStudents(fallbackStudents) {
  const [students, setStudents] = useState(fallbackStudents);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStudents() {
      try {
        const response = await fetch("/api/students?limit=500");
        if (!response.ok) throw new Error("Could not load students");

        const result = await response.json();
        const profiles = await Promise.all(
          result.items.map(async (student) => {
            const profileResponse = await fetch(
              `/api/students/${encodeURIComponent(student.student_id)}/profile`
            );
            if (!profileResponse.ok) throw new Error("Could not load student profile");
            return profileResponse.json();
          })
        );

        if (!active) return;
        setStudents(profiles.map((profile) => {
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
            semester: academic.semester ?? profile.student.year,
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
        }));
        setLoadError(false);
      } catch {
        if (active) setLoadError(true);
      }
    }

    loadStudents();
    return () => {
      active = false;
    };
  }, [fallbackStudents]);

  return { students, setStudents, loadError };
}