import moment from "moment";

export const formatDate = (dateString) => {
    return moment.utc(dateString).format("DD-MM-YYYY HH:mm")
};

