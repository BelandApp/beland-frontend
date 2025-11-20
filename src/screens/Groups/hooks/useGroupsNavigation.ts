import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { notify } from "src/hooks/notification/notify.external";

export const useGroupsNavigation = () => {
  const { isAuthenticated } = useAuth();
  const { navigate, goBack } = useCustomNavigation();

  const navigateToCreateGroup = () => {
    if (!isAuthenticated) {
      notify.confirm({
        message: "Para crear un grupo debes estar logueado! Te ayudo?",
        onConfirm: () => navigate("Login"),
      });
      return;
    }
    navigate("Groups", { screen: "CreateGroup" });
  };

  // chequear que funcione
  const navigateToGroupManagement = (groupId: string) => {
    navigate("Groups", { screen: "GroupManagement", params: { groupId } });
  };

  return {
    navigateToCreateGroup,
    navigateToGroupManagement,
    goBack,
  };
};
