const characters =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export default function base62Encode(number) {
  let result = "";

  while (number > 0n) {
    const remainder = number % 62n;

    result = characters[Number(remainder)] + result;

    number = number / 62n;
  }

  return result || "0";
}
