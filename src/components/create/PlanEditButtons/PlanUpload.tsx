import React, { useRef } from "react";

import { Button } from "@mui/material";

import { ImgCroppie, ImgCroppieRef } from "src/components/ImgCroppie";
import { useTranslation } from "src/i18n/useTranslation";

interface PlanUploadProps {
  imageUrl: string;
  handleClearInput(): void;
  handleSubmit(img: Blob): Promise<void>;
}

export const PlanUpload: React.FunctionComponent<PlanUploadProps> = ({ imageUrl, handleClearInput = () => {}, handleSubmit = async () => {} }: PlanUploadProps) => {
  const { t } = useTranslation();
  const croppieRef = useRef<ImgCroppieRef | null>(null);

  const submit = async () => {
    if (croppieRef.current) {
      await handleSubmit(await croppieRef.current.getBlob());
    }
  };

  return (
    <div className="text-center">
      <div className="plan-img plan-croppie-container">
        <div>
          <ImgCroppie src={imageUrl} alt="Plan image" ref={croppieRef} />
        </div>
      </div>
      <div className="plan-img-buttons">
        <Button variant="outlined" color="secondary" style={{ width: "48%", marginRight: "4%" }} onClick={handleClearInput}>
          {t("cancel")}
        </Button>
        <Button variant="contained" color="secondary" style={{ width: "48%" }} onClick={submit}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
};
