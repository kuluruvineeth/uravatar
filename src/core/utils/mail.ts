export type EmailProvider = {
  name: string;
  url: string;
  hosts: string[];
};

export const providers: EmailProvider[] = [
  {
    name: "Gmail",
    url: "https://mail.google.com",
    hosts: ["gmail.com", "googlemail.com"],
  },
];

export function getEmailProvider(email: string): EmailProvider {
  const [, host] = email.split("@");

  return (
    providers.find((provider) => provider.hosts.includes(host)) ?? {
      name: "",
      url: "",
      hosts: [],
    }
  );
}
