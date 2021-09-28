const str = 'abcdefghijklmeopqrstvuwxyz1234567980'
export default function ss(b: number) {
  let result = ''
  for (let i = 0; i < b; i++) {
    const aa = Math.floor(Math.random() * str.length)
    result = result + str.substring(aa, aa + 1)
  }
  return result
}
