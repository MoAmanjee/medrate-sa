"use client";

export default function DoctorCard({ doctor }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold">{doctor?.name || "Doctor Name"}</h3>
      <p className="text-gray-600">{doctor?.specialization || "Specialization"}</p>
    </div>
  );
}
