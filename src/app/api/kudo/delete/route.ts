import adminDB from "@/app/lib/admin/instant";
import {
  authenticateRequest,
  getUserProfile,
  jsonResponse,
} from "@/helpers/loginHelper";
import {
  getKudoDetails,
  deleteKudoImageFromBucket,
  deleteKudoLike,
} from "@/app/actions/kudo";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }
    const { kudoId } = await request.json();

    if (!kudoId) {
      return jsonResponse(400, "Invalid kudo!");
    }

    const kudo = await getKudoDetails(kudoId);

    if (!kudo) {
      return jsonResponse(404, "Kudo not found");
    }

    const isSender = kudo.$users[0]?.id === user.id;

    const receiver = kudo.kudo_receiver.find(
      (receiver: any) => receiver.$users[0]?.id === user.id
    );
    const userProfile: any = await getUserProfile(user.id);
    const isAdmin = userProfile && userProfile.role === "admin";
    if (!isSender && !receiver && !isAdmin) {
        return jsonResponse(403, "Not authorized to delete this kudo");
    }

    if (isSender || (receiver && kudo.kudo_receiver.length === 1) || isAdmin) {
      // Check and delete the S3 file BEFORE deleting the kudo from database
      const fileUrl = kudo.file_url;
      if (fileUrl && fileUrl.includes(process.env.S3_BUCKET_NAME!)) {
        await deleteKudoImageFromBucket(fileUrl);
      }

      await deleteKudoLike(kudoId, kudo);

      return jsonResponse(200, "Kudo deleted successfully");
    }

    if (receiver) {
      // Delete kudo receiver
      await adminDB.transact([adminDB.tx.kudo_receiver[receiver.id].delete()]);
      return jsonResponse(200, "Kudo deleted successfully");
    }
    return jsonResponse(500, "Something went wrong!");
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error deleting kudo:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
