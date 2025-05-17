export const transformText = (text) => {
    return text.replace(/"/g, "").toLowerCase().replace(/\s/g, "_");
  };

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text)
    .then(() => {})
    .catch(err => console.error("Copy failed:", err));
}