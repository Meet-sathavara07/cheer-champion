import "server-only";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import * as Sentry from "@sentry/nextjs";
import { isDummyEmail } from "@/helpers/jobs";
import moment from "moment";
import { addNotificationChannel } from "@/app/actions/notifications";

export const REMINDER_EMAILS = [
  {
    template: "emailReminder1.html",
    subject: "The timing’s never perfect. The message always is.",
  },
  {
    template: "emailReminder2.html",
    subject: "You made someone smile last time. Wanna try again?",
  },
  { template: "emailReminder3.html", subject: "Send Some Cheer!" },
  { template: "emailReminder4.html", subject: "Send Some Cheer!" },
];

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.GMAIL_USER_EMAIL, // Your Google Workspace email
//     pass: process.env.GMAIL_APP_PASSWORD, // The app password you generated
//   },
//   greetingTimeout: 30000,
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // or 587
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.GMAIL_USER_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD, // must be an App Password
  },
  connectionTimeout: 10000, // 10s
  greetingTimeout: 5000, // wait 5s for server greeting
  // tls: {
  //   rejectUnauthorized: true, // set false only if behind corporate firewall
  // },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
});

export const sendOtpEmail = async (toEmail: string, otp: string) => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "app",
      "emailTemplates",
      "otpTemplate.html"
    );

    // Read the file content
    let emailHtml = fs.readFileSync(templatePath, "utf8");

    emailHtml = emailHtml.replace("{{otp}}", otp);
    const params = {
      from: process.env.GMAIL_USER_EMAIL,
      to: toEmail,
      subject: "Cheer Champion OTP Verification",
      html: emailHtml,
    };
    await transporter.sendMail(params);
  } catch (error: any) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

