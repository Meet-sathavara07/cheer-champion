import "server-only";
import adminDB from "../lib/admin/instant";
import {
  createInitProfile,
  createTokenHandler,
  extractNameFromMessage,
  getGenderFromName,
} from "@/helpers/loginHelper";

interface User {
  id: string;
  email: string;
}
export async function checkUserAccountExist(
  identifier: string,
  countryCode: string
): Promise<User | null> {
  try {
    // find existing user
    const userQuery: any = await adminDB.query({
      $users: {
        $: {
          where: countryCode
            ? {
                and: [
                  { "user_profile.mobile1": identifier },
                  { "user_profile.mobile1_country_code": countryCode },
                ],
              }
            : { email: identifier.toLowerCase() },
          limit: 1,
        },
      },
    });
    if (userQuery.$users?.length) {
      return userQuery.$users[0];
    }
    return null; // User not found
  } catch (error) {
    console.error(
      "Error checking user account:",
      JSON.stringify(error, null, 2)
    );
    throw error;
  }
}

// export async function checkUserAccountExist(
//   identifier: string,
//   countryCode: string
// ): Promise<string | null> {
//   try {
//     // Step 1: Check Primary Email First
//     if (!countryCode) {
//       const userQuery = await adminDB.query({
//         $users: {
//           $: {
//             where: { email: identifier.toLowerCase() },
//             limit: 1,
//           },
//         },
//       });
//       if (userQuery?.$users?.length) {
//         return userQuery.$users[0].id;
//       }
//     }

//     // Step 2: Check Multi-Login Emails & Mobile Numbers
//     const multiLoginQuery:any = await adminDB.query({
//       user_profile: {
//         $: {
//           where: countryCode
//             ? {
//                 or: [
//                   {
//                     and: [
//                       { mobile1: identifier },
//                       { mobile1_country_code: countryCode },
//                     ],
//                   },
//                   {
//                     and: [
//                       { mobile2: identifier },
//                       { mobile2_country_code: countryCode },
//                     ],
//                   },
//                   {
//                     and: [
//                       { mobile3: identifier },
//                       { mobile3_country_code: countryCode },
//                     ],
//                   },
//                 ],
//               }
//             : {
//                 or: [
//                   { email2: identifier.toLowerCase() },
//                   { email3: identifier.toLowerCase() },
//                 ],
//               },
//           limit: 1,
//         },
//       },
//     });
//     if (multiLoginQuery?.user_profile?.length && multiLoginQuery.user_profile[0]["$users"]) {
//       return multiLoginQuery.user_profile[0]["$users"]
//     }
//     return null; // User not found
//   } catch (error) {
//     console.error(
//       "Error checking user account:",
//       JSON.stringify(error, null, 2)
//     );
//     throw (error);
//   }
// }

export async function createOrFindReceivers(
  recipients: any[],
  message: string
) {
  return await Promise.all(
    recipients.map(async (recipient: any) => {
      try {
        const { email, mobile, countryCode, countryIso2 } = recipient;
        const identifier = email || mobile;
        const userExists = await checkUserAccountExist(identifier, countryCode);
        if (userExists) return userExists.id;
        const token = await createTokenHandler(identifier, "", countryCode);
        // extract name from kudo message while send kudo to new account
        const extractedName = await extractNameFromMessage(message);
        let extractedGender = "";
        if (extractedName) {
          // extract gender from name
          extractedGender = await getGenderFromName(extractedName);
        }
        const newUser = await createInitProfile(
          token,
          identifier,
          countryCode,
          countryIso2,
          extractedName,
          "",
          "",
          extractedGender,
          0
        );
        return newUser?.id;
      } catch (error) {
        if (!(error instanceof Error)) {
          throw new Error(
            typeof error === "string" ? error : JSON.stringify(error)
          );
        }
        throw error;
      }
    })
  );
}
