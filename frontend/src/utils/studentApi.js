const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const endpoint = API_BASE
    ? normalizedPath.replace(/^\/api(?=\/)/, "")
    : normalizedPath;
  return `${API_BASE}${endpoint}`;
}

async function request(path, options = {}) {
  const response = await fetch(apiUrl(`/api${path}`), {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

function apiYear(semester) {
  return Math.min(4, Math.max(1, Math.ceil(Number(semester || 1) / 2)));
}

export async function saveStudent(student, create = false) {
  const studentId = encodeURIComponent(student.rollNumber);
  const studentData = {
    name: student.name,
    department: student.department,
    year: apiYear(student.semester),
  };

  await request(create ? "/students" : `/students/${studentId}`, {
    method: create ? "POST" : "PUT",
    body: JSON.stringify(create ? { ...studentData, student_id: student.rollNumber } : studentData),
  });

  await Promise.all([
    request(`/attendance/${studentId}`, {
      method: "PUT",
      body: JSON.stringify({ attendance_pct: Number(student.attendance) || 0 }),
    }),
    request(`/academics/${studentId}`, {
      method: "PUT",
      body: JSON.stringify({
        cgpa: Number(student.cgpa) || 0,
        backlogs: Number(student.backlogs) || 0,
        internal_marks_avg: Number(student.internalMarks) || 0,
        semester: Number(student.semester) || null,
      }),
    }),
    request(`/lms/${studentId}`, {
      method: "PUT",
      body: JSON.stringify({
        assignments_submitted_pct: Number(student.assignmentsTotal)
          ? (Number(student.assignmentsCompleted) / Number(student.assignmentsTotal)) * 100
          : 0,
      }),
    }),
  ]);
}

export function deleteStudent(studentId) {
  return request(`/students/${encodeURIComponent(studentId)}`, { method: "DELETE" });
}