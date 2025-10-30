import {
  authenticateRequest,
  jsonResponse,
} from "@/helpers/loginHelper";
import { getKudoDetails, likeKudoMessages } from "@/app/actions/kudo";
import * as Sentry from "@sentry/nextjs";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return jsonResponse(401, "Unauthorized");
    }
    const { kudoId,createdAt } = await request.json();

    if (!kudoId) {
      return jsonResponse(400, "Invalid kudo!");
    }

    const kudo = await getKudoDetails(kudoId);

    if (!kudo) {
      return jsonResponse(404, "Kudo not found");
    }

    const isReceiverLike = kudo.kudo_receiver.find(
      (receiver: any) => receiver.$users[0]?.id === user.id
    );

    if (isReceiverLike) {
      // notify sender about the like
      await likeKudoMessages(kudoId, user.id, [kudo.$users[0]?.id],createdAt);
    } else {
      const isSender = kudo.$users[0]?.id === user.id;
      const isOtherUserLike = !isSender;
      if (isOtherUserLike) {
        const kudoReceiverIDs = kudo.kudo_receiver.map(
        (receiver: any) => receiver.$users[0]?.id
      );
        // notify sender and receiver both about the like
       await likeKudoMessages(kudoId, user.id, [kudo.$users[0]?.id,...kudoReceiverIDs],createdAt);
      }
    }
    return jsonResponse(200, "Kudo like successfully");
  } catch (error: any) {
    const status = error?.response?.status || 500;
    if (status >= 500) {
      Sentry.captureException(error);
    }
    console.error("Error like kudo:", error);
    return jsonResponse(
      status,
      error?.response?.data.message || "Internal server error"
    );
  }
}
