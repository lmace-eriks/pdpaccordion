import React, { useEffect, useRef, useState, ReactChildren, ReactChild } from "react";
import { canUseDOM } from "vtex.render-runtime";

// Styles
import styles from "./styles.css";

interface PDPAccordionProps {
  children: ReactChildren | any
  sectionTitles: Array<string>
  sectionProps: Array<SectionPropsObject>
  blockClass: string
}

interface SectionPropsObject {
  title: string
  lazyLoaded: boolean
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
export const removeSpaces = (value: string) => value.split(" ").join("-").toLowerCase().replace("'", "");

const PDPAccordion: StorefrontFunctionComponent<PDPAccordionProps> = ({ children, sectionProps }) => {
  // Refs
  const wrappers = useRef<Array<HTMLDivElement>>([]);

  // State
  const [validSpecs, setValidSpecs] = useState<DataPoints>({});
  const [showDataCard, setShowProductDataCard] = useState(false);
  const [activeSection, setActiveSection] = useState(-1);
  const [activeHeight, setActiveHeight] = useState(0);
  const [loadedSections, setLoadedSections] = useState<Array<boolean>>(sectionProps.map(section => !section.lazyLoaded));

  // Run on load
  useEffect(() => determineCategory(), []);

  // Run on navigate
  useEffect(() => {
    if (!canUseDOM) return;
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  });

  // Run on navigate
  const handleMessage = (e: MessageEvent) => {
    const eventName = e.data.eventName;
    if (eventName === "vtex:productView") determineCategory();
  }

  const determineCategory = () => {
    const productCategoryDOM = grabDOM(`.${categoryClass}`);
    if (!productCategoryDOM) return;

    const productCategory = productCategoryDOM.innerText.toLowerCase();
    let validCategory = false;

    for (const key in categories) {
      // Only searchForSpecs() if productCategory is in {categories}.
      if (productCategory === key) {
        searchForSpecs(categories[productCategory]);
        validCategory = true;
        break;
      }
    }

    if (!validCategory) activateSection(1); // Product Description.
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

    // Testing
    tempValidSpecs.bestUse = {
      label: "Best Use",
      value: "Powder",
      info: {},
      attribute: "ProductData_AllStyle_SB"
    }

    // Only setValidSpecs() if we have found product attributes.
    if (Object.keys(tempValidSpecs).length) {
      setValidSpecs(tempValidSpecs);
      setShowProductDataCard(true);
      // Product Data Card.
      activateSection(0);
    } else {
      // Product Details.
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

  const sectionClick = (index: number) => {
    const sectionShouldLazyLoad = sectionProps[index].lazyLoaded;
    sectionShouldLazyLoad ? loadSection(index) : activateSection(index);
  }

  const loadSection = (index: number) => {
    console.info(loadedSections);
    const tempLoadedSections = loadedSections;
    tempLoadedSections[index] = true;
    setLoadedSections(tempLoadedSections);
    activateSection(index);
  }

  const setRef = (element: HTMLDivElement, wrapper: number) => wrappers.current[wrapper] = element;

  return (
    <section aria-label="Product Information" className={styles.container}>

      {sectionProps.map((section: SectionPropsObject, index: number) => (
        <section key={section.title} aria-labelledby={`${removeSpaces(section.title)}-title`} data-pdp-section={index} data-active={activeSection === index} data-applicable={index === 0 ? showDataCard ? "true" : "false" : "true"} className={styles.dataSection}>
          <button onClick={() => sectionClick(index)} className={styles.titleButton}>
            <h2 id={`${removeSpaces(section.title)}-title`} className={styles.buttonText}>{section.title}</h2>
            <span>+</span>
          </button>
          {/* <div style={{ height: `${activeSection === index ? activeHeight : 0}px` }} className={styles.window}> */}
          <div className={styles.window}>
            <div ref={(element: HTMLDivElement) => setRef(element, index)} className={styles.wrapper}>
              {index === 0 ? <ProductDataCard validSpecs={validSpecs} /> :
                !loadedSections[index] ? <div>Loading Data...</div> : children[index - 1]}
            </div>
          </div>
        </section>
      ))}

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

