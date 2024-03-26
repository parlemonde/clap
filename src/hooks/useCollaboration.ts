import { getFromSessionStorage, setToSessionStorage } from 'src/utils/session-storage';

export const useCollaboration = () => {
    const isCollaborationActive = getFromSessionStorage('isCollaborationActive', false);

    const setIsCollaborationActive = (state: boolean) => {
        setToSessionStorage('isCollaborationActive', state);
    };

    return { isCollaborationActive, setIsCollaborationActive };
};
