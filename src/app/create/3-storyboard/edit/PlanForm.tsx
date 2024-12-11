import { ImageIcon, LightningBoltIcon } from '@radix-ui/react-icons';
import React from 'react';

import { Flex, FlexItem } from 'src/components/layout/Flex';
import { Field, Form, TextArea } from 'src/components/layout/Form';
import { Title } from 'src/components/layout/Typography';
import { NextButton } from 'src/components/navigation/NextButton';
import { useTranslation } from 'src/contexts/translationContext';
import type { Plan } from 'src/hooks/useLocalStorage/local-storage';

interface PlanFormProps {
    plan: Plan;
    setPlan: (plan: Plan) => void;
    onSubmit: () => void;
}

export const PlanForm = ({ plan, setPlan, onSubmit }: PlanFormProps) => {
    const { t } = useTranslation();

    return (
        <Form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit();
            }}
        >
            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start">
                <div className={`pill ${plan.description ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <LightningBoltIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2" style={{ margin: '1rem 0' }}>
                        {t('part3_plan_desc')}
                    </Title>
                </FlexItem>
            </Flex>
            <Field
                name="plan_description"
                input={
                    <TextArea
                        value={plan.description}
                        onChange={(event) => {
                            setPlan({ ...plan, description: event.target.value.slice(0, 2000) });
                        }}
                        placeholder={t('part3_plan_desc_placeholder')}
                        isFullWidth
                        rows={7}
                        color="secondary"
                        autoComplete="off"
                    />
                }
                helperText={`${plan.description.length}/2000`}
            ></Field>

            <Flex isFullWidth flexDirection="row" alignItems="center" justifyContent="flex-start" style={{ margin: '1rem 0 0 0' }}>
                <div className={`pill ${plan.imageUrl ? 'pill--green' : ''}`} style={{ marginRight: '10px' }}>
                    <ImageIcon />
                </div>
                <FlexItem flexGrow={1} flexBasis={0}>
                    <Title color="inherit" variant="h2">
                        {t('part3_plan_image')}
                    </Title>
                </FlexItem>
            </Flex>
            <Title color="inherit" variant="h3" className="for-tablet-up-only">
                {t('part3_plan_edit_title_desktop')}
            </Title>
            <Title color="inherit" variant="h3" className="for-mobile-only">
                {t('part3_plan_edit_title_mobile')}
            </Title>

            <NextButton label={t('continue')} backHref="/create/3-storyboard" type="submit" />
        </Form>
    );
};
