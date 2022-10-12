import React from 'react';

import { UserServiceContext } from 'src/services/UserService';
import type { Sound } from 'types/models/sound.type';

export const useSoundRequests = (): {
    editSound(sound: Sound): Promise<void>;
} => {
    const { axiosLoggedRequest } = React.useContext(UserServiceContext);

    const editSound = React.useCallback(
        async (sound: Sound) => {
            if (!sound.id) {
                return;
            }
            await axiosLoggedRequest({
                url: `/sounds/${sound.id}`,
                method: 'PUT',
                data: sound,
            });
        },
        [axiosLoggedRequest],
    );

    return { editSound };
};
