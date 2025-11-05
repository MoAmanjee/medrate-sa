"use client";

export default function DoctorProfile({ doctor }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold">{doctor?.name || "Doctor Name"}</h2>
      <p className="text-gray-600">{doctor?.specialization || "Specialization"}</p>
    </div>
  );
}
