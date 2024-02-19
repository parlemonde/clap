import { Router } from 'express';

import { handleErrors } from '../middlewares/handle-errors';
import { login } from './login';
import { loginStudent } from './loginStudent';
import { logout } from './logout';
import { resetPassword, updatePassword, verifyEmail } from './password';
import { loginWithPlmSSO } from './plmSSO';
import { refreshToken, rejectAccessToken } from './refreshToken';

const authRouter = Router();
authRouter.post('/token', handleErrors(refreshToken));
authRouter.post('/token/reject', handleErrors(rejectAccessToken));
authRouter.post('/login', handleErrors(login));
authRouter.post('/login/student', handleErrors(loginStudent));
authRouter.post('/login/reset-password', handleErrors(resetPassword));
authRouter.post('/login/update-password', handleErrors(updatePassword));
authRouter.post('/login/verify-email', handleErrors(verifyEmail));
authRouter.post('/login-sso-plm', handleErrors(loginWithPlmSSO));
authRouter.post('/logout', handleErrors(logout));

export { authRouter };
