// Maps better-auth error codes to Polish user-facing messages.
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Nieprawidłowy e-mail lub hasło.",
  USER_NOT_FOUND: "Nieprawidłowy e-mail lub hasło.",
  INVALID_PASSWORD: "Nieprawidłowy e-mail lub hasło.",
  USER_ALREADY_EXISTS: "Konto z tym adresem e-mail już istnieje.",
  WEAK_PASSWORD: "Hasło musi mieć co najmniej 8 znaków.",
  INVALID_EMAIL: "Podaj poprawny adres e-mail.",
  FAILED_TO_CREATE_USER: "Nie udało się utworzyć konta. Spróbuj ponownie.",
};

export function authErrorMessage(code: string | null | undefined): string {
  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Coś poszło nie tak. Spróbuj ponownie.";
}
