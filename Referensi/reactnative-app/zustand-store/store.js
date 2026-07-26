import { create } from "zustand";


export const userDetailsState = create(() => {
    return {
        userDetailsInGlobalState: ''
    }
});

export const modelResponseState = create(() => {
    return {
        responseFromGeminiModel: '',
    }
});