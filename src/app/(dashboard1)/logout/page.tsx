"use client";

import { useUser, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";

const LogoutPage = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  // While loading or if not signed in, show a loading state.
  if (!isLoaded || !isSignedIn || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading logout page...</p>
      </div>
    );
  }

  // Determine the user's role from Clerk's public metadata.
  const role = (user.publicMetadata?.role as string) || "student";

  // Prepare a farewell message based on role.
  let farewellMessage = "";
  switch (role) {
    case "admin":
      farewellMessage = "Goodbye Administrator, your leadership makes a difference!";
      break;
    case "teacher":
      farewellMessage = "Goodbye Teacher, keep inspiring future minds!";
      break;
    case "parent":
      farewellMessage = "Goodbye Parent, thank you for being so involved!";
      break;
    default:
      farewellMessage = "Goodbye, see you soon!";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-lg p-8 max-w-md text-center">
        <Image
          src="/logout-illustration.jpg"
          alt="Logout Illustration"
          width={150}
          height={150}
          className="mx-auto"
        />
        <h1 className="text-3xl font-bold mt-4">See You Soon!</h1>
        <p className="text-gray-600 mt-2">{farewellMessage}</p>
        <p className="text-gray-500 mt-1">You are about to log out of your account.</p>
        <div className="mt-6">
          <SignOutButton redirectUrl="/">
            <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition-colors duration-300">
              Logout Now
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;
