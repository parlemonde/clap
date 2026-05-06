import type { AbstractIntlMessages } from 'next-intl';

// Type declaration for dynamically generated message files
declare module '*/messages/fr.json' {
    const messages: AbstractIntlMessages;
    export default messages;
}
