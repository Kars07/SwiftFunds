import React, { useState, useEffect, ChangeEvent } from "react";
import default_profile from "../../assets/default_profile.png";

interface User {
  fullName: string;
  email: string;
  emailConfirmed: boolean;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User>({
    fullName: "",
    email: "",
    emailConfirmed: false,
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Fetch user profile on mount
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // include cookies if needed
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            fullName: data.fullName || "",
            email: data.email || "",
            emailConfirmed: data.emailConfirmed || false,
          });
        } else {
          console.error("Failed to fetch profile");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setProfilePhoto(e.target.files[0]);
    }
  };

  const handleSaveChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users/updateprofile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: user.fullName,
          email: user.email,
        }),
      });

      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred.");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    window.location.reload(); // reload to discard unsaved changes
  };

  return (
    <div className="flex-1 p-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-8 w-full">
        <h2 className="text-2xl text-gray-500 font-bold mb-6">Account Settings</h2>

        {/* Profile Picture Section */}
        <div className="flex items-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300">
            <img
              src={
                profilePhoto
                  ? URL.createObjectURL(profilePhoto)
                  : default_profile
              }
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-4">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
              id="upload-photo"
            />
            <label
              htmlFor="upload-photo"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md cursor-pointer text-sm"
            >
              Upload new photo
            </label>
            <button
              onClick={() => setProfilePhoto(null)}
              className="ml-2 bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-md text-sm"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              value={user.fullName}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              onChange={(e) =>
                setUser((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full p-3 rounded-md border border-gray-300"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={handleCancel}
            className="bg-gray-300 hover:bg-gray-400 text-black py-2 px-4 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveChanges}
            disabled={loading}
            className={`${
              loading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white py-2 px-4 rounded-md`}
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;