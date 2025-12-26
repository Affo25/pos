export const generateSubjectCode = (name) => {
  if (!name) return '';
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length === 1) {
    return words[0].substring(0, 3).toUpperCase();
  }
  return words.map((word) => word[0].toUpperCase()).join('');
};
