import { useState } from "react";
import initialStudents from "../data/students";
import useBackendStudents from "../utils/useBackendStudents";
import { saveStudent } from "../utils/studentApi";

function StaffDashboard({ onLogout }) {
  const { students, setStudents, loadError } = useBackendStudents(initialStudents);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    attendance: "",
    assignmentsCompleted: "",
    assignmentsTotal: "",
    internalMarks: "",
    progress: "",
    cgpa: "",
    backlogs: "",
  });

  // Calculate risk automatically
  const calculateRisk = (
    attendance,
    assignmentsCompleted,
    assignmentsTotal,
    cgpa,
    backlogs,
    internalMarks,
    progress
  ) => {
    const assignmentPercentage =
      assignmentsTotal > 0
        ? (assignmentsCompleted / assignmentsTotal) * 100
        : 0;

    let score = 0;

    if (attendance < 60) score += 3;
    else if (attendance < 75) score += 2;
    else if (attendance < 85) score += 1;

    if (assignmentPercentage < 50) score += 3;
    else if (assignmentPercentage < 75) score += 2;
    else if (assignmentPercentage < 90) score += 1;

    if (cgpa < 6) score += 3;
    else if (cgpa < 7) score += 2;
    else if (cgpa < 8) score += 1;

    if (backlogs >= 3) score += 3;
    else if (backlogs >= 1) score += 2;

    if (internalMarks < 50) score += 3;
    else if (internalMarks < 65) score += 2;
    else if (internalMarks < 75) score += 1;

    if (progress < 50) score += 2;
    else if (progress < 70) score += 1;

    if (score >= 7) return "HIGH";
    if (score >= 4) return "MEDIUM";

    return "LOW";
  };

  // Search + risk filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      student.rollNumber
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL" ||
      student.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Open edit form
  const handleEdit = (student) => {
    setEditingStudent(student);

    setFormData({
      attendance: student.attendance,
      assignmentsCompleted:
        student.assignmentsCompleted,
      assignmentsTotal:
        student.assignmentsTotal,
      internalMarks: student.internalMarks,
      progress: student.progress,
      cgpa: student.cgpa,
      backlogs: student.backlogs,
    });
  };

  // Handle input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Update student
  const handleUpdate = async (e) => {
    e.preventDefault();

    const attendance = Number(formData.attendance);
    const assignmentsCompleted =
      Number(formData.assignmentsCompleted);
    const assignmentsTotal =
      Number(formData.assignmentsTotal);
    const internalMarks =
      Number(formData.internalMarks);
    const progress = Number(formData.progress);
    const cgpa = Number(formData.cgpa);
    const backlogs = Number(formData.backlogs);

    const riskLevel = calculateRisk(
      attendance,
      assignmentsCompleted,
      assignmentsTotal,
      cgpa,
      backlogs,
      internalMarks,
      progress
    );

    const updatedStudent = {
      ...editingStudent,

      attendance,
      assignmentsCompleted,
      assignmentsTotal,
      internalMarks,
      progress,
      cgpa,
      backlogs,
      riskLevel,
    };

    try {
      await saveStudent(updatedStudent);
    } catch (error) {
      window.alert(error.message);
      return;
    }

    setStudents(
      students.map((student) =>
        student.id === editingStudent.id
          ? updatedStudent
          : student
      )
    );

    setEditingStudent(null);
  };

  // Statistics
  const totalStudents = students.length;

  const lowRisk = students.filter(
    (student) => student.riskLevel === "LOW"
  ).length;

  const mediumRisk = students.filter(
    (student) => student.riskLevel === "MEDIUM"
  ).length;

  const highRisk = students.filter(
    (student) => student.riskLevel === "HIGH"
  ).length;

  return (
    <div className="dashboard">

      {/* Navbar */}

      <nav className="navbar">

        <h2>Staff Dashboard</h2>

        <button onClick={onLogout}>
          Logout
        </button>

      </nav>

      <div className="dashboard-content">

        <h1>My Students</h1>
        {loadError && <p role="status">Backend unavailable. Showing demo data.</p>}

        {/* Statistics */}

        <div className="cards">

          <div className="card">
            <h3>Total Students</h3>
            <p>{totalStudents}</p>
          </div>

          <div className="card">
            <h3>Low Risk</h3>
            <p>{lowRisk}</p>
          </div>

          <div className="card">
            <h3>Medium Risk</h3>
            <p>{mediumRisk}</p>
          </div>

          <div className="card">
            <h3>High Risk</h3>
            <p>{highRisk}</p>
          </div>

        </div>

        {/* Search */}

        <div className="student-controls">

          <input
            type="text"
            placeholder="Search student..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={riskFilter}
            onChange={(e) =>
              setRiskFilter(e.target.value)
            }
          >
            <option value="ALL">
              All Students
            </option>

            <option value="LOW">
              Low Risk
            </option>

            <option value="MEDIUM">
              Medium Risk
            </option>

            <option value="HIGH">
              High Risk
            </option>
          </select>

        </div>

        {/* Student table */}

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>Roll No</th>

                <th>Name</th>

                <th>Department</th>

                <th>Attendance</th>

                <th>Assignments</th>

                <th>Internal</th>

                <th>CGPA</th>

                <th>Backlogs</th>

                <th>Progress</th>

                <th>Risk</th>

                <th>Action</th>

              </tr>

            </thead>

            <tbody>

              {filteredStudents.map((student) => (

                <tr key={student.id}>

                  <td>
                    {student.rollNumber}
                  </td>

                  <td>
                    {student.name}
                  </td>

                  <td>
                    {student.department}
                  </td>

                  <td>
                    {student.attendance}%
                  </td>

                  <td>
                    {student.assignmentsCompleted}/
                    {student.assignmentsTotal}
                  </td>

                  <td>
                    {student.internalMarks}
                  </td>

                  <td>
                    {student.cgpa}
                  </td>

                  <td>
                    {student.backlogs}
                  </td>

                  <td>
                    {student.progress}%
                  </td>

                  <td>

                    <span
                      className={`risk ${student.riskLevel.toLowerCase()}`}
                    >
                      {student.riskLevel}
                    </span>

                  </td>

                  <td>

                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(student)
                      }
                    >
                      Update
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* Update Modal */}

      {editingStudent && (

        <div className="modal">

          <div className="modal-content">

            <h2>
              Update Student
            </h2>

            <h3 className="student-name">
              {editingStudent.name}
              {" - "}
              {editingStudent.rollNumber}
            </h3>

            <form onSubmit={handleUpdate}>

              <div className="form-grid">

                <div>
                  <label>
                    Attendance %
                  </label>

                  <input
                    name="attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.attendance}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    Assignments Completed
                  </label>

                  <input
                    name="assignmentsCompleted"
                    type="number"
                    min="0"
                    value={
                      formData.assignmentsCompleted
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    Assignments Total
                  </label>

                  <input
                    name="assignmentsTotal"
                    type="number"
                    min="1"
                    value={
                      formData.assignmentsTotal
                    }
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    Internal Marks
                  </label>

                  <input
                    name="internalMarks"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.internalMarks}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    CGPA
                  </label>

                  <input
                    name="cgpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.cgpa}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    Backlogs
                  </label>

                  <input
                    name="backlogs"
                    type="number"
                    min="0"
                    value={formData.backlogs}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label>
                    Progress %
                  </label>

                  <input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>

              <div className="form-buttons">

                <button type="submit">
                  Save Changes
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={() =>
                    setEditingStudent(null)
                  }
                >
                  Cancel
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default StaffDashboard;