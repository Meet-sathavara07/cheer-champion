import "server-only";
import adminDB from "../lib/admin/instant";
import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import moment from "moment";
export async function getUserProfilesByUserIds(userIds: string[]) {
  try {
    const result: any = await adminDB.query({
      user_profile: {
        $: {
          where: {
            $users: { $in: userIds },
          },
        },
        $users: {},
      },
    });
    return result?.user_profile || []; // Return the fetched profiles
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
}

export async function getAllUserProfiles() {
  try {
    const userProfiles: any = await adminDB.query({
      user_profile: {
        $: {},
        $users: {},
      },
    });
    return userProfiles?.user_profile || null; 
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
}

// export async function getUserProfileBySlug(slug: string) {
//   try {
//     const userProfiles: any = await adminDB.query({
//       user_profile: {
//         $: {
//           where: { slug: slug },
//         },
//         kudos: {},
//         kudo_receiver: {},
//         $files:{}
//       },
//     });
//      if(userProfiles.user_profile.length){
//        return userProfiles.user_profile[0];
//      }
//      throw new Error("Something went wrong!");
//   } catch (error) {
//     console.error("Error fetching user profiles:", error);
//     throw error;
//   }
// }

// export async function generateSlug(name: string) {
//   return name
//     .replace(/[^a-zA-Z0-9 ]+/g, "") // Remove special characters except space
//     .split(" ")
//     .map((word) =>
//       word === word.toUpperCase() // Keep words like "CP" as is
//         ? word
//         : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//     )
//     .join("");
// }

// export const isSlugUnique = async (slug: string, userID: string) => {
//   const response = await adminDB.query({
//     user_profile: {
//       $: {
//         where: { slug },
//         limit: 1,
//       },
//     },
//   });
//   let userProfile = response?.user_profile;
//   if (userID) {
//     userProfile = response?.user_profile.filter(
//       (item: any) => item.$users !== userID
//     );
//   }
//   return userProfile?.length === 0;
// };

// export const createUniqueSlug = async (name: string, userID: string = "") => {
//   const baseSlug = await generateSlug(name);
//   let slug: any = baseSlug;
//   let counter = 1;

//   while (!(await isSlugUnique(slug, userID))) {
//     slug = `${baseSlug}-${counter}`;
//     counter++;
//   }
//   return slug;
// };

export async function getUserProfileDetails(userId: string) {
  try {
    const userProfiles: any = await adminDB.query({
      $users: {
        $: {
          where: { id: userId },
        },
        kudos: {},
        kudo_receiver: {},
        user_profile: {
          $files: {},
        },
      },
    });
    if (userProfiles?.$users?.length) {
      return userProfiles.$users[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profiles:", error);
    throw error;
  }
}
export async function uploadImage(file: File, userID: string) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer); // Important for Node environments

    const opts = {
      contentType: file.type || "image/jpeg",
      contentDisposition: "inline",
    };

    const uploadedFile = await adminDB.storage.uploadFile(
      `profile/${userID}`,
      buffer,
      opts
    );
    return uploadedFile.data.id;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}
export async function getUserProfileImage(userID: string) {
  try {
    const query: any = {
      $files: {
        $: {
          where: { path: `profile/${userID}` },
          order: { serverCreatedAt: "desc" },
          first: 1,
        },
      },
    };
    const data: any = await adminDB.query(query);
    return data.$files[0].url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function uploadGoogleProfileImage(
  imageUrl: string,
  userID: string
) {
  try {
    // Step 1: Download image from Google
    const res = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(res.data);

    // Step 2: Detect file type
    const fileType = await fileTypeFromBuffer(buffer);
    const mime = fileType?.mime || "image/jpeg";

    // Step 3: Upload to InstantDB
    const uploaded = await adminDB.storage.uploadFile(
      `profile/${userID}`,
      buffer,
      {
        contentType: mime,
        contentDisposition: "inline",
      }
    );
    return uploaded.data.id; // returns the InstantDB file ID
  } catch (err) {
    console.error("Upload Google profile image failed:", err);
    throw err;
  }
}

export const handleEmailUpdate = async (
  newEmail: string,
  isEmailDummy: boolean,
  userId: string,
  userProfile: any,
  updateFields: Record<string, string>
) => {
  if (isEmailDummy) {
    adminDB.transact([adminDB.tx.$users[userId].update({ email: newEmail })]);
  } else {
    if (!userProfile.email2) updateFields.email2 = newEmail;
    else if (!userProfile.email3) updateFields.email3 = newEmail;
  }
};

/**
 * Handles mobile update logic
 */
export const handleMobileUpdate = async (
  newMobile: string,
  userProfile: any,
  updateFields: Record<string, string>
) => {
  const existingMobiles = [
    userProfile.mobile1,
    userProfile.mobile2,
    userProfile.mobile3,
  ];
  if (!existingMobiles.includes(newMobile)) {
    if (!userProfile.mobile1) updateFields.mobile1 = newMobile;
    else if (!userProfile.mobile2) updateFields.mobile2 = newMobile;
    else if (!userProfile.mobile3) updateFields.mobile3 = newMobile;
  }
};

export const updateUserProfile = async (
  profileId: string,
  updateFields: Record<string, string>
) => {
  try {
    await adminDB.transact([
      adminDB.tx.user_profile[profileId].update(updateFields),
    ]);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

const getSentKudos = async (userID: string) => {
  return await adminDB.query({
    kudos: {
      $: {
        where: { $users: userID },
      },
    },
  });
};
const getKudoReceivers = async (userID: string) => {
  return await adminDB.query({
    kudo_receiver: {
      $: {
        where: { $users: userID },
      },
    },
  });
};
const cleanupUser = async (userID: string) => {
  const { user_profile } = await adminDB.query({
    user_profile: { $: { where: { $users: userID } } },
    // todos: { $: { where: { creator: userId } } },
  });

  await adminDB.transact([
    ...user_profile.map((profile) =>
      adminDB.tx.user_profile[profile.id].delete()
    ),
    // ...todos.map((item) => tx.todos[item.id].delete()),
  ]);
  await adminDB.auth.deleteUser({ id: userID });
};

export const mergeAccount = async (
  currentUserProfile: any,
  mergeUserID: string
) => {
  try {
    const sentKudos = await getSentKudos(mergeUserID);
    const kudoReceives = await getKudoReceivers(mergeUserID);
    const unlinkedSentKudos = sentKudos.kudos.map((kudo) => {
      return adminDB.tx.kudos[kudo.id].unlink({ $users: mergeUserID });
    });
    const unlinkedReceivedKudos = kudoReceives.kudo_receiver.map((receiver) => {
      return adminDB.tx.kudo_receiver[receiver.id].unlink({
        $users: mergeUserID,
      });
    });
    const linkedSentKudos = sentKudos.kudos.map((kudo) => {
      return adminDB.tx.kudos[kudo.id].link({
        $users: currentUserProfile.$users,
      });
    });
    const linkedReceivedKudos = kudoReceives.kudo_receiver.map((receiver) => {
      return adminDB.tx.kudo_receiver[receiver.id].link({
        $users: currentUserProfile.$users,
      });
    });
    await adminDB.transact([
      ...unlinkedSentKudos,
      ...unlinkedReceivedKudos,
      ...linkedSentKudos,
      ...linkedReceivedKudos,
    ]);
    await cleanupUser(mergeUserID);
  } catch (error) {
    console.error("Error merge user:", error);
    console.log("Error data merge user:", JSON.stringify(error, null, 2));
    throw error;
  }
};

// export const updateActivityDate = async (kudoUsers: string[]) => {
//   try {
//     const now = moment().format("YYYY-MM-DD HH:mm:ss");
//     const profiles: any = await adminDB.query({
//       user_profile: {
//         $: {
//           where: {
//             or: kudoUsers.map((id) => ({ "$users.id": id })),
//           },
//         },
//       },
//     });
//     return profiles.user_profile.map((profile: any) => {
//       return adminDB.tx.user_profile[profile.id].update({
//         last_activity_at: now,
//       });
//     });
//   } catch (error) {
//     console.log("Error update activity:", JSON.stringify(error, null, 2));
//   }
// };

export const updateLastSendAt = async (userId: string) => {
  try {
    const now = moment().format("YYYY-MM-DD HH:mm:ss");
    const profiles: any = await adminDB.query({
      user_profile: {
        $: {
          where: { "$users.id": userId },
        },
      },
    });
    if (!profiles.user_profile.length) return;
    await adminDB.transact([
      adminDB.tx.user_profile[profiles.user_profile[0].id].update({
        last_send_at: now,
        last_activity_at: now,
      }),
    ]);
  } catch (error) {
    console.error("Error updating last_send_at:", error);
  }
};

export const updateLastReceiveAt = async (userIds: string[]) => {
  try {
    const now = moment().format("YYYY-MM-DD HH:mm:ss");

    if (!userIds.length) return;
    const profiles: any = await adminDB.query({
      user_profile: {
        $: {
          where: {
            or: userIds.map((id) => ({ "$users.id": id })),
          },
        },
      },
    });
    if (!profiles.user_profile.length) return;
    await adminDB.transact(
      profiles.user_profile.map((profile: any) =>
        adminDB.tx.user_profile[profile.id].update({
          last_receive_at: now,
          last_activity_at: now,
        })
      )
    );
  } catch (error) {
    console.error("Error updating last_receive_at:", error);
  }
};
