import { IMAGE_UPLOAD_URL } from "../Api";
import moment from "moment";
import { useRef } from "react";
import { useEffect } from "react";
import secureLocalStorage from "react-secure-storage";

export function getImageUrlPath(fileName) {
    return `${IMAGE_UPLOAD_URL}${fileName}`
}

export function generateSessionId(length = 8) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

export function findDateInRange(fromDate, toDate, checkDate) {
    if ((fromDate <= checkDate) && (checkDate <= toDate)) {
        return true
    }
    return false;
}

export function latestExpireDateWithinNDays(latesExpireDate = secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "latestActivePlanExpireDate"), n = 20) {
    if (differenceInTimeToInDays(differenceInTime(new Date(latesExpireDate), new Date())) <= n) {
        return true;
    }
    return false;
}

export function differenceInTime(dateOne, dateTwo) {
    return dateOne.getTime() - dateTwo.getTime();
}

export function differenceInTimeToInDays(differenceInTime) {
    return differenceInTime / (1000 * 3600 * 24);
}

// React paginate, page index starts with 0 ,
//  actual page number starts with 1 so, input to 
// react-paginate and valueFrom react-paginate converted

export function pageNumberToReactPaginateIndex(pageNumber) {
    return pageNumber - 1;
}

export function reactPaginateIndexToPageNumber(pageIndex) {
    return pageIndex + 1;
}

export function viewBase64String(base64String) {
    return "data:image/png;base64, " + base64String
}

export function hasPermission(permission) {
    if (Boolean(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "superAdmin"))) {
        return true;
    }
    return JSON.parse(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "userRole")).role.RoleOnPage.find(item => item.pageId === parseInt(secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + "currentPage")))[permission]
}

export function getYearShortCode(fromDate, toDate) {
    return `${new Date(fromDate).getFullYear().toString().slice(2)}-${new Date(toDate).getFullYear().toString().slice(2)}`
}

export const handleKeyDown = (event, callback) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === 's') {
        event.preventDefault();
        callback();
    }
}

export function calculateAge(dob) {
    var diff_ms = Date.now() - dob.getTime();
    var age_dt = new Date(diff_ms);

    return Math.abs(age_dt.getUTCFullYear() - 1970);
}

// Convert number to words

const arr = x => Array.from(x);
const num = x => Number(x) || 0;
const isEmpty = xs => xs.length === 0;
const take = n => xs => xs.slice(0, n);
const drop = n => xs => xs.slice(n);
const reverse = xs => xs.slice(0).reverse();
const comp = f => g => x => f(g(x));
const not = x => !x;
const chunk = n => xs =>
    isEmpty(xs) ? [] : [take(n)(xs), ...chunk(n)(drop(n)(xs))];

// numToWords :: (Number a, String a) => a -> String
export const numToWords = n => {

    let a = [
        '', 'one', 'two', 'three', 'four',
        'five', 'six', 'seven', 'eight', 'nine',
        'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
        'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
    ];

    let b = [
        '', '', 'twenty', 'thirty', 'forty',
        'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
    ];

    let g = [
        '', 'thousand', 'million', 'billion', 'trillion', 'quadrillion',
        'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion'
    ];

    // this part is really nasty still
    // it might edit this again later to show how Monoids could fix this up
    let makeGroup = ([ones, tens, huns]) => {
        return [
            num(huns) === 0 ? '' : a[huns] + ' hundred ',
            num(ones) === 0 ? b[tens] : b[tens] && b[tens] + '-' || '',
            a[tens + ones] || a[ones]
        ].join('');
    };

    let thousand = (group, i) => group === '' ? group : `${group} ${g[i]}`;

    if (typeof n === 'number')
        return numToWords(String(n));
    else if (n === '0')
        return 'zero';
    else
        return comp(chunk(3))(reverse)(arr(n))
            .map(makeGroup)
            .map(thousand)
            .filter(comp(not)(isEmpty))
            .reverse()
            .join(' ');
};


export function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

export const getDateFromDateTime = (dateTime) => moment.utc(dateTime).format("YYYY-MM-DD")
export const getDateFromDateTimeToDisplay = (dateTime) => moment.utc(dateTime).format("DD-MM-YYYY")


export function findFromList(id, list, property) {
    if (!list) return ""
    let data = list.find(i => parseInt(i.id) === parseInt(id))
    if (!data) return ""
    return data[property]
}
export function findFromListReturnsItem(id, list) {
    if (!list) return ""
    let data = list.find(i => parseInt(i.id) === parseInt(id))
    if (!data) return ""
    return data
}

export function isBetweenRange(startValue, endValue, value) {
    return (parseFloat(startValue) <= parseFloat(value)) && (parseFloat(value) <= parseFloat(endValue))
}

export function substract(num1, num2) {
    let n1 = parseFloat(num1) * 1000;
    let n2 = parseFloat(num2) * 1000;
    let result = (n1 - n2) / 1000
    return result;
}

