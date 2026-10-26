import React from 'react';
import { ShalLogo } from './ShalLogo';

export const NabdLogo: React.FC<React.ComponentProps<typeof ShalLogo>> = (props) => {
  return <ShalLogo {...props} />;
};

export { ShalLogo };
