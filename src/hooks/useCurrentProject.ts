import { useLocalStorage } from './useLocalStorage';

export const useCurrentProject = () => {
    return useLocalStorage('project');
};
