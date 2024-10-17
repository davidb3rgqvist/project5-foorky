import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";

export default [
  // Apply to all JavaScript and JSX files
  { files: ["**/*.{js,mjs,cjs,jsx}"] },

  // Add browser-specific globals like window, document, etc.
  { languageOptions: { globals: globals.browser } },

  // Enable recommended JavaScript rules
  pluginJs.configs.recommended,

  // Enable recommended React rules
  pluginReact.configs.flat.recommended,

  // Custom rules (you can add more based on your project)
  {
    rules: {
      // Allow console.log for development but warn in production
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      
      // Warn on unused variables
      "no-unused-vars": "warn",
      
      // Enforce proper React hook usage
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Disable prop-types check if you're not using it
      "react/prop-types": "off",
      
      // Allow JSX in files with .js and .jsx extensions
      "react/jsx-uses-react": "off", // React 17+ (JSX transformation)
      "react/react-in-jsx-scope": "off", // React 17+ (JSX transformation)
    },
  },
];
