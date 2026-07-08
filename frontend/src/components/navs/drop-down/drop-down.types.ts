import type { DropdownMenu } from "@/components/ui";

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export type DropDown = React.ComponentProps<typeof DropdownMenu> & {
  user: User;
};
