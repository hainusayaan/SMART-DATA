import { useState } from "react";
import initialStudents from "../data/students";
import useBackendStudents from "../utils/useBackendStudents";
import { deleteStudent, saveStudent } from "../utils/studentApi";

function AdminDashboard({ onLogout }) {
  const { students, setStudents, loadError } = useBackendStudents(initialStudents);

  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const emptyStudent = {
    rollNumber: "",
    name: "",
    department: "",
    semester: "",
    attendance: "",
    assignmentsCompleted: "",
    assignmentsTotal: "",
    cgpa: "",
    backlogs: "",
    internalMarks: "",
    progress: "",
    riskLevel: "LOW",
    staffMember: "",
  };

  const [formData, setFormData] = useState(emptyStudent);

  // Search + Filter
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      student.department.toLowerCase().includes(search.toLowerCase());

    const matchesRisk =
      riskFilter === "ALL" ||
      student.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  // Input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Add student
  const handleAddStudent = async (e) => {
    e.preventDefault();

    const newStudent = {
      ...formData,
      id: Date.now(),
      semester: Number(formData.semester),
      attendance: Number(formData.attendance),
      assignmentsCompleted: Number(formData.assignmentsCompleted),
      assignmentsTotal: Number(formData.assignmentsTotal),
      cgpa: Number(formData.cgpa),
      backlogs: Number(formData.backlogs),
      internalMarks: Number(formData.internalMarks),
      progress: Number(formData.progress),
    };

    try {
      await saveStudent(newStudent, true);
      setStudents([...students, newStudent]);
    } catch (error) {
      window.alert(error.message);
      return;
    }

    setFormData(emptyStudent);
    setShowForm(false);
  };

  // Delete
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (confirmDelete) {
      try {
        await deleteStudent(id);
      } catch (error) {
        window.alert(error.message);
        return;
      }
      setStudents(
        students.filter((student) => student.id !== id)
      );
    }
  };

  // Edit
  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData(student);
    setShowForm(true);
  };

  // Update
  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatedStudent = {
      ...formData,
      semester: Number(formData.semester),
      attendance: Number(formData.attendance),
      assignmentsCompleted: Number(formData.assignmentsCompleted),
      assignmentsTotal: Number(formData.assignmentsTotal),
      cgpa: Number(formData.cgpa),
      backlogs: Number(formData.backlogs),
      internalMarks: Number(formData.internalMarks),
      progress: Number(formData.progress),
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
    setFormData(emptyStudent);
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingStudent(null);
    setFormData(emptyStudent);
  };

  return (
    <div className="dashboard">

      {/* Navbar */}
      <nav className="navbar">
        <h2>Admin Dashboard</h2>

        <button onClick={onLogout}>
          Logout
        </button>
      </nav>

      <div className="dashboard-content">

        <h1>Student Management</h1>
        {loadError && <p role="status">Backend unavailable. Showing demo data.</p>}

        {/* Statistics */}
        <div className="cards">

          <div className="card">
            <h3>Total Students</h3>
            <p>{students.length}</p>
          </div>

          <div className="card">
            <h3>Low Risk</h3>
            <p>
              {
                students.filter(
                  (s) => s.riskLevel === "LOW"
                ).length
              }
            </p>
          </div>

          <div className="card">
            <h3>Medium Risk</h3>
            <p>
              {
                students.filter(
                  (s) => s.riskLevel === "MEDIUM"
                ).length
              }
            </p>
          </div>

          <div className="card">
            <h3>High Risk</h3>
            <p>
              {
                students.filter(
                  (s) => s.riskLevel === "HIGH"
                ).length
              }
            </p>
          </div>

        </div>

        {/* Controls */}
        <div className="student-controls">

          <input
            type="text"
            placeholder="Search by name, roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          >
            <option value="ALL">All Risk Levels</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <button
            className="add-button"
            onClick={() => {
              setEditingStudent(null);
              setFormData(emptyStudent);
              setShowForm(true);
            }}
          >
            + Add Student
          </button>

        </div>

        {/* Student Table */}
        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Attendance</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredStudents.map((student) => (

                <tr key={student.id}>

                  <td>{student.rollNumber}</td>

                  <td>{student.name}</td>

                  <td>{student.department}</td>

                  <td>{student.semester}</td>

                  <td>{student.attendance}%</td>

                  <td>{student.cgpa}</td>

                  <td>{student.backlogs}</td>

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
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

          {filteredStudents.length === 0 && (
            <p className="no-students">
              No students found.
            </p>
          )}

        </div>

      </div>

      {/* Student Form */}
      {showForm && (

        <div className="modal">

          <div className="modal-content">

            <h2>
              {editingStudent
                ? "Edit Student"
                : "Add Student"}
            </h2>

            <form
              onSubmit={
                editingStudent
                  ? handleUpdate
                  : handleAddStudent
              }
            >

              <div className="form-grid">

                <input
                  name="rollNumber"
                  placeholder="Roll Number"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  required
                />

                <input
                  name="name"
                  placeholder="Student Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <input
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />

                <input
                  name="semester"
                  type="number"
                  placeholder="Semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                />

                <input
                  name="attendance"
                  type="number"
                  placeholder="Attendance %"
                  value={formData.attendance}
                  onChange={handleChange}
                  required
                />

                <input
                  name="assignmentsCompleted"
                  type="number"
                  placeholder="Assignments Completed"
                  value={formData.assignmentsCompleted}
                  onChange={handleChange}
                  required
                />

                <input
                  name="assignmentsTotal"
                  type="number"
                  placeholder="Assignments Total"
                  value={formData.assignmentsTotal}
                  onChange={handleChange}
                  required
                />

                <input
                  name="cgpa"
                  type="number"
                  step="0.1"
                  placeholder="CGPA"
                  value={formData.cgpa}
                  onChange={handleChange}
                  required
                />

                <input
                  name="backlogs"
                  type="number"
                  placeholder="Backlogs"
                  value={formData.backlogs}
                  onChange={handleChange}
                  required
                />

                <input
                  name="internalMarks"
                  type="number"
                  placeholder="Internal Marks"
                  value={formData.internalMarks}
                  onChange={handleChange}
                  required
                />

                <input
                  name="progress"
                  type="number"
                  placeholder="Progress %"
                  value={formData.progress}
                  onChange={handleChange}
                  required
                />

                <input
                  name="staffMember"
                  placeholder="Staff Member"
                  value={formData.staffMember}
                  onChange={handleChange}
                  required
                />

                <select
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleChange}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>

              </div>

              <div className="form-buttons">

                <button type="submit">
                  {editingStudent
                    ? "Update Student"
                    : "Add Student"}
                </button>

                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeForm}
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

export default AdminDashboard;