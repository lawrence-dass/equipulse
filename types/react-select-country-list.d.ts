declare module 'react-select-country-list' {
    export type CountryOption = {
        label: string;
        value: string;
    };

    type CountryList = {
        getData: () => CountryOption[];
    };

    export default function countryList(): CountryList;
}
