import React, { useEffect, useRef, useState, useMemo, ReactChildren } from "react";
import { Link, canUseDOM } from "vtex.render-runtime";

// Styles
import styles from "./styles.css";

interface PDPAccordionProps {
  blockClass: string
}

const grabDOM: any = (selector: string) => canUseDOM ? document.querySelector(selector) : null;

const PDPAccordion: StorefrontFunctionComponent<PDPAccordionProps> = ({ }) => {

  return (
    <section className={styles.container}>
      Accordion!
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
