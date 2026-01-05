import { createContext, useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";




export const BookingContext = createContext();

export const BookingProvider = ({children}) => {
    const {authToken} = useContext(UserContext);
    const [slots, setSlots] = useState({morning: [],afternoon: [],evening: [],});
    const [serviceId, setServiceId] = useState(null);
    const [date, setDate] = useState(null);
    const [bookingPreview, setBookingPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false)
    const [previewError, setPreviewError] = useState(null);
    const navigate = useNavigate()


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


    // ==============Booking ==============
    const createBooking = (service_id, date, start_time, employee_id) => {
        fetch("http://127.0.0.1:5000/bookings", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
            },
            body: JSON.stringify({
            service_id,
            date,
            start_time,
            employee_id, // optional, backend handles missing
            }),
        })
            .then((res) => res.json())
            .then((response) => {
            console.log(response);

            if (response.message) {
                toast.dismiss();
                toast.success(response.message);
                navigate("/thanks");
            } 
            else if (response.error) {
                toast.dismiss();
                toast.error(response.error);
            }
            })
            .catch((err) => {
            toast.dismiss();
            toast.error("Something went wrong");
            console.error(err);
            });
        };

    // ==========Preview================
    const fetchBookingPreview = async ({ serviceId, date, startTime, employeeId = null }) => {
        setPreviewLoading(true);
        setPreviewError(null);

        try {
        // Build query parameters
        const params = new URLSearchParams({
            service_id: serviceId,
            date: date,
            start_time: startTime,
        });

        // Add optional employee_id if provided
        if (employeeId) {
            params.append('employee_id', employeeId);
        }

        const response = await fetch(`http://127.0.0.1:5000/bookings/preview?${params.toString()}`, {
            method: 'GET',
            headers: {
            "Content-Type": "application/json",
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch booking preview');
        }

        const data = await response.json();
        setBookingPreview(data);
        return data;
        } catch (error) {
        console.error('Error fetching booking preview:', error);
        setPreviewError(error.message);
        throw error;
        } finally {
        setPreviewLoading(false);
        }
    };

    /**
     * Clear booking preview data
     */
    const clearBookingPreview = () => {
        setBookingPreview(null);
        setPreviewError(null);
    };



    const data = {
        slots,
        setServiceId,
        setDate,
        createBooking,
        fetchBookingPreview,
        clearBookingPreview,
        bookingPreview,
        previewError,
        previewLoading
    }

    return (
        <BookingContext.Provider value={data}>
            {children}
        </BookingContext.Provider>
    )
}