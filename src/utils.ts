export const shuffle = <T>(array: Array<T>) => {
  const copy = [];

  // While there remain elements to shuffle…
  for (let n = array.length; n > 0; --n) {
    // And move it to the new array.
    copy.push(array.splice(Math.floor(Math.random() * n), 1)[0]);
  }

  return copy;
};
