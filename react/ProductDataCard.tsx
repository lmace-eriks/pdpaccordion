import React, { useEffect, useRef, useState, useMemo, memo, ReactChildren } from "react";
import { Link, canUseDOM } from "vtex.render-runtime";

// Styles
import styles from "./styles.css";

// Types
import { ProductDataCardProps, DataPoints, PointObject, MoreInfoObject } from "./typesdata";

const removeSpaces = (value: string) => value.split(" ").join("-").toLowerCase();
const addSpaces = (value: string) => value.split("-").join(" - ");
const flexRating = (value: string) => {
  const rating = Number(value);
  if (rating < 3) return "Soft";
  if (rating >= 4 && rating <= 7) return "Medium";
  if (rating >= 8) return "Firm";
  return ""; // All paths must return a value. - LM
}

const ProductDataCard: StorefrontFunctionComponent<ProductDataCardProps> = ({ validSpecs }) => {
  const modal = useRef<HTMLDialogElement>(null);
  const [moreInfo, setMoreInfo] = useState<MoreInfoObject>({});

  const openModalClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = e.target as HTMLButtonElement;
    const spec: keyof DataPoints = target.dataset.spec as keyof DataPoints;

    const title = validSpecs[spec]?.label;
    const text = validSpecs[spec]?.info?.text;
    const image = validSpecs[spec]?.info?.image;
    setMoreInfo({ title, text, image });
    modal.current?.showModal();
  }

  const closeModalClick = () => {
    setMoreInfo({ title: "", text: "", image: "" });
    modal.current?.close();
  }

  const ValueElement = ({ spec, label }: { spec: keyof DataPoints, label: string }) => (
    <div className={styles.value}>
      {label === "Best Use" && // All Style
        <div className={styles.valueText}>
          <div className={styles.valueText}>
            {validSpecs[spec]?.value}
          </div>
          <img src={`/arquivos/pdc-sb-${removeSpaces(validSpecs[spec]?.value)}.png`} className={styles.valueImage} />
        </div>
      }
      {label === "Flex" &&
        <div className={styles.valueText}>
          <div className={styles.valueText}>
            {`${validSpecs[spec]?.value} out of 10 - ${flexRating(validSpecs[spec]?.value)}`}
          </div>
          <img src={`/arquivos/pdc-flex-${validSpecs[spec]?.value}.png`} className={styles.valueImage} />
        </div>
      }
      {label === "Profile" &&
        <div className={styles.valueText}>
          <div className={styles.valueText}>
            {validSpecs[spec]?.value}
          </div>
          <img src={`/arquivos/pdc-sb-profile-${validSpecs[spec]?.value}.png`} className={styles.valueImage} />
        </div>
      }
      {label === "Rider Level" &&
        <div className={styles.valueStack}>
          <div className={styles.valueText}>
            {addSpaces(validSpecs[spec]?.value)}
          </div>
          <img src={`/arquivos/pdc-${(validSpecs[spec]?.value).toLowerCase()}.png`} className={styles.valueImage} />
        </div>
      }
      {/* String Only Outputs */
        (label === "Base Tech" ||
          label === "Base Type" ||
          label === "Core" ||
          label === "Mounting" ||
          label === "Stance" ||
          label === "Shape" ||
          label === "Gender") &&
        <div className={styles.valueText}>{validSpecs[spec]?.value}</div>
      }
    </div>
  )

  return (
    <div className={styles.container}>
      {Object.keys(validSpecs).map((spec: string, index: number) => (
        <div key={`${spec}-${index}`} className={styles.detailsRow}>
          <div className={styles.spec}>{validSpecs[spec as keyof DataPoints]?.label}:</div>
          <ValueElement spec={spec as keyof DataPoints} label={validSpecs[spec as keyof DataPoints]?.label!} />
          <button onClick={openModalClick} data-spec={spec} aria-label={`Learn more about ${spec}`} className={styles.learnMore}>Learn More <span className={styles.questionMark}>?</span></button>
        </div>
      ))}
      <dialog ref={modal} className={styles.dialog}>
        {moreInfo.title && <div className={styles.dialogTitle}>{moreInfo.title}</div>}
        {moreInfo.text && <div className={styles.dialogText}>{moreInfo.text}</div>}
        {moreInfo.image && <img src={moreInfo.image} className={styles.dialogImage} />}
        <button onClick={closeModalClick} className={styles.dialogButton}>Close</button>
      </dialog>
    </div>
  );
};

ProductDataCard.schema = {
  title: "ProductDataCard",
  description: "",
  type: "object",
  properties: {

  }
};

export default ProductDataCard;