export async function sendKudoEmail(
  receiver: any,
  sender: any,
  kudoID: string,
  kudo: any,
  notificationID: string = ""
) {
  const sentEmails = [];
  const { $users, email2, email3, name } = receiver;
  const senderName = sender.name || "";
  // const senderEmail = sender.$users.email.includes("@cheerchampion.com") ? process.env.GMAIL_USER_EMAIL : sender.$users.email
  // Collect valid numbers
  const emails = [$users.email, email2, email3].filter((email) => email);
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    "kudoTemplate.html"
  );
  // Read the file content
  let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
  const brandLogo = `${process.env.NEXT_PUBLIC_BASE_URL}/brandLightLogo.png`;
  emailHtml = emailHtml.replace("{{kudoID}}", kudoID);
  emailHtml = emailHtml.replace(/{{sender}}/g, senderName);
  emailHtml = emailHtml.replace("{{recipientName}}", name);
  emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
  emailHtml = emailHtml.replace("{{kudoImageURL}}", kudo.file_url);
  emailHtml = emailHtml.replace("{{kudoMessage}}", kudo.kudo);
  for (const email of emails) {
    try {
      const isEmailDummy = await isDummyEmail(email);
      if (isEmailDummy) {
        continue;
      }
      const params: any = {
        from: process.env.GMAIL_USER_EMAIL,
        to: email,
        subject: `🎉 Cheer from ${senderName}! 🎉`,
        html: emailHtml,
      };
      if (!isDummyEmail(sender.$users.email)) {
        params.replyTo = sender.$users.email;
      }
      const sentEmail = await transporter.sendMail(params);
      sentEmails.push(sentEmail);
      if (sentEmail.accepted?.length) {
        await addNotificationChannel(notificationID, {
          channel: "email",
          status: "success",
          identifier: "kudoTemplate.html",
        });
      }
    } catch (error: any) {
      console.error(`Failed to send kudo message to ${email}:`, error);
      Sentry.captureException(error);
      await addNotificationChannel(notificationID, {
        channel: "email",
        status: "failed",
        identifier: "kudoTemplate.html",
        error:
          error?.response?.data?.message ||
          error.message ||
          "Failed to send kudo message",
      });
      continue;
    }
  }
  return sentEmails;
}
export async function receiveKudoEmailNotification(
  contact: any,
  sender: any,
  receiverName: string,
  kudoID: string,
  kudoMessage: any,
  kudoImage: string
) {
  const emailTemplate = "kudoReceivedNotifyReceiverContact.html";
  const returnValue = {
    identifier: emailTemplate,
    status: "pending",
    error: "",
  };
  const { email, user_profile } = contact;
  try {
    const senderName = sender.name || "";
    const templatePath = path.join(
      process.cwd(),
      "src",
      "app",
      "emailTemplates",
      emailTemplate
    );
    // Read the file content
    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
    const brandLogo = `${process.env.NEXT_PUBLIC_BASE_URL}/brandLightLogo.png`;
    emailHtml = emailHtml.replace("{{kudoID}}", kudoID);
    emailHtml = emailHtml.replace(/{{sender}}/g, senderName);
    emailHtml = emailHtml.replace(/{{receiverName}}/g, receiverName);
    emailHtml = emailHtml.replace("{{contactName}}", user_profile.name);
    emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
    emailHtml = emailHtml.replace("{{kudoImageURL}}", kudoImage);
    emailHtml = emailHtml.replace("{{kudoMessage}}", kudoMessage);
    const params: any = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: `${receiverName} received a new Kudo on Cheer Champion`,
      html: emailHtml,
    };
    if (!isDummyEmail(sender.$users.email)) {
      params.replyTo = sender.$users.email;
    }
    const sentEmail = await transporter.sendMail(params);
    returnValue.status = sentEmail.accepted?.length ? "success" : "failed";
  } catch (error: any) {
    console.error(`Failed to friend received kudo to ${email}:`, error);
    Sentry.captureException(error);
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to friend sent kudo to";
    returnValue.status = "failed";
  } finally {
    return returnValue;
  }
}
export async function sentKudoEmailNotification(
  contact: any,
  sender: any,
  kudoReceiverNames: string,
  kudoID: string,
  kudoMessage: any,
  kudoImage: string
) {
  const emailTemplate = "kudoSentNotifySenderContact.html";
  const returnValue = {
    identifier: emailTemplate,
    status: "pending",
    error: "",
  };
  const { user_profile, email } = contact;
  const senderName = sender.name || "";
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );
  let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
  const brandLogo = `${process.env.NEXT_PUBLIC_BASE_URL}/brandLightLogo.png`;
  emailHtml = emailHtml.replace("{{kudoID}}", kudoID);
  emailHtml = emailHtml.replace(/{{receiverNames}}/g, kudoReceiverNames);
  emailHtml = emailHtml.replace(/{{senderName}}/g, senderName);
  emailHtml = emailHtml.replace("{{contactName}}", user_profile.name);
  emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
  emailHtml = emailHtml.replace("{{kudoImageURL}}", kudoImage);
  emailHtml = emailHtml.replace("{{kudoMessage}}", kudoMessage);
  try {
    const params: any = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: `${senderName} sent a new Kudo on Cheer Champion`,
      html: emailHtml,
    };
    if (!isDummyEmail(sender.$users.email)) {
      params.replyTo = sender.$users.email;
    }
    const sentEmail = await transporter.sendMail(params);
    returnValue.status = sentEmail.accepted?.length ? "success" : "failed";
  } catch (error: any) {
    console.error(`Failed to friend sent kudo to ${email}:`, error);
    Sentry.captureException(error);
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to friend sent kudo to";
    returnValue.status = "failed";
  } finally {
    return returnValue;
  }
}

