// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  // We inferred 2 attributes!
  // Take a look at this schema, and if everything looks good,
  // run `push schema` again to enforce the types.
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    kudo_comments: i.entity({
      comment: i.string().optional(),
    }),
    kudo_likes: i.entity({
      created_at: i.date().indexed().optional(),
    }),
    kudo_receiver: i.entity({
      token: i.string().unique().optional(),
      kudos: i.string(),
    }),
    kudos: i.entity({
      created_at: i.date().indexed().optional(),
      file_url: i.string().optional(),
      kudo: i.string().optional(),
    }),
    master_moods: i.entity({
      mood: i.string().optional(),
    }),
    notification_channels: i.entity({
      channel: i.string(),
      error: i.string().optional(),
      identifier: i.string().optional(),
      message: i.string().optional(),
      status: i.string().indexed(),
      title: i.string().optional(),
    }),
    notifications: i.entity({
      action_by: i.string().optional(),
      created_at: i.date().indexed(),
      entity_id: i.string().indexed().optional(),
      entity_type: i.string().indexed().optional(),
      frequency: i.string().indexed().optional(),
      is_read: i.boolean().indexed().optional(),
      message: i.string().indexed(),
      name: i.string().indexed().optional(),
      read_at: i.date().indexed().optional(),
      title: i.string().indexed(),
      type: i.string().indexed(),
      user_id: i.string().indexed(),
    }),
    otps: i.entity({
      blocked_until: i.date().optional(),
      country_code: i.string().indexed().optional(),
      created_at: i.date().indexed().optional(),
      email: i.string().indexed().optional(),
      expired_at: i.date().optional(),
      mobile: i.string().indexed().optional(),
      otp: i.string().optional(),
      otp_attempted: i.number().optional(),
      otp_resend: i.date().optional(),
      otp_type: i.string().indexed().optional(),
    }),
    pages: i.entity({
      content: i.string(),
      title: i.string().unique().indexed(),
    }),
    user_profile: i.entity({
      bio: i.string().optional(),
      consent_message_taken: i.string().indexed().optional(),
      consent_message_taken_at: i.date().indexed().optional(),
      country_code: i.string().indexed().optional(),
      created_at: i.date().indexed().optional(),
      email2: i.string().unique().indexed().optional(),
      email3: i.string().unique().indexed().optional(),
      last_activity_at: i.date().indexed().optional(),
      last_login_at: i.date().optional(),
      last_login_ip: i.string().optional(),
      last_receive_at: i.date().indexed().optional(),
      last_reminder_send_at: i.date().indexed().optional(),
      last_send_at: i.date().indexed().optional(),
      logins: i.number().indexed().optional(),
      mobile1: i.string().indexed().optional(),
      mobile1_country_code: i.string().indexed().optional(),
      mobile1_country_iso2: i.string().indexed().optional(),
      mobile2: i.string().indexed().optional(),
      mobile2_country_code: i.string().indexed().optional(),
      mobile3: i.string().indexed().optional(),
      mobile3_country_code: i.string().indexed().optional(),
      name: i.string().indexed().optional(),
      photo_url: i.string().optional(),
      push_token: i.string().indexed().optional(),
      role: i.string().indexed().optional(),
      slug: i.string().unique().indexed().optional(),
      timezone: i.string().indexed().optional(),
      updated_at: i.date().optional(),
      web_push_token: i.string().indexed().optional(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
    kudo_comments$users: {
      forward: {
        on: "kudo_comments",
        has: "one",
        label: "$users",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "kudo_comments",
      },
    },
    kudo_commentsKudos: {
      forward: {
        on: "kudo_comments",
        has: "one",
        label: "kudos",
      },
      reverse: {
        on: "kudos",
        has: "many",
        label: "kudo_comments",
      },
    },
    kudo_likes$users: {
      forward: {
        on: "kudo_likes",
        has: "one",
        label: "$users",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "kudo_likes",
      },
    },
    kudo_likesKudos: {
      forward: {
        on: "kudo_likes",
        has: "one",
        label: "kudos",
      },
      reverse: {
        on: "kudos",
        has: "many",
        label: "kudo_likes",
      },
    },
    kudo_receiver$users: {
      forward: {
        on: "kudo_receiver",
        has: "many",
        label: "$users",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "kudo_receiver",
      },
    },
    kudo_receiverKudos: {
      forward: {
        on: "kudo_receiver",
        has: "one",
        label: "kudos",
        onDelete: "cascade",
      },
      reverse: {
        on: "kudos",
        has: "many",
        label: "kudo_receiver",
      },
    },
    kudos$users: {
      forward: {
        on: "kudos",
        has: "many",
        label: "$users",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "kudos",
      },
    },
    notifications$users: {
      forward: {
        on: "notifications",
        has: "one",
        label: "$users",
        required: true,
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "notifications",
      },
    },
    notificationsKudos: {
      forward: {
        on: "notifications",
        has: "one",
        label: "kudos",
        onDelete: "cascade",
      },
      reverse: {
        on: "kudos",
        has: "many",
        label: "notifications",
      },
    },
    notificationsNotification_channels: {
      forward: {
        on: "notifications",
        has: "many",
        label: "notification_channels",
      },
      reverse: {
        on: "notification_channels",
        has: "one",
        label: "notifications",
        onDelete: "cascade",
      },
    },
    user_profile$files: {
      forward: {
        on: "user_profile",
        has: "one",
        label: "$files",
      },
      reverse: {
        on: "$files",
        has: "many",
        label: "user_profile",
      },
    },
    user_profile$users: {
      forward: {
        on: "user_profile",
        has: "one",
        label: "$users",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "user_profile",
      },
    },
    user_profileMood: {
      forward: {
        on: "user_profile",
        has: "one",
        label: "mood",
      },
      reverse: {
        on: "master_moods",
        has: "many",
        label: "user_profile",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
