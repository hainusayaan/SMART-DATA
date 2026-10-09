import { useEffect, useState } from "react";
import initialStudents from "../data/students";
import cseCurriculum from "../data/cseCurriculum";
import otherBranchCurriculum from "../data/otherBranchCurriculum";
import useBackendStudents from "../utils/useBackendStudents";

const cseBranch = "CSE - Computer Science Engineering";
const branches = {
  [cseBranch]: cseCurriculum.map((semester) => ({
    title: semester.title,
    groups: [
      { label: "Theory subjects", subjects: semester.theory },
      { label: "Laboratories", subjects: semester.labs },
      { label: "Projects & professional work", subjects: semester.projects },
      { label: "Elective options", subjects: semester.electives },
    ].filter((group) => group.subjects.length > 0),
  })),
  ...Object.fromEntries(
    Object.entries(otherBranchCurriculum).map(([branch, semesters]) => [
      branch,
      semesters.map((subjects, index) => ({
        title: `Year ${Math.floor(index / 2) + 1} · Semester ${index + 1}`,
        groups: [{ label: "Subjects", subjects }],
      })),
    ])
  ),
};

function branchForDepartment(department) {
  const normalized = String(department ?? "").trim().toUpperCase();
  const departmentAliases = {
    CIVIL: "Civil Engineering",
    MECH: "Mechanical Engineering",
  };
  if (departmentAliases[normalized]) return departmentAliases[normalized];
  const match = Object.keys(branches).find((branch) =>
    branch.toUpperCase().startsWith(`${normalized} -`)
  );
  return match ?? cseBranch;
}

