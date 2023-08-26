import { EyeOpenIcon, EyeNoneIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/router';
import React from 'react';

import { useDeleteUserMutation } from 'src/api/users/users.delete';
import type { PUTParams as UpdateUserArgs } from 'src/api/users/users.put';
import { useUpdateUserMutation } from 'src/api/users/users.put';
import { Button } from 'src/components/layout/Button';
import { IconButton } from 'src/components/layout/Button/IconButton';
import { Container } from 'src/components/layout/Container';
import { Divider } from 'src/components/layout/Divider';
import { Flex } from 'src/components/layout/Flex';
import { Field, Input } from 'src/components/layout/Form';
import { Modal } from 'src/components/layout/Modal';
import { Title } from 'src/components/layout/Typography';
import { sendToast } from 'src/components/ui/Toasts';
import { Trans } from 'src/components/ui/Trans';
import { userContext } from 'src/contexts/userContext';
import { useTranslation } from 'src/i18n/useTranslation';
import { httpRequest } from 'src/utils/http-request';
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
    const response = await httpRequest<{ available: boolean }>({
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
            sendToast({ message: t('account_updated'), type: 'success' });
            setUser(newUser);
            setShowModal(-1);
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
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
            sendToast({ message: t('account_deleted'), type: 'success' });
            setShowModal(-1);
        } catch (err) {
            console.error(err);
            sendToast({ message: t('unknown_error'), type: 'error' });
        }
    };

    const logout = async () => {
        await httpRequest({
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
        <Container>
            <div className="text-center">
                <Title color="primary" variant="h1" marginY="md">
                    {t('my_account')}
                </Title>
            </div>
            <div style={{ maxWidth: '800px', margin: 'auto', paddingBottom: '2rem' }}>
                <Title color="inherit" variant="h2">
                    {t('account_connexion_title')}
                </Title>
                <div style={{ marginTop: '0.5rem' }}>
                    <label>
                        <strong>{t('signup_pseudo')} : </strong>
                    </label>
                    {user.pseudo}
                    {user.accountRegistration < 10 && (
                        <>
                            {' '}
                            -{' '}
                            <a
                                tabIndex={0}
                                className="color-primary"
                                onKeyDown={(event) => {
                                    if (event.key === ' ' || event.key === 'Enter') {
                                        openModal(1)();
                                    }
                                }}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={openModal(1)}
                            >
                                {t('account_change_button')}
                            </a>
                        </>
                    )}
                </div>
                <div style={{ marginTop: '4px' }}>
                    <label>
                        <strong>{t('signup_email')} : </strong>
                    </label>
                    {user.email}
                    {user.accountRegistration < 10 && (
                        <>
                            {' '}
                            -{' '}
                            <a
                                tabIndex={0}
                                className="color-primary"
                                onKeyDown={(event) => {
                                    if (event.key === ' ' || event.key === 'Enter') {
                                        openModal(2)();
                                    }
                                }}
                                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={openModal(2)}
                            >
                                {t('account_change_button')}
                            </a>
                        </>
                    )}
                </div>
                {user.accountRegistration < 10 && (
                    <Button
                        label={t('account_password_change')}
                        style={{ marginTop: '0.8rem' }}
                        className="mobile-full-width"
                        onClick={openModal(3)}
                        variant="contained"
                        color="secondary"
                        size="sm"
                        marginTop="md"
                    ></Button>
                )}
                <Divider marginY="lg" />

                <Title color="inherit" variant="h2">
                    {t('logout_button')}
                </Title>
                <Button label={t('logout_button')} variant="outlined" color="error" className="mobile-full-width" onClick={logout} size="sm"></Button>
                <Divider marginY="lg" />
                <Title color="inherit" variant="h2">
                    {t('my_account')}
                </Title>
                <Button
                    label={t('account_delete_button')}
                    style={{ marginTop: '0.8rem' }}
                    className="mobile-full-width"
                    onClick={openModal(5)}
                    variant="contained"
                    color="error"
                    size="sm"
                    marginTop="sm"
                ></Button>

                <Modal
                    isOpen={showModal === 1 && updatedUser !== null}
                    isLoading={isLoading}
                    onClose={() => setShowModal(-1)}
                    onConfirm={onSubmit('pseudo')}
                    confirmLabel={t('edit')}
                    cancelLabel={t('cancel')}
                    title={t('Changer de pseudo')}
                    onOpenAutoFocus={false}
                    isFullWidth
                >
                    <div id="pseudo-dialog-description">
                        <Flex
                            isFullWidth
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            marginBottom="md"
                            paddingX="md"
                            paddingY="sm"
                            style={{
                                backgroundColor: 'rgb(229, 246, 253)',
                                borderRadius: 4,
                                boxSizing: 'border-box',
                                fontSize: '14px',
                                color: 'rgb(1, 67, 97)',
                            }}
                        >
                            <InfoCircledIcon style={{ width: 20, height: 20, marginRight: 8, paddingTop: 1 }} />
                            {t('account_change_pseudo_info')}
                        </Flex>
                        <Field
                            name="pseudo"
                            label={t('signup_pseudo')}
                            input={
                                <Input
                                    id="pseudo"
                                    name="pseudo"
                                    isFullWidth
                                    value={updatedUser?.pseudo || ''}
                                    onChange={onUserChange('pseudo')}
                                    onBlur={handleInputValidations('pseudo')}
                                    color="secondary"
                                    hasError={errors.pseudo || errors.pseudoNotAvailable}
                                />
                            }
                            helperText={
                                (errors.pseudo ? `${t('signup_required')} | ` : errors.pseudoNotAvailable ? `${t('signup_pseudo_error')} |` : '') +
                                t('signup_pseudo_help')
                            }
                            helperTextStyle={{ textAlign: 'left', color: 'inherit' }}
                        ></Field>
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
                    isFullWidth
                    onOpenAutoFocus={false}
                >
                    <div id="email-dialog-description">
                        <Flex
                            isFullWidth
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            marginBottom="md"
                            paddingX="md"
                            paddingY="sm"
                            style={{
                                backgroundColor: 'rgb(229, 246, 253)',
                                borderRadius: 4,
                                boxSizing: 'border-box',
                                fontSize: '14px',
                                color: 'rgb(1, 67, 97)',
                            }}
                        >
                            <InfoCircledIcon style={{ width: 20, height: 20, marginRight: 8, paddingTop: 1 }} />
                            {t('account_change_email_info')}
                        </Flex>
                        <Field
                            name="email"
                            label={t('signup_email')}
                            input={
                                <Input
                                    name="email"
                                    id="email"
                                    isFullWidth
                                    value={updatedUser?.email || ''}
                                    onChange={onUserChange('email')}
                                    onBlur={handleInputValidations('email')}
                                    color="secondary"
                                    hasError={errors.email}
                                />
                            }
                            helperText={errors.email ? t('signup_email_error') : ''}
                            helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
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
                    isFullWidth
                    onOpenAutoFocus={false}
                >
                    <div id="mdp-dialog-description">
                        <Field
                            name="old_password"
                            label={t('account_current_password')}
                            input={
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    color="secondary"
                                    id="old_password"
                                    name="old_password"
                                    value={updatedUser?.oldPassword || ''}
                                    onChange={onUserChange('oldPassword')}
                                    iconAdornment={
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            variant="borderless"
                                            icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                            iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                        ></IconButton>
                                    }
                                    iconAdornmentProps={{ position: 'right' }}
                                    isFullWidth
                                />
                            }
                        />
                        <Divider marginY="lg" />
                        <Field
                            name="new_password"
                            label={t('account_new_password')}
                            input={
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    color="secondary"
                                    id="new_password"
                                    name="new_password"
                                    value={updatedUser?.password || ''}
                                    onChange={onUserChange('password')}
                                    onBlur={handleInputValidations('password')}
                                    iconAdornment={
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            variant="borderless"
                                            icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                            iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                        ></IconButton>
                                    }
                                    iconAdornmentProps={{ position: 'right' }}
                                    isFullWidth
                                    hasError={errors.password}
                                />
                            }
                            helperText={errors.password ? t('signup_password_error') : ''}
                            helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
                        />
                        <Field
                            name="new_password_confirm"
                            label={t('signup_password_confirm')}
                            input={
                                <Input
                                    style={{ marginTop: '1rem' }}
                                    type={showPassword ? 'text' : 'password'}
                                    color="secondary"
                                    id="new_password_confirm"
                                    name="new_password_confirm"
                                    value={updatedUser?.passwordConfirm || ''}
                                    onChange={onUserChange('passwordConfirm')}
                                    onBlur={handleInputValidations('passwordConfirm')}
                                    iconAdornment={
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPassword(!showPassword);
                                            }}
                                            variant="borderless"
                                            icon={showPassword ? EyeNoneIcon : EyeOpenIcon}
                                            iconProps={{ style: { color: 'rgba(0, 0, 0, 0.54)', height: 24, width: 24 } }}
                                        ></IconButton>
                                    }
                                    iconAdornmentProps={{ position: 'right' }}
                                    isFullWidth
                                    hasError={errors.passwordConfirm}
                                />
                            }
                            helperText={errors.passwordConfirm ? t('signup_password_confirm_error') : ''}
                            helperTextStyle={{ textAlign: 'left', color: 'rgb(211, 47, 47)' }}
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
                    isConfirmDisabled={deleteText.toLowerCase() !== t('account_delete_confirm').toLowerCase()}
                    isFullWidth
                >
                    <div id="delete-dialog-description">
                        <Flex
                            isFullWidth
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            marginBottom="md"
                            paddingX="md"
                            paddingY="sm"
                            style={{
                                backgroundColor: 'rgb(253, 237, 237)',
                                borderRadius: 4,
                                boxSizing: 'border-box',
                                fontSize: '14px',
                                color: 'rgb(95, 33, 32)',
                            }}
                        >
                            <InfoCircledIcon style={{ width: 20, height: 20, marginRight: 8, paddingTop: 1 }} />
                            <span>
                                <Trans i18nKey="account_delete_warning1">
                                    Attention! Êtes-vous sur de vouloir supprimer votre compte ? Cette action est <strong>irréversible</strong>.
                                </Trans>
                                <br />
                                <Trans i18nKey="account_delete_warning2" i18nParams={{ deleteConfirm: t('account_delete_confirm') }}>
                                    Pour supprimer votre compte, veuillez taper <strong>supprimer</strong> ci-dessous et cliquez sur supprimer.
                                </Trans>
                            </span>
                        </Flex>
                        <Input
                            isFullWidth
                            value={deleteText}
                            placeholder={t('account_delete_placeholder', { deleteConfirm: t('account_delete_confirm') })}
                            color="secondary"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setDeleteText(event.target.value);
                            }}
                            style={{ marginTop: '0.25rem' }}
                        />
                    </div>
                </Modal>
            </div>
        </Container>
    );
};

export default AccountPage;