export async function likeKudoEmail(
  receiver: any,
  likeUserName: any,
  kudoID: string,
  createdAt: Date,
  likeUser: any,
  notificationID: string = ""
) {
  const sendDate = moment(createdAt).format("MMMM D, YYYY");
  const sendTime = moment(createdAt).format("hh:mm A");

  const { $users, name } = receiver;
  const emails = [$users.email].filter((email) => email);
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    "likeKudoTemplate.html"
  );
  // Read the file content
  let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
  const brandLogo = `${process.env.NEXT_PUBLIC_BASE_URL}/brandLightLogo.png`;
  emailHtml = emailHtml.replace("{{kudoID}}", kudoID);
  emailHtml = emailHtml.replace("{{1}}", name);
  emailHtml = emailHtml.replace("{{2}}", likeUserName);
  emailHtml = emailHtml.replace("{{3}}", sendDate);
  emailHtml = emailHtml.replace("{{4}}", sendTime);
  emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
  for (const email of emails) {
    try {
      const isEmailDummy = await isDummyEmail(email);
      if (isEmailDummy) {
        continue;
      }
      const params: any = {
        from: process.env.GMAIL_USER_EMAIL,
        to: email,
        subject: "Someone Liked Your Kudo",
        html: emailHtml,
      };
      if (!isDummyEmail(likeUser.$users.email)) {
        params.replyTo = likeUser.$users.email;
      }
      const sentEmail = await transporter.sendMail(params);
      if (sentEmail.accepted?.length) {
        await addNotificationChannel(notificationID, {
          channel: "email",
          status: "success",
          identifier: "likeKudoTemplate.html",
        });
      }
    } catch (error: any) {
      console.error(`Failed to send like kudo message to ${email}:`, error);
      Sentry.captureException(error);
      await addNotificationChannel(notificationID, {
        channel: "email",
        status: "failed",
        identifier: "likeKudoTemplate.html",
        error: error?.response?.data?.message || error.message,
      });
      continue;
    }
  }
}
export async function reportIssue(
  sender: string,
  email: string,
  message: string,
  file: File | null
) {
  try {
    const params: any = {
      from: email,
      to: "dev@cheerchampion.com",
      subject: `New Feedback from ${sender}`,
      text: message,
    };

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      params.attachments = [
        {
          filename: file.name,
          content: buffer,
        },
      ];
    }
    return await transporter.sendMail(params);
  } catch (error) {
    console.error(`Failed to send report message to ${sender}:`, error);
    throw error;
  }
}

export async function testReportIssue(message: string) {
  try {
    const params: any = {
      from: process.env.GMAIL_USER_EMAIL,
      to: "dev@cheerchampion.com",
      subject: `Auto test failed`,
      html: message,
      attachment: "",
    };

    return await transporter.sendMail(params);
  } catch (error) {
    console.error(`Failed to send test failed message to`, error);
    throw error;
  }
}

