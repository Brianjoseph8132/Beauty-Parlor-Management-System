import { Children } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";




export const BookingContext = createContext();

export const BookingProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [slots, setSlots] = useState({morning: [],afternoon: [],evening: [],});
    const [serviceId, setServiceId] = useState(null);
    const [date, setDate] = useState(null);


    const [onChange, setOnChange] = useState(true)

    

    // ========== Slots===============
    useEffect(() => {
        if (!serviceId || !date) return;

        fetch(
        `http://127.0.0.1:5000/available-slots?service_id=${serviceId}&date=${date}`,
        {
            headers: {
            Authorization: `Bearer ${authToken}`,
            },
        }
        )
        .then((res) => res.json())
        .then((data) => {
            setSlots(data.slots);
        })
        .catch((err) => console.error("Slot fetch error:", err));
    }, [serviceId, date, authToken]);


    const data = {
        slots,
        setServiceId,
        setDate
    }

    return (
        <BookingContext.Provider value={data}>
            {children}
        </BookingContext.Provider>
    )
}