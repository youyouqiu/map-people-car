
export const carKeyList = [
    '1', '2', '3', '4', '5',
    '6', '7', '8', '9', '10',
    '11', '13', '14', '15', '16',
    '18', '19', '31', '54', '59',
    '60', '61', '62', '63',
    '70', '71', '77', '80', '93',
    '97', '101', '102', '104', '105',
    '106', '108', '110', '111', '581',
    '1001',
];
export const publicCarPath = (key: string | number) => {
    // return '/src/static/image/publicCar/' + key + '.png';
    return `/static/image/publicCar/${key}.png`
}