export function getAllowableReturnQty(inwardedQty, returnedQty, stockQty) {
    let balanceReturnQty = parseFloat(inwardedQty) + parseFloat(returnedQty);
    return (balanceReturnQty < parseFloat(stockQty)) ? balanceReturnQty : parseFloat(stockQty)
}

export function priceWithTax(price, tax) {
    if (!price) return 0
    if (!tax) return parseFloat(price)
    let taxAmount = (parseFloat(price) / 100) * parseFloat(tax)
    return parseFloat(price) + taxAmount
}

export function getItemFullNameFromShortCode(shortCode) {
    let fullForm = "";
    switch (shortCode) {
        case "GY":
            fullForm = "GreyYarn"
            break;
        case "GF":
            fullForm = "GreyFabric"
            break;
        case "DY":
            fullForm = "DyedYarn"
            break;
        case "DF":
            fullForm = "DyedFabric"
            break;
        default:
            break;
    }
    return fullForm
}

export function filterGodown(store, itemShortCode) {
    if (itemShortCode.includes("Y")) {
        return store.isYarn
    } else if (itemShortCode.includes("F")) {
        return store.isFabric
    }
}

export const params = {
    companyId: secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userCompanyId"
    ),
    branchId: secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "currentBranchId"
    ),
    userId: secureLocalStorage.getItem(
        sessionStorage.getItem("sessionId") + "userId"
    ),
    finYearId: secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'currentFinYear')
};

export const getCommonParams = () => ({

    user: sessionStorage.getItem("userName"),

    token: `Bearer ${secureLocalStorage.getItem(sessionStorage.getItem("sessionId") + 'token')}`

})

export function isGridDatasValid(datas, isRequiredAllData, mandatoryFields = []) {
    console.log(mandatoryFields, "mandatory fields", datas);
    if (isRequiredAllData) {
        let gridDatasValid = datas.every(obj =>
            Object.values(obj).every(value => value !== "" && value !== null && value !== 0))
        return gridDatasValid
    }
    else {
        let gridDatasValid = datas.every(obj =>
            mandatoryFields.every(field => (obj[field]) && (obj[field] !== "") && (obj[field] !== null) && (parseFloat(obj[field]) !== 0)
            ))
        return gridDatasValid;
    }
}

export const groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

export const convertGroupedObjectIntoArray = (groupedObject) => {
    const groups = Object.keys(groupedObject);
    const out = [];
    for (let index = 0; index < groups.length; index++) {
        const element = groups[index];
        out.push({ groupName: element, items: groupedObject[element] })
    }
    return out;
}

export function sumArray(arr, property) {
    return arr.reduce((total, current) => parseFloat(total) + parseFloat(current[property]), 0)
}

export function getBalanceBillQty(inwardQty, returnQty, alreadyBilledQty) {
    return substract(substract(inwardQty, returnQty), alreadyBilledQty).toFixed(2)
}

export function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
}

export function getDiscountAmount(discountType, discountValue, grossAmount) {
    return discountType ? ((discountType === 'Flat') ? discountValue : grossAmount / 100 * parseFloat(discountValue)) : 0
}

export function getEntryType(entryType, customerName) {

    if (entryType === "My Payment") {
        return "Ps Tex Payment"
    } else if (entryType === "Customer Payment") {
        return `${customerName} Payment`
    } else {
        return entryType
    }
}

export function convertSpaceToUnderScore(str) {
    return str.toLowerCase().trim().split(' ').join('_');
}

export function getInvoiceTotal(item) {
    let rate = parseFloat(parseFloat(item?.rate || 0).toFixed(2))
    let qty = parseFloat(parseFloat(item?.qty || 0).toFixed(2))
    const taxableValue = isNaN(parseFloat(rate * qty)) ? parseFloat(rate || 0) : parseFloat(rate * qty);
    const taxValue = parseFloat(((taxableValue / 100) * parseFloat(item?.tax || 0)))
    return {
        taxableValue: taxableValue.toFixed(2), taxValue: taxValue.toFixed(2),
        totalAmount: (taxableValue + taxValue).toFixed(2), splitValue: ((taxValue) / 2).toFixed(2)
    }
}

export const stringToLiteral = (value) => {
    if (value === "undefined") return undefined;
    else if (value === "null") return null;
    else return value;
};



const IDLE_TIME = 9 * 60 * 1000; 

export const useIdleLogout = (
    onLogout,
    isLoggedIn,
) => {
    const timerRef = useRef(null);

    console.log(isLoggedIn, 'isLoggedIn');
    
    useEffect(() => {
        if (!isLoggedIn) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            return;
        }

        const resetTimer = () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            timerRef.current = setTimeout(() => {
                onLogout();
            }, IDLE_TIME);
        };

        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
        ];

        events.forEach(event =>
            window.addEventListener(event, resetTimer)
        );

        resetTimer(); // start timer immediately

        return () => {
            events.forEach(event =>
                window.removeEventListener(event, resetTimer)
            );

            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isLoggedIn, onLogout]);
};
    