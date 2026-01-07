import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';

import Translate from '@docusaurus/Translate';
import { useColorMode } from '@docusaurus/theme-common';

import styles from './styles.module.css';

type FeatureItem = {
  title: ReactNode;
  imgName: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: <Translate id="homepage.features.knowledgeCenter.title">Developer Knowledge Center</Translate>,
    imgName: 'card-1',
    description: (
      <Translate id="homepage.features.knowledgeCenter.description">
        The single source of truth. Always up-to-date API specs, SDK references, and tool guides.
      </Translate>
    ),
  },
  {
    title: <Translate id="homepage.features.docs.title">Clear, Comprehensive Docs</Translate>,
    imgName: 'card-2',
    description: (
      <Translate id="homepage.features.docs.description">
        From Quickstart to production-ready implementations, with real-world examples.
      </Translate>
    ),
  },
  {
    title: <Translate id="homepage.features.partner.title">Your Evolving Learning Partner</Translate>,
    imgName: 'card-3',
    description: (
      <Translate id="homepage.features.partner.description">
        Release-aware content covering migrations, best practices, and troubleshooting.
      </Translate>
    ),
  },
];

function Feature({title, imgName, description}: FeatureItem) {
  const { colorMode } = useColorMode();
  const imgSrc = require(`@site/static/img/${imgName}-${colorMode}.png`).default;

  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <img src={imgSrc} className={styles.featureSvg} alt={imgName} />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
