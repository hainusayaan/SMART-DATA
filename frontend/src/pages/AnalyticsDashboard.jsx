import { useMemo, useState } from "react";

import studentsData from "../data/students";

import {
  calculateSuccessScore,
  calculateRisk,
  getScoreDrivers,
  getRiskDrivers,
  getStudentSegment,
  getCategoryScores,
  getIntervention
} from "../utils/analytics";


function AnalyticsDashboard() {

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [riskFilter, setRiskFilter] =
    useState("ALL");

  const [segmentFilter, setSegmentFilter] =
    useState("ALL");


  /* =====================================================
     ANALYTICS DATA
  ===================================================== */

  const analyticsStudents = useMemo(() => {

    return studentsData.map((student) => ({

      ...student,

      successScore:
        calculateSuccessScore(student),

      risk:
        calculateRisk(student),

      segment:
        getStudentSegment(student),

      scoreDrivers:
        getScoreDrivers(student),

      riskDrivers:
        getRiskDrivers(student),

      categoryScores:
        getCategoryScores(student),

      interventions:
        getIntervention(student)

    }));

  }, []);


  /* =====================================================
     FILTER
  ===================================================== */

  const filteredStudents =
    analyticsStudents.filter((student) => {

      const riskMatch =
        riskFilter === "ALL" ||
        student.risk === riskFilter;

      const segmentMatch =
        segmentFilter === "ALL" ||
        student.segment === segmentFilter;

      return riskMatch && segmentMatch;

    });


  /* =====================================================
     KPIs
  ===================================================== */

  const totalStudents =
    analyticsStudents.length;


  const averageScore =
    totalStudents > 0
      ? Math.round(
          analyticsStudents.reduce(
            (sum, student) =>
              sum + student.successScore,
            0
          ) / totalStudents
        )
      : 0;


  const highRisk =
    analyticsStudents.filter(
      (student) => student.risk === "HIGH"
    ).length;


  const mediumRisk =
    analyticsStudents.filter(
      (student) => student.risk === "MEDIUM"
    ).length;


  const lowRisk =
    analyticsStudents.filter(
      (student) => student.risk === "LOW"
    ).length;


  /* =====================================================
     SEGMENTS
  ===================================================== */

  const segments = [
    ...new Set(
      analyticsStudents.map(
        (student) => student.segment
      )
    )
  ];


  return (

    <div className="analytics-dashboard">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="analytics-header">

        <h1>
          Smart Campus Analytics
        </h1>

        <p>
          Predict, optimize and improve student success
          using unified student data.
        </p>

      </div>


      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="analytics-cards">

        <div className="analytics-card">
          <span>Total Students</span>
          <strong>
            {totalStudents}
          </strong>
        </div>


        <div className="analytics-card">
          <span>Average Success Score</span>
          <strong>
            {averageScore}%
          </strong>
        </div>


        <div className="analytics-card">
          <span>High Risk</span>
          <strong className="danger-number">
            {highRisk}
          </strong>
        </div>


        <div className="analytics-card">
          <span>Medium Risk</span>
          <strong className="warning-number">
            {mediumRisk}
          </strong>
        </div>


        <div className="analytics-card">
          <span>Low Risk</span>
          <strong className="success-number">
            {lowRisk}
          </strong>
        </div>

      </div>


      {/* =================================================
          RISK SUMMARY
      ================================================= */}

      <div className="analytics-section">

        <h2>
          Student Risk Overview
        </h2>


        <div className="risk-summary">

          <div className="risk-summary-card high">
            <span>🔴</span>

            <div>
              <h3>
                {highRisk}
              </h3>

              <p>
                High Risk Students
              </p>
            </div>
          </div>


          <div className="risk-summary-card medium">
            <span>🟡</span>

            <div>
              <h3>
                {mediumRisk}
              </h3>

              <p>
                Medium Risk Students
              </p>
            </div>
          </div>


          <div className="risk-summary-card low">
            <span>🟢</span>

            <div>
              <h3>
                {lowRisk}
              </h3>

              <p>
                Low Risk Students
              </p>
            </div>
          </div>

        </div>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="analytics-section">

        <div className="analytics-filters">

          <div>

            <label>
              Risk Level
            </label>

            <select
              value={riskFilter}
              onChange={(e) =>
                setRiskFilter(e.target.value)
              }
            >

              <option value="ALL">
                All Risk Levels
              </option>

              <option value="HIGH">
                High Risk
              </option>

              <option value="MEDIUM">
                Medium Risk
              </option>

              <option value="LOW">
                Low Risk
              </option>

            </select>

          </div>


          <div>

            <label>
              Student Segment
            </label>

            <select
              value={segmentFilter}
              onChange={(e) =>
                setSegmentFilter(e.target.value)
              }
            >

              <option value="ALL">
                All Segments
              </option>

              {segments.map((segment) => (

                <option
                  key={segment}
                  value={segment}
                >
                  {segment}
                </option>

              ))}

            </select>

          </div>

        </div>

      </div>


      {/* =================================================
          STUDENT SUCCESS TABLE
      ================================================= */}

      <div className="analytics-section">

        <h2>
          Student Success Intelligence
        </h2>

        <div className="table-container">

          <table>

            <thead>

              <tr>

                <th>Student</th>

                <th>Department</th>

                <th>Success Score</th>

                <th>Risk</th>

                <th>Segment</th>

                <th>Action</th>

              </tr>

            </thead>


            <tbody>

              {filteredStudents.map(
                (student) => (

                  <tr key={student.id}>

                    <td>

                      <strong>
                        {student.name}
                      </strong>

                      <br />

                      <small>
                        {student.rollNumber}
                      </small>

                    </td>


                    <td>
                      {student.department}
                    </td>


                    <td>

                      <div className="score-container">

                        <div className="score-bar">

                          <div
                            className="score-fill"
                            style={{
                              width:
                                `${student.successScore}%`
                            }}
                          />

                        </div>

                        <strong>
                          {student.successScore}%
                        </strong>

                      </div>

                    </td>


                    <td>

                      <span
                        className={`risk ${student.risk.toLowerCase()}`}
                      >
                        {student.risk}
                      </span>

                    </td>


                    <td>

                      <span className="segment-badge">

                        {student.segment}

                      </span>

                    </td>


                    <td>

                      <button
                        className="view-button"
                        onClick={() =>
                          setSelectedStudent(
                            student
                          )
                        }
                      >
                        View Insights
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          SEGMENTATION
      ================================================= */}

      <div className="analytics-section">

        <h2>
          Student Segmentation
        </h2>

        <div className="segment-grid">

          {segments.map((segment) => {

            const count =
              analyticsStudents.filter(
                (student) =>
                  student.segment === segment
              ).length;

            return (

              <div
                className="segment-card"
                key={segment}
              >

                <h3>
                  {segment}
                </h3>

                <strong>
                  {count}
                </strong>

                <p>
                  students
                </p>

              </div>

            );

          })}

        </div>

      </div>


      {/* =================================================
          CATEGORY PERFORMANCE
      ================================================= */}

      <div className="analytics-section">

        <h2>
          Campus Performance Indicators
        </h2>

        <div className="category-grid">

          {[
            "academic",
            "attendance",
            "lms",
            "engagement",
            "placement",
            "skills",
            "feedback"
          ].map((category) => {

            const average =
              totalStudents > 0
                ? Math.round(
                    analyticsStudents.reduce(
                      (sum, student) =>
                        sum +
                        student.categoryScores[
                          category
                        ],
                      0
                    ) / totalStudents
                  )
                : 0;

            return (

              <div
                className="category-card"
                key={category}
              >

                <div className="category-header">

                  <span>
                    {category
                      .charAt(0)
                      .toUpperCase() +
                      category.slice(1)}
                  </span>

                  <strong>
                    {average}%
                  </strong>

                </div>


                <div className="category-progress">

                  <div
                    style={{
                      width: `${average}%`
                    }}
                  />

                </div>

              </div>

            );

          })}

        </div>

      </div>


      {/* =================================================
          INSIGHT MODAL
      ================================================= */}

      {selectedStudent && (

        <div className="modal">

          <div className="modal-content insight-modal">

            <button
              className="close-insight"
              onClick={() =>
                setSelectedStudent(null)
              }
            >
              ×
            </button>


            <h2>
              {selectedStudent.name}
            </h2>

            <p className="student-name">
              {selectedStudent.rollNumber}
              {" • "}
              {selectedStudent.department}
            </p>


            {/* SCORE */}

            <div className="insight-score-box">

              <span>
                Student Success Score
              </span>

              <strong>
                {selectedStudent.successScore}%
              </strong>

            </div>


            {/* RISK */}

            <div className="insight-risk-box">

              <span>
                Risk Level
              </span>

              <strong
                className={`risk ${selectedStudent.risk.toLowerCase()}`}
              >
                {selectedStudent.risk}
              </strong>

            </div>


            {/* SEGMENT */}

            <div className="insight-segment">

              <h3>
                Student Segment
              </h3>

              <span className="segment-badge large">
                {selectedStudent.segment}
              </span>

            </div>


            <hr />


            {/* EXPLAINABLE SCORE */}

            <h3>
              🔍 Why is this Success Score?
            </h3>

            <p className="explanation-text">
              The Success Score combines academic,
              attendance, LMS, engagement, placement,
              skills and feedback indicators.
            </p>


            <div className="driver-list">

              {selectedStudent.scoreDrivers.length > 0 ? (

                selectedStudent.scoreDrivers.map(
                  (driver, index) => (

                    <div
                      className="driver positive"
                      key={index}
                    >

                      <span>
                        ✓
                      </span>

                      <div>

                        <strong>
                          {driver.name}
                        </strong>

                        <small>
                          {driver.category}
                          {" • "}
                          {driver.value}
                        </small>

                      </div>

                    </div>

                  )
                )

              ) : (

                <p>
                  No strong positive drivers detected.
                </p>

              )}

            </div>


            {/* RISK DRIVERS */}

            <h3>
              🚨 Risk Drivers
            </h3>

            <div className="driver-list">

              {selectedStudent.riskDrivers.length > 0 ? (

                selectedStudent.riskDrivers.map(
                  (driver, index) => (

                    <div
                      className="driver negative"
                      key={index}
                    >

                      <span>
                        !
                      </span>

                      <div>

                        <strong>
                          {driver.name}
                        </strong>

                        <small>
                          {driver.category}
                          {" • "}
                          {driver.value}
                        </small>

                      </div>

                    </div>

                  )
                )

              ) : (

                <p>
                  No major risk drivers detected.
                </p>

              )}

            </div>


            {/* INTERVENTION */}

            <h3>
              🎯 Recommended Actions
            </h3>

            <div className="intervention-list">

              {selectedStudent.interventions.map(
                (action, index) => (

                  <div
                    className="intervention-item"
                    key={index}
                  >

                    <span>
                      {index + 1}
                    </span>

                    <p>
                      {action}
                    </p>

                  </div>

                )
              )}

            </div>


            <button
              className="close-button"
              onClick={() =>
                setSelectedStudent(null)
              }
            >
              Close
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default AnalyticsDashboard;