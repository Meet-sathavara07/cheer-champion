// instant.schema.ts
// import { i } from '@instantdb/admin';

// const _schema = i.schema({
//   entities: {
//     $users: i.entity({
//       email: i.any().unique().indexed(),
//     }),
//     user_profile: i.entity({
//       $users: i.string().unique().indexed(),
//       email2: i.string().unique().indexed(),
//       email3: i.string().unique().indexed(),
//       mobile1: i.string().unique().indexed(),
//       mobile2: i.string().unique().indexed(),
//       mobile3: i.string().unique().indexed(),
//       name: i.string().indexed(),
//       photo_url: i.string(),
//       created_at:i.date(),
//       last_login_at:i.date(),
//       updated_at:i.date(),
//       country_code:i.string(),
//       last_login_ip:i.string(),
//       logins:i.number(),
//     }),
//     otps: i.entity({
//       created_at: i.string().indexed(),
//       email: i.string().indexed(),
//       expired_at: i.date(),
//       mobile: i.string().indexed(),
//       otp: i.string(),
//       otp_attempted: i.number(),
//       otp_resend: i.date(),
//       otp_type: i.string().indexed(),
//     }),
//     kudos: i.entity({
//       kudo: i.string(),
//       created_at: i.string(),
//     }),
//     // user_email: i.entity({
//     //   email: i.string().unique().indexed(),
//     //   id: i.string().unique(),
//     // }),
//     // user_mobile: i.entity({
//     //   mobile: i.string().unique().indexed(),
//     //   id: i.string().unique(),
//     // }),
//     // posts: i.entity({
//     //   text: i.string(),
//     //   userId: i.string(),
//     //   completed: i.boolean(),
//     // }),
//   },
//   links: {
//     // user_email: {
//     //   forward: { on: 'user_email', has: 'many', label: 'user' },
//     //   reverse: { on: '$users', has: 'one', label: 'user_email' },
//     // },
//     // user_mobile: {
//     //   forward: { on: 'user_mobile', has: 'many', label: 'user' },
//     //   reverse: { on: '$users', has: 'one', label: 'user_mobile' },
//     // },
//     user_profile: {
//       forward: { on: 'user_profile', has: 'one', label: '$users' },
//       reverse: { on: '$users', has: 'one', label: 'user_profile' },
//     },
//     kudos: {
//       forward: { on: 'kudos', has: 'one', label: '$users' },
//       reverse: { on: '$users', has: 'one', label: 'kudos' },
//     },
//     // otps: {
//     //   forward: { on: 'otps', has: 'one', label: 'user' },
//     //   reverse: { on: '$users', has: 'one', label: 'otps' },
//     // },
//   },
// });

// // This helps Typescript display nicer intellisense
// type _AppSchema = typeof _schema;
// interface AppSchema extends _AppSchema {}
// const schema: AppSchema = _schema;

// export type { AppSchema };
// export default schema;