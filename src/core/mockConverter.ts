import { ConversionResult, GeneratedComponent } from "@/types/figma";

// Egyszerű mock konverter teszteléshez
export class MockConverter {
  async convertMockDesign(): Promise<ConversionResult> {
    // Szimuláljuk a konverziót
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockComponents: GeneratedComponent[] = [
      {
        name: "Button",
        code: `import React from 'react';
import { css } from '@emotion/react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const styles = css\`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  
  &.primary {
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
  }
  
  &.secondary {
    background-color: #f1f5f9;
    color: #334155;
    
    &:hover {
      background-color: #e2e8f0;
    }
  }
  
  &.sm {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  &.md {
    padding: 8px 16px;
    font-size: 16px;
  }
  
  &.lg {
    padding: 12px 24px;
    font-size: 18px;
  }
\`;

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className,
  style,
  ...props 
}) => {
  return (
    <button 
      css={styles} 
      className={\`\${variant} \${size} \${className || ''}\`}
      onClick={onClick}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};`,
        props: [
          {
            name: "children",
            type: "React.ReactNode",
            defaultValue: undefined,
            required: true,
          },
          {
            name: "onClick",
            type: "() => void",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "variant",
            type: "'primary' | 'secondary'",
            defaultValue: "'primary'",
            required: false,
          },
          {
            name: "size",
            type: "'sm' | 'md' | 'lg'",
            defaultValue: "'md'",
            required: false,
          },
          {
            name: "className",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "style",
            type: "React.CSSProperties",
            defaultValue: undefined,
            required: false,
          },
        ],
        styles: `{
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  fontWeight: '500',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  border: 'none',
  backgroundColor: '#3b82f6',
  color: 'white',
  padding: '8px 16px',
  fontSize: '16px'
}`,
        isMainComponent: true,
      },
      {
        name: "Card",
        code: `import React from 'react';
import { css } from '@emotion/react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

const styles = css\`
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 24px;
  border: 1px solid #e2e8f0;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }
\`;

const titleStyles = css\`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1e293b;
\`;

export const Card: React.FC<CardProps> = ({ 
  children, 
  title,
  className,
  style,
  ...props 
}) => {
  return (
    <div 
      css={styles} 
      className={className}
      style={style}
      {...props}
    >
      {title && <h3 css={titleStyles}>{title}</h3>}
      {children}
    </div>
  );
};`,
        props: [
          {
            name: "children",
            type: "React.ReactNode",
            defaultValue: undefined,
            required: true,
          },
          {
            name: "title",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "className",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "style",
            type: "React.CSSProperties",
            defaultValue: undefined,
            required: false,
          },
        ],
        styles: `{
  backgroundColor: 'white',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  padding: '24px',
  border: '1px solid #e2e8f0'
}`,
        isMainComponent: false,
      },
      {
        name: "Input",
        code: `import React from 'react';
import { css } from '@emotion/react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
}

const styles = css\`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
  }
  
  &.error {
    border-color: #ef4444;
    
    &:focus {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  }
\`;

const labelStyles = css\`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
\`;

const errorStyles = css\`
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
\`;

export const Input: React.FC<InputProps> = ({ 
  label,
  error,
  className,
  style,
  ...props 
}) => {
  return (
    <div>
      {label && <label css={labelStyles}>{label}</label>}
      <input 
        css={styles} 
        className={\`\${error ? 'error' : ''} \${className || ''}\`}
        style={style}
        {...props}
      />
      {error && <div css={errorStyles}>{error}</div>}
    </div>
  );
};`,
        props: [
          {
            name: "label",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "error",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "placeholder",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "value",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "onChange",
            type: "(e: React.ChangeEvent<HTMLInputElement>) => void",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "className",
            type: "string",
            defaultValue: undefined,
            required: false,
          },
          {
            name: "style",
            type: "React.CSSProperties",
            defaultValue: undefined,
            required: false,
          },
        ],
        styles: `{
  width: '100%',
  padding: '12px 16px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  lineHeight: '20px'
}`,
        isMainComponent: false,
      },
    ];

    return {
      success: true,
      components: mockComponents,
      designTokens: {
        colors: {
          "primary-50": "#eff6ff",
          "primary-100": "#dbeafe",
          "primary-500": "#3b82f6",
          "primary-600": "#2563eb",
          "gray-50": "#f9fafb",
          "gray-100": "#f3f4f6",
          "gray-200": "#e5e7eb",
          "gray-300": "#d1d5db",
          "gray-400": "#9ca3af",
          "gray-500": "#6b7280",
          "gray-600": "#4b5563",
          "gray-700": "#374151",
          "gray-800": "#1f2937",
          "gray-900": "#111827",
          "red-500": "#ef4444",
          white: "#ffffff",
        },
        typography: {
          "text-xs": {
            fontSize: "12px",
            fontWeight: "400",
            lineHeight: "16px",
            fontFamily: "Inter, sans-serif",
          },
          "text-sm": {
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "20px",
            fontFamily: "Inter, sans-serif",
          },
          "text-base": {
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "24px",
            fontFamily: "Inter, sans-serif",
          },
          "text-lg": {
            fontSize: "18px",
            fontWeight: "400",
            lineHeight: "28px",
            fontFamily: "Inter, sans-serif",
          },
        },
        spacing: {
          "1": "4px",
          "2": "8px",
          "3": "12px",
          "4": "16px",
          "5": "20px",
          "6": "24px",
          "8": "32px",
          "10": "40px",
          "12": "48px",
        },
        borderRadius: {
          none: "0px",
          sm: "2px",
          md: "6px",
          lg: "8px",
          xl: "12px",
          "2xl": "16px",
          full: "9999px",
        },
        shadows: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        },
      },
      errors: [],
      warnings: [],
    };
  }

  // Demo mode ellenőrzés
  static isDemoUrl(url: string): boolean {
    return (
      url.includes("demo") || url.includes("test") || url.includes("example")
    );
  }
}

export const mockConverter = new MockConverter();
