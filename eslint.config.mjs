import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // The React Compiler lint rules (eslint-plugin-react-hooks v6) are tuned
    // for plain React data flow and fire false positives on standard
    // react-three-fiber / WebGL patterns that this project relies on:
    //   - immutability: configuring objects returned by useTexture/useLoader
    //     (the documented R3F way to set colorSpace, anisotropy, filters).
    //   - purity: Math.random()/new Date() inside useMemo for one-time star
    //     and lightning geometry (stable for the component's lifetime).
    //   - set-state-in-effect: clock/timer ticks and one-shot hydration guards.
    //   - use-memo: compiler memoization hints, not correctness issues.
    // The core safety rules (rules-of-hooks, exhaustive-deps) stay enabled, and
    // `next build` + tsc both pass. These four are relaxed deliberately.
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/use-memo": "off",
    },
  },
]);

export default eslintConfig;
