export interface AllowedEmail {
  email: string;
  addedBy: string;
  addedAt: Date;
}

export function createAllowedEmail(email: string, addedBy: string): AllowedEmail {
  return {
    email: email.toLowerCase().trim(),
    addedBy,
    addedAt: new Date(),
  };
}
