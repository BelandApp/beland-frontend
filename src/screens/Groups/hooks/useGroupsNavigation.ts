
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";


export const useGroupsNavigation = () => {
  const { navigate, goBack } = useCustomNavigation()

  const navigateToCreateGroup = () => {
    navigate("Groups",{screen:"CreateGroup"});
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
