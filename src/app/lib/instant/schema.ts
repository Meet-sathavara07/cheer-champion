// instant.schema.ts
"use client";
import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.any().unique().indexed(),
    }),
    user_profile: i.entity({
      $users: i.string().unique().indexed(),
      email2: i.string().unique().indexed(),
      email3: i.string().unique().indexed(),
      mobile1: i.string().unique().indexed(),
      mobile2: i.string().unique().indexed(),
      mobile3: i.string().unique().indexed(),
      name: i.string().indexed(),
      photo_url: i.string(),
      created_at:i.date(),
      last_login_at:i.date(),
      updated_at:i.date(),
      country_code:i.string(),
      last_login_ip:i.string(),
      logins:i.number(),
    }),
    kudos: i.entity({
      kudo: i.string(),
      created_at: i.string(),
    }),
    kudo_receiver: i.entity({
      kudos: i.string(),
      $users: i.string().unique().indexed(),
    }),
  },
  links: {
    kudos: {
      forward: { on: 'kudos', has: 'many', label: '$users' },
      reverse: { on: '$users', has: 'one', label: 'kudos' },
    },
    kudo_receiver: {
      forward: { on: 'kudo_receiver', has: 'many', label: '$users' },
      reverse: { on: '$users', has: 'one', label: 'kudo_receiver' },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;