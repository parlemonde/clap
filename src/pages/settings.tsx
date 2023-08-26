import React from 'react';

import { useLanguages } from 'src/api/languages/languages.list';
import { Field } from 'src/components/layout/Form';
import { Select } from 'src/components/layout/Form/Select';
import { Title } from 'src/components/layout/Typography';
import { useTranslation } from 'src/i18n/useTranslation';
import { setCookie } from 'src/utils/cookies';

const Settings: React.FunctionComponent = () => {
    const { t, currentLocale } = useTranslation();

    const [currentLanguage, setCurrentLanguage] = React.useState<string | null>(null);
    const { languages } = useLanguages();

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setCurrentLanguage(event.target.value);
        setCookie('app-language', event.target.value, {
            'max-age': 24 * 60 * 60,
        });
        window.location.reload();
    };

    return (
        <div className="text-center">
            <form className="login-form" noValidate autoComplete="off" style={{ margin: '1rem 0' }}>
                <Title color="primary" variant="h1" marginBottom="xl" style={{ width: '100%', textAlign: 'left' }}>
                    {t('settings')}
                </Title>
                {languages.length > 0 && (
                    <>
                        <Title color="inherit" variant="h2" marginTop="sm" marginBottom="md" style={{ width: '100%', textAlign: 'left' }}>
                            {t('change_language')}
                        </Title>
                        <Field
                            name="language"
                            label={t('language')}
                            input={
                                <Select marginTop="xs" isFullWidth value={currentLanguage || currentLocale} onChange={handleLanguageChange}>
                                    {languages.map((l) => (
                                        <option value={l.value} key={l.value}>
                                            {l.label}
                                        </option>
                                    ))}
                                </Select>
                            }
                        />
                    </>
                )}
            </form>
        </div>
    );
};

export default Settings;
