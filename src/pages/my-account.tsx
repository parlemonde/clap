import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React from 'react';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useDeleteUserMutation } from 'src/api/users/users.delete';
import type { PUTParams as UpdateUserArgs } from 'src/api/users/users.put';
import { useUpdateUserMutation } from 'src/api/users/users.put';
import Modal from 'src/components/ui/Modal';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { axiosRequest } from 'src/utils/axiosRequest';
import type { User } from 'types/models/user.type';

type UpdatedUser = Partial<User> & { password?: string; passwordConfirm?: string; oldPassword?: string };

const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/i;
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;
const checks = {
    // eslint-disable-next-line
  email: (value: string, _u: UpdatedUser) => emailRegex.test(value), // eslint-disable-next-line
  pseudo: (value: string, _u: UpdatedUser) => value.length > 0, // eslint-disable-next-line
  password: (value: string, _u: UpdatedUser) => strongPassword.test(value), // eslint-disable-next-line
  passwordConfirm: (value: string, user: UpdatedUser) => value === user.password, // eslint-disable-next-line
  school: (_v: string, _u: UpdatedUser) => true,
};

const isPseudoAvailable = async (userPseudo: string, pseudo: string): Promise<boolean> => {
    if (userPseudo === pseudo) {
        return true;
    }
    const response = await axiosRequest<{ available: boolean }>({
        method: 'GET',
        url: `/users/test-pseudo/${pseudo}`,
    });
    if (response.success) {
        return response.data.available;
    }
    return false;
};

