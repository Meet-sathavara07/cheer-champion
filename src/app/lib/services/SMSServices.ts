// import "server-only";
// import twilio from "twilio";
// const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// export async function createMessage(phoneNumber: string,code:string,countryCode:string) {
//   try {
//     const message = await client.messages.create({
//       body: `You asked to join cheer_champion. To complete your registration, use this verification code: ${code}`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: `+${countryCode}${phoneNumber}`,
//     });
//     // console.error(message,"EEEEEEEEEEEEEEEEEEEEEEEEEE");
//     return message.body
//   } catch(error:any) {
//     console.error(JSON.stringify(error, null, 2),"")
//     throw new Error(`Failed to send OTP to +${countryCode}${phoneNumber}: ${error.message}`);
//   }
// }

// export async function sendKudoSMS(receivers: any[], sender: string, kudoLink:string) {
//   const messages = [];
  
//   for (const receiver of receivers) {
//     const { mobile1,mobile1_country_code, mobile2,mobile2_country_code, mobile3,mobile3_country_code} = receiver;
  
//     // Collect valid numbers
//     const numbers = [{number:mobile1,code:mobile1_country_code}, {number:mobile2,code:mobile2_country_code},{number:mobile3,code:mobile3_country_code}].filter(mobile => mobile.code && mobile.number);
    
//     for (const mobile of numbers) {
//       try {
//         const message = await client.messages.create({
//           body: `🎉 You have received a Kudo from ${sender}! Keep up the great work! 🚀 \n check out here ${kudoLink}`,
//           from: process.env.TWILIO_PHONE_NUMBER,
//           to: `+${mobile.code}${mobile.number}`,
//         });
//         console.log(`Message sent to ${mobile.number}: ${message.sid}`);
//         messages.push(message);
//       } catch (error) {
//         console.error(`Failed to send message to ${mobile.number}:`, error);
//         throw error;
//       }
//     }
//   }

//   return messages;
// }
