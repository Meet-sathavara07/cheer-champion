export const generateAIShareKudoContent = (senderName:string,receiverNames:string,kudoMessage:string ,selectedLangauge:any) => `
    Generate a social media post to celebrate a received Kudo on Cheer Champion. The post should include:
 
A short, catchy headline or emoji-based intro to set the tone (e.g., “🌟 Grateful Moment 🌟” or “💫 Feeling Appreciated 💫”).
 
A personalized message that:
 
Mentions the sender’s name (e.g., “from ${senderName}”).
 
Expresses gratitude and how the message made the receiver feel.
 
Briefly includes a truncated preview of the Kudo message (maximum 100 characters, with ... if needed).
 
Emphasizes the value of appreciation and positive culture.
 
Include this phrase:
 
“🧡 Shared via Cheer Champion — a platform that inspires everyday appreciation.”
 
 
A meaningful set of 5–7 hashtags, chosen from this list:
 
#Gratitude
 
#Kudos
 
#CheerChampion
 
#AppreciationCulture
 
#PositiveWorkplace
 
#RecognitionMatters
 
#SpreadPositivity
 
#Thankful
 
#WorkCulture
 
#Teamwork
 
#Encouragement
 
The tone should be warm, appreciative, and friendly for social media.
 
Inputs:
 
Sender Name: ${senderName}
 
Receiver Name: ${receiverNames}
 
Kudo Message: ${kudoMessage}
 
 
Output:
One complete, ready-to-share social media post in message is more humanize and realistic in ${selectedLangauge.label} language.
Make sure the Kudo message preview is no more than 150 characters followed by ... if truncated
`
 

export const generateAIShareProfileContent = (profileName: string, profileBio: string, selectedLanguage: any) => `
    Generate a social media post to celebrate a user's profile on Cheer Champion. The post should include:

    A short, catchy headline or emoji-based intro to set the tone (e.g., “🌟 Meet an Inspiring Champion 🌟” or “💫 Sharing My Journey 💫”).

    A personalized message that:
    - Mentions the user’s name (e.g., “Check out ${profileName}’s profile!”).
    - Highlights a brief snippet of their bio (maximum 100 characters, with ... if needed).
    - Encourages others to visit the profile to learn more about their contributions or story.
    - Emphasizes the value of inspiration and community connection.

    Include this phrase:
    “🧡 Shared via Cheer Champion — a platform that celebrates everyday inspiration.”

    A meaningful set of 5–7 hashtags, chosen from this list:
    #Inspiration
    #CheerChampion
    #ProfileSpotlight
    #CommunityHeroes
    #PositiveVibes
    #ShareYourStory
    #MotivationMatters
    #TeamSpirit
    #Encouragement
    #BeInspired

    The tone should be warm, inspiring, and friendly for social media.

    Inputs:
    Profile Name: ${profileName}
    Profile Bio: ${profileBio}

    Output:
    One complete, ready-to-share social media post in a humanized and realistic tone in ${selectedLanguage.label} language.
    Ensure the bio preview is no more than 100 characters followed by ... if truncated.
`;