export const sendTestReportEmail = async (
  passedTests: string[],
  failedTests: string[]
) => {
  try {
    const isSuccess = failedTests.length === 0;
    const subject = isSuccess
      ? "✅ All Playwright Tests Passed"
      : "❌ Some Playwright Tests Failed";

    // Load & compile HTML template
    const templatePath = path.join(
      process.cwd(),
      "src",
      "app",
      "emailTemplates",
      "testReportTemplate.html"
    );
    const templateHtml = fs.readFileSync(templatePath, "utf8");
    const compileTemplate = Handlebars.compile(templateHtml);

    const htmlContent = compileTemplate({
      statusText: isSuccess ? "Passed ✅" : "Failed ❌",
      statusClass: isSuccess ? "passed" : "failed",
      passedCount: passedTests.length,
      failedCount: failedTests.length,
      failedTests: failedTests.length > 0 ? failedTests : null,
    });

    const mailOptions = {
      from: process.env.GMAIL_USER_EMAIL,
      to: process.env.DEV_EMAIL,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("📬 Test summary email sent.");
  } catch (error) {
    console.error("❌ Failed to send test report email:", error);
  }
};

export async function emailRemindUsers(inactiveUser: any) {
  const emailTemplate = "noKudoReminder.html";
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );
  let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
  const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
  emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);

  try {
    const { email, id, user_profile } = inactiveUser;
    const isEmailDummy = await isDummyEmail(email);
    if (!email || isEmailDummy) {
      console.warn(`User ${id} has no valid email, skipping reminder.`);
    }
    emailHtml = emailHtml.replace(/{{userName}}/g, user_profile.name);
    emailHtml = emailHtml.replace("{{userId}}", id);
    const params: any = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      // to: "dev@cheerchampion.com",
      subject: "Start your journey with a Kudo ✨",
      html: emailHtml,
    };
    await transporter.sendMail(params);

    return { success: true, emailTemplate };
  } catch (error) {
    console.error(
      `Failed to send email reminder to ${inactiveUser.email}:`,
      error
    );
    Sentry.captureException(error);
    return {
      success: false,
      emailTemplate,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

const getRandomReminderEmail = () => {
  const campaignIdx = Math.floor(Math.random() * REMINDER_EMAILS.length);
  return REMINDER_EMAILS[campaignIdx];
};
export async function emailRemindUser(inactiveUser: any) {
  const emailTemplateObj = getRandomReminderEmail();
  const emailTemplate = emailTemplateObj.template;
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );
  let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
  const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
  emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);

  // const updates = [];
  try {
    const { email, id, user_profile } = inactiveUser;

    emailHtml = emailHtml.replace(
      /{{userName}}/g,
      user_profile.name || "CheerChampion User"
    );
    emailHtml = emailHtml.replace("{{userId}}", id);
    const params: any = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: emailTemplateObj.subject,
      html: emailHtml,
    };

    await transporter.sendMail(params);
    return { success: true, emailTemplate };
  } catch (error: any) {
    console.error(
      `Failed to send email reminder to ${inactiveUser.email}:`,
      error
    );
    Sentry.captureException(error);
    return {
      success: false,
      emailTemplate,
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
    };
  }
}

export async function emailActiveKudoUser(
  activeUser: any,
  lastMonthName: string,
  kudosCount: number,
  title: string
) {
  const emailTemplate = "kudoSenderAppreciationMonthly.html";
  const returnValue = {
    identifier: emailTemplate,
    status: "pending",
    error: "",
  };
  try {
    const { email, id, user_profile } = activeUser;
    const templatePath = path.join(
      process.cwd(),
      "src",
      "app",
      "emailTemplates",
      emailTemplate
    );

    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();

    // Replace template variables
    const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
    emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
    emailHtml = emailHtml.replace(
      /{{UserName}}/g,
      user_profile?.name || "CheerChampion User"
    );
    emailHtml = emailHtml.replace(/{{lastMonthName}}/g, lastMonthName);
    emailHtml = emailHtml.replace(/{{kudosCount}}/g, kudosCount.toString());
    emailHtml = emailHtml.replace("{{userId}}", id);

    const emailParams = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: title,
      html: emailHtml,
    };

    const sentEmail = await transporter.sendMail(emailParams);
    returnValue.status = sentEmail.accepted?.length ? "success" : "failed";
  } catch (error: any) {
    console.error(`Failed to send active kudo email reminder:`, error);
    Sentry.captureException(error);
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send active kudo email reminder";
    returnValue.status = "failed";
  } finally {
    return returnValue;
  }
}

// Email sending function for top kudo senders
export async function emailTopSenderUser(
  activeUser: any,
  lastMonthName: string,
  kudosCount: number,
  position: string
) {
  const emailTemplate = "TopKudoSenders.html";
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );

  try {
    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
    const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
    const { email, id, user_profile } = activeUser;

    // Replace template variables
    emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
    emailHtml = emailHtml.replace(
      /{{UserName}}/g,
      user_profile?.name || "CheerChampion User"
    );
    emailHtml = emailHtml.replace(/{{lastMonthName}}/g, lastMonthName);
    emailHtml = emailHtml.replace(
      /{{ProfileImage}}/g,
      user_profile?.$files?.url || "image"
    );
    emailHtml = emailHtml.replace(/{{kudosCount}}/g, kudosCount.toString());
    emailHtml = emailHtml.replace(/{{position}}/g, position);
    emailHtml = emailHtml.replace("{{userId}}", id);

    const emailParams = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: `🔥 Hey Cheer Champion! You’re a Top ${position} Kudo Sender 🎉`,
      html: emailHtml,
    };

    await transporter.sendMail(emailParams);

    return { success: true, emailTemplate };
  } catch (error: any) {
    console.error(
      `Failed to send top kudo sender email to ${activeUser?.email}:`,
      error
    );
    Sentry.captureException(error);
    return {
      success: false,
      emailTemplate,
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
    };
  }
}