const AccountPage = () => {
    const router = useRouter();
    const { t } = useTranslation();
    const { enqueueSnackbar } = useSnackbar();
    const { user, setUser } = React.useContext(userContext);
    const [updatedUser, setUpdatedUser] = React.useState<UpdatedUser | null>(null);
    const [showPassword, setShowPassword] = React.useState<boolean>(false);
    const [showModal, setShowModal] = React.useState<number>(-1);
    const [errors, setErrors] = React.useState({
        email: false,
        pseudo: false,
        pseudoNotAvailable: false,
        password: false,
        passwordConfirm: false,
    });
    const [deleteText, setDeleteText] = React.useState<string>('');

    const openModal = (n: number) => () => {
        if (user === null) {
            return;
        }
        setUpdatedUser({ ...user, oldPassword: '', password: '', passwordConfirm: '' });
        setDeleteText('');
        setShowModal(n);
    };

    const onUserChange =
        (userKey: 'email' | 'pseudo' | 'password' | 'passwordConfirm' | 'oldPassword') => (event: React.ChangeEvent<HTMLInputElement>) => {
            setUpdatedUser({ ...updatedUser, [userKey]: event?.target?.value || '' });
            setErrors((e) => ({ ...e, [userKey]: false, global: false }));
        };
    const handleInputValidations = (userKey: 'email' | 'pseudo' | 'password' | 'passwordConfirm') => (event: React.FocusEvent<HTMLInputElement>) => {
        if (updatedUser === null) {
            return;
        }
        const value = event.target.value || '';
        setErrors((e) => ({
            ...e,
            [userKey]: value.length !== 0 && !checks[userKey](value, updatedUser),
        }));
        if (userKey === 'pseudo' && value.length !== 0) {
            isPseudoAvailable(user?.pseudo || '', value).then((result: boolean) => {
                setErrors((e) => ({ ...e, pseudoNotAvailable: !result }));
            });
        }
    };

    const upadeUserMutation = useUpdateUserMutation();
    const isLoading = upadeUserMutation.isLoading;
    const onSubmit = (userKey: 'email' | 'pseudo' | 'password') => async () => {
        if (user === null || updatedUser === null) {
            return;
        }

        const value = updatedUser[userKey];
        if (value === undefined || !checks[userKey](value, updatedUser)) {
            setErrors((e) => ({ ...e, [userKey]: true }));
            return;
        }
        if (userKey === 'pseudo' && !(await isPseudoAvailable(user?.pseudo || '', updatedUser.pseudo || ''))) {
            setErrors((e) => ({ ...e, pseudoNotAvailable: true }));
            return;
        }

        const data: UpdateUserArgs = {
            userId: user.id,
        };
        if (userKey === 'password') {
            data.oldPassword = updatedUser.oldPassword;
            data.password = updatedUser.password;
        } else if (userKey === 'email') {
            data.email = updatedUser.email;
        } else if (userKey === 'pseudo') {
            data.pseudo = updatedUser.pseudo;
        }

        try {
            const { user: newUser } = await upadeUserMutation.mutateAsync(data);
            enqueueSnackbar(t('account_updated'), {
                variant: 'success',
            });
            setUser(newUser);
            setShowModal(-1);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    const deleteUserMutation = useDeleteUserMutation();
    const onDeleteAccount = async () => {
        if (user === null) {
            return;
        }
        try {
            await deleteUserMutation.mutateAsync({
                userId: user.id,
            });
            enqueueSnackbar(t('account_deleted'), {
                variant: 'success',
            });
            setShowModal(-1);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(t('unknown_error'), {
                variant: 'error',
            });
        }
    };

    const logout = async () => {
        await axiosRequest({
            method: 'POST',
            url: '/logout',
        });
        setUser(null);
        router.push('/create');
    };

    if (user === null) {
        return null;
    }

    return (
        <div>
            <div className="text-center">
                <Typography color="primary" variant="h1">
                    {t('my_account')}
                </Typography>
            </div>
            <div style={{ maxWidth: '800px', margin: 'auto', paddingBottom: '2rem' }}>
                <Typography variant="h2">{t('account_connexion_title')}</Typography>
                <div style={{ marginTop: '0.5rem' }}>
                    <label>
                        <strong>{t('signup_pseudo')} : </strong>
                    </label>
                    {user.pseudo}
                    {user.accountRegistration < 10 && (
                        <>
                            {' '}
                            -{' '}
                            <Link style={{ cursor: 'pointer' }} onClick={openModal(1)}>
                                {t('account_change_button')}
                            </Link>
                        </>
                    )}
                </div>
                <div>
                    <label>
                        <strong>{t('signup_email')} : </strong>
                    </label>
                    {user.email}
                    {user.accountRegistration < 10 && (
                        <>
                            {' '}
                            -{' '}
                            <Link style={{ cursor: 'pointer' }} onClick={openModal(2)}>
                                {t('account_change_button')}
                            </Link>
                        </>
                    )}
                </div>
                {user.accountRegistration < 10 && (
                    <Button
                        style={{ marginTop: '0.8rem' }}
                        className="mobile-full-width"
                        onClick={openModal(3)}
                        variant="contained"
                        color="secondary"
                        size="small"
                    >
                        {t('account_password_change')}
                    </Button>
                )}
                <Divider style={{ margin: '1rem 0 1.5rem' }} />

                <Typography variant="h2">{t('logout_button')}</Typography>
                <Button
                    sx={{ color: (theme) => theme.palette.error.main, borderColor: (theme) => theme.palette.error.main }}
                    variant="outlined"
                    className="mobile-full-width"
                    onClick={logout}
                    size="small"
                >
                    {t('logout_button')}
                </Button>
                <Divider style={{ margin: '1rem 0 1.5rem' }} />
                <Typography variant="h2">{t('my_account')}</Typography>
                {/* <Button style={{ marginTop: "0.8rem" }} className="mobile-full-width" onClick={() => {}} variant="contained" color="secondary" size="small">
          Télécharger toutes mes données
        </Button> */}
                {/* <br /> */}
                <Button
                    sx={{
                        color: (theme) => theme.palette.error.contrastText,
                        background: (theme) => theme.palette.error.light,
                        '&:hover': {
                            backgroundColor: (theme) => theme.palette.error.dark,
                        },
                    }}
                    style={{ marginTop: '0.8rem' }}
                    className="mobile-full-width"
                    onClick={openModal(5)}
                    variant="contained"
                    color="secondary"
                    size="small"
                >
                    {t('account_delete_button')}
                </Button>

                <Modal
                    isOpen={showModal === 1 && updatedUser !== null}
                    isLoading={isLoading}
                    onClose={() => setShowModal(-1)}
                    onConfirm={onSubmit('pseudo')}
                    confirmLabel={t('edit')}
                    cancelLabel={t('cancel')}
                    title={t('Changer de pseudo')}
                    ariaLabelledBy="pseudo-dialog-title"
                    ariaDescribedBy="pseudo-dialog-description"
                    isFullWidth
                >
                    <div id="pseudo-dialog-description">
                        <Alert severity="info" style={{ marginBottom: '1rem' }}>
                            {t('account_change_pseudo_info')}
                        </Alert>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={updatedUser?.pseudo || ''}
                            label={t('signup_pseudo')}
                            onChange={onUserChange('pseudo')}
                            onBlur={handleInputValidations('pseudo')}
                            color="secondary"
                            error={errors.pseudo || errors.pseudoNotAvailable}
                            helperText={
                                (errors.pseudo ? `${t('signup_required')} | ` : errors.pseudoNotAvailable ? `${t('signup_pseudo_error')} |` : '') +
                                t('signup_pseudo_help')
                            }
                        />
                    </div>
                </Modal>
                <Modal
                    isOpen={showModal === 2 && updatedUser !== null}
                    isLoading={isLoading}
                    onClose={() => setShowModal(-1)}
                    onConfirm={onSubmit('email')}
                    confirmLabel={t('edit')}
                    cancelLabel={t('cancel')}
                    title={t('account_change_email')}
                    ariaLabelledBy="email-dialog-title"
                    ariaDescribedBy="email-dialog-description"
                    isFullWidth
                >
                    <div id="email-dialog-description">
                        <Alert severity="info" style={{ marginBottom: '1rem' }}>
                            {t('account_change_email_info')}
                        </Alert>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={updatedUser?.email || ''}
                            label={t('signup_email')}
                            onChange={onUserChange('email')}
                            onBlur={handleInputValidations('email')}
                            color="secondary"
                            error={errors.email}
                            helperText={errors.email ? t('signup_email_error') : ''}
                        />
                    </div>
                </Modal>
                <Modal
                    isOpen={showModal === 3 && updatedUser !== null}
                    isLoading={isLoading}
                    onClose={() => setShowModal(-1)}
                    onConfirm={onSubmit('password')}
                    confirmLabel={t('edit')}
                    cancelLabel={t('cancel')}
                    title={t('account_change_password')}
                    ariaLabelledBy="mdp-dialog-title"
                    ariaDescribedBy="mdp-dialog-description"
                    isFullWidth
                >
                    <div id="mdp-dialog-description">
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            color="secondary"
                            id="password"
                            name="password"
                            label={t('account_current_password')}
                            value={updatedUser?.oldPassword || ''}
                            onChange={onUserChange('oldPassword')}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                        />
                        <Divider style={{ margin: '1.5rem 0' }} />
                        <TextField
                            type={showPassword ? 'text' : 'password'}
                            color="secondary"
                            id="password"
                            name="password"
                            label={t('account_new_password')}
                            value={updatedUser?.password || ''}
                            onChange={onUserChange('password')}
                            onBlur={handleInputValidations('password')}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                            error={errors.password}
                            helperText={errors.password ? t('signup_password_error') : ''}
                        />
                        <TextField
                            style={{ marginTop: '1rem' }}
                            type={showPassword ? 'text' : 'password'}
                            color="secondary"
                            id="passwordComfirm"
                            name="passwordComfirm"
                            label={t('signup_password_confirm')}
                            value={updatedUser?.passwordConfirm || ''}
                            onChange={onUserChange('passwordConfirm')}
                            onBlur={handleInputValidations('passwordConfirm')}
                            variant="outlined"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            edge="end"
                                        >
                                            {showPassword ? <Visibility /> : <VisibilityOff />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            fullWidth
                            error={errors.passwordConfirm}
                            helperText={errors.passwordConfirm ? t('signup_password_confirm_error') : ''}
                        />
                    </div>
                </Modal>
                <Modal
                    isOpen={showModal === 5 && updatedUser !== null}
                    isLoading={deleteUserMutation.isLoading}
                    onClose={() => setShowModal(-1)}
                    onConfirm={onDeleteAccount}
                    confirmLabel={t('delete')}
                    confirmLevel="error"
                    cancelLabel={t('cancel')}
                    title={t('account_delete_button')}
                    ariaLabelledBy="delete-dialog-title"
                    ariaDescribedBy="delete-dialog-description"
                    isConfirmDisabled={deleteText.toLowerCase() !== t('account_delete_confirm').toLowerCase()}
                    isFullWidth
                >
                    <div id="delete-dialog-description">
                        <Alert severity="error" style={{ marginBottom: '1rem' }}>
                            <Trans i18nKey="account_delete_warning1">
                                Attention! Êtes-vous sur de vouloir supprimer votre compte ? Cette action est <strong>irréversible</strong>.
                            </Trans>
                            <br />
                            <Trans i18nKey="account_delete_warning2" i18nParams={{ deleteConfirm: t('account_delete_confirm') }}>
                                Pour supprimer votre compte, veuillez taper <strong>supprimer</strong> ci-dessous et cliquez sur supprimer.
                            </Trans>
                        </Alert>
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={deleteText}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            placeholder={t('account_delete_placeholder', { deleteConfirm: t('account_delete_confirm') })}
                            label=""
                            color="secondary"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setDeleteText(event.target.value);
                            }}
                            style={{ marginTop: '0.25rem' }}
                        />
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default AccountPage;
