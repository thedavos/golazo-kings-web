export const getInitials = (firstName: string, lastName: string): string => {
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  if (!trimmedFirstName || !trimmedLastName) {
    return '';
  }

  const firstInitial = trimmedFirstName[0];
  const lastInitial = trimmedLastName[0];

  return `${firstInitial}${lastInitial}`.toUpperCase();
};
