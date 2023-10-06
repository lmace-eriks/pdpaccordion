import React, { useEffect, useRef, useState, ReactChildren } from "react";
import { canUseDOM } from "vtex.render-runtime";

// Styles
import styles from "./styles.css";

interface PDPAccordionProps {
  children: ReactChildren | any
  blockClass: string
}

// Types
import { DataPoints, PointObject } from "./typesdata";

// Data
import { categories } from "./typesdata";

// Components
import ProductDataCard from "./ProductDataCard";

// Class of second tier breadcrumb. Inner Text contains "Bicycles", "Snowboards", ect.
const categoryClass = "vtex-breadcrumb-1-x-arrow--2";

const grabDOM: any = (selector: string) => canUseDOM ? document.querySelector(selector) : null;

const PDPAccordion: StorefrontFunctionComponent<PDPAccordionProps> = ({ children }) => {
  // Refs
  const wrappers = useRef<Array<HTMLDivElement>>([]);

  // State
  const [validSpecs, setValidSpecs] = useState<DataPoints>({});
  const [showDataCard, setShowProductDataCard] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [activeHeight, setActiveHeight] = useState(0);

  // Children Components
  const ProductDescription = () => children[0];
  const EriksExtras = () => children[1];
  const Reviews = () => children[2];
  const RelatedProducts = () => children[3];

  // Run on load
  useEffect(() => determineCategory(), []);

  // Run on navigate
  useEffect(() => {
    if (!canUseDOM) return;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

  const handleMessage = (e: MessageEvent) => {
    const eventName = e.data.eventName;
    if (eventName === "vtex:productView") determineCategory();
  }

  const determineCategory = () => {
    const productCategoryDOM = grabDOM(`.${categoryClass}`);
    if (!productCategoryDOM) return;

    const productCategory = productCategoryDOM.innerText.toLowerCase();

    for (const key in categories) {
      // Only searchForSpecs() if productCategory is in {categories}.
      if (productCategory === key) {
        searchForSpecs(categories[productCategory]);
        break;
      }
    }
  }

  const searchForSpecs = (dataList: DataPoints) => {
    const tempValidSpecs: DataPoints = new Object();
    const dataKeys: Array<string> = Object.keys(dataList);
    const dataAttributes: Array<string> = [];

    // Build [dataAttributes].
    for (const key in dataList) {
      const keyTypeFix: keyof DataPoints = key as keyof DataPoints;
      const dataPoint = dataList[keyTypeFix]!;
      const attribute = dataPoint.attribute!;
      dataAttributes.push(attribute);
    }

    for (let index = 0; index < dataAttributes.length; index++) {
      const attribute: string = dataAttributes[index];

      // Value is in the <td> that follows the specification.
      const val = grabDOM(`[data-specification="${attribute}"] + [data-specification]`) as HTMLElement;
      if (!val) continue;

      const tempKey = dataKeys[index] as keyof DataPoints;

      const tempObject: PointObject = {
        attribute,
        label: dataList[tempKey]?.label!,
        info: dataList[tempKey]?.info,
        value: val.innerText
      }

      tempValidSpecs[tempKey] = tempObject;
    }

    // Only setValidSpecs() if we have found product attributes.
    if (Object.keys(tempValidSpecs).length) {
      setValidSpecs(tempValidSpecs);
      setShowProductDataCard(true);
      activateSection(0);
    } else {
      // Product Details
      activateSection(1);
    }
  }

  const activateSection = (section: number) => {
    if (!!wrappers.current[section]) {
      const dataHeight = Number(wrappers.current[section].offsetHeight);
      setActiveHeight(dataHeight);
      setActiveSection(section);
    }
  }

  const handleTitleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const target = event.currentTarget as HTMLButtonElement;
    const section = target.parentElement!;
    const sectionNumber = Number(section.dataset.pdpSection);

    activateSection(sectionNumber);
  }

  const setRef = (element: HTMLDivElement, wrapper: number) => wrappers.current[wrapper] = element;

  return (
    <section aria-label="Product Information" className={styles.container}>

      {showDataCard &&
        <section aria-labelledby="product-data-card-title" data-pdp-section={0} data-active={activeSection === 0} className={styles.dataSection}>
          <button onClick={handleTitleClick} className={styles.titleButton}>
            <h2 id="product-data-card-title" className={styles.buttonText}>Details</h2>
            <span>+</span>
          </button>
          <div style={{ height: `${activeSection === 0 ? activeHeight : 0}px` }} className={styles.window}>
            <div ref={(element: HTMLDivElement) => setRef(element, 0)} className={styles.wrapper}>
              <ProductDataCard validSpecs={validSpecs} />
            </div>
          </div>
        </section>}

      <section aria-labelledby="description-title" data-pdp-section={1} data-active={activeSection === 1} className={styles.dataSection}>
        <button onClick={handleTitleClick} className={styles.titleButton}>
          <h2 id="description-title" className={styles.buttonText}>Product Description</h2>
          <span>+</span>
        </button>
        <div style={{ height: `${activeSection === 1 ? activeHeight : 0}px` }} className={styles.window}>
          <div ref={(element: HTMLDivElement) => setRef(element, 1)} className={styles.wrapper}>
            <ProductDescription />
          </div>
        </div>
      </section>

      <section aria-labelledby="eriks-extras-title" data-pdp-section={2} data-active={activeSection === 2} className={styles.dataSection}>
        <button onClick={handleTitleClick} className={styles.titleButton}>
          <h2 id="eriks-extras-title" className={styles.buttonText}>Erik's Extras</h2>
          <span>+</span>
        </button>
        <div style={{ height: `${activeSection === 2 ? activeHeight : 0}px` }} className={styles.window}>
          <div ref={(element: HTMLDivElement) => setRef(element, 2)} className={styles.wrapper}>
            <EriksExtras />
          </div>
        </div>
      </section>

      <section aria-labelledby="review-title" data-pdp-section={3} data-active={activeSection === 3} className={styles.dataSection}>
        <button onClick={handleTitleClick} className={styles.titleButton}>
          <h2 id="review-title" className={styles.buttonText}>Reviews and Questions</h2>
          <span>+</span>
        </button>
        <div style={{ height: `${activeSection === 3 ? activeHeight : 0}px` }} className={styles.window}>
          <div ref={(element: HTMLDivElement) => setRef(element, 3)} className={styles.wrapper}>
            <Reviews />
          </div>
        </div>
      </section>

      <section aria-labelledby="similar-items-title" data-pdp-section={4} data-active={activeSection === 4} className={styles.dataSection}>
        <button onClick={handleTitleClick} className={styles.titleButton}>
          <h2 id="similar-items-title" className={styles.buttonText}>Similar Items</h2>
          <span>+</span>
        </button>
        <div style={{ height: `${activeSection === 4 ? activeHeight : 0}px` }} className={styles.window}>
          <div ref={(element: HTMLDivElement) => setRef(element, 4)} className={styles.wrapper}>
            <RelatedProducts />
          </div>
        </div>
      </section>

    </section>
  );
};

PDPAccordion.schema = {
  title: "PDPAccordion",
  description: "",
  type: "object",
  properties: {

  }
};

export default PDPAccordion;

