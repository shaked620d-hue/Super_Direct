// Builds an exact, case-insensitive email matcher that also tolerates legacy surrounding spaces.
export const createEmailPattern = (email) => {
    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`^\\s*${escapedEmail}\\s*$`, 'i');
};
