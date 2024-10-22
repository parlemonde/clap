import { useLocalStorage } from './useLocalStorage';

export const useCurrentProject = () => {
    return useLocalStorage('project');

    // TODO: get project from API
};
