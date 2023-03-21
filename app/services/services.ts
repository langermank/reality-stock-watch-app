import { getAppDomain } from "./app";
import { UserService } from "../../app-domain/service-layer/users.service";

let userService: UserService | null = null;
export const getUserService = async () => {
  if (userService) return userService;

  const app = await getAppDomain();
  userService = new UserService(app);
  return userService;
};
