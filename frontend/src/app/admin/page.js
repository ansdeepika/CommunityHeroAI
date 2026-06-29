"use client";

import { useEffect, useState } from "react";

export default function AdminPage() {
  const [data, setData] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    complaints: [],
  });

  const fetchComplaints = async () => {
    try {
      const response = await fetch(
        "https://communityhero-backend-787820491307.asia-south1.run.app/admin/complaints"
      );

      const result = await response.json();

      setData(result);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchComplaints();

    const interval = setInterval(() => {
      fetchComplaints();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const resolveComplaint = async (id) => {
    try {
      await fetch(
        `https://communityhero-backend-787820491307.asia-south1.run.app/admin/resolve/${id}`,
        {
          method: "POST",
        }
      );

      fetchComplaints();
    } catch (err) {
      console.log(err);
    }
  };

  const departments = {};

  data.complaints.forEach((c) => {
    departments[c.department] =
      (departments[c.department] || 0) + 1;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-5xl font-bold text-center mb-10">
          Community Hero AI Admin Dashboard
        </h1>

        {/* STATS */}
        <div className="grid md:grid-cols-4 gap-5 mb-10">

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">
              Total Complaints
            </h2>

            <p className="text-4xl font-bold">
              {data.total}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">
              Pending
            </h2>

            <p className="text-4xl font-bold text-red-600">
              {data.pending}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">
              Resolved
            </h2>

            <p className="text-4xl font-bold text-green-600">
              {data.resolved}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-gray-500">
              Departments
            </h2>

            <p className="text-4xl font-bold text-blue-600">
              {Object.keys(departments).length}
            </p>
          </div>

        </div>

        {/* COMPLAINT TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-4 text-left">
                  Complaint ID
                </th>

                <th className="p-4 text-left">
                  Issue
                </th>

                <th className="p-4 text-left">
                  Department
                </th>

                <th className="p-4 text-left">
                  Severity
                </th>

                <th className="p-4 text-left">
                  Status
                </th>

                <th className="p-4 text-left">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>

              {data.complaints.map((item) => (
                <tr
                  key={item.complaint_id}
                  className="border-b"
                >
                  <td className="p-4">
                    {item.complaint_id}
                  </td>

                  <td className="p-4">
                    {item.issue_type}
                  </td>

                  <td className="p-4">
                    {item.department}
                  </td>

                  <td className="p-4">
                    {item.severity}
                  </td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-white ${
                        item.status === "Resolved"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="p-4">

                    {item.status === "Pending" ? (
                      <button
                        onClick={() =>
                          resolveComplaint(
                            item.complaint_id
                          )
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Done
                      </span>
                    )}

                  </td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

        {/* DEPARTMENT MONITORING */}
        <div className="bg-white rounded-xl shadow p-6 mt-8">

          <h2 className="text-2xl font-bold mb-5">
            Department Monitoring
          </h2>

          {Object.entries(departments).length === 0 ? (
            <p className="text-gray-500">
              No complaints available.
            </p>
          ) : (
            Object.entries(departments).map(
              ([department, count]) => (
                <div
                  key={department}
                  className="flex justify-between border-b py-3"
                >
                  <span>{department}</span>

                  <span className="font-bold text-blue-600">
                    {count} complaints
                  </span>
                </div>
              )
            )
          )}

        </div>

      </div>
    </main>
  );
}