// Email sending function for top kudo receivers
export async function emailTopReceiverUser(
  activeUser: any,
  lastMonthName: string,
  kudosCount: number,
  position: string
) {
  const emailTemplate = "topKudoReceivers.html";
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );

  try {
    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
    const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
    const { email, id, user_profile } = activeUser;

    // Replace template variables
    emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);
    emailHtml = emailHtml.replace(
      /{{UserName}}/g,
      user_profile?.name || "CheerChampion User"
    );
    emailHtml = emailHtml.replace(
      /{{ProfileImage}}/g,
      user_profile?.$files?.url || "image"
    );
    emailHtml = emailHtml.replace(/{{lastMonthName}}/g, lastMonthName);
    emailHtml = emailHtml.replace(/{{kudosCount}}/g, kudosCount.toString());
    emailHtml = emailHtml.replace(/{{position}}/g, position);
    emailHtml = emailHtml.replace(
      /{{sampleKudoText}}/g,
      "Really appreciate your help — couldn’t have done it without you!"
    );
    emailHtml = emailHtml.replace("{{userId}}", id);

    const emailParams = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: `🏆 You Ranked ${position}! Top Kudo Receiver of ${lastMonthName}!`,
      html: emailHtml,
    };

    await transporter.sendMail(emailParams);

    return { success: true, emailTemplate };
  } catch (error: any) {
    console.error(
      `Failed to send top kudo receiver email to ${activeUser?.email}:`,
      error
    );
    Sentry.captureException(error);
    return {
      success: false,
      emailTemplate,
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
    };
  }
}

// Email sending function for users who haven't sent kudos in the last week
export async function emailNoKudoSentLastWeekReminder(
  inactiveUser: any,
  title: string
) {
  const emailTemplate = "noKudoSentLastWeek.html";
  const returnValue = {
    identifier: emailTemplate,
    status: "pending",
    error: "",
  };
  const { email, id, user_profile } = inactiveUser;
  try {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "app",
      "emailTemplates",
      emailTemplate
    );
    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();

    const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
    emailHtml = emailHtml.replace("{{brandLogoURL}}", brandLogo);

    emailHtml = emailHtml.replace(
      /{{UserName}}/g,
      user_profile?.name || "CheerChampion User"
    );
    emailHtml = emailHtml.replace("{{userId}}", id);

    const emailParams = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: title,
      html: emailHtml,
    };

    const sentEmail = await transporter.sendMail(emailParams);
    returnValue.status = sentEmail.accepted?.length ? "success" : "failed";
  } catch (error: any) {
    console.error(
      `Failed to send no kudo sent last week email reminder to ${email}:`,
      error
    );
    Sentry.captureException(error);
    returnValue.error =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to send no kudo sent last week email reminder";
    returnValue.status = "failed";
  } finally {
    return returnValue;
  }
}

