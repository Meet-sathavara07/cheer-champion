// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from "@instantdb/react";

const rules = {
  kudos: {
    bind: [
      "isOwner",
      "auth.id != null && auth.id == data.ref('$users.id')",
      "isLoggedIn",
      "auth.id != null",
    ],
    allow: {
      view: "true",
      create: "isLoggedIn",
      delete: "isOwner",
      update: "isOwner",
    },
  },
  $files: {
    bind: [
      "isOwner",
      "auth.id != null && auth.id == data.ref('user_profile.$users.id')",
      "isLoggedIn",
      "auth.id != null",
    ],
    allow: {
      view: "isLoggedIn",
      create: "isLoggedIn",
      delete: "isOwner",
    },
  },
  $users: {
    bind: ["isLoggedIn", "auth.id != null"],
    allow: {
      view: "isLoggedIn",
    },
  },
  user_profile: {
    bind: [
      "isOwner",
      "auth.id != null && auth.id == data.ref('$users.id')",
      "isLoggedIn",
      "auth.id != null",
    ],
    allow: {
      view: "isLoggedIn",
      create: "isLoggedIn",
      delete: "isOwner",
      update: "isOwner",
    },
  },
  notifications: {
    bind: [
      "isRecipient",
      "auth.id != null && auth.id == data.user_id",
      "isAdmin",
      "auth.email in ['meetsathavara10@gmail.com', 'cp@cheerchampion.com','chetanthumar@gmail.com','cploonker@gmail.com','raj.mansuri@quantuminfoway.com']",
    ],
    allow: {
      view: "isRecipient || isAdmin",
      create: "isRecipient || isAdmin",
      delete: "isRecipient || isAdmin",
      update: "isRecipient || isAdmin",
    },
  },
} satisfies InstantRules;

export default rules;
