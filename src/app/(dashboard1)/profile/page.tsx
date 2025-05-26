"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";


interface StudentData {
  className: string;
  grade: string;
  attendance: number;
}

interface ParentData {
  students: {
    id: string;
    name: string;
    surname: string;
    className: string;
    classId: string;
  }[];
}

interface TeacherData {
  id: string;
  name: string;
  surname: string;
  img: string | null;
  bloodType: string;
  birthday: string;
  email: string;
  phone: string;
  subjectsCount: number;
  lessonsCount: number;
  classesCount: number;
}
const ProfilePage = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [teacherData, setTeacherData] = useState<TeacherData | null>(null);
  // Fetch student-specific data from your API endpoint
  useEffect(() => {
    if (!user) return;
    const fetchStudentData = async () => {
      try {
        // Fetch dynamic data from the API endpoint
        const response = await fetch(`/api/studentData/${user.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }
        const data: StudentData = await response.json();
        setStudentData(data);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchStudentData();
  }, [user]);
  // Fetch parent-specific data from your API endpoint
   useEffect(() => {
    if (!user) return;
    const userRole = user.publicMetadata?.role as string;
    
    if (userRole === "parent") {
      const fetchParentData = async () => {
        try {
          const response = await fetch(`/api/parent/${user.id}`);
          if (!response.ok) throw new Error("Failed to fetch parent's data");
          const data: ParentData = await response.json();
          setParentData(data);
        } catch (error) {
          console.error("Error fetching parent's data:", error);
          setParentData(null);
        }
      };
      fetchParentData();
    } else if (userRole === "teacher") {
      const fetchTeacherData = async () => {
        try {
          const response = await fetch(`/api/teacher/${user.id}`);
          if (!response.ok) throw new Error("Failed to fetch teacher's data");
          const data: TeacherData = await response.json();
          setTeacherData(data);
        } catch (error) {
          console.error("Error fetching teacher's data:", error);
          setTeacherData(null);
        }
      };
      fetchTeacherData();
    }
  }, [user]);
  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  // Retrieve the role from public metadata. Default to "student" if missing.
  const role = (user.publicMetadata?.role as string) || "student";

  // Render role-specific content.
  const renderRoleContent = () => {
    if (role === "student") {
      return (
        <div className="mt-4">
          <h3 className="text-xl font-semibold border-b pb-1 mb-2">Student Information</h3>
          <p className="text-lg">
            <span className="font-medium">Class:</span>{" "}
            {studentData ? studentData.className : "No class assigned"}
          </p>
          <p className="text-lg">
            <span className="font-medium">Grade:</span>{" "}
            {studentData ? studentData.grade : "No grade assigned"}
          </p>
          <p className="text-lg">
            <span className="font-medium">Attendance:</span>{" "}
            {studentData ? `${studentData.attendance}%` : "No attendance data available"}
          </p>
        </div>
      );
    } else if (role === "parent") {
      return (
         <div className="mt-4">
          <h3 className="text-xl font-semibold border-b pb-1 mb-4">Parent Information</h3>
          {parentData && parentData.students.length > 0 ? (
            parentData.students.map((student) => (
              <div key={student.id} className="mb-6 bg-white p-4 rounded-md shadow">
                <h1 className="text-xl font-semibold">
                  Schedule ({student.name} {student.surname})
                </h1>
                <p className="mt-1 text-lg">
                  <span className="font-medium">Class:</span> {student.className || "No class assigned"}
                </p>
              </div>
            ))
          ) : (
            <p>No children assigned</p>
          )}
        </div>
      );
    } else if (role === "teacher") {
      if (!teacherData) {
    return <div className="mt-4">No teacher information available</div>;
  }
  return (
    <div className="mt-4">
      <h3 className="text-xl font-semibold border-b pb-1 mb-2">Teacher Information</h3>
      <p className="text-lg">
        <span className="font-medium">Subjects:</span> {teacherData!.subjectsCount}
      </p>
      <p className="text-lg">
        <span className="font-medium">Lessons:</span> {teacherData!.lessonsCount}
      </p>
      <p className="text-lg">
        <span className="font-medium">Classes:</span> {teacherData!.classesCount}
      </p>
    </div>
  );
    } else if (role === "admin") {
      return (
        <div className="mt-4">
      <h3 className="text-xl font-semibold border-b pb-1 mb-2">Administrator Panel</h3>
      <p>
        <Link href="/list/teachers" className="text-blue-600 hover:underline">
          Manage Teachers
        </Link>
      </p>
      <p className="mt-1">
        <Link href="/list/students" className="text-blue-600 hover:underline">
          Manage Students
        </Link>
      </p>
      <p className="mt-1">
        <Link href="/list/results" className="text-blue-600 hover:underline">
          View Results
        </Link>
      </p>
    </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex justify-center items-start p-6">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Cover Image Section */}
        <div className="relative h-48">
          <Image
            src="/profile-bg.jpg"
            alt="Cover Image"
            fill
            className="object-contain"
          />
          <div className="absolute inset-0 bg-black opacity-30"></div>
        </div>
        {/* Profile Card Section */}
        <div className="relative p-6">
          {/* Profile Avatar */}
          <div className="absolute -top-16 left-6">
            <Image
              src={user.imageUrl || "/default-avatar.png"}
              alt="Avatar"
              width={100}
              height={100}
              className="rounded-full border-4 border-white shadow-lg"
            />
          </div>
          {/* Profile Info */}
          <div className="ml-28">
            <h2 className="text-3xl font-bold text-gray-800">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
            <p className="mt-2 text-sm font-medium text-blue-600 uppercase">{role}</p>
          </div>
          {/* Role Specific Content */}
          <div className="mt-8 border-t pt-4">
            {renderRoleContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
