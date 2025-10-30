export const extractNamePrompt = (message:string) => `You are given a Kudo message: "${message}"

Your task:
- Extract the receiver’s name from the message (i.e., the person being thanked, appreciated, or addressed).
- The name should appear after appreciation or greeting words like: "Thanks", "Thank you", "Dear", "Appreciate", "Awesome", "Great job", etc.
- Only extract a proper name if it clearly refers to someone else (the receiver), not the sender.
- Ignore generic words like "dear", "mate", "bro", "buddy", "friend", even if capitalized.
- Return only the first valid name found.
- If no clear receiver name is found, return No name found.

Return format:
- Just the name (e.g., "Raj") or No name found if no name found.
- Do not include any extra text or punctuation.

Examples:
- "Thanks, Raj, for your help!" → Raj  
- "Great job Johnson on completing the task!" → Johnson  
- "Thanks bro!" → No name found 
- "Appreciate the help!" → No name found  
- "Dear Mukesh, you nailed it!" → Mukesh`;