import React from 'react';
import './FolderFooter.css';

export interface PropDoc {
  name: string;
  type: string;
  default: string;
  description: string;
}

const folderPropsDoc: PropDoc[] = [
  {
    name: 'color',
    type: "'black' | 'white' | 'blue'",
    default: "'black'",
    description: 'Sets the theme color palette and SVG gradient glass accents for the folder.',
  },
  {
    name: 'size',
    type: "'sm' | 'md' | 'lg'",
    default: "'md'",
    description: 'Controls the overall 3D scale factor of the folder container.',
  },
  {
    name: 'className',
    type: 'string',
    default: "''",
    description: 'Additional CSS class names for custom layout overrides.',
  },
];

export const FolderFooter: React.FC = () => {
  return (
    <div className="folder-props-section">
      <h3 className="props-title">Props Reference</h3>
      <div className="props-table-wrapper">
        <table className="props-table">
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {folderPropsDoc.map((prop) => (
              <tr key={prop.name}>
                <td>
                  <code className="prop-name">{prop.name}</code>
                </td>
                <td>
                  <code className="prop-type">{prop.type}</code>
                </td>
                <td>
                  <code className="prop-default">{prop.default}</code>
                </td>
                <td className="prop-desc">{prop.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FolderFooter;
