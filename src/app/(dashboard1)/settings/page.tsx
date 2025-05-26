"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SettingsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading settings...</p>
      </div>
    );
  }

  // Retrieve the role from the user's public metadata, default to "student" if undefined.
  const role = (user.publicMetadata?.role as string) || "student";

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6 space-y-8">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">
            Customize your account, notifications, and more.
          </p>
        </header>

        {/* Role-Specific Settings */}
        {role === "admin" && <AdminSettings />}
        {role === "teacher" && <TeacherSettings />}
        {role === "student" && <StudentSettings />}
        {role === "parent" && <ParentSettings />}

        {/* General Settings for all roles */}
        <GeneralSettings user={user} />
      </div>
    </div>
  );
};

export default SettingsPage;

/* -------------------------------------------------
   Role-specific Sections
------------------------------------------------- */

const AdminSettings = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Administrator Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingCard
          title="Manage Users"
          description="Add, edit or remove teachers, students, and parents."
          link="/"
          icon="/users.png"
        />
        <SettingCard
          title="System Reports"
          description="View analytics and performance reports."
          link="/admin/reports"
          icon="/reports.png"
        />
        <SettingCard
          title="School Settings"
          description="Configure school-wide settings and policies."
          link="/admin/school-settings"
          icon="/settings.png"
        />
        <SettingCard
          title="Security"
          description="Manage access levels and permissions."
          link="/admin/security"
          icon="/security.png"
        />
      </div>
    </section>
  );
};

const TeacherSettings = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Teacher Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingCard
          title="My Classes"
          description="View and manage the classes you teach."
          link="/teacher/classes"
          icon="/class.png"
        />
        <SettingCard
          title="Schedule Preferences"
          description="Set your teaching schedule and office hours."
          link="/teacher/schedule"
          icon="/calendar.png"
        />
        <SettingCard
          title="Gradebook"
          description="Configure grading options and report cards."
          link="/teacher/gradebook"
          icon="/gradebook.png"
        />
        <SettingCard
          title="Communication"
          description="Customize how you share announcements and messages."
          link="/teacher/communication"
          icon="/message.png"
        />
      </div>
    </section>
  );
};

const StudentSettings = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Student Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingCard
          title="Profile"
          description="Edit your profile and update personal information."
          link="/student/profile"
          icon="/child1.png"
        />
        <SettingCard
          title="Course Enrollment"
          description="View and manage your course registrations."
          link="/student/courses"
          icon="/courses.png"
        />
        <SettingCard
          title="Attendance"
          description="Review your attendance records."
          link="/student/attendance"
          icon="/attendance.png"
        />
        <SettingCard
          title="Notifications"
          description="Manage your notification preferences."
          link="/student/notifications"
          icon="/notifications.png"
        />
      </div>
    </section>
  );
};

const ParentSettings = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Parent Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingCard
          title="Child Profile"
          description="Access and update your child's information."
          link="/parent/child-profile"
          icon="/child1.png"
        />
        <SettingCard
          title="Academic Reports"
          description="Review your child's academic performance."
          link="/parent/reports"
          icon="/reports.png"
        />
        <SettingCard
          title="Communication"
          description="Set preferences for receiving school updates."
          link="/parent/communication"
          icon="/message.png"
        />
        <SettingCard
          title="Payment Options"
          description="Manage tuition and fee payments."
          link="/parent/payments"
          icon="/payment.png"
        />
      </div>
    </section>
  );
};

/* -------------------------------------------------
   General Settings (for all roles)
------------------------------------------------- */

const GeneralSettings = ({ user }: { user: any }) => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        General Settings
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SettingCard
          title="Account Information"
          description="Manage your email, password, and login methods."
          link="/settings/account"
          icon="/account.png"
        />
        <SettingCard
          title="Privacy & Security"
          description="Configure your privacy settings and secure your account."
          link="/settings/privacy"
          icon="/privacy.png"
        />
        <SettingCard
          title="Notification Preferences"
          description="Customize email and push notification options."
          link="/settings/notifications"
          icon="/notifications.png"
        />
        <SettingCard
          title="Language & Theme"
          description="Select your preferred language and theme."
          link="/settings/appearance"
          icon="/theme.png"
        />
      </div>
    </section>
  );
};

/* -------------------------------------------------
   Reusable Setting Card Component
------------------------------------------------- */

interface SettingCardProps {
  title: string;
  description: string;
  link: string;
  icon: string;
}

const SettingCard = ({ title, description, link, icon }: SettingCardProps) => {
  return (
    <Link href={link}>
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-md hover:bg-lamaSkyLight transition-colors duration-300 shadow-sm">
        <Image src={icon} alt={title} width={32} height={32} />
        <div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm">{description}</p>
        </div>
      </div>
    </Link>
  );
};
