import { T } from "./theme";
import { MSP_DB } from "./constants";

export const getMSP = (name) => {
  const k = name.toLowerCase().trim();
  return (
    MSP_DB[k] ||
    MSP_DB[Object.keys(MSP_DB).find((c) => c.includes(k) || k.includes(c))] ||
    1200
  );
};

export const tierStyle = (color) => {
  if (color === "red") return { bg: T.redBg, bo: T.redBo, c: T.red };
  if (color === "yellow") return { bg: T.yelBg, bo: T.yelBo, c: T.yel };
  if (color === "blue") return { bg: T.bluBg, bo: T.bluBo, c: T.blu };
  return { bg: "#f0fdf4", bo: T.border, c: T.green };
};

export const fungicideColor = (type) => {
  if (type === "Systemic") return { c: T.blu, bg: T.bluBg, bo: T.bluBo };
  if (type === "Bio") return { c: T.green, bg: "#f0fdf4", bo: T.border };
  return { c: T.red, bg: T.redBg, bo: T.redBo };
};
