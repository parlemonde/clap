import type { FunctionComponent } from 'react';

export interface NextFunctionComponent<P> extends FunctionComponent<P> {
    getInitialProps(): Promise<P>;
}