function StudentDashboard({ onLogout }) {
  const { students, loadError } = useBackendStudents(initialStudents);
  const student = students[0] ?? initialStudents[0];
  const [selectedBranch, setSelectedBranch] = useState(() =>
    branchForDepartment(student.department)
  );
  const [subjectSearch, setSubjectSearch] = useState("");

  useEffect(() => {
    setSelectedBranch(branchForDepartment(student.department));
  }, [student.department]);

  const normalizedSearch = subjectSearch.trim().toLowerCase();
  const semesters = branches[selectedBranch].map((semester) => ({
    ...semester,
    groups: semester.groups
      .map((group) => ({
        ...group,
        subjects: group.subjects.filter((subject) =>
          subject.toLowerCase().includes(normalizedSearch)
        ),
      }))
      .filter((group) => group.subjects.length > 0),
  })).filter((semester) => semester.groups.length > 0);
  const youtubeSearchUrl = (subject) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${subject} engineering full course lectures`)}`;

  const assignmentPercentage =
    student.assignmentsTotal > 0
      ? Math.round(
          (student.assignmentsCompleted /
            student.assignmentsTotal) *
            100
        )
      : 0;

  const getRiskMessage = () => {
    if (student.riskLevel === "LOW") {
      return "You are performing well. Keep up the good work!";
    }

    if (student.riskLevel === "MEDIUM") {
      return "Your performance needs some attention. Try to improve your weak areas.";
    }

    return "You are at high academic risk. Please contact your staff member.";
  };

  return (
    <div className="dashboard">

      {/* Navbar */}

      <nav className="navbar">

        <h2>Student Dashboard</h2>

        <button onClick={onLogout}>
          Logout
        </button>

      </nav>

      <div className="student-dashboard">
        {loadError && <p role="status">Backend unavailable. Showing demo data.</p>}

        {/* Welcome */}

        <div className="welcome-section">

          <div>
            <h1>
              Welcome, {student.name} 👋
            </h1>

            <p>
              Here is your academic progress overview.
            </p>
          </div>

          <div className="student-roll">
            {student.rollNumber}
          </div>

        </div>

        {/* Profile */}

        <section className="dashboard-section">

          <h2>Student Profile</h2>

          <div className="profile-grid">

            <div className="profile-item">
              <span>Roll Number</span>
              <strong>
                {student.rollNumber}
              </strong>
            </div>

            <div className="profile-item">
              <span>Name</span>
              <strong>
                {student.name}
              </strong>
            </div>

            <div className="profile-item">
              <span>Department</span>
              <strong>
                {student.department}
              </strong>
            </div>

            <div className="profile-item">
              <span>Semester</span>
              <strong>
                {student.semester}
              </strong>
            </div>

            <div className="profile-item">
              <span>Staff Member</span>
              <strong>
                {student.staffMember}
              </strong>
            </div>

          </div>

        </section>

        {/* Academic Cards */}

        <section className="dashboard-section">

          <h2>Academic Overview</h2>

          <div className="student-cards">

            <div className="student-card">

              <div className="card-icon">
                📅
              </div>

              <div>
                <span>Attendance</span>

                <h3>
                  {student.attendance}%
                </h3>
              </div>

            </div>

            <div className="student-card">

              <div className="card-icon">
                🎓
              </div>

              <div>
                <span>CGPA</span>

                <h3>
                  {student.cgpa}
                </h3>
              </div>

            </div>

            <div className="student-card">

              <div className="card-icon">
                📝
              </div>

              <div>
                <span>Internal Marks</span>

                <h3>
                  {student.internalMarks}
                </h3>
              </div>

            </div>

            <div className="student-card">

              <div className="card-icon">
                ⚠️
              </div>

              <div>
                <span>Backlogs</span>

                <h3>
                  {student.backlogs}
                </h3>
              </div>

            </div>

          </div>

        </section>

        {/* Progress */}

        <section className="dashboard-section">

          <h2>Academic Progress</h2>

          <div className="progress-container">

            {/* Attendance */}

            <div className="progress-item">

              <div className="progress-header">

                <span>
                  Attendance
                </span>

                <strong>
                  {student.attendance}%
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${student.attendance}%`,
                  }}
                />

              </div>

            </div>

            {/* Assignments */}

            <div className="progress-item">

              <div className="progress-header">

                <span>
                  Assignments
                </span>

                <strong>
                  {student.assignmentsCompleted}/
                  {student.assignmentsTotal}
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${assignmentPercentage}%`,
                  }}
                />

              </div>

            </div>

            {/* Overall Progress */}

            <div className="progress-item">

              <div className="progress-header">

                <span>
                  Overall Progress
                </span>

                <strong>
                  {student.progress}%
                </strong>

              </div>

              <div className="progress-bar">

                <div
                  className="progress-fill"
                  style={{
                    width: `${student.progress}%`,
                  }}
                />

              </div>

            </div>

          </div>

        </section>

        {/* Risk */}

        <section className="dashboard-section">

          <h2>Academic Risk Assessment</h2>

          <div
            className={`risk-card ${student.riskLevel.toLowerCase()}`}
          >

            <div className="risk-icon">

              {student.riskLevel === "LOW" && "✅"}

              {student.riskLevel === "MEDIUM" && "⚠️"}

              {student.riskLevel === "HIGH" && "🚨"}

            </div>

            <div className="risk-content">

              <h2>
                {student.riskLevel} RISK
              </h2>

              <p>
                {getRiskMessage()}
              </p>

            </div>

          </div>

        </section>

        <section className="dashboard-section curriculum-section">
          <div className="curriculum-heading">
            <div>
              <h2>Engineering Subjects & Learning Hub</h2>
              <p>
                Browse branch-specific subjects across all four years and eight semesters.
                Open a YouTube search to find lessons for any subject.
              </p>
            </div>
          </div>

          <div className="curriculum-controls">
            <label className="semester-picker">
              <span>Engineering branch</span>
              <select
                value={selectedBranch}
                onChange={(event) => setSelectedBranch(event.target.value)}
                aria-label="Select engineering branch"
              >
                {Object.keys(branches).map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </label>
            <label className="curriculum-search">
              <span>Search subjects</span>
              <input
                type="search"
                value={subjectSearch}
                onChange={(event) => setSubjectSearch(event.target.value)}
                placeholder="Search a subject..."
                aria-label="Search subjects"
              />
            </label>
          </div>

          {semesters.length > 0 ? semesters.map((semester) => (
            <article className="curriculum-semester-card" key={semester.title}>
              <h3 className="curriculum-semester-title">{semester.title}</h3>
              {semester.groups.map((group) => (
                <div className="curriculum-group" key={group.label}>
                  <h4>{group.label}</h4>
                  <ul className="subject-list">
                    {group.subjects.map((subject) => (
                      <li className="subject-item" key={subject}>
                        <span>{subject}</span>
                        <a
                          href={youtubeSearchUrl(subject)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Find YouTube lessons for ${subject}`}
                        >
                          Watch on YouTube ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </article>
          )) : (
            <p className="curriculum-note" role="status">
              No subjects match “{subjectSearch}”. Try another search.
            </p>
          )}
          <p className="curriculum-footnote">
            This is a general reference syllabus. Subject names and semester allocation
            vary by university. YouTube links open subject-specific lecture search results.
          </p>
        </section>

      </div>

    </div>
  );
}

export default StudentDashboard;