// Email sending function for monthly user report
export async function emailMonthlyUserReport(
  user: any,
  userLikesCount: number,
  lastMonthName: string,
  sentKudosCount: number,
  receivedKudosCount: number,
  totalKudosCount: number,
  lastSendAt: any,
  kudosGoal: number,
  goalPercentage: string
) {
  const emailTemplate = "monthlyUserReport.html";
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );

  try {
    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();

    const brandLogo = "https://cheer-champion.vercel.app/brandLightLogo.png";
    const { email, id, user_profile } = user;

    // Format dates safely
    const formattedLastSendAt =
      lastSendAt && lastSendAt !== "N/A"
        ? moment(lastSendAt, "YYYY-MM-DD").format("MMMM D, YYYY")
        : "N/A";

    const formattedCreatedDate = user_profile?.created_at
      ? moment(user_profile.created_at, "YYYY-MM-DD").format("MMMM D, YYYY")
      : "N/A";

    // Replace template variables
    const replacements = {
      "{{brandLogoURL}}": brandLogo,
      "{{UserName}}": user_profile?.name || "User",
      "{{Email}}": email || "email",
      "{{PhoneNumber}}": user_profile?.mobile1 || "",
      "{{phoneNumbercode}}": user_profile?.mobile1_country_code || "-",
      "{{createdDate}}": formattedCreatedDate,
      "{{ProfileImage}}":
        user_profile?.$files?.url ||
        "https://via.placeholder.com/70x70?text=User",
      "{{lastMonthName}}": lastMonthName,
      "{{sentKudosCount}}": sentKudosCount.toString(),
      "{{receivedKudosCount}}": receivedKudosCount.toString(),
      "{{LikesCount}}": userLikesCount.toString(),
      "{{totalKudosCount}}": totalKudosCount.toString(),
      "{{lastSendAt}}": formattedLastSendAt,
      "{{kudosent}}": sentKudosCount.toString(),
      "{{kudosGoal}}": kudosGoal.toString(),
      "{{goalPercentage}}": goalPercentage,
      "{{kudosSent}}": sentKudosCount.toString(),
      "{{userId}}": id,
    };

    // Apply all replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      emailHtml = emailHtml.replace(
        new RegExp(placeholder.replace(/[{}]/g, "\\$&"), "g"),
        value
      );
    });

    const emailParams = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: `Your ${lastMonthName} Cheer Champion Recap 🎉`,
      html: emailHtml,
    };

    await transporter.sendMail(emailParams);

    return { success: true, emailTemplate };
  } catch (error: any) {
    console.error(
      `Failed to send monthly user report email to ${user?.email}:`,
      error
    );
    Sentry.captureException(error);
    return {
      success: false,
      emailTemplate,
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
    };
  }
}

export async function sendAnnouncementEmail(
  title: string,
  message: string,
  imageUrl: string | undefined,
  receiver: any,
  userId: any
) {
  const emailTemplate = "announcement.html";
  const templatePath = path.join(
    process.cwd(),
    "src",
    "app",
    "emailTemplates",
    emailTemplate
  );

  try {
    let emailHtml = fs.readFileSync(templatePath, "utf8").toString();
    const baseURL = "https://cheer-champion.vercel.app";
    const defaultImage = `${baseURL}/OpenGraph.png`;
    const brandLogo = `${baseURL}/brandLightLogo.png`;

    // Replace common template variables
    emailHtml = emailHtml.replace(/{{title}}/g, title);
    emailHtml = emailHtml.replace(/{{message}}/g, message);
    emailHtml = emailHtml.replace(/{{imageUrl}}/g, imageUrl || defaultImage);
    emailHtml = emailHtml.replace(/{{brandLogoURL}}/g, brandLogo);
    emailHtml = emailHtml.replace(/{{baseURL}}/g, baseURL);
    emailHtml = emailHtml.replace("{{userId}}", userId);

    const { email, name } = receiver;

    // Replace user-specific template variables
    const userEmailHtml = emailHtml.replace(
      /{{userName}}/g,
      name || "CheerChampion User"
    );

    const emailParams = {
      from: process.env.GMAIL_USER_EMAIL,
      to: email,
      subject: title,
      html: userEmailHtml,
    };

    await transporter.sendMail(emailParams);

    return { success: true, emailTemplate };
  } catch (error: any) {
    console.error(
      `Failed to send announcement email to ${receiver?.email}:`,
      error
    );
    Sentry.captureException(error);
    return {
      success: false,
      emailTemplate,
      error:
        error?.response?.data?.message || error?.message || "Unknown error",
    };
  }
}
