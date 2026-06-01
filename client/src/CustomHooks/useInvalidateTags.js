import { useDispatch } from "react-redux";

const useInvalidateTags = () => {
    const dispatch = useDispatch();

    const apiInvalidateData = [

        {
            type: `pieceReceipt/invalidateTags`,
            payload: ["pieceReceipt"],
        },
        {
            type: `tableLot/invalidateTags`,
            payload: ["tableLotApi"],
        },
        {
            type: `defectEntryApi/invalidateTags`,
            payload: ["defectEntryApi"],
        },
        {
            type: `foldingPending/invalidateTags`,
            payload: ["foldingPending"],
        },
        {
            type: `pieceVerificationApi/invalidateTags`,
            payload: ["pieceVerificationApi"],
        },

        {
            type: `packingSlip/invalidateTags`,
            payload: ["packingSlip"],
        },
        {
            type: `finYearMaster/invalidateTags`,
            payload: ["FinYear"],
        },

       


    ];

    function dispatchInvalidate() {
        apiInvalidateData.forEach(item => {
            dispatch(item);
        })
    }
    return [dispatchInvalidate];
};

export default useInvalidateTags;
