export const Patterns: {
    positiveInteger: RegExp;
    charactersWithSpaces: RegExp;
    Base64: RegExp;
    positiveNumbersFromOne: RegExp;
    positiveNumbersFromZero: RegExp;
    email: RegExp;
    charactersWithoutSpaces: RegExp;
    domainName: RegExp;
} = {
    positiveInteger: /^[0-9]*[1-9][0-9]*$/,
    charactersWithSpaces: /^[a-zA-Z\s]*$/,
    Base64: /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{4})$/,
    positiveNumbersFromOne: /^[1-9]\d*(\.\d+)?$/,
    positiveNumbersFromZero: /^[0-9]\d*(\.\d+)?$/,
    email: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    charactersWithoutSpaces: /(.*\S+.*)/,
    domainName: new RegExp("^[A-Za-z0-9-_]+([\\-\\.]{1}[a-z0-9]+)*\\.?[A-Za-z]{2,6}$")